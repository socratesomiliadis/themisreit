// Simple vertex shader
export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader - blends through 6 baked textures based on trail
export const fragmentShader = /* glsl */ `
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
    
    // Sample trail with slight blur to remove edge artifacts
    vec2 texelSize = vec2(1.0 / 512.0);
    float rawTrail = 0.0;
    rawTrail += texture2D(tTrail, uv).r * 0.4;
    rawTrail += texture2D(tTrail, uv + vec2(texelSize.x, 0.0)).r * 0.15;
    rawTrail += texture2D(tTrail, uv - vec2(texelSize.x, 0.0)).r * 0.15;
    rawTrail += texture2D(tTrail, uv + vec2(0.0, texelSize.y)).r * 0.15;
    rawTrail += texture2D(tTrail, uv - vec2(0.0, texelSize.y)).r * 0.15;
    
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
    vec4 color;
    float t = trail * 5.0;
    
    if (t < 1.0) {
      color = mix(bake1, bake2, t);
    } else if (t < 2.0) {
      color = mix(bake2, bake3, t - 1.0);
    } else if (t < 3.0) {
      color = mix(bake3, bake4, t - 2.0);
    } else if (t < 4.0) {
      color = mix(bake4, bake5, t - 3.0);
    } else {
      color = mix(bake5, bake6, min(t - 4.0, 1.0));
    }
    
    // Apply multiply color (like davincii's uColor) - darkens the base
    color.rgb *= uMultiplyColor;
    
    // Apply grunge/plaster texture as FULL multiply
    color.rgb *= mix(vec3(1.0), plaster.rgb, uTextureStrength);
    
    // Edge glow effect at trail boundaries
    if (uFresnelEnabled > 0.5) {
      float edgeGlow = smoothstep(0.05, 0.2, trail) - smoothstep(0.3, 0.7, trail);
      color.rgb += uFresnelColor * edgeGlow * uFresnelStrength;
      color.rgb += uFresnelColor * trail * uFresnelStrength * 0.08;
    }
    
    // Edge fade/vignette for smooth blending with surrounding content
    if (uEdgeFade > 0.0) {
      vec2 edgeDist = min(uv, 1.0 - uv);
      float fadeX = smoothstep(0.0, uEdgeFade, edgeDist.x);
      float fadeY = smoothstep(0.0, uEdgeFade, edgeDist.y);
      float edgeAlpha = fadeX * fadeY;
      color.a *= edgeAlpha;
    }
    
    gl_FragColor = color;
  }
`;
