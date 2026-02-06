"use client";

import { useEffect, useState } from "react";
import { deleteProgram, listenToExercises, listenToProgram, listenToPrograms, listenToSessions, saveProgram } from "@/lib/db";
import type { Exercise, ProgramRecord, SessionRecord } from "@/types";
import { track } from "@/lib/analytics";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const unsubscribe = listenToExercises(setExercises);
    return unsubscribe;
  }, []);

  return exercises;
}

export function usePrograms() {
  const [programs, setPrograms] = useState<ProgramRecord[]>([]);

  useEffect(() => {
    const unsubscribe = listenToPrograms(setPrograms);
    return unsubscribe;
  }, []);

  return programs;
}

export function useProgram(programId?: string) {
  const [program, setProgram] = useState<ProgramRecord | null | undefined>(undefined);

  useEffect(() => {
    if (!programId) {
      setProgram(null);
      return;
    }

    setProgram(undefined);
    return listenToProgram(programId, (snapshot) => {
      setProgram(snapshot);
    });
  }, [programId]);

  return program;
}

export function useSessions(programId?: string) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    const unsubscribe = listenToSessions(programId ?? null, setSessions);
    return unsubscribe;
  }, [programId]);

  return sessions;
}

export function useProgramActions() {
  return {
    async persist(record: ProgramRecord) {
      await saveProgram(record);
      track("program.create", { id: record.id, steps: record.steps.length });
    },
    async remove(id: string) {
      await deleteProgram(id);
      track("program.delete", { id });
    },
  };
}
