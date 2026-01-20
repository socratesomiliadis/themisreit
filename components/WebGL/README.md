# WebGL/WebGPU Baked Relief Components

Interactive 3D relief effect that responds to mouse movement, revealing baked lighting textures through a trail-based reveal system.

## Components Overview

```
components/WebGL/
├── baked-relief/           # WebGL implementation (React Three Fiber)
│   ├── index.tsx           # Main component with Canvas setup
│   ├── baked-relief-plane.tsx  # 3D plane with shader material
│   ├── shaders.ts          # GLSL vertex/fragment shaders
│   ├── trail.ts            # Canvas-based trail texture generator
│   ├── texture-cache.ts    # Shared texture loading/caching
│   ├── performance.ts      # Performance tier detection
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Helper functions
│
├── baked-relief-webgpu/    # WebGPU implementation (Three.js TSL)
│   ├── index.tsx           # Main component with fallback logic
│   ├── Trail.ts            # Canvas-based trail texture generator
│   └── types.ts            # TypeScript interfaces
│
└── index.tsx               # Re-exports
```

## Usage

```tsx
import { BakedRelief } from "@/components/WebGL/baked-relief-webgpu";

// Texture configuration
const textures = {
  bake1: "/textures/0006.png",  // Darkest/flattest
  bake2: "/textures/0005.png",
  bake3: "/textures/0004.png",
  bake4: "/textures/0003.png",
  bake5: "/textures/0002.png",
  bake6: "/textures/0001.png",  // Brightest/most revealed
  plaster: "/textures/plaster.png",  // Optional overlay texture
};

<BakedRelief
  textures={textures}
  multiplyColor="#161616"
  showRendererIndicator={true}  // Debug: shows WEBGPU or WEBGL badge
/>
```

## WebGPU vs WebGL

The `baked-relief-webgpu` component automatically detects browser support and falls back:

| Browser | Renderer Used |
|---------|--------------|
| Chrome (macOS/Windows/Linux) | WebGPU |
| Firefox | WebGL (fallback) |
| Safari (all versions) | WebGL (forced fallback*) |
| iOS (all browsers) | WebGL (forced fallback*) |

*Safari's WebGPU implementation has known issues with Three.js TSL, so WebGL is forced for stability.

### Debug Indicator

Enable `showRendererIndicator={true}` to see which renderer is active:
- **WEBGPU** (green badge) - Using WebGPU renderer
- **WEBGL** (orange badge) - Using WebGL fallback

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `textures` | `BakedTextures` | required | URLs to 6 baked textures + optional plaster |
| `textureScale` | `number` | `5.0` | Plaster texture tiling scale |
| `textureStrength` | `number` | `1.0` | Plaster texture blend strength |
| `multiplyColor` | `string` | `"#161616"` | Color multiply for darkening |
| `trailSize` | `number` | `0.1` | Trail brush size |
| `trailFadeSpeed` | `number` | `0.9` | Trail persistence (0-1) |
| `trailMaxAge` | `number` | `120` | Trail point lifetime in frames |
| `trailIntensity` | `number` | `0.05` | Trail opacity per stroke |
| `ambientIntensity` | `number` | `0.2` | Auto-animated trail intensity |
| `mouseLerp` | `number` | `1.0` | Mouse smoothing (higher = snappier) |
| `mouseInfluence` | `number` | `0.05` | Rotation based on mouse position |
| `rotationSpeed` | `number` | `0.0003` | Auto-rotation speed |
| `edgeFade` | `number` | `0.05` | Edge vignette fade distance |
| `showRendererIndicator` | `boolean` | `false` | Show debug renderer badge |

### WebGL-only Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fresnelEnabled` | `boolean` | `false` | Enable edge glow effect |
| `fresnelColor` | `string` | `"#ffffff"` | Edge glow color |
| `fresnelStrength` | `number` | `0.0` | Edge glow intensity |
| `aspectRatio` | `number` | `1` | Plane aspect ratio |
| `trailResolution` | `number` | `256` | Trail texture resolution |
| `pauseWhenHidden` | `boolean` | `true` | Pause when off-screen |

---

## Performance Optimization

The components include automatic performance tier detection that adjusts quality based on device capabilities.

### Performance Tiers

| Tier | When Applied |
|------|--------------|
| **High** | Desktop with dedicated GPU, 8+ GB RAM, 8+ CPU cores |
| **Medium** | Most laptops, integrated graphics, 4+ GB RAM |
| **Low** | Mobile devices, iOS, older hardware, low memory |

### Quality Settings by Tier

| Setting | High | Medium | Low |
|---------|------|--------|-----|
| Device Pixel Ratio | 1-2 | 1-1.5 | 1 |
| Trail Resolution | 256px | 192px | 128px |
| Gradient Stops | 6 | 4 | 3 |
| Max Trail Points | 400 | 250 | 150 |
| Update Interval | 16ms | 20ms | 25ms |
| Ambient Particles | 3 | 2 | 1 |
| Trail Blur Samples | 5 | 3 | 1 |
| Target FPS | 60 | 45 | 30 |

### Detection Factors

The performance tier is determined by scoring these factors:

```
+ Device memory (navigator.deviceMemory)
+ CPU cores (navigator.hardwareConcurrency)
+ GPU type (WebGL debug renderer info)
- Mobile device detection
- iOS detection (thermal throttling)
- Large screen resolution (4K+, 5K+)
- Integrated graphics (Intel)
```

### Console Output

On load, you'll see the detected tier:
```
Performance tier detected: medium (score: 1)
```

### Manual Override

```tsx
import { getQualitySettings } from "@/components/WebGL/baked-relief/performance";

// Force a specific tier
const settings = getQualitySettings("low");
```

---

## How It Works

### Trail System

1. Mouse/touch position is tracked and interpolated smoothly
2. Trail points are added along the mouse path
3. A Canvas 2D context renders radial gradients for each point
4. The canvas is uploaded as a texture to the GPU each frame
5. Points fade out based on age and the canvas fades over time

### Texture Blending

The shader samples a "trail" texture and uses its intensity to blend through 6 baked lighting textures:

```
trail = 0.0 → bake1 (flat/dark)
trail = 0.5 → bake3 (mid-reveal)
trail = 1.0 → bake6 (fully lit)
```

The blending uses `smoothstep` for smooth transitions between texture levels.

### Shader Pipeline

```glsl
// 1. Sample trail with optional blur
float trail = sampleTrailWithBlur(uv);

// 2. Blend through 6 baked textures
vec4 color = blendBakedTextures(trail, bake1...bake6);

// 3. Apply multiply color (darkening)
color.rgb *= uMultiplyColor;

// 4. Apply plaster/grunge texture overlay
color.rgb *= mix(vec3(1.0), plaster.rgb, uTextureStrength);

// 5. Apply edge fade/vignette
color.a *= calculateEdgeFade(uv);
```

---

## Texture Requirements

### Baked Textures (bake1-6)

- **Format**: PNG with alpha channel
- **Size**: Square, power of 2 recommended (512x512, 1024x1024)
- **Content**: Pre-rendered lighting from flat (bake1) to fully lit (bake6)
- **Color Space**: sRGB (automatically handled)

### Plaster/Grunge Texture (optional)

- **Format**: PNG, seamless/tileable
- **Size**: Power of 2 recommended
- **Content**: Surface detail that multiplies over the base
- **Wrapping**: Set to repeat

---

## Troubleshooting

### "WebGPU not working on Safari"

This is expected. Safari is automatically forced to use WebGL fallback due to compatibility issues with Three.js TSL on Safari's WebGPU implementation.

### "Effect is laggy"

1. Check console for detected performance tier
2. If on a capable device but showing "low", the detection may need tuning
3. Reduce the number of BakedRelief instances on the page
4. Ensure textures are optimized (compressed, appropriate size)

### "Trail not visible"

1. Check `trailIntensity` is > 0
2. Check `ambientIntensity` for auto-animation
3. Verify textures are loading (check Network tab)
4. Ensure the component has explicit width/height

### "Textures not loading"

1. Verify texture paths are correct
2. Check for CORS issues if loading from external URLs
3. Ensure textures exist in `/public/` directory

---

## Architecture Notes

### Staggered Initialization

Multiple BakedRelief instances are initialized sequentially (150ms apart) to prevent GPU stalls and jank during page load.

### Visibility Pausing

When `pauseWhenHidden={true}` (default), the component uses IntersectionObserver to pause rendering when off-screen, saving GPU resources.

### Texture Caching

The WebGL version uses a global texture cache (`texture-cache.ts`) to share loaded textures between multiple instances, reducing memory usage and load times.

### OffscreenCanvas

Both Trail implementations attempt to use OffscreenCanvas for better performance, falling back to regular Canvas on unsupported browsers.
