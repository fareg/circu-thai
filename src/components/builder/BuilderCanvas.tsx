"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Exercise } from "@/types";
import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { ExerciseFilterState, ExerciseFilters } from "@/components/exercises/ExerciseFilters";
import { ProgramTimeline } from "@/components/programs/ProgramTimeline";
import { useExercises, useProgramActions, usePrograms } from "@/hooks/usePrograms";
import { useProgramDraftStore } from "@/store/programDraft";
import { curatedTracks } from "@/lib/audio/library";

interface BuilderCanvasProps {
  labels: {
    title: string;
    nameLabel: string;
    musicLabel: string;
    musicPresetLabel: string;
    musicPresetPlaceholder: string;
    musicCredit: string;
    notes: string;
    save: string;
    add: string;
    total: string;
    duration: string;
    duplicate: string;
    success: string;
    error: string;
    emptyTimeline: string;
    lastUpdate: string;
    filters: string;
    zone: string;
    intensity: string;
    reset: string;
    search: string;
    catalogHint: string;
    catalogCta: string;
    zoneOptions: Record<ExerciseFilterState["zone"], string>;
    intensityOptions: Record<ExerciseFilterState["intensity"], string>;
  };
  programId?: string;
  locale: string;
}

const initialFilters: ExerciseFilterState = { zone: "all", intensity: "all", search: "" };

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function BuilderCanvas({ labels, programId, locale }: BuilderCanvasProps) {
  const exercises = useExercises() ?? [];
  const programs = usePrograms() ?? [];
  const { persist } = useProgramActions();
  const [filters, setFilters] = useState(initialFilters);
  const [feedback, setFeedback] = useState<string | null>(null);
  const {
    name,
    musicUrl,
    notes,
    steps,
    setName,
    setMusicUrl,
    setNotes,
    addStep,
    moveStep,
    reorderStep,
    removeStep,
    updateDuration,
    reset,
    loadFromProgram,
  } = useProgramDraftStore();
  const [draftSourceId, setDraftSourceId] = useState<string | null>(null);

  const editingProgram = useMemo(() => programs.find((program) => program.id === programId), [programId, programs]);
  const lastUpdateDisplay = useMemo(() => {
    if (!editingProgram?.updatedAt) {
      return null;
    }
    const date = new Date(editingProgram.updatedAt);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
    } catch (_error) {
      return date.toLocaleString();
    }
  }, [editingProgram, locale]);

  useEffect(() => {
    if (programId && editingProgram && draftSourceId !== programId) {
      loadFromProgram(editingProgram);
      setDraftSourceId(programId);
      setFeedback(null);
    }
    if (!programId && draftSourceId) {
      reset();
      setDraftSourceId(null);
      setFeedback(null);
    }
  }, [draftSourceId, editingProgram, loadFromProgram, programId, reset]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesZone = filters.zone === "all" || exercise.zone === filters.zone;
      const matchesIntensity = filters.intensity === "all" || exercise.intensity === filters.intensity;
      const matchesSearch = exercise.name.toLowerCase().includes(filters.search.toLowerCase());
      return matchesZone && matchesIntensity && matchesSearch;
    });
  }, [exercises, filters]);

  const presetValue = useMemo(() => {
    const match = curatedTracks.find((track) => track.url === musicUrl);
    return match ? match.url : "";
  }, [musicUrl]);

  const totalSeconds = steps.reduce((total, step) => total + step.duration, 0);
  const trimmedName = name.trim();
  const normalizedName = trimmedName.toLowerCase();
  const isDuplicate = programs.some((program) => program.id !== programId && program.name.toLowerCase() === normalizedName);
  const canSave = steps.length > 0 && trimmedName.length >= 3 && !isDuplicate;

  const upsertStep = (exercise: Exercise) => {
    addStep({
      id: newId(),
      exerciseId: exercise.id,
      duration: exercise.defaultDuration,
    });
  };

  const handleSave = async () => {
    if (!canSave) {
      if (!steps.length) {
        setFeedback(labels.emptyTimeline);
      } else if (isDuplicate) {
        setFeedback(labels.duplicate);
      }
      return;
    }
    const now = new Date().toISOString();
    const createdAt = programId && editingProgram ? editingProgram.createdAt : now;
    try {
      const targetId = programId ?? newId();
      await persist({
        id: targetId,
        name: trimmedName,
        steps,
        musicUrl,
        notes,
        createdAt,
        updatedAt: now,
      });
      setFeedback(`${labels.success} (${trimmedName})`);
      if (!programId) {
        reset();
      }
    } catch (error) {
      console.error(error);
      setFeedback(labels.error);
    }
  };

  const timelineWithDetails = steps.map((step) => ({
    step,
    exercise: exercises.find((exercise) => exercise.id === step.exerciseId),
  }));

  return (
    <section className="space-y-6">
      <header className="glass-panel px-6 py-4 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{labels.title}</h1>
            {lastUpdateDisplay && (
              <p className="text-sm text-white/70">
                {labels.lastUpdate}: {lastUpdateDisplay}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 focus-ring disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/60"
          >
            {labels.save}
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">{labels.nameLabel}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl bg-white/10 px-3 py-2 text-white"
            />
            {isDuplicate && <span className="text-xs text-rose-200">{labels.duplicate}</span>}
          </label>
          <div className="flex flex-col gap-3 text-sm">
            <label className="flex flex-col gap-2">
              <span className="text-white/70">{labels.musicLabel}</span>
              <input
                value={musicUrl}
                onChange={(event) => setMusicUrl(event.target.value)}
                className="rounded-xl bg-white/10 px-3 py-2 text-white"
                placeholder="https://"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs">
              <span className="text-white/60 uppercase tracking-[0.2em]">{labels.musicPresetLabel}</span>
              <select
                value={presetValue}
                onChange={(event) => setMusicUrl(event.target.value)}
                className="rounded-xl bg-white/10 px-3 py-2 text-white text-sm"
              >
                <option value="">{labels.musicPresetPlaceholder}</option>
                {curatedTracks.map((track) => (
                  <option key={track.id} value={track.url} className="bg-slate-900 text-white">
                    {track.label}
                  </option>
                ))}
              </select>
              <span className="text-[0.7rem] text-white/50">{labels.musicCredit}</span>
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">{labels.notes}</span>
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="rounded-xl bg-white/10 px-3 py-2 text-white"
            />
          </label>
        </div>
      </header>
      <ExerciseFilters
        filters={filters}
        onChange={setFilters}
        labels={{
          filters: labels.filters,
          zone: labels.zone,
          intensity: labels.intensity,
          reset: labels.reset,
          search: labels.search,
        }}
        optionLabels={{
          zone: labels.zoneOptions,
          intensity: labels.intensityOptions,
        }}
      />
      <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/70 flex flex-wrap items-center gap-3">
        <span>{labels.catalogHint}</span>
        <Link
          href={`/${locale}/exercises`}
          className="inline-flex items-center gap-1 text-white font-semibold underline decoration-dotted underline-offset-4 hover:decoration-solid focus-ring"
        >
          {labels.catalogCta}
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelect={upsertStep}
              ctaLabel={labels.add}
            />
          ))}
        </div>
        <div>
          <ProgramTimeline
            items={timelineWithDetails}
            totalSeconds={totalSeconds}
            totalLabel={labels.total}
            emptyLabel={labels.emptyTimeline}
            durationLabel={labels.duration}
            onMove={moveStep}
            onReorder={reorderStep}
            onRemove={removeStep}
            onDurationChange={updateDuration}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="mt-6 w-full rounded-full bg-white py-3 text-sm font-semibold text-slate-900 focus-ring disabled:cursor-not-allowed disabled:bg-white/40 disabled:text-white/60"
          >
            {labels.save}
          </button>
          {feedback && (
            <p className="mt-2 text-sm text-white/80" role="status" aria-live="polite">
              {feedback}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
