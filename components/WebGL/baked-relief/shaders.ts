// Simple vertex shader
export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Trail blur sample counts
export type TrailBlurSamples = 1 | 3 | 5;

/**
 * Generate fragment shader with configurable quality
 * @param blurSamples - Number of trail blur samples (1 = no blur, 3 = light, 5 = full)
 */
export function createFragmentShader(blurSamples: TrailBlurSamples = 5): string {
  // Generate trail sampling code based on blur level
  let trailSamplingCode: string;

  if (blurSamples === 1) {
    // No blur - single sample (fastest)
    trailSamplingCode = `
    float rawTrail = texture2D(tTrail, uv).r;`;
  } else if (blurSamples === 3) {
    // Light blur - 3 samples
    trailSamplingCode = `
    vec2 texelSize = vec2(1.0 / 256.0);
    float rawTrail = texture2D(tTrail, uv).r * 0.5;
    rawTrail += texture2D(tTrail, uv + vec2(texelSize.x, 0.0)).r * 0.25;
    rawTrail += texture2D(tTrail, uv + vec2(0.0, texelSize.y)).r * 0.25;`;
  } else {
    // Full blur - 5 samples (original quality)
    trailSamplingCode = `
    vec2 texelSize = vec2(1.0 / 512.0);
    float rawTrail = texture2D(tTrail, uv).r * 0.4;
    rawTrail += texture2D(tTrail, uv + vec2(texelSize.x, 0.0)).r * 0.15;
    rawTrail += texture2D(tTrail, uv - vec2(texelSize.x, 0.0)).r * 0.15;
    rawTrail += texture2D(tTrail, uv + vec2(0.0, texelSize.y)).r * 0.15;
    rawTrail += texture2D(tTrail, uv - vec2(0.0, texelSize.y)).r * 0.15;`;
  }

  return /* glsl */ `
  uniform sampler2D tBake1;
  uniform sampler2D tBake2;
  uniform sampler2D tBake3;
  uniform sampler2D tBake4;
  uniform sampler2D tBake5;
  uniform sampler2D tBake6;
  uniform sampler2D tPlaster;
  uniform sampler2D tTrail;
  
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uTextureScale;
  uniform float uTextureStrength;
  uniform vec3 uMultiplyColor;
  uniform float uFresnelEnabled;
  uniform vec3 uFresnelColor;
  uniform float uFresnelStrength;
  uniform float uEdgeFade;
  
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    
    // Sample trail${trailSamplingCode}
    
    // Apply feathering/smoothing to the trail edges
    float trail = smoothstep(0.0, 0.3, rawTrail) * smoothstep(0.0, 1.0, rawTrail);
    trail = pow(trail, 0.7);
    
    // Sample plaster/grunge texture with tiling
    vec4 plaster = texture2D(tPlaster, uv * uTextureScale);
    
    // Sample all 6 baked textures
    vec4 bake1 = texture2D(tBake1, uv);
    vec4 bake2 = texture2D(tBake2, uv);
    vec4 bake3 = texture2D(tBake3, uv);
    vec4 bake4 = texture2D(tBake4, uv);
    vec4 bake5 = texture2D(tBake5, uv);
    vec4 bake6 = texture2D(tBake6, uv);
    
    // Progressive blend through the 6 textures based on trail intensity
    // Using smoothstep for branchless blending (better GPU performance)
    float t = trail * 5.0;
    
    vec4 color = mix(bake1, bake2, smoothstep(0.0, 1.0, t));
    color = mix(color, bake3, smoothstep(1.0, 2.0, t));
    color = mix(color, bake4, smoothstep(2.0, 3.0, t));
    color = mix(color, bake5, smoothstep(3.0, 4.0, t));
    color = mix(color, bake6, smoothstep(4.0, 5.0, t));
    
    // Apply multiply color - darkens the base
    color.rgb *= uMultiplyColor;
    
    // Apply grunge/plaster texture as multiply
    color.rgb *= mix(vec3(1.0), plaster.rgb, uTextureStrength);
    
    // Edge glow effect at trail boundaries (skip if disabled)
    if (uFresnelEnabled > 0.5) {
      float edgeGlow = smoothstep(0.05, 0.2, trail) - smoothstep(0.3, 0.7, trail);
      color.rgb += uFresnelColor * edgeGlow * uFresnelStrength;
      color.rgb += uFresnelColor * trail * uFresnelStrength * 0.08;
    }
    
    // Edge fade/vignette for smooth blending
    vec2 edgeDist = min(uv, 1.0 - uv);
    float fadeX = smoothstep(0.0, uEdgeFade + 0.001, edgeDist.x);
    float fadeY = smoothstep(0.0, uEdgeFade + 0.001, edgeDist.y);
    color.a *= fadeX * fadeY;
    
    gl_FragColor = color;
  }
`;
}

// Default fragment shader (high quality)
export const fragmentShader = createFragmentShader(5);
