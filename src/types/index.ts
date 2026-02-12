export type ExerciseZone = "legs" | "arms" | "core" | "full";
export type ExerciseIntensity = "low" | "medium" | "high";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  tags: string[];
  zone: ExerciseZone;
  intensity: ExerciseIntensity;
  defaultDuration: number;
  media?: string;
  sideSwitch?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramStep {
  id: string;
  exerciseId: string;
  duration: number;
}

export interface ProgramRecord {
  id: string;
  name: string;
  steps: ProgramStep[];
  musicUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  id?: string;
  programId: string;
  completedAt: string;
  durationSeconds: number;
  interruptCount: number;
}
