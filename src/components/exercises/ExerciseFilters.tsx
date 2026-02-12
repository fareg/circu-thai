"use client";

import { ExerciseIntensity, ExerciseZone } from "@/types";

export interface ExerciseFilterState {
  zone: ExerciseZone | "all";
  intensity: ExerciseIntensity | "all";
  search: string;
}

interface ExerciseFiltersProps {
  filters: ExerciseFilterState;
  onChange: (state: ExerciseFilterState) => void;
  labels: {
    filters: string;
    zone: string;
    intensity: string;
    reset: string;
    search: string;
  };
  optionLabels: {
    zone: Record<ExerciseFilterState["zone"], string>;
    intensity: Record<ExerciseFilterState["intensity"], string>;
  };
}

const zones: (ExerciseZone | "all")[] = ["all", "legs", "arms", "core", "full"];
const intensities: (ExerciseIntensity | "all")[] = ["all", "low", "medium", "high"];

export function ExerciseFilters({ filters, onChange, labels, optionLabels }: ExerciseFiltersProps) {
  const update = (key: keyof ExerciseFilterState, value: ExerciseFilterState[keyof ExerciseFilterState]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="glass-panel px-4 py-4 text-sm text-white/80">
      <div className="flex items-center justify-between">
        <p className="font-semibold uppercase tracking-[0.2em] text-xs text-white/60">
          {labels.filters}
        </p>
        <button
          type="button"
          onClick={() => onChange({ zone: "all", intensity: "all", search: "" })}
          className="text-xs text-emerald-200 underline"
        >
          {labels.reset}
        </button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-white/50">{labels.zone}</span>
          <select
            value={filters.zone}
            onChange={(event) => update("zone", event.target.value as ExerciseFilterState["zone"])}
            className="rounded-lg bg-white/10 px-3 py-2 text-white"
          >
            {zones.map((zoneOption) => (
              <option key={zoneOption} value={zoneOption} className="bg-slate-900 text-white">
                {optionLabels.zone[zoneOption] ?? zoneOption}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-white/50">{labels.intensity}</span>
          <select
            value={filters.intensity}
            onChange={(event) => update("intensity", event.target.value as ExerciseFilterState["intensity"])}
            className="rounded-lg bg-white/10 px-3 py-2 text-white"
          >
            {intensities.map((intensityOption) => (
              <option key={intensityOption} value={intensityOption} className="bg-slate-900 text-white">
                {optionLabels.intensity[intensityOption] ?? intensityOption}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-white/50">{labels.search}</span>
          <input
            value={filters.search}
            onChange={(event) => update("search", event.target.value)}
            className="rounded-lg bg-white/10 px-3 py-2 text-white"
            placeholder="ex: jambes"
          />
        </label>
      </div>
    </section>
  );
}
