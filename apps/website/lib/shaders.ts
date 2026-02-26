export const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  // Visual constants
  const float LENS_STRENGTH = 0.1;
  const float EDGE_SMOOTH = 0.005;
  const float GRID_COLUMNS = 3.0;
  
  // Image sizing
  const float IMAGE_WIDTH = 0.8;
  const float IMAGE_ASPECT = 16.0 / 9.0;
  
  // Hover effect
  const float HOVER_INNER = 0.4;
  const float HOVER_OUTER = 0.7;
  
  // Edge fade
  const float FADE_START = 1.2;
  const float FADE_END = 1.8;
  
  // Uniforms
  uniform vec2 uOffset;
  uniform vec2 uResolution;
  uniform vec4 uHoverColor;
  uniform vec4 uBackgroundColor;
  uniform vec2 uMousePos;
  uniform float uZoom;
  uniform vec2 uCellSize;
  uniform float uTextureCount;
  uniform sampler2D uImageAtlas;
  uniform float uDistortionAmount;
  uniform sampler2D uHighResTexture;
  uniform float uFocusedIndex;
  uniform float uFocusBlend;
  
  varying vec2 vUv;
  
  // Apply barrel distortion effect
  vec2 applyLensDistortion(vec2 coord, float amount) {
    float radius = length(coord);
    float distortion = 1.0 - LENS_STRENGTH * radius * radius * amount;
    return coord * distortion;
  }
  
  // Convert normalized device coordinates to world space
  vec2 screenToWorld(vec2 screenCoord, vec2 aspect, float zoom, vec2 offset, float distortion) {
    vec2 distorted = applyLensDistortion(screenCoord, distortion);
    return distorted * aspect * zoom + offset;
  }
  
  // Convert world coordinates to cell grid coordinates
  vec2 worldToCell(vec2 worldCoord, vec2 cellSize) {
    return worldCoord / cellSize;
  }
  
  // Positive modulo (handles negative numbers correctly)
  float positiveModulo(float value, float divisor) {
    return mod(mod(value, divisor) + divisor, divisor);
  }
  
  // Get UV coordinates for a texture in the atlas
  vec2 getAtlasUV(float textureIndex, float atlasSize, vec2 localUV) {
    float col = mod(textureIndex, atlasSize);
    float row = floor(textureIndex / atlasSize);
    float flippedRow = (atlasSize - 1.0) - row;
    
    return vec2(
      (col + localUV.x) / atlasSize,
      (flippedRow + localUV.y) / atlasSize
    );
  }
  
  // Calculate hover intensity based on distance from mouse
  float getHoverIntensity(vec2 cellId, vec2 mouseCellId, bool mouseActive) {
    if (!mouseActive) return 0.0;
    
    vec2 cellCenter = cellId + 0.5;
    vec2 mouseCellCenter = mouseCellId + 0.5;
    float distance = length(cellCenter - mouseCellCenter);
    
    return 1.0 - smoothstep(HOVER_INNER, HOVER_OUTER, distance);
  }
  
  // Get texture index for a given cell
  float getCellTextureIndex(vec2 cellId, float textureCount) {
    float rawIndex = cellId.x + cellId.y * GRID_COLUMNS;
    return positiveModulo(rawIndex, textureCount);
  }
  
  void main() {
    // Convert UV to normalized screen coordinates (-1 to 1)
    vec2 screenCoord = (vUv - 0.5) * 2.0;
    vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);
    
    // Transform screen coordinates to world space
    vec2 worldCoord = screenToWorld(screenCoord, aspectRatio, uZoom, uOffset, uDistortionAmount);
    
    // Determine which cell we're in
    vec2 cellPos = worldToCell(worldCoord, uCellSize);
    vec2 cellId = floor(cellPos);
    vec2 cellUV = fract(cellPos);
    
    // Calculate mouse position in world space
    vec2 mouseScreenCoord = (uMousePos / uResolution) * 2.0 - 1.0;
    mouseScreenCoord.y = -mouseScreenCoord.y;
    vec2 mouseWorldCoord = screenToWorld(mouseScreenCoord, aspectRatio, uZoom, uOffset, uDistortionAmount);
    vec2 mouseCellId = floor(worldToCell(mouseWorldCoord, uCellSize));
    
    // Calculate hover effect
    bool mouseActive = uMousePos.x >= 0.0;
    float hoverIntensity = getHoverIntensity(cellId, mouseCellId, mouseActive);
    
    // Apply hover color to background
    vec3 bgColor = uBackgroundColor.rgb;
    if (hoverIntensity > 0.0) {
      bgColor = mix(bgColor, uHoverColor.rgb, hoverIntensity * uHoverColor.a);
    }
    
    // Calculate image bounds within cell
    float cellAspect = uCellSize.x / uCellSize.y;
    float imageHeight = IMAGE_WIDTH * (1.0 / IMAGE_ASPECT) * cellAspect;
    vec2 imageBorder = vec2((1.0 - IMAGE_WIDTH) * 0.5, 0.0);
    
    // Get UV coordinates within the image
    vec2 imageUV = (cellUV - imageBorder) / vec2(IMAGE_WIDTH, imageHeight);
    
    // Calculate smooth edge mask for the image
    vec2 edgeMask = smoothstep(-EDGE_SMOOTH, EDGE_SMOOTH, imageUV) * 
                    smoothstep(-EDGE_SMOOTH, EDGE_SMOOTH, 1.0 - imageUV);
    float imageAlpha = edgeMask.x * edgeMask.y;
    
    // Check if we're within the image bounds
    bool inBounds = all(greaterThanEqual(imageUV, vec2(0.0))) && 
                    all(lessThanEqual(imageUV, vec2(1.0)));
    
    // Start with background color
    vec3 finalColor = bgColor;
    
    // Sample and blend image if we're within bounds
    if (inBounds && imageAlpha > 0.0) {
      float atlasSize = ceil(sqrt(uTextureCount));
      float textureIndex = getCellTextureIndex(cellId, uTextureCount);
      
      vec3 imageColor;
      bool isFocused = uFocusedIndex >= 0.0 && abs(textureIndex - uFocusedIndex) < 0.5;
      
      if (isFocused && uFocusBlend > 0.0) {
        // Blend between atlas and high-res texture for focused cell
        vec3 atlasColor = texture2D(uImageAtlas, getAtlasUV(textureIndex, atlasSize, imageUV)).rgb;
        vec3 highResColor = texture2D(uHighResTexture, imageUV).rgb;
        imageColor = mix(atlasColor, highResColor, uFocusBlend);
      } else {
        // Use atlas texture
        imageColor = texture2D(uImageAtlas, getAtlasUV(textureIndex, atlasSize, imageUV)).rgb;
      }
      
      finalColor = mix(finalColor, imageColor, imageAlpha);
    }
    
    // Apply edge fade
    float edgeFade = 1.0 - smoothstep(FADE_START, FADE_END, length(screenCoord));
    
    gl_FragColor = vec4(finalColor * edgeFade, 1.0);
  }
`;
