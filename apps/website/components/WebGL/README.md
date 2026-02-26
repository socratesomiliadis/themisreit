# WebGL/WebGPU Baked Relief Components

Interactive relief effect that responds to mouse movement, revealing baked lighting textures through a trail-based reveal system.

## File Structure

```
components/WebGL/
├── baked-relief/                  # WebGL fallback (React Three Fiber)
│   ├── index.tsx                  # Main component with Canvas + staggered init
│   ├── baked-relief-plane.tsx     # R3F mesh with shader material
│   ├── shaders.ts                # GLSL vertex/fragment shaders
│   ├── trail.ts                  # Canvas-based trail texture generator
│   ├── texture-cache.ts          # Global texture loading/caching
│   ├── performance.ts            # Performance tier detection (shared)
│   ├── types.ts                  # TypeScript interfaces + defaults
│   └── utils.ts                  # Color parsing, plane sizing
│
├── baked-relief-webgpu/           # WebGPU primary (Three.js TSL + ssam)
│   ├── index.tsx                  # Component with automatic WebGL fallback
│   ├── create-material.ts         # TSL shader / NodeMaterial factory
│   ├── Trail.ts                   # Canvas-based trail texture generator
│   ├── types.ts                   # TypeScript interfaces + defaults
│   └── utils.ts                   # Safari detection, WebGPU probing, helpers
│
├── baked-relief.tsx               # Re-export of WebGL version
├── baked-relief-controls.tsx      # Debug controls panel
├── index.tsx                      # Barrel exports
└── README.md
```

## Usage

```tsx
import dynamic from "next/dynamic";

// Recommended: WebGPU with automatic WebGL fallback
const BakedRelief = dynamic(
  () => import("@/components/WebGL/baked-relief-webgpu"),
  { ssr: false }
);

const textures = {
  bake1: "/textures/0006.png", // Darkest / flattest
  bake2: "/textures/0005.png",
  bake3: "/textures/0004.png",
  bake4: "/textures/0003.png",
  bake5: "/textures/0002.png",
  bake6: "/textures/0001.png", // Brightest / most revealed
  plaster: "/textures/plaster.png", // Optional overlay texture
};

<BakedRelief
  textures={textures}
  multiplyColor="#161616"
  showRendererIndicator // Debug: shows WEBGPU or WEBGL badge
/>;
```

## WebGPU vs WebGL

The `baked-relief-webgpu` component probes for WebGPU support and falls back automatically:

| Browser                      | Renderer |
| ---------------------------- | -------- |
| Chrome (macOS/Windows/Linux) | WebGPU   |
| Firefox                      | WebGL    |
| Safari (all versions)        | WebGL\*  |
| iOS (all browsers)           | WebGL\*  |

\*Safari's WebGPU implementation has known issues with Three.js TSL, so WebGL is forced for stability.

## Props

| Prop                    | Type            | Default     | Description                                 |
| ----------------------- | --------------- | ----------- | ------------------------------------------- |
| `textures`              | `BakedTextures` | required    | URLs to 6 baked textures + optional plaster |
| `textureScale`          | `number`        | `1.0`       | Plaster texture tiling scale                |
| `textureStrength`       | `number`        | `0.0`       | Plaster texture blend strength              |
| `multiplyColor`         | `string`        | `"#ffffff"` | Color tint for darkening                    |
| `trailSize`             | `number`        | `0.1`       | Trail brush size                            |
| `trailFadeSpeed`        | `number`        | `0.9`       | Trail persistence (0–1)                     |
| `trailMaxAge`           | `number`        | `120`       | Trail point lifetime in frames              |
| `trailIntensity`        | `number`        | `0.15`      | Trail opacity per stroke                    |
| `ambientIntensity`      | `number`        | `0.2`       | Auto-animated trail intensity               |
| `mouseLerp`             | `number`        | `1.0`       | Mouse smoothing (higher = snappier)         |
| `mouseInfluence`        | `number`        | `0.15`      | Rotation based on mouse position            |
| `rotationSpeed`         | `number`        | `0.0003`    | Auto-rotation speed                         |
| `edgeFade`              | `number`        | `0.0`       | Edge vignette fade distance                 |
| `showRendererIndicator` | `boolean`       | `false`     | Show debug renderer badge (WebGPU only)     |

### WebGL-only Props

| Prop              | Type      | Default     | Description              |
| ----------------- | --------- | ----------- | ------------------------ |
| `fresnelEnabled`  | `boolean` | `false`     | Enable edge glow effect  |
| `fresnelColor`    | `string`  | `"#ffffff"` | Edge glow color          |
| `fresnelStrength` | `number`  | `0.0`       | Edge glow intensity      |
| `aspectRatio`     | `number`  | `1`         | Plane aspect ratio       |
| `trailResolution` | `number`  | `256`       | Trail texture resolution |
| `pauseWhenHidden` | `boolean` | `true`      | Pause when off-screen    |

## Performance Tiers

Device capabilities are scored automatically. The detected tier controls quality settings:

| Setting            | High   | Medium | Low   |
| ------------------ | ------ | ------ | ----- |
| Device Pixel Ratio | 1–2    | 0.5–1  | 0.5–1 |
| Trail Resolution   | 256 px | 128 px | 96 px |
| Gradient Stops     | 6      | 4      | 3     |
| Max Trail Points   | 400    | 250    | 150   |
| Update Interval    | 16 ms  | 20 ms  | 25 ms |
| Ambient Particles  | 3      | 2      | 1     |
| Trail Blur Samples | 5      | 3      | 1     |
| Target FPS         | 45     | 30     | 30    |

Scoring factors: device memory, CPU cores, GPU type (via WebGL debug info), mobile/iOS detection, screen resolution.

## How It Works

### Trail System

1. Mouse/touch position is tracked via window listeners and mapped to canvas UV
2. Trail points are interpolated along the movement vector
3. A Canvas 2D context renders radial gradients for each point (with additive blending)
4. The canvas is uploaded as a texture to the GPU each frame
5. Points fade out based on age; the canvas decays via a semi-transparent black fill

### Shader Pipeline

```
1. Sample trail texture (with optional 5-tap cross blur)
2. Feather with smoothstep + pow curve
3. Blend bake1 → bake6 progressively based on trail intensity
4. Apply multiply color tint (per-channel)
5. (Optional) overlay plaster/detail texture
6. Apply edge-fade vignette
```

## Texture Requirements

**Baked textures (bake1–6):** PNG with alpha, square, power-of-2 recommended. Pre-rendered lighting from flat (bake1) to fully lit (bake6).

**Plaster texture (optional):** PNG, seamless/tileable, power-of-2. Surface detail multiplied over the base.
