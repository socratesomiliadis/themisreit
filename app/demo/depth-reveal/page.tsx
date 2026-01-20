"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import BakedReliefControls from "@/components/WebGL/baked-relief-controls";

// Dynamic import to avoid SSR issues with Three.js
const BakedRelief = dynamic(() => import("@/components/WebGL/baked-relief"), {
  ssr: false,
  loading: () => <LoadingPlaceholder />,
});

function LoadingPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-neutral-950">
      <div className="text-neutral-500 text-sm font-mono">Loading WebGL...</div>
    </div>
  );
}

export default function BakedReliefDemo() {
  // Texture controls
  const [textureScale, setTextureScale] = useState(5.0);
  const [textureStrength, setTextureStrength] = useState(1.0); // Full grunge like davincii
  const [multiplyColor, setMultiplyColor] = useState("#1c1c1c"); // Darken base like davincii

  // Glow controls
  const [fresnelEnabled, setFresnelEnabled] = useState(false);
  const [fresnelColor, setFresnelColor] = useState("#ffffff");
  const [fresnelStrength, setFresnelStrength] = useState(0);

  // Trail controls
  const [trailSize, setTrailSize] = useState(0.08);
  const [trailFadeSpeed, setTrailFadeSpeed] = useState(0.9);
  const [trailIntensity, setTrailIntensity] = useState(0.05);
  const [ambientIntensity, setAmbientIntensity] = useState(0.2);
  const [mouseLerp, setMouseLerp] = useState(1);

  // Rotation controls
  const [mouseInfluence, setMouseInfluence] = useState(0.05);
  const [rotationSpeed, setRotationSpeed] = useState(0.0003);

  // Layout
  const [edgeFade, setEdgeFade] = useState(0.1);
  const [aspectRatio, setAspectRatio] = useState(1);

  return (
    <div
      style={{
        backgroundColor: "#161616",
      }}
      className="min-h-screen bg-[#d9d9d9] text-white flex justify-center"
    >
      {/* Controls Panel */}
      <BakedReliefControls
        className="fixed top-4 left-4 z-50"
        title="Baked Relief"
        subtitle={
          <>
            No 3D model needed - just 6 images!
            <br />
            Inspired by{" "}
            <a
              href="https://davincii.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 hover:text-white underline"
            >
              davincii.com
            </a>
          </>
        }
        textureScale={textureScale}
        setTextureScale={setTextureScale}
        textureStrength={textureStrength}
        setTextureStrength={setTextureStrength}
        multiplyColor={multiplyColor}
        setMultiplyColor={setMultiplyColor}
        fresnelEnabled={fresnelEnabled}
        setFresnelEnabled={setFresnelEnabled}
        fresnelColor={fresnelColor}
        setFresnelColor={setFresnelColor}
        fresnelStrength={fresnelStrength}
        setFresnelStrength={setFresnelStrength}
        trailSize={trailSize}
        setTrailSize={setTrailSize}
        trailFadeSpeed={trailFadeSpeed}
        setTrailFadeSpeed={setTrailFadeSpeed}
        trailIntensity={trailIntensity}
        setTrailIntensity={setTrailIntensity}
        ambientIntensity={ambientIntensity}
        setAmbientIntensity={setAmbientIntensity}
        mouseLerp={mouseLerp}
        setMouseLerp={setMouseLerp}
        mouseInfluence={mouseInfluence}
        setMouseInfluence={setMouseInfluence}
        rotationSpeed={rotationSpeed}
        setRotationSpeed={setRotationSpeed}
        edgeFade={edgeFade}
        setEdgeFade={setEdgeFade}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
      />

      {/* WebGL Canvas */}
      <div className="min-w-[150vw] w-[150vw] max-w-none h-auto aspect-square">
        <BakedRelief
          textures={{
            bake1: "/textures/0006.png",
            bake2: "/textures/0005.png",
            bake3: "/textures/0004.png",
            bake4: "/textures/0003.png",
            bake5: "/textures/0002.png",
            bake6: "/textures/0001.png",
            // Use grungeWall as the plaster texture for the dark davincii effect
            plaster: "/textures/plaster.png",
          }}
          textureScale={textureScale}
          textureStrength={textureStrength}
          multiplyColor={multiplyColor}
          fresnelEnabled={fresnelEnabled}
          fresnelColor={fresnelColor}
          fresnelStrength={fresnelStrength}
          trailSize={trailSize}
          trailFadeSpeed={trailFadeSpeed}
          trailIntensity={trailIntensity}
          ambientIntensity={ambientIntensity}
          mouseLerp={mouseLerp}
          mouseInfluence={mouseInfluence}
          rotationSpeed={rotationSpeed}
          edgeFade={edgeFade}
          aspectRatio={aspectRatio}
        />
      </div>
    </div>
  );
}
