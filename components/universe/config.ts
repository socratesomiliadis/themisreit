import * as THREE from "three";
import type {
  ConfigValues,
  GalleryConfig,
  DevicePreset,
  RuntimePreset,
} from "./types";

export const GRID_COLUMNS = 3;
export const CLICK_THRESHOLD_MS = 220;
export const DRAG_THRESHOLD_PX = 2;
export const ZOOM_TRIGGER_DELAY_MS = 80;
export const MAX_IMAGES_PER_PROJECT = 10;

export const DOM_DELTA_SCALE = {
  line: 16,
  page: 360,
} as const;

export const IMAGE_TILE = {
  width: 768,
  height: Math.round((768 * 9) / 16),
} as const;

export const IMAGE_REQUEST_SCALE = 2;
export const IMAGE_REQUEST = {
  width: IMAGE_TILE.width * IMAGE_REQUEST_SCALE,
  height: Math.round((IMAGE_TILE.width * IMAGE_REQUEST_SCALE * 9) / 16),
  quality: 95,
} as const;

export const HIGH_RES_IMAGE = {
  width: 2560,
  height: 1440,
  quality: 98,
} as const;

export const DEVICE_PRESETS: Record<DevicePreset, RuntimePreset> = {
  desktop: {
    config: {
      cellSize: { x: 1.1, y: 0.8 },
      minZoom: 0.85,
      zoomLevel: 1.8,
      focusZoom: 3.2,
      focusTargetZoom: 0.33,
      dragSpeed: 0.003,
      scrollSpeed: 0.0025,
      wheelZoomFactor: 0.0015,
      lerpFactor: 0.075,
      backgroundColor: "rgba(245, 245, 245, 1)",
      hoverColor: "rgba(255, 255, 255, 0.08)",
    },
    dpr: [1.5, 2.5],
    projectLimit: null,
    enableHighResFocus: true,
    maxAnisotropy: Number.POSITIVE_INFINITY,
    focusEnabled: true,
  },
  mobile: {
    config: {
      cellSize: { x: 0.95, y: 0.72 },
      minZoom: 0.75,
      zoomLevel: 1.08,
      focusZoom: 2.4,
      focusTargetZoom: 0.8,
      dragSpeed: 0.0021,
      scrollSpeed: 0.0018,
      wheelZoomFactor: 0.0009,
      lerpFactor: 0.1,
      backgroundColor: "rgba(245, 245, 245, 1)",
      hoverColor: "rgba(255, 255, 255, 0.12)",
    },
    dpr: [1, 1.75],
    projectLimit: 48,
    enableHighResFocus: false,
    maxAnisotropy: 4,
    focusEnabled: false,
  },
};

const createConfig = (values: ConfigValues): GalleryConfig => ({
  cellSize: new THREE.Vector2(values.cellSize.x, values.cellSize.y),
  minZoom: values.minZoom,
  zoomLevel: values.zoomLevel,
  focusZoom: values.focusZoom,
  focusTargetZoom: values.focusTargetZoom,
  dragSpeed: values.dragSpeed,
  scrollSpeed: values.scrollSpeed,
  wheelZoomFactor: values.wheelZoomFactor,
  lerpFactor: values.lerpFactor,
  backgroundColor: values.backgroundColor,
  hoverColor: values.hoverColor,
});

export const config: GalleryConfig = createConfig(
  DEVICE_PRESETS.desktop.config
);

export const applyConfigValues = (values: ConfigValues) => {
  config.cellSize.set(values.cellSize.x, values.cellSize.y);
  config.minZoom = values.minZoom;
  config.zoomLevel = values.zoomLevel;
  config.focusZoom = values.focusZoom;
  config.focusTargetZoom = values.focusTargetZoom;
  config.dragSpeed = values.dragSpeed;
  config.scrollSpeed = values.scrollSpeed;
  config.wheelZoomFactor = values.wheelZoomFactor;
  config.lerpFactor = values.lerpFactor;
  config.backgroundColor = values.backgroundColor;
  config.hoverColor = values.hoverColor;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const clampZoomValue = (value: number) =>
  clamp(value, config.minZoom, Math.max(config.zoomLevel, config.focusZoom));
