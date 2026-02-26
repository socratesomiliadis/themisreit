/**
 * Baked Relief Component
 *
 * Creates the davincii.com effect using ONLY images - no 3D model needed!
 * The 3D effect comes from baked lighting/shadows in the textures.
 *
 * Uses 6 baked images that blend from flat/invisible to fully revealed
 * as you draw with the mouse trail.
 *
 * This file re-exports the modular implementation for backwards compatibility.
 */

// Re-export everything from the modular implementation
export { default } from "./baked-relief/index";
export type { BakedReliefProps, BakedTextures } from "./baked-relief/types";
