export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fluidShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform vec4 iMouse;
  uniform int iFrame;
  uniform sampler2D iPreviousFrame;
  uniform float uBrushSize;
  uniform float uBrushStrength;
  uniform float uFluidDecay;
  uniform float uTrailLength;
  uniform float uStopDecay;
  varying vec2 vUv;
  
  vec2 ur, U;
  
  float ln(vec2 p, vec2 a, vec2 b) {
      return length(p-a-(b-a)*clamp(dot(p-a,b-a)/dot(b-a,b-a),0.,1.));
  }
  
  vec4 t(vec2 v, int a, int b) {
      return texture2D(iPreviousFrame, fract((v+vec2(float(a),float(b)))/ur));
  }
  
  vec4 t(vec2 v) {
      return texture2D(iPreviousFrame, fract(v/ur));
  }
  
  float area(vec2 a, vec2 b, vec2 c) {
      float A = length(b-c), B = length(c-a), C = length(a-b), s = 0.5*(A+B+C);
      return sqrt(s*(s-A)*(s-B)*(s-C));
  }
  
  void main() {
      U = vUv * iResolution;
      ur = iResolution.xy;
      
      if (iFrame < 1) {
          float w = 0.5+sin(0.2*U.x)*0.5;
          float q = length(U-0.5*ur);
          gl_FragColor = vec4(0.1*exp(-0.001*q*q),0,0,w);
      } else {
          vec2 v = U,
               A = v + vec2( 1, 1),
               B = v + vec2( 1,-1),
               C = v + vec2(-1, 1),
               D = v + vec2(-1,-1);
          
          for (int i = 0; i < 8; i++) {
              v -= t(v).xy;
              A -= t(A).xy;
              B -= t(B).xy;
              C -= t(C).xy;
              D -= t(D).xy;
          }
          
          vec4 me = t(v);
          vec4 n = t(v, 0, 1),
              e = t(v, 1, 0),
              s = t(v, 0, -1),
              w = t(v, -1, 0);
          vec4 ne = .25*(n+e+s+w);
          me = mix(t(v), ne, vec4(0.15,0.15,0.95,0.));
          me.z = me.z - 0.01*((area(A,B,C)+area(B,C,D))-4.);
          
          vec4 pr = vec4(e.z,w.z,n.z,s.z);
          me.xy = me.xy + 100.*vec2(pr.x-pr.y, pr.z-pr.w)/ur;
          
          me.xy *= uFluidDecay;
          me.z *= uTrailLength;
          
          if (iMouse.z > 0.0) {
              vec2 mousePos = iMouse.xy;
              vec2 mousePrev = iMouse.zw;
              vec2 mouseVel = mousePos - mousePrev;
              float velMagnitude = length(mouseVel);
              float q = ln(U, mousePos, mousePrev);
              vec2 m = mousePos - mousePrev;
              float l = length(m);
              if (l > 0.0) m = min(l, 10.0) * m / l;
              
              float brushSizeFactor = 1e-4 / uBrushSize;
              float strengthFactor = 0.03 * uBrushStrength;
              
              float falloff = exp(-brushSizeFactor*q*q*q);
              falloff = pow(falloff, 0.5);
              
              me.xyw += strengthFactor * falloff * vec3(m, 10.);
              
              if (velMagnitude < 2.0) {
                  float distToCursor = length(U - mousePos);
                  float influence = exp(-distToCursor * 0.01);
                  float cursorDecay = mix(1.0, uStopDecay, influence);
                  me.xy *= cursorDecay;
                  me.z *= cursorDecay;
              }
          }
          
          gl_FragColor = clamp(me, -0.4, 0.4);
      }
  }
`;

export const displayShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform sampler2D iFluid;
  uniform float uDistortionAmount;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform float uColorIntensity;
  uniform float uSoftness;
  varying vec2 vUv;
  
  void main() {
    vec2 fragCoord = vUv * iResolution;
    
    vec4 fluid = texture2D(iFluid, vUv);
    vec2 fluidVel = fluid.xy;
    
    float mr = min(iResolution.x, iResolution.y);
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;
    
    uv += fluidVel * (0.5 * uDistortionAmount);
    
    float d = -iTime * 0.5;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
      a += cos(i - d - a * uv.x);
      d += sin(uv.y * i + a);
    }
    d += iTime * 0.5;
    
    float mixer1 = cos(uv.x * d) * 0.5 + 0.5;
    float mixer2 = cos(uv.y * a) * 0.5 + 0.5;
    float mixer3 = sin(d + a) * 0.5 + 0.5;
    
    float smoothAmount = clamp(uSoftness * 0.1, 0.0, 0.9);
    mixer1 = mix(mixer1, 0.5, smoothAmount);
    mixer2 = mix(mixer2, 0.5, smoothAmount);
    mixer3 = mix(mixer3, 0.5, smoothAmount);
    
    vec3 col = mix(uColor1, uColor2, mixer1);
    col = mix(col, uColor3, mixer2);
    col = mix(col, uColor4, mixer3 * 0.4);
    
    col *= uColorIntensity;
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

// New shader for the gooey background with cross/diamond particles
export const gooeyParticleShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform sampler2D iFluid;
  uniform vec2 iMouse;
  uniform float uParticleSize;
  uniform float uMaskIntensity;
  uniform vec3 uBackgroundColor;
  uniform vec3 uParticleColor;
  varying vec2 vUv;
  
  // Random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  // Noise function
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  // Pixelated X shape function
  float pixelatedX(vec2 p, float size) {
    p = abs(p);
    
    // Create a pixelated X pattern
    // Main diagonal: when x ≈ y
    float mainDiag = step(abs(p.x - p.y), size * 0.3);
    
    // Anti-diagonal: when x + y ≈ constant (around the center)
    float center = size * 0.7071; // sqrt(2)/2 * size for proper scaling
    float antiDiag = step(abs(p.x + p.y - center), size * 0.3);
    
    // Combine both diagonals, but ensure they intersect properly
    float x = max(mainDiag, antiDiag);
    
    // Add pixelation by quantizing the position
    vec2 pixelSize = vec2(size * 0.2);
    vec2 pixelatedP = floor(p / pixelSize) * pixelSize;
    
    // Recalculate with pixelated coordinates for sharper edges
    pixelatedP = abs(pixelatedP);
    float pixelMainDiag = step(abs(pixelatedP.x - pixelatedP.y), size * 0.25);
    float pixelAntiDiag = step(abs(pixelatedP.x + pixelatedP.y - center), size * 0.25);
    
    float pixelX = max(pixelMainDiag, pixelAntiDiag);
    
    // Ensure the X is contained within a square boundary
    float boundary = step(max(p.x, p.y), size);
    
    return pixelX * boundary;
  }
  
  // Create particle pattern
  float particles(vec2 uv) {
    vec2 grid = vec2(120.0); // Much higher density for closer particles
    vec2 id = floor(uv * grid);
    vec2 p = fract(uv * grid) - 0.5;
    
    // Add randomness to break up grid pattern
    vec2 offset = vec2(
      random(id) * 0.4 - 0.2,
      random(id + 100.0) * 0.4 - 0.2
    );
    p += offset;
    
    // Wrap positions to avoid gaps
    p = fract(p + 0.5) - 0.5;
    
    // Vary particle size
    float sizeVariation = 0.5 + 0.5 * random(id + 200.0);
    float size = uParticleSize * sizeVariation;
    
    // Create pixelated X shape
    float particle = pixelatedX(p, size);
    
    // Random intensity variation
    float intensity = 0.6 + 0.4 * random(id + 300.0);
    
    // Add a second overlapping grid for even more density
    vec2 grid2 = vec2(100.0);
    vec2 id2 = floor(uv * grid2 + 0.3); // Offset second grid
    vec2 p2 = fract(uv * grid2 + 0.3) - 0.5;
    
    vec2 offset2 = vec2(
      random(id2 + 500.0) * 0.35 - 0.175,
      random(id2 + 600.0) * 0.35 - 0.175
    );
    p2 += offset2;
    p2 = fract(p2 + 0.5) - 0.5;
    
    float sizeVariation2 = 0.4 + 0.4 * random(id2 + 700.0);
    float size2 = uParticleSize * sizeVariation2;
    float particle2 = pixelatedX(p2, size2);
    float intensity2 = 0.5 + 0.3 * random(id2 + 800.0);
    
    // Combine both grids
    float result = (particle * intensity) + (particle2 * intensity2 * 0.6);
    
    return clamp(result, 0.0, 1.0);
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 fragCoord = uv * iResolution;
    
    // Sample the fluid simulation texture
    vec4 fluid = texture2D(iFluid, uv);
    
    // Create particle pattern
    float particlePattern = particles(uv);
    
    // Use fluid simulation as reveal mask
    float fluidMask = length(fluid.xy) * uMaskIntensity;
    fluidMask += fluid.z * 0.4;
    fluidMask = smoothstep(0.0, 1.0, fluidMask);
    
    // Calculate distance from current pixel to mouse cursor
    vec2 mousePos = iMouse;
    float distanceToMouse = length(fragCoord - mousePos);
    
    // Create distance-based fade (closer = brighter, farther = darker)
    float maxDistance = min(iResolution.x, iResolution.y) * 0.6; // Fade distance
    float distanceFade = 1.0 - smoothstep(0.0, maxDistance, distanceToMouse);
    distanceFade = pow(distanceFade, 1.5); // Make the fade more dramatic
    
    // Apply reveal effect - particles only visible where fluid mask is active
    float revealedParticles = particlePattern * fluidMask;
    
    // Apply distance fade to revealed particles
    float fadedParticles = revealedParticles * (0.1 + distanceFade * 0.9);
    
    // Mix background and particle colors
    vec3 color = mix(uBackgroundColor, uParticleColor, fadedParticles);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
