"use client";

import { formatDuration } from "@/lib/time";

interface DurationControlProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function DurationControl({ value, onChange, label, min = 10, max = 600, step = 10 }: DurationControlProps) {
  const normalizedStep = step <= 0 ? 10 : step;

  const snapToStep = (next: number) => {
    const clamped = clamp(next, min, max);
    const snapped = Math.round(clamped / normalizedStep) * normalizedStep;
    return clamp(snapped, min, max);
  };

  const handleNudge = (direction: "up" | "down") => {
    const delta = direction === "up" ? normalizedStep : -normalizedStep;
    onChange(snapToStep(value + delta));
  };

  return (
    <div className="flex flex-col gap-2 text-xs text-white/60">
      <span>{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Diminuer la duree"
          onClick={() => handleNudge("down")}
          className="rounded-full bg-white/10 px-3 py-2 text-base text-white/80 disabled:opacity-40"
          disabled={value <= min}
        >
          -{normalizedStep}s
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={normalizedStep}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full"
          aria-label={label}
        />
        <button
          type="button"
          aria-label="Augmenter la duree"
          onClick={() => handleNudge("up")}
          className="rounded-full bg-white/10 px-3 py-2 text-base text-white/80 disabled:opacity-40"
          disabled={value >= max}
        >
          +{normalizedStep}s
        </button>
      </div>
      <span className="text-sm text-white">{formatDuration(value)}</span>
    </div>
  );
}
