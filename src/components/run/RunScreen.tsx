"use client";

import { useMemo } from "react";
import { useExercises, useProgram, usePrograms, useSessions } from "@/hooks/usePrograms";
import { logSession } from "@/lib/db";
import { RunController } from "./RunController";
import { SessionLog } from "./SessionLog";
import Link from "next/link";

interface RunLabels {
  start: string;
  pause: string;
  resume: string;
  skip: string;
  previous: string;
  restart: string;
  next: string;
  completed: string;
  ready: string;
  elapsed: string;
  remaining: string;
  summaryHeading: string;
  music: string;
  volume: string;
  mute: string;
  unmute: string;
  missingHint: string;
  missingEmpty: string;
  openBuilder: string;
  viewPrograms: string;
  stepCount: string;
  descriptionLabel: string;
  repeatDescription: string;
  minuteSingular: string;
  minutePlural: string;
  secondSingular: string;
  secondPlural: string;
  sideSwitchCue: string;
  disableDescriptionNarration: string;
  enableDescriptionNarration: string;
}

interface RunScreenProps {
  programId: string;
  labels: RunLabels;
  missingLabel: string;
  logLabel: string;
  builderHref: string;
  programsHref: string;
  runBaseHref: string;
  homeHref: string;
  homeLabel: string;
}

export function RunScreen({
  programId,
  labels,
  missingLabel,
  logLabel,
  builderHref,
  programsHref,
  runBaseHref,
  homeHref,
  homeLabel,
}: RunScreenProps) {
  const program = useProgram(programId);
  const exercises = useExercises();
  const programs = usePrograms() ?? [];
  const exerciseMap = useMemo(() => {
    return exercises.reduce<Record<string, (typeof exercises)[number]>>((acc, exercise) => {
      acc[exercise.id] = exercise;
      return acc;
    }, {});
  }, [exercises]);

  const sessions = useSessions(programId) ?? [];

  if (program === undefined) {
    return (
      <div className="glass-panel px-6 py-6 text-white">
        <p className="text-sm text-white/70">Chargement du programme…</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="glass-panel space-y-4 px-6 py-6 text-white">
        <p className="text-lg font-semibold">{missingLabel}</p>
        {programs.length > 0 ? (
          <div>
            <p className="text-sm text-white/70">{labels.missingHint}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {programs.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
                  <span>{item.name}</span>
                  <Link href={`${runBaseHref}/${item.id}`} className="text-emerald-200 underline">
                    {labels.next}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={programsHref} className="mt-4 inline-flex rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-wide">
              {labels.viewPrograms}
            </Link>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-white/70">
            <p>{labels.missingEmpty}</p>
            <Link href={builderHref} className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900">
              {labels.openBuilder}
            </Link>
          </div>
        )}
      </div>
    );
  }

  const handleCompleted = async (durationSeconds: number, interruptCount: number) => {
    await logSession({
      programId: program.id,
      completedAt: new Date().toISOString(),
      durationSeconds,
      interruptCount,
    });
  };

  return (
    <div className="space-y-6">
      <RunController
        program={program}
        exercises={exerciseMap}
        labels={labels}
        onCompleted={handleCompleted}
        homeHref={homeHref}
        homeLabel={homeLabel}
      />
      <SessionLog title={logLabel} sessions={sessions} />
    </div>
  );
}
