import type { TrailOptions, AmbientParticle, TrailPoint } from "./types";

/**
 * Trail class - Canvas-based mouse trail texture
 * Frame-rate independent fade using delta time
 * Includes ambient trails that animate independently of mouse
 */
export class Trail {
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private transferCanvas: HTMLCanvasElement | null = null;
  readonly width: number;
  readonly height: number;
  private points: TrailPoint[];
  private maxAge: number;
  private baseSize: number;
  private fadeSpeed: number;
  private intensity: number;
  private lastTime: number;
  private readonly targetFPS = 60;

  // Ambient trail system
  private ambientParticles: AmbientParticle[] = [];
  private ambientIntensity = 0;

  // Pre-allocated values
  private readonly TWO_PI = Math.PI * 2;

  // Throttle updates
  private lastUpdateTime = 0;
  private readonly minUpdateInterval = 16; // ~60fps cap

  constructor(width = 512, height = 512, options: TrailOptions = {}) {
    this.width = width;
    this.height = height;
    this.maxAge = options.maxAge ?? 120;
    this.baseSize = options.baseSize ?? 0.15;
    this.fadeSpeed = options.fadeSpeed ?? 0.985;
    this.intensity = options.intensity ?? 0.15;
    this.points = [];
    this.lastTime = performance.now();

    // Try OffscreenCanvas for better performance
    let canvas: HTMLCanvasElement | OffscreenCanvas;
    let ctx:
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;

    if (typeof OffscreenCanvas !== "undefined") {
      try {
        canvas = new OffscreenCanvas(width, height);
        ctx = canvas.getContext("2d", {
          alpha: false,
          willReadFrequently: false,
        });
        // Create transfer canvas for texture
        this.transferCanvas = document.createElement("canvas");
        this.transferCanvas.width = width;
        this.transferCanvas.height = height;
      } catch {
        canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext("2d", { alpha: false });
      }
    } else {
      canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext("2d", { alpha: false });
    }

    this.canvas = canvas;
    this.ctx = ctx!;

    this.initAmbientParticles(3);
    this.clear();
  }

  private initAmbientParticles(count: number): void {
    this.ambientParticles = [];
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.002,
        vy: (Math.random() - 0.5) * 0.002,
        phase: Math.random() * this.TWO_PI,
        speed: 0.5 + Math.random() * 0.5,
      });
    }
  }

  setAmbientIntensity(intensity: number): void {
    this.ambientIntensity = intensity;
  }

  setBaseSize(size: number): void {
    this.baseSize = size;
  }

  setFadeSpeed(speed: number): void {
    this.fadeSpeed = speed;
  }

  setMaxAge(age: number): void {
    this.maxAge = age;
  }

  setIntensity(intensity: number): void {
    this.intensity = intensity;
  }

  clear(): void {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  addPoint(x: number, y: number): void {
    if (this.points.length > 500) {
      this.points.shift();
    }

    this.points.push({
      x: x * this.width,
      y: (1 - y) * this.height,
      age: 0,
      size: this.baseSize * this.width,
    });
  }

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

      // Soft boundary bounce
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

  update(): void {
    const now = performance.now();
    if (now - this.lastUpdateTime < this.minUpdateInterval) {
      return;
    }
    this.lastUpdateTime = now;

    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    const frameMultiplier = deltaTime * this.targetFPS;
    const adjustedFade = Math.pow(this.fadeSpeed, frameMultiplier);

    const ctx = this.ctx;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - adjustedFade})`;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.globalCompositeOperation = "lighter";

    const points = this.points;
    const maxAge = this.maxAge;
    const intensity = this.intensity;

    for (let i = points.length - 1; i >= 0; i--) {
      const point = points[i];
      point.age += frameMultiplier;

      if (point.age > maxAge) {
        points[i] = points[points.length - 1];
        points.pop();
        continue;
      }

      const lifeRatio = 1 - point.age / maxAge;
      const opacity = lifeRatio * lifeRatio * intensity;
      const sizeMultiplier = Math.sin(lifeRatio * Math.PI) * 0.5 + 0.5;
      const currentSize = point.size * (0.5 + sizeMultiplier * 0.5);

      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        currentSize
      );

      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.1, `rgba(255, 255, 255, ${opacity * 0.95})`);
      gradient.addColorStop(0.25, `rgba(255, 255, 255, ${opacity * 0.8})`);
      gradient.addColorStop(0.4, `rgba(255, 255, 255, ${opacity * 0.55})`);
      gradient.addColorStop(0.55, `rgba(255, 255, 255, ${opacity * 0.3})`);
      gradient.addColorStop(0.7, `rgba(255, 255, 255, ${opacity * 0.12})`);
      gradient.addColorStop(0.85, `rgba(255, 255, 255, ${opacity * 0.03})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, currentSize, 0, this.TWO_PI);
      ctx.fill();
    }

    // Transfer from OffscreenCanvas if needed
    if (this.transferCanvas && this.canvas instanceof OffscreenCanvas) {
      const textureCtx = this.transferCanvas.getContext("2d");
      if (textureCtx) {
        textureCtx.drawImage(this.canvas, 0, 0);
      }
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.transferCanvas || (this.canvas as HTMLCanvasElement);
  }

  destroy(): void {
    this.points.length = 0;
    this.ambientParticles.length = 0;
  }
}
