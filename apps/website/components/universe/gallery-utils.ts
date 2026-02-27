import * as THREE from "three";
import { urlForImage } from "@/lib/sanity/sanity.image";
import {
  IMAGE_REQUEST,
  HIGH_RES_IMAGE,
  IMAGE_TILE,
  MAX_IMAGES_PER_PROJECT,
  config,
  GRID_COLUMNS,
} from "./config";
import type {
  ProjectRecord,
  ProjectImageSource,
  GalleryItem,
  InteractionState,
  FocusSelection,
} from "./types";

// Color utilities
export const rgbaToArray = (rgba: string): number[] => {
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  const values = match?.[1];
  if (!values) return [1, 1, 1, 1];
  return values.split(",").map((value, index) => {
    const normalized = parseFloat(value.trim() || "1");
    return index < 3 ? normalized / 255 : normalized;
  });
};

export const toVector4 = (rgba: string) =>
  new THREE.Vector4(...rgbaToArray(rgba));

// Image URL builders
export const buildImageUrl = (image?: ProjectImageSource): string => {
  if (!image?.asset) {
    return "";
  }
  return (
    urlForImage(image)
      ?.width(IMAGE_REQUEST.width)
      ?.height(IMAGE_REQUEST.height)
      ?.fit("crop")
      ?.focalPoint(0.5, 0.4)
      ?.quality(IMAGE_REQUEST.quality)
      ?.url() ?? ""
  );
};

export const buildHighResImageUrl = (image?: ProjectImageSource): string => {
  if (!image?.asset) {
    return "";
  }
  return (
    urlForImage(image)
      ?.width(HIGH_RES_IMAGE.width)
      ?.height(HIGH_RES_IMAGE.height)
      ?.fit("crop")
      ?.focalPoint(0.5, 0.4)
      ?.quality(HIGH_RES_IMAGE.quality)
      ?.url() ?? ""
  );
};

// Project image processing: mainImage + gallery images
export const collectProjectImages = (
  project: ProjectRecord
): ProjectImageSource[] => {
  const mainImage = project.mainImage?.asset ? [project.mainImage] : [];

  const galleryImages =
    project.gallery?.filter((img): img is NonNullable<typeof img> =>
      Boolean(img?.asset)
    ) ?? [];

  return [...mainImage, ...galleryImages].slice(0, MAX_IMAGES_PER_PROJECT);
};

export const buildGalleryItems = (
  projects: ProjectRecord[]
): GalleryItem[] => {
  const seenIds = new Set<string>();
  const galleryItems: GalleryItem[] = [];

  projects.forEach((project) => {
    if (seenIds.has(project._id) || !project.slug?.current) {
      return;
    }
    seenIds.add(project._id);

    const images = collectProjectImages(project);

    images.forEach((image, index) => {
      const imageUrl = buildImageUrl(image);
      if (!imageUrl) {
        return;
      }

      const imageKey = (image as { _key?: string })._key ?? String(index);

      galleryItems.push({
        id: `${project._id}-${imageKey}`,
        title: project.title ?? "Untitled",
        subtitle:
          project.company ?? project.category?.title ?? project.slug.current,
        imageUrl,
        slug: project.slug.current,
        imageSource: image,
      });
    });
  });

  return galleryItems;
};

// Interaction utilities
export const createInteractionState = (): InteractionState => ({
  isDragging: false,
  isClick: true,
  clickStart: 0,
  previousMouse: new THREE.Vector2(),
  offset: new THREE.Vector2(),
  targetOffset: new THREE.Vector2(),
  zoom: 1,
  targetZoom: 1,
  previousOffset: new THREE.Vector2(),
  velocity: new THREE.Vector2(),
  distortionAmount: 1,
  targetDistortionAmount: 1,
  focusBlend: 0,
  targetFocusBlend: 0,
});

export const getSelectionFromPointer = (
  pointerEvent: PointerEvent,
  canvas: HTMLCanvasElement,
  state: InteractionState,
  items: GalleryItem[]
): FocusSelection | null => {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const total = items.length;
  if (!total) return null;

  const screenX = ((pointerEvent.clientX - rect.left) / rect.width) * 2 - 1;
  const screenY = -(((pointerEvent.clientY - rect.top) / rect.height) * 2 - 1);

  const radius = Math.hypot(screenX, screenY);
  const distortion = 1 - 0.08 * radius * radius;

  const aspect = rect.width / rect.height;
  const worldX = screenX * distortion * aspect * state.zoom + state.offset.x;
  const worldY = screenY * distortion * state.zoom + state.offset.y;

  const cellX = Math.floor(worldX / config.cellSize.x);
  const cellY = Math.floor(worldY / config.cellSize.y);

  let texIndex = Math.floor((cellX + cellY * GRID_COLUMNS) % total);
  if (texIndex < 0) texIndex = total + texIndex;

  const targetItem = items[texIndex % total];
  if (!targetItem) {
    return null;
  }

  const centerX = (cellX + 0.5) * config.cellSize.x;
  const centerY = (cellY + 0.5) * config.cellSize.y;

  return {
    item: targetItem,
    cellCenter: { x: centerX, y: centerY },
  };
};

export const getCellCenter = (index: number) => {
  const column = index % GRID_COLUMNS;
  const row = Math.floor(index / GRID_COLUMNS);
  return new THREE.Vector2(
    (column + 0.5) * config.cellSize.x,
    (row + 0.5) * config.cellSize.y
  );
};
