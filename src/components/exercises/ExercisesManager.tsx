"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Exercise } from "@/types";
import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { ExerciseFilters, ExerciseFilterState } from "@/components/exercises/ExerciseFilters";
import { useExerciseActions, useExercises } from "@/hooks/usePrograms";

interface ExercisesManagerProps {
  labels: {
    title: string;
    intro: string;
    countLabel: string;
    filters: string;
    zone: string;
    intensity: string;
    reset: string;
    search: string;
    emptyState: string;
    editAction: string;
    editPanelTitle: string;
    editNameLabel: string;
    editDescriptionLabel: string;
    editPlaceholder: string;
    lastUpdateLabel: string;
    editSave: string;
    editCancel: string;
    editSuccess: string;
    editError: string;
    zoneOptions: Record<ExerciseFilterState["zone"], string>;
    intensityOptions: Record<ExerciseFilterState["intensity"], string>;
  };
  locale: string;
}

const initialFilters: ExerciseFilterState = { zone: "all", intensity: "all", search: "" };

export function ExercisesManager({ labels, locale }: ExercisesManagerProps) {
  const exercises = useExercises() ?? [];
  const { updateDetails } = useExerciseActions();
  const [filters, setFilters] = useState(initialFilters);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [busy, setBusy] = useState(false);

  const filteredExercises = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();
    return exercises
      .filter((exercise) => {
        const matchesZone = filters.zone === "all" || exercise.zone === filters.zone;
        const matchesIntensity = filters.intensity === "all" || exercise.intensity === filters.intensity;
        const matchesSearch =
          normalizedSearch.length === 0 ||
          `${exercise.name} ${exercise.description}`.toLowerCase().includes(normalizedSearch);
        return matchesZone && matchesIntensity && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, filters]);

  const editingExercise = useMemo(() => {
    if (!editingExerciseId) {
      return null;
    }
    return exercises.find((exercise) => exercise.id === editingExerciseId) ?? null;
  }, [editingExerciseId, exercises]);

  useEffect(() => {
    if (editingExerciseId && !editingExercise) {
      setEditingExerciseId(null);
      setEditName("");
      setEditDescription("");
      setStatus("idle");
    }
  }, [editingExercise, editingExerciseId]);

  const handleEditRequest = (exercise: Exercise) => {
    setEditingExerciseId(exercise.id);
    setEditName(exercise.name);
    setEditDescription(exercise.description);
    setStatus("idle");
  };

  const handleEditClear = () => {
    setEditingExerciseId(null);
    setEditName("");
    setEditDescription("");
    setStatus("idle");
  };

  const canSave = Boolean(
    editingExercise && editName.trim().length >= 3 && editDescription.trim().length >= 10
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingExercise || !canSave) {
      return;
    }
    setBusy(true);
    try {
      const nextName = editName.trim();
      const nextDescription = editDescription.trim();
      await updateDetails(editingExercise.id, {
        name: nextName,
        description: nextDescription,
      });
      setEditName(nextName);
      setEditDescription(nextDescription);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setBusy(false);
    }
  };

  const updatedAtLabel = useMemo(() => {
    if (!editingExercise?.updatedAt) {
      return null;
    }
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(editingExercise.updatedAt)
      );
    } catch (_error) {
      return editingExercise.updatedAt;
    }
  }, [editingExercise?.updatedAt, locale]);

  const countDisplay = useMemo(() => {
    return labels.countLabel
      .replace("{current}", String(filteredExercises.length))
      .replace("{total}", String(exercises.length));
  }, [exercises.length, filteredExercises.length, labels.countLabel]);

  return (
    <section className="space-y-6">
      <header className="glass-panel px-6 py-4 text-white">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold">{labels.title}</h1>
          <p className="text-sm text-white/70">{labels.intro}</p>
          <p className="text-xs tracking-[0.3em] text-white/50">{countDisplay}</p>
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
        optionLabels={{ zone: labels.zoneOptions, intensity: labels.intensityOptions }}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {filteredExercises.length === 0 ? (
            <p className="rounded-2xl bg-white/5 px-4 py-6 text-center text-sm text-white/70">
              {labels.emptyState}
            </p>
          ) : (
            filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onEdit={handleEditRequest}
                editLabel={labels.editAction}
              />
            ))
          )}
        </div>
        <div className="glass-panel h-fit px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{labels.editPanelTitle}</h2>
            {editingExercise && (
              <button
                type="button"
                onClick={handleEditClear}
                className="text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white focus-ring rounded-full px-3 py-1"
              >
                {labels.editCancel}
              </button>
            )}
          </div>
          {editingExercise ? (
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-white/70">{labels.editNameLabel}</span>
                <input
                  value={editName}
                  onChange={(event) => {
                    setEditName(event.target.value);
                    if (status !== "idle") {
                      setStatus("idle");
                    }
                  }}
                  className="rounded-xl bg-white/10 px-3 py-2 text-white"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-white/70">{labels.editDescriptionLabel}</span>
                <textarea
                  value={editDescription}
                  onChange={(event) => {
                    setEditDescription(event.target.value);
                    if (status !== "idle") {
                      setStatus("idle");
                    }
                  }}
                  className="rounded-xl bg-white/10 px-3 py-2 text-white"
                  rows={5}
                />
              </label>
              {updatedAtLabel && (
                <p className="text-xs text-white/60">
                  {labels.lastUpdateLabel}: {updatedAtLabel}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleEditClear}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 focus-ring"
                >
                  {labels.editCancel}
                </button>
                <button
                  type="submit"
                  disabled={!canSave || busy}
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 focus-ring disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/60"
                >
                  {labels.editSave}
                </button>
              </div>
              {status === "success" && <p className="text-sm text-emerald-200">{labels.editSuccess}</p>}
              {status === "error" && <p className="text-sm text-rose-200">{labels.editError}</p>}
            </form>
          ) : (
            <p className="mt-4 text-sm text-white/70">{labels.editPlaceholder}</p>
          )}
        </div>
      </div>
    </section>
  );
}
