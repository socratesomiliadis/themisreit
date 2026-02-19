import * as THREE from "three";
import { ProjectsQueryResult } from "@/sanity.types";

export type ProjectRecord = ProjectsQueryResult[number];
export type ProjectMainImage = NonNullable<ProjectRecord["mainImage"]>;
export type ProjectGalleryImage = NonNullable<
  NonNullable<ProjectRecord["gallery"]>[number]
>;
export type ProjectImageSource = ProjectMainImage | ProjectGalleryImage;

export type GalleryItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  slug: string;
  imageSource?: ProjectImageSource;
};

export type FocusSelection = {
  item: GalleryItem;
  cellCenter: { x: number; y: number };
};

export type ConfigValues = {
  cellSize: { x: number; y: number };
  minZoom: number;
  zoomLevel: number;
  focusZoom: number;
  focusTargetZoom: number;
  dragSpeed: number;
  scrollSpeed: number;
  wheelZoomFactor: number;
  lerpFactor: number;
  backgroundColor: string;
  hoverColor: string;
};

export type GalleryConfig = {
  cellSize: THREE.Vector2;
  minZoom: number;
  zoomLevel: number;
  focusZoom: number;
  focusTargetZoom: number;
  dragSpeed: number;
  scrollSpeed: number;
  wheelZoomFactor: number;
  lerpFactor: number;
  backgroundColor: string;
  hoverColor: string;
};

export type DevicePreset = "desktop" | "mobile";

export type RuntimePreset = {
  config: ConfigValues;
  dpr: [number, number];
  projectLimit: number | null;
  enableHighResFocus: boolean;
  maxAnisotropy: number;
  focusEnabled: boolean;
};

export type InteractionState = {
  isDragging: boolean;
  isClick: boolean;
  clickStart: number;
  previousMouse: THREE.Vector2;
  offset: THREE.Vector2;
  targetOffset: THREE.Vector2;
  zoom: number;
  targetZoom: number;
  previousOffset: THREE.Vector2;
  velocity: THREE.Vector2;
  distortionAmount: number;
  targetDistortionAmount: number;
  focusBlend: number;
  targetFocusBlend: number;
};

export type GalleryUniforms = {
  uOffset: { value: THREE.Vector2 };
  uResolution: { value: THREE.Vector2 };
  uHoverColor: { value: THREE.Vector4 };
  uBackgroundColor: { value: THREE.Vector4 };
  uMousePos: { value: THREE.Vector2 };
  uVelocity: { value: THREE.Vector2 };
  uZoom: { value: number };
  uCellSize: { value: THREE.Vector2 };
  uTextureCount: { value: number };
  uImageAtlas: { value: THREE.Texture };
  uDistortionAmount: { value: number };
  uHighResTexture: { value: THREE.Texture | null };
  uFocusedIndex: { value: number };
  uFocusBlend: { value: number };
};
