import { ProgramRecord, ProgramStep } from "@/types";
import { create } from "zustand";

const defaultName = "Flow du jour";
const defaultMusic = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_demo.mp3";

interface ProgramDraftState {
  name: string;
  musicUrl: string;
  notes: string;
  steps: ProgramStep[];
  setName: (value: string) => void;
  setMusicUrl: (value: string) => void;
  setNotes: (value: string) => void;
  addStep: (step: ProgramStep) => void;
  moveStep: (id: string, direction: "up" | "down") => void;
  reorderStep: (id: string, targetIndex: number) => void;
  removeStep: (id: string) => void;
  updateDuration: (id: string, value: number) => void;
  reset: () => void;
  loadFromProgram: (program: ProgramRecord) => void;
}

export const useProgramDraftStore = create<ProgramDraftState>((set) => ({
  name: defaultName,
  musicUrl: defaultMusic,
  notes: "",
  steps: [],
  setName: (value) => set({ name: value }),
  setMusicUrl: (value) => set({ musicUrl: value }),
  setNotes: (value) => set({ notes: value }),
  addStep: (step) => set((state) => ({ steps: [...state.steps, step] })),
  moveStep: (id, direction) =>
    set((state) => {
      const index = state.steps.findIndex((step) => step.id === id);
      if (index === -1) {
        return state;
      }
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= state.steps.length) {
        return state;
      }
      const steps = [...state.steps];
      [steps[index], steps[target]] = [steps[target], steps[index]];
      return { steps };
    }),
  reorderStep: (id, targetIndex) =>
    set((state) => {
      const index = state.steps.findIndex((step) => step.id === id);
      if (index === -1 || targetIndex < 0 || targetIndex >= state.steps.length) {
        return state;
      }
      if (index === targetIndex) {
        return state;
      }
      const steps = [...state.steps];
      const [moved] = steps.splice(index, 1);
      steps.splice(targetIndex, 0, moved);
      return { steps };
    }),
  removeStep: (id) => set((state) => ({ steps: state.steps.filter((step) => step.id !== id) })),
  updateDuration: (id, value) =>
    set((state) => ({ steps: state.steps.map((step) => (step.id === id ? { ...step, duration: value } : step)) })),
  reset: () => set({ name: defaultName, musicUrl: defaultMusic, notes: "", steps: [] }),
  loadFromProgram: (program) =>
    set({
      name: program.name,
      musicUrl: program.musicUrl ?? defaultMusic,
      notes: program.notes ?? "",
      steps: program.steps.map((step) => ({ ...step })),
    }),
}));
