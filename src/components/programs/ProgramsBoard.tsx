"use client";

import Link from "next/link";
import { useProgramActions, usePrograms, useSessions } from "@/hooks/usePrograms";
import { ProgramRecord } from "@/types";
import { exportToJson, importFromJson } from "@/lib/storage";
import { track } from "@/lib/analytics";
import { useMemo, useRef, useState } from "react";
import { formatDuration } from "@/lib/time";

interface ProgramsBoardProps {
  labels: {
    title: string;
    empty: string;
    run: string;
    delete: string;
    total: string;
    export: string;
    import: string;
    sessions: string;
    edit: string;
    duplicate: string;
    copySuffix: string;
    duplicateSuccess: string;
    duplicateError: string;
  };
  locale: string;
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

export function ProgramsBoard({ labels, locale }: ProgramsBoardProps) {
  const programs = usePrograms() ?? [];
  const sessions = useSessions() ?? [];
  const { remove, persist } = useProgramActions();
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizedNames = useMemo(() => programs.map((program) => ({ id: program.id, name: program.name.toLowerCase().trim() })), [programs]);

  const sessionCount = sessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.programId] = (acc[session.programId] ?? 0) + 1;
    return acc;
  }, {});

  const totalDuration = (program: ProgramRecord) =>
    formatDuration(program.steps.reduce((sum, step) => sum + step.duration, 0));

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const handleExport = async () => {
    const payload = await exportToJson();
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "circu-thai-programs.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Export ok");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await importFromJson(file);
    setStatus("Import ok");
    track("program.create", { source: "import" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const ensureUniqueName = (base: string) => {
    const normalize = (value: string) => value.trim().toLowerCase();
    let candidate = base;
    let counter = 2;
    while (normalizedNames.some((item) => normalize(item.name) === normalize(candidate))) {
      candidate = `${base} #${counter}`;
      counter += 1;
    }
    return candidate;
  };

  const handleDuplicate = async (program: ProgramRecord) => {
    const suffix = labels.copySuffix ?? " (copy)";
    const baseName = ensureUniqueName(`${program.name}${suffix}`.trim());
    const now = new Date().toISOString();
    try {
      await persist({
        ...program,
        id: makeId(),
        name: baseName,
        steps: program.steps.map((step) => ({ ...step })),
        createdAt: now,
        updatedAt: now,
      });
      setStatus(`${labels.duplicateSuccess} ${baseName}`);
    } catch (error) {
      console.error(error);
      setStatus(labels.duplicateError);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">{labels.title}</h2>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleExport} className="rounded-full border border-white/30 px-4 py-2 text-sm text-white">
          {labels.export}
        </button>
        <label className="rounded-full border border-dashed border-white/30 px-4 py-2 text-sm text-white">
          {labels.import}
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </label>
        {status && <span className="text-sm text-white/70">{status}</span>}
      </div>
      {programs.length === 0 ? (
        <p className="text-sm text-white/70">{labels.empty}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((program) => (
            <article key={program.id} className="glass-panel flex flex-col gap-4 px-4 py-4 text-white">
              <div>
                <h3 className="text-xl font-semibold">{program.name}</h3>
                <p className="text-sm text-white/70">
                  {labels.total}: {totalDuration(program)}
                </p>
                <p className="text-xs text-white/60">
                  {labels.sessions}: {sessionCount[program.id] ?? 0}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href={`/${locale}/run/${program.id}`}
                  className="rounded-full bg-white px-4 py-2 font-semibold text-slate-900"
                >
                  {labels.run}
                </Link>
                <Link
                  href={`/${locale}/builder?programId=${program.id}`}
                  className="rounded-full border border-white/40 px-4 py-2"
                >
                  {labels.edit}
                </Link>
                <button
                  type="button"
                  onClick={() => handleDuplicate(program)}
                  className="rounded-full border border-white/40 px-4 py-2"
                >
                  {labels.duplicate}
                </button>
                <button type="button" onClick={() => handleDelete(program.id)} className="rounded-full border border-white/40 px-4 py-2">
                  {labels.delete}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
