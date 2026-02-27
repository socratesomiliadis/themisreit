import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (time: number) => {
  //formarting duration of video
  if (isNaN(time)) {
    return "00:00";
  }

  const date = new Date(time * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  if (hours) {
    //if video have hours
    return `${hours}:${minutes.toString().padStart(2, "0")} `;
  } else return `${minutes}:${seconds}`;
};

export function clamp(min: number, input: number, max: number) {
  return Math.max(min, Math.min(input, max));
}

export function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomFloatFromInterval(min: number, max: number) {
  // min and max included
  return Math.random() * (max - min) + min;
}

export function mapRange(
  inMin: number,
  inMax: number,
  input: number,
  outMin: number,
  outMax: number,
  shouldClamp = false
) {
  const result =
    ((input - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

  const isInverted = outMin > outMax;

  if (isInverted) {
    return shouldClamp ? clamp(outMax, result, outMin) : result;
  }

  return shouldClamp ? clamp(outMin, result, outMax) : result;
}

/**
 * Returns the appropriate text color (#434343 or #ffffff) for text on top of a
 * given background color, based on relative luminance for WCAG contrast.
 * Supports hex (#fff, #ffffff) and rgb(r, g, b) formats.
 */
export function getContrastTextColor(
  backgroundColor: string
): "#434343" | "#ffffff" {
  let r: number, g: number, b: number;

  const rgbMatch = backgroundColor.match(
    /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/
  );
  if (rgbMatch) {
    r = parseInt(rgbMatch[1] ?? "0", 10);
    g = parseInt(rgbMatch[2] ?? "0", 10);
    b = parseInt(rgbMatch[3] ?? "0", 10);
  } else {
    const hex = backgroundColor.replace(/^#/, "");
    if (hex.length === 3) {
      r = parseInt((hex[0] ?? "f") + (hex[0] ?? "f"), 16);
      g = parseInt((hex[1] ?? "f") + (hex[1] ?? "f"), 16);
      b = parseInt((hex[2] ?? "f") + (hex[2] ?? "f"), 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2) || "ff", 16);
      g = parseInt(hex.slice(2, 4) || "ff", 16);
      b = parseInt(hex.slice(4, 6) || "ff", 16);
    } else {
      return "#434343";
    }
  }

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return "#434343";
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#434343" : "#ffffff";
}

export function getMaskImage(
  radius: string,
  corners: "all" | "top" | "bottom" | "left" | "right" = "all"
) {
  if (corners === "all") {
    return `radial-gradient(circle at 0% 0%, transparent ${radius}, black calc(${radius} + 1px)), 
    radial-gradient(circle at 100% 0%, transparent ${radius}, black calc(${radius} + 1px)),
    radial-gradient(circle at 0% 100%, transparent ${radius}, black calc(${radius} + 1px)),
    radial-gradient(circle at 100% 100%, transparent ${radius}, black calc(${radius} + 1px))`;
  }
  if (corners === "top") {
    return `radial-gradient(circle at 0% 0%, transparent ${radius}, black calc(${radius} + 1px)), 
    radial-gradient(circle at 100% 0%, transparent ${radius}, black calc(${radius} + 1px))`;
  }
  if (corners === "bottom") {
    return `radial-gradient(circle at 0% 100%, transparent ${radius}, black calc(${radius} + 1px)), 
    radial-gradient(circle at 100% 100%, transparent ${radius}, black calc(${radius} + 1px))`;
  }
  if (corners === "left") {
    return `radial-gradient(circle at 0% 0%, transparent ${radius}, black calc(${radius} + 1px))`;
  }
  if (corners === "right") {
    return `radial-gradient(circle at 100% 0%, transparent ${radius}, black calc(${radius} + 1px))`;
  }
}
