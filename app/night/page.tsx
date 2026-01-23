"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Three.js
const BakedRelief = dynamic(
  () => import("@/components/WebGL/baked-relief-webgpu"),
  {
    ssr: false,
    loading: () => null,
  }
);

const WEBGL_TEXTURES = {
    bake1: "/textures/dimcha/6.png",
    bake2: "/textures/dimcha/5.png",
    bake3: "/textures/dimcha/4.png",
    bake4: "/textures/dimcha/3.png",
    bake5: "/textures/dimcha/2.png",
    bake6: "/textures/dimcha/1.png",
    plaster: "/textures/plaster.png",
  };


export default function NightPage() {
  return <div className="h-screen w-screen bg-white">
    <BakedRelief
      className="w-full relative aspect-square h-auto"
   
      textures={WEBGL_TEXTURES}
    />
  </div>;
}