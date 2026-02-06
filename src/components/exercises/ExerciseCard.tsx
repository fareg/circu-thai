"use client";

import { Exercise } from "@/types";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time";

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  isActive?: boolean;
  ctaLabel?: string;
}

export function ExerciseCard({ exercise, onSelect, isActive, ctaLabel }: ExerciseCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(exercise)}
      className={cn(
        "glass-panel flex w-full flex-col gap-2 px-4 py-4 text-left focus-ring",
        isActive && "outline outline-1 outline-emerald-300"
      )}
      aria-pressed={isActive}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-wide text-white/70">{exercise.zone}</p>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {exercise.intensity}
        </span>
      </div>
      <h4 className="text-lg font-semibold text-white">{exercise.name}</h4>
      <p className="text-sm text-white/80">{exercise.description}</p>
      <div className="flex flex-wrap gap-2 text-xs text-white/60">
        {exercise.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white/10 px-2 py-1">
            {tag}
          </span>
        ))}
      </div>
      <span className="text-sm text-white/80">{formatDuration(exercise.defaultDuration)}</span>
      <span className="text-xs text-white/60">{ctaLabel ?? "Ajouter"}</span>
    </button>
  );
}
