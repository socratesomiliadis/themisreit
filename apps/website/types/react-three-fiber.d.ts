/**
 * Augment JSX for @react-three/fiber when React 19 types take precedence.
 * R3F extends react/jsx-runtime but React 19 may use a different resolution.
 */
import type { ThreeElements } from "@react-three/fiber";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
