import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(min: number, input: number, max: number) {
  return Math.max(min, Math.min(input, max));
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
