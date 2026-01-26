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
  bake1: "/textures/dimcha/new/6.jpg",
  bake2: "/textures/dimcha/new/5.jpg",
  bake3: "/textures/dimcha/new/4.jpg",
  bake4: "/textures/dimcha/new/3.jpg",
  bake5: "/textures/dimcha/new/2.jpg",
  bake6: "/textures/dimcha/new/1.jpg",
  plaster: "/textures/plaster.png",
};

const WEBGL_TEXTURES_2 = {
  bake1: "/textures/new/0006.png",
  bake2: "/textures/new/0005.png",
  bake3: "/textures/new/0004.png",
  bake4: "/textures/new/0003.png",
  bake5: "/textures/new/0002.png",
  bake6: "/textures/new/0001.png",
  plaster: "/textures/plaster.png",
};

export default function NightPage() {
  return (
    <div className="min-h-screen w-screen">
      <BakedRelief
        className="w-full relative aspect-square h-auto"
        textures={WEBGL_TEXTURES}
      />
      <BakedRelief
        className="w-full relative aspect-square h-auto"
        textures={WEBGL_TEXTURES_2}
      />
    </div>
  );
}
