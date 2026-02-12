"use client";

import { KeyboardEvent, useMemo } from "react";
import { Exercise } from "@/types";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time";

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  isActive?: boolean;
  ctaLabel?: string;
  editLabel?: string;
}

export function ExerciseCard({ exercise, onSelect, onEdit, isActive, ctaLabel, editLabel }: ExerciseCardProps) {
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }), []);
  const createdLabel = exercise.createdAt ? dateFormatter.format(new Date(exercise.createdAt)) : null;
  const updatedLabel = exercise.updatedAt ? dateFormatter.format(new Date(exercise.updatedAt)) : null;
  const showUpdated = Boolean(updatedLabel && updatedLabel !== createdLabel);
  const supportsPrimaryAction = Boolean(onSelect || onEdit);
  const handleCardClick = () => {
    if (onSelect) {
      onSelect(exercise);
      return;
    }
    onEdit?.(exercise);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!supportsPrimaryAction) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <article
      onClick={supportsPrimaryAction ? handleCardClick : undefined}
      onKeyDown={handleKeyDown}
      role={supportsPrimaryAction ? "button" : undefined}
      tabIndex={supportsPrimaryAction ? 0 : undefined}
      className={cn(
        "glass-panel flex w-full flex-col gap-2 px-4 py-4 text-left focus-ring",
        supportsPrimaryAction && "cursor-pointer",
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
      {(createdLabel || showUpdated) && (
        <div className="text-xs text-white/60">
          {createdLabel && <p>Créé le {createdLabel}</p>}
          {showUpdated && updatedLabel && <p>Mis à jour le {updatedLabel}</p>}
        </div>
      )}
      {(onSelect || onEdit) && (
        <div className="flex flex-wrap gap-2 pt-2">
          {onSelect && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelect(exercise);
              }}
              className="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
            >
              {ctaLabel ?? "Ajouter"}
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(exercise);
              }}
              className="rounded-full border border-white/30 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:text-white"
            >
              {editLabel ?? "Modifier"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
