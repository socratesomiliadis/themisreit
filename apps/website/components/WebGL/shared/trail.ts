export interface TrailOptions {
  maxAge?: number;
  baseSize?: number;
  fadeSpeed?: number;
  intensity?: number;
}

export interface TrailQualityOptions extends TrailOptions {
  /** Number of gradient color stops (3, 4, or 6) — fewer = faster */
  gradientStops?: number;
  /** Maximum number of trail points */
  maxPoints?: number;
  /** Minimum update interval in ms */
  updateInterval?: number;
  /** Number of ambient particles */
  ambientParticleCount?: number;
}

export interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  age: number;
  size: number;
}

const STAMP_RESOLUTION = 32;
const TWO_PI = Math.PI * 2;

/**
 * Canvas-based mouse trail texture generator.
 *
 * Optimisations over the original per-point-gradient approach:
 *  - Pre-rendered gradient **stamp** drawn via `drawImage` (no per-frame gradient creation)
 *  - **Ring buffer** for trail points (O(1) insert / evict, zero GC)
 *  - `update()` returns a **dirty flag** so callers can skip GPU uploads when throttled
 */
export class Trail {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;

  // Ring buffer
  private points: TrailPoint[];
  private ringHead = 0;
  private ringCount = 0;
  private readonly capacity: number;

  private maxAge: number;
  private baseSize: number;
  private fadeSpeed: number;
  private intensity: number;
  private lastTime: number;
  private readonly targetFPS = 60;

  private readonly minUpdateInterval: number;

  // Ambient trail system
  private ambientParticles: AmbientParticle[] = [];
  private ambientIntensity = 0;

  private lastUpdateTime = 0;

  // Pre-computed gradient multipliers & stamp
  private readonly gradientMultipliers: number[];
  private stampCanvas: HTMLCanvasElement;

  constructor(width = 256, height = 256, options: TrailQualityOptions = {}) {
    this.width = width;
    this.height = height;
    this.maxAge = options.maxAge ?? 120;
    this.baseSize = options.baseSize ?? 0.15;
    this.fadeSpeed = options.fadeSpeed ?? 0.985;
    this.intensity = options.intensity ?? 0.15;
    this.lastTime = performance.now();

    this.capacity = options.maxPoints ?? 400;
    this.minUpdateInterval = options.updateInterval ?? 16;

    this.gradientMultipliers = computeGradientMultipliers(
      options.gradientStops ?? 6
    );
    this.stampCanvas = createStamp(this.gradientMultipliers);

    // Pre-allocate ring buffer with reusable point objects
    this.points = new Array(this.capacity);
    for (let i = 0; i < this.capacity; i++) {
      this.points[i] = { x: 0, y: 0, age: -1, size: 0 };
    }

    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      throw new Error("Failed to create 2D context for trail canvas");
    }
    this.ctx = ctx;

    this.initAmbientParticles(options.ambientParticleCount ?? 3);
    this.clear();
  }

  // ---------------------------------------------------------------------------
  // Public setters
  // ---------------------------------------------------------------------------

  setAmbientIntensity(v: number): void {
    this.ambientIntensity = v;
  }
  setBaseSize(v: number): void {
    this.baseSize = v;
  }
  setFadeSpeed(v: number): void {
    this.fadeSpeed = v;
  }
  setMaxAge(v: number): void {
    this.maxAge = v;
  }
  setIntensity(v: number): void {
    this.intensity = v;
  }

  /** Reset timing state to prevent large delta-time spikes after visibility changes */
  resetTime(): void {
    const now = performance.now();
    this.lastTime = now;
    this.lastUpdateTime = now;
  }

  clear(): void {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // ---------------------------------------------------------------------------
  // Point management (ring buffer — O(1) insert / evict)
  // ---------------------------------------------------------------------------

  addPoint(x: number, y: number): void {
    const tail = (this.ringHead + this.ringCount) % this.capacity;
    const p = this.points[tail];
    p.x = x * this.width;
    p.y = (1 - y) * this.height;
    p.age = 0;
    p.size = this.baseSize * this.width;

    if (this.ringCount < this.capacity) {
      this.ringCount++;
    } else {
      this.ringHead = (this.ringHead + 1) % this.capacity;
    }
  }

  // ---------------------------------------------------------------------------
  // Ambient particles
  // ---------------------------------------------------------------------------

  updateAmbient(time: number): void {
    if (this.ambientIntensity <= 0) return;

    const particles = this.ambientParticles;
    const len = particles.length;

    for (let i = 0; i < len; i++) {
      const particle = particles[i];
      const wobbleX = Math.sin(time * particle.speed + particle.phase) * 0.003;
      const wobbleY =
        Math.cos(time * particle.speed * 0.7 + particle.phase) * 0.003;

      particle.x += particle.vx + wobbleX;
      particle.y += particle.vy + wobbleY;

      if (particle.x < 0.1 || particle.x > 0.9) {
        particle.vx *= -1;
        particle.x = Math.max(0.1, Math.min(0.9, particle.x));
      }
      if (particle.y < 0.1 || particle.y > 0.9) {
        particle.vy *= -1;
        particle.y = Math.max(0.1, Math.min(0.9, particle.y));
      }

      if (Math.random() < this.ambientIntensity) {
        this.addPoint(particle.x, 1 - particle.y);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Main update — returns **true** when the canvas was modified (dirty flag)
  // ---------------------------------------------------------------------------

  update(): boolean {
    const now = performance.now();
    if (now - this.lastUpdateTime < this.minUpdateInterval) {
      return false;
    }
    this.lastUpdateTime = now;

    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    const frameMultiplier = deltaTime * this.targetFPS;
    const adjustedFade = Math.pow(this.fadeSpeed, frameMultiplier);

    const ctx = this.ctx;

    // Fade existing trail
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - adjustedFade})`;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.globalCompositeOperation = "lighter";

    const maxAge = this.maxAge;
    const intensity = this.intensity;
    const cap = this.capacity;

    // Age all active points
    for (let i = 0; i < this.ringCount; i++) {
      this.points[(this.ringHead + i) % cap].age += frameMultiplier;
    }

    // Evict expired from the head (points are ordered oldest-first)
    while (
      this.ringCount > 0 &&
      this.points[this.ringHead].age > maxAge
    ) {
      this.ringHead = (this.ringHead + 1) % cap;
      this.ringCount--;
    }

    // Draw active points using the pre-rendered stamp
    const stamp = this.stampCanvas;
    for (let i = 0; i < this.ringCount; i++) {
      const point = this.points[(this.ringHead + i) % cap];

      const lifeRatio = 1 - point.age / maxAge;
      const opacity = lifeRatio * lifeRatio * intensity;
      const sizeMultiplier = Math.sin(lifeRatio * Math.PI) * 0.5 + 0.5;
      const currentSize = point.size * (0.5 + sizeMultiplier * 0.5);

      ctx.globalAlpha = opacity;
      const drawSize = currentSize * 2;
      ctx.drawImage(
        stamp,
        point.x - currentSize,
        point.y - currentSize,
        drawSize,
        drawSize
      );
    }

    ctx.globalAlpha = 1;
    return true;
  }

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  destroy(): void {
    this.ringCount = 0;
    this.ringHead = 0;
    this.ambientParticles.length = 0;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private initAmbientParticles(count: number): void {
    this.ambientParticles = [];
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.002,
        vy: (Math.random() - 0.5) * 0.002,
        phase: Math.random() * TWO_PI,
        speed: 0.5 + Math.random() * 0.5,
      });
    }
  }
}

// =============================================================================
// Module-level helpers (shared across instances, never GC'd)
// =============================================================================

function computeGradientMultipliers(stops: number): number[] {
  switch (stops) {
    case 3:
      return [1.0, 0.4, 0];
    case 4:
      return [1.0, 0.6, 0.2, 0];
    case 6:
    default:
      return [1.0, 0.8, 0.5, 0.25, 0.08, 0];
  }
}

/** Pre-render a radial gradient circle onto a small canvas (created once). */
function createStamp(multipliers: number[]): HTMLCanvasElement {
  const size = STAMP_RESOLUTION;
  const half = size / 2;

  const stampCanvas = document.createElement("canvas");
  stampCanvas.width = size;
  stampCanvas.height = size;
  const ctx = stampCanvas.getContext("2d", { alpha: true })!;

  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  const numStops = multipliers.length;
  const stepSize = 1 / (numStops - 1);

  for (let s = 0; s < numStops; s++) {
    gradient.addColorStop(
      s * stepSize,
      `rgba(255,255,255,${multipliers[s]})`
    );
  }

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(half, half, half, 0, TWO_PI);
  ctx.fill();

  return stampCanvas;
}
