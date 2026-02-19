import * as THREE from "three";
import { IMAGE_TILE, HIGH_RES_IMAGE } from "./config";

export const getTextureFilters = (useMipmaps: boolean) => ({
  min: useMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter,
  mag: THREE.LinearFilter,
});

export const createCanvasTexture = (
  canvas: HTMLCanvasElement,
  {
    minFilter = THREE.LinearFilter,
    magFilter = THREE.LinearFilter,
    flipY = false,
    anisotropy = 1,
    generateMipmaps = false,
  }: {
    minFilter?: THREE.MinificationTextureFilter;
    magFilter?: THREE.MagnificationTextureFilter;
    flipY?: boolean;
    anisotropy?: number;
    generateMipmaps?: boolean;
  } = {}
) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = minFilter;
  texture.magFilter = magFilter;
  texture.flipY = flipY;
  texture.generateMipmaps = generateMipmaps;
  texture.anisotropy = anisotropy;
  texture.format = THREE.RGBAFormat;
  return texture;
};

export const loadImageElement = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export const createImageTexture = (
  image: HTMLImageElement,
  {
    anisotropy = 1,
    minFilter = THREE.LinearFilter,
    magFilter = THREE.LinearFilter,
    generateMipmaps = false,
  }: {
    anisotropy?: number;
    minFilter?: THREE.MinificationTextureFilter;
    magFilter?: THREE.MagnificationTextureFilter;
    generateMipmaps?: boolean;
  } = {}
) => {
  const texture = new THREE.Texture(image);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = minFilter;
  texture.magFilter = magFilter;
  texture.generateMipmaps = generateMipmaps;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
};

export const createCroppedHighResTexture = (
  image: HTMLImageElement,
  {
    anisotropy = 1,
    minFilter = THREE.LinearFilter,
    magFilter = THREE.LinearFilter,
    generateMipmaps = false,
  }: {
    anisotropy?: number;
    minFilter?: THREE.MinificationTextureFilter;
    magFilter?: THREE.MagnificationTextureFilter;
    generateMipmaps?: boolean;
  } = {}
) => {
  const targetAspect = 16 / 9;
  const canvas = document.createElement("canvas");
  canvas.width = HIGH_RES_IMAGE.width;
  canvas.height = HIGH_RES_IMAGE.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imgWidth = image.naturalWidth || image.width;
  const imgHeight = image.naturalHeight || image.height;
  const imgAspect = imgWidth / imgHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imgWidth;
  let sourceHeight = imgHeight;

  // Crop to match target aspect ratio
  if (imgAspect > targetAspect) {
    sourceHeight = imgHeight;
    sourceWidth = imgHeight * targetAspect;
    sourceX = (imgWidth - sourceWidth) / 2;
  } else {
    sourceWidth = imgWidth;
    sourceHeight = imgWidth / targetAspect;
    sourceY = (imgHeight - sourceHeight) / 2;
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return createCanvasTexture(canvas, {
    minFilter,
    magFilter,
    flipY: true,
    anisotropy,
    generateMipmaps,
  });
};

export const createTextureAtlas = async (
  textures: THREE.Texture[],
  {
    anisotropy = 1,
    useMipmaps = false,
  }: {
    anisotropy?: number;
    useMipmaps?: boolean;
  } = {}
): Promise<THREE.Texture | null> => {
  const atlasSize = Math.ceil(Math.sqrt(Math.max(1, textures.length)));
  const tile = IMAGE_TILE;
  const targetAspect = tile.width / tile.height;
  const canvas = document.createElement("canvas");
  canvas.width = atlasSize * tile.width;
  canvas.height = atlasSize * tile.height;
  const ctx = canvas.getContext("2d", {
    willReadFrequently: false,
    alpha: false,
  });
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Process images in batches to avoid blocking
  const BATCH_SIZE = 3;
  for (let i = 0; i < textures.length; i += BATCH_SIZE) {
    const batch = textures.slice(i, Math.min(i + BATCH_SIZE, textures.length));

    batch.forEach((texture, batchIndex) => {
      const index = i + batchIndex;
      const image = texture.image as HTMLCanvasElement | HTMLImageElement;
      if (!image || (image instanceof HTMLImageElement && !image.complete)) {
        return;
      }

      const x = (index % atlasSize) * tile.width;
      const y = Math.floor(index / atlasSize) * tile.height;

      const imgWidth =
        image instanceof HTMLImageElement
          ? image.naturalWidth || image.width || tile.width
          : image.width || tile.width;
      const imgHeight =
        image instanceof HTMLImageElement
          ? image.naturalHeight || image.height || tile.height
          : image.height || tile.height;
      const imgAspect = imgWidth / imgHeight;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = imgWidth;
      let sourceHeight = imgHeight;

      if (imgAspect > targetAspect) {
        sourceHeight = imgHeight;
        sourceWidth = imgHeight * targetAspect;
        sourceX = (imgWidth - sourceWidth) / 2;
      } else {
        sourceWidth = imgWidth;
        sourceHeight = imgWidth / targetAspect;
        sourceY = (imgHeight - sourceHeight) / 2;
      }

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        x,
        y,
        tile.width,
        tile.height
      );
    });

    // Yield to browser after each batch
    if (i + BATCH_SIZE < textures.length) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }

  const filters = getTextureFilters(useMipmaps);

  return createCanvasTexture(canvas, {
    minFilter: filters.min,
    magFilter: filters.mag,
    flipY: true,
    anisotropy,
    generateMipmaps: useMipmaps,
  });
};
