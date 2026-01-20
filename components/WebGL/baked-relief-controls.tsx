"use client";

import { ReactNode } from "react";

export interface BakedReliefControlsProps {
  // Texture controls
  textureScale: number;
  setTextureScale: (value: number) => void;
  textureStrength: number;
  setTextureStrength: (value: number) => void;
  multiplyColor?: string;
  setMultiplyColor?: (value: string) => void;

  // Glow controls
  fresnelEnabled: boolean;
  setFresnelEnabled: (value: boolean) => void;
  fresnelColor: string;
  setFresnelColor: (value: string) => void;
  fresnelStrength: number;
  setFresnelStrength: (value: number) => void;

  // Trail controls
  trailSize: number;
  setTrailSize: (value: number) => void;
  trailFadeSpeed: number;
  setTrailFadeSpeed: (value: number) => void;
  trailIntensity: number;
  setTrailIntensity: (value: number) => void;
  ambientIntensity?: number;
  setAmbientIntensity?: (value: number) => void;
  mouseLerp: number;
  setMouseLerp: (value: number) => void;

  // Rotation controls
  mouseInfluence: number;
  setMouseInfluence: (value: number) => void;
  rotationSpeed: number;
  setRotationSpeed: (value: number) => void;

  // Edge fade
  edgeFade?: number;
  setEdgeFade?: (value: number) => void;

  // Aspect ratio
  aspectRatio?: number;
  setAspectRatio?: (value: number) => void;

  // Optional customization
  title?: string;
  subtitle?: ReactNode;
  className?: string;
}

export default function BakedReliefControls({
  textureScale,
  setTextureScale,
  textureStrength,
  setTextureStrength,
  multiplyColor,
  setMultiplyColor,
  fresnelEnabled,
  setFresnelEnabled,
  fresnelColor,
  setFresnelColor,
  fresnelStrength,
  setFresnelStrength,
  trailSize,
  setTrailSize,
  trailFadeSpeed,
  setTrailFadeSpeed,
  trailIntensity,
  setTrailIntensity,
  ambientIntensity,
  setAmbientIntensity,
  mouseLerp,
  setMouseLerp,
  mouseInfluence,
  setMouseInfluence,
  rotationSpeed,
  setRotationSpeed,
  edgeFade,
  setEdgeFade,
  aspectRatio,
  setAspectRatio,
  title = "Baked Relief",
  subtitle,
  className = "",
}: BakedReliefControlsProps) {
  return (
    <div
      className={`bg-black/85 backdrop-blur-md border border-neutral-800 rounded-xl p-5 w-72 font-mono text-sm max-h-[calc(100vh-2rem)] overflow-y-auto ${className}`}
    >
      <h2 className="text-lg font-semibold mb-1 text-neutral-100">{title}</h2>
      {subtitle && <p className="text-xs text-neutral-500 mb-4">{subtitle}</p>}

      {/* Glow Section */}
      <div className="border-t border-neutral-800 pt-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs text-neutral-400 uppercase tracking-wider">
            Edge Glow
          </h3>
          <button
            onClick={() => setFresnelEnabled(!fresnelEnabled)}
            className={`px-2 py-1 text-[10px] rounded border transition-colors ${
              fresnelEnabled
                ? "bg-white text-black border-white"
                : "bg-transparent text-neutral-500 border-neutral-700"
            }`}
          >
            {fresnelEnabled ? "ON" : "OFF"}
          </button>
        </div>

        <div
          className={`mb-3 ${
            !fresnelEnabled ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <label className="block text-neutral-400 mb-1 text-xs">Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={fresnelColor}
              onChange={(e) => setFresnelColor(e.target.value)}
              className="w-8 h-8 rounded border border-neutral-700 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={fresnelColor}
              onChange={(e) => setFresnelColor(e.target.value)}
              className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-200 font-mono"
            />
          </div>
        </div>

        <div
          className={`mb-3 ${
            !fresnelEnabled ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <label className="flex justify-between text-neutral-400 mb-1 text-xs">
            <span>Intensity</span>
            <span className="text-neutral-300">
              {fresnelStrength.toFixed(2)}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={fresnelStrength}
            onChange={(e) => setFresnelStrength(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>

      {/* Grunge/Wall Texture Section */}
      <div className="border-t border-neutral-800 pt-3 mb-3">
        <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-3">
          Grunge Texture
        </h3>

        <div className="mb-3">
          <label className="flex justify-between text-neutral-400 mb-1 text-xs">
            <span>Scale</span>
            <span className="text-neutral-300">{textureScale.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={textureScale}
            onChange={(e) => setTextureScale(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
          />
        </div>

        <div className="mb-3">
          <label className="flex justify-between text-neutral-400 mb-1 text-xs">
            <span>Strength</span>
            <span className="text-neutral-300">
              {textureStrength.toFixed(2)}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={textureStrength}
            onChange={(e) => setTextureStrength(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
          />
        </div>

        {/* Multiply Color - darkens the base like davincii.com */}
        {setMultiplyColor && (
          <div className="mb-3">
            <label className="block text-neutral-400 mb-1 text-xs">
              Darken Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={multiplyColor ?? "#ffffff"}
                onChange={(e) => setMultiplyColor(e.target.value)}
                className="w-8 h-8 rounded border border-neutral-700 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={multiplyColor ?? "#ffffff"}
                onChange={(e) => setMultiplyColor(e.target.value)}
                className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-200 font-mono"
              />
            </div>
            <p className="text-[10px] text-neutral-600 mt-1">
              Lower = darker (like davincii&apos;s dark wall effect)
            </p>
          </div>
        )}
      </div>

      {/* Trail Section */}
      <div className="border-t border-neutral-800 pt-3 mb-3">
        <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-3">
          Trail
        </h3>

        <div className="mb-3">
          <label className="flex justify-between text-neutral-400 mb-1 text-xs">
            <span>Size</span>
            <span className="text-neutral-300">{trailSize.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.05"
            max="0.25"
            step="0.01"
            value={trailSize}
            onChange={(e) => setTrailSize(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
          />
        </div>

        <div className="mb-3">
          <label className="flex justify-between text-neutral-400 mb-1 text-xs">
            <span>Persistence</span>
            <span className="text-neutral-300">
              {trailFadeSpeed.toFixed(3)}
            </span>
          </label>
          <input
            type="range"
            min="0.75"
            max="0.995"
            step="0.01"
            value={trailFadeSpeed}
            onChange={(e) => setTrailFadeSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
          />
        </div>

        <div className="mb-3">
          <label className="flex justify-between text-neutral-400 mb-1 text-xs">
            <span>Intensity</span>
            <span className="text-neutral-300">
              {trailIntensity.toFixed(2)}
            </span>
          </label>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.01"
            value={trailIntensity}
            onChange={(e) => setTrailIntensity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
          />
          <p className="text-[10px] text-neutral-600 mt-1">
            Lower = more gradual reveal
          </p>
        </div>

        {/* Ambient Trails - automatic trails without mouse */}
        {setAmbientIntensity && (
          <div className="mb-3">
            <label className="flex justify-between text-neutral-400 mb-1 text-xs">
              <span>Ambient</span>
              <span className="text-neutral-300">
                {(ambientIntensity ?? 0.3).toFixed(2)}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientIntensity ?? 0.3}
              onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
            />
            <p className="text-[10px] text-neutral-600 mt-1">
              Auto trails even without mouse movement
            </p>
          </div>
        )}

        <div className="mb-3">
          <label className="flex justify-between text-neutral-400 mb-1 text-xs">
            <span>Responsiveness</span>
            <span className="text-neutral-300">{mouseLerp.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={mouseLerp}
            onChange={(e) => setMouseLerp(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
          />
          <p className="text-[10px] text-neutral-600 mt-1">
            Higher = instant, Lower = smooth lag
          </p>
        </div>
      </div>

      {/* Rotation Section */}
      <div className="border-t border-neutral-800 pt-3 mb-3">
        <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-3">
          Rotation
        </h3>

        <div className="mb-3">
          <label className="flex justify-between text-neutral-400 mb-1 text-xs">
            <span>Mouse</span>
            <span className="text-neutral-300">
              {mouseInfluence.toFixed(2)}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="0.2"
            step="0.01"
            value={mouseInfluence}
            onChange={(e) => setMouseInfluence(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
          />
        </div>

        <div className="mb-3">
          <label className="flex justify-between text-neutral-400 mb-1 text-xs">
            <span>Auto</span>
            <span className="text-neutral-300">
              {(rotationSpeed * 10000).toFixed(1)}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="0.001"
            step="0.00005"
            value={rotationSpeed}
            onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>

      {/* Layout Section */}
      {(setEdgeFade || setAspectRatio) && (
        <div className="border-t border-neutral-800 pt-3 mb-3">
          <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-3">
            Layout
          </h3>

          {setAspectRatio && (
            <div className="mb-3">
              <label className="flex justify-between text-neutral-400 mb-1 text-xs">
                <span>Aspect Ratio</span>
                <span className="text-neutral-300">
                  {(aspectRatio ?? 1).toFixed(2)}
                </span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={aspectRatio ?? 1}
                onChange={(e) => setAspectRatio(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
              />
              <p className="text-[10px] text-neutral-600 mt-1">
                1 = square, &gt;1 = wide, &lt;1 = tall
              </p>
            </div>
          )}

          {setEdgeFade && (
            <div className="mb-3">
              <label className="flex justify-between text-neutral-400 mb-1 text-xs">
                <span>Edge Fade</span>
                <span className="text-neutral-300">
                  {(edgeFade ?? 0.15).toFixed(2)}
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={edgeFade ?? 0.15}
                onChange={(e) => setEdgeFade(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-white"
              />
              <p className="text-[10px] text-neutral-600 mt-1">
                Feather edges for smooth blending
              </p>
            </div>
          )}
        </div>
      )}

      <div className="pt-3 border-t border-neutral-800">
        <p className="text-xs text-neutral-500">
          Draw on the image to reveal the relief. The trail blends through 6
          baked textures progressively.
        </p>
      </div>
    </div>
  );
}
