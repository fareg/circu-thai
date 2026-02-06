"use client";

import { SessionRecord } from "@/types";
import { formatDuration } from "@/lib/time";

interface SessionLogProps {
  title: string;
  sessions: SessionRecord[];
}

export function SessionLog({ title, sessions }: SessionLogProps) {
  if (!sessions.length) {
    return null;
  }

  return (
    <section className="glass-panel px-4 py-4 text-white">
      <h3 className="text-sm uppercase tracking-[0.3em] text-white/50">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-white/80">
        {sessions.map((session) => (
          <li key={session.id ?? session.completedAt} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-none">
            <span>{new Date(session.completedAt).toLocaleString()}</span>
            <span>{formatDuration(session.durationSeconds)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
