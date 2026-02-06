"use client";

import { useMemo } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Exercise, ProgramStep } from "@/types";
import { formatDuration } from "@/lib/time";
import { DurationControl } from "./DurationControl";
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";

interface TimelineItem {
  step: ProgramStep;
  exercise?: Exercise;
}

interface ProgramTimelineProps {
  items: TimelineItem[];
  totalSeconds: number;
  totalLabel: string;
  emptyLabel: string;
  durationLabel?: string;
  onMove: (stepId: string, direction: "up" | "down") => void;
  onReorder: (stepId: string, targetIndex: number) => void;
  onRemove: (stepId: string) => void;
  onDurationChange: (stepId: string, value: number) => void;
}

export function ProgramTimeline({
  items,
  totalSeconds,
  totalLabel,
  emptyLabel,
  durationLabel = "Duration",
  onMove,
  onReorder,
  onRemove,
  onDurationChange,
}: ProgramTimelineProps) {
  if (!items.length) {
    return <p className="text-sm text-white/70">{emptyLabel}</p>;
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const ids = useMemo(() => items.map((item) => item.step.id), [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const overIndex = items.findIndex((item) => item.step.id === over.id);
    if (overIndex === -1) {
      return;
    }
    onReorder(String(active.id), overIndex);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map(({ step, exercise }, index) => (
            <SortableTimelineCard
              key={step.id}
              index={index}
              totalItems={items.length}
              step={step}
              exercise={exercise}
              durationLabel={durationLabel}
              onMove={onMove}
              onRemove={onRemove}
              onDurationChange={onDurationChange}
            />
          ))}
          <div className="flex items-center justify-between text-sm text-white/80">
            <span>{totalLabel}</span>
            <span>{formatDuration(totalSeconds)}</span>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableTimelineCardProps {
  index: number;
  totalItems: number;
  step: ProgramStep;
  exercise?: Exercise;
  durationLabel: string;
  onMove: (stepId: string, direction: "up" | "down") => void;
  onRemove: (stepId: string) => void;
  onDurationChange: (stepId: string, value: number) => void;
}

function SortableTimelineCard({
  index,
  totalItems,
  step,
  exercise,
  durationLabel,
  onMove,
  onRemove,
  onDurationChange,
}: SortableTimelineCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`glass-panel px-4 py-4 text-white ${isDragging ? "ring-2 ring-white/50" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-start gap-3">
          <button
            type="button"
            aria-label="Reordonner"
            className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">Step {index + 1}</p>
            <h4 className="text-lg font-semibold">{exercise?.name ?? step.exerciseId}</h4>
            <p className="text-sm text-white/70">{exercise?.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Monter"
            disabled={index === 0}
            onClick={() => onMove(step.id, "up")}
            className="rounded-full bg-white/10 p-2 text-white/80 disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Descendre"
            disabled={index === totalItems - 1}
            onClick={() => onMove(step.id, "down")}
            className="rounded-full bg-white/10 p-2 text-white/80 disabled:opacity-40"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Supprimer"
            onClick={() => onRemove(step.id)}
            className="rounded-full bg-white/10 p-2 text-rose-200"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <DurationControl value={step.duration} onChange={(value) => onDurationChange(step.id, value)} label={durationLabel} />
      </div>
    </article>
  );
}
