import { exerciseCatalog } from "@/data/exercises";
import { curatedTracks } from "@/lib/audio/library";
import type { ProgramRecord, ProgramStep } from "@/types";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

const EXERCISES_COLLECTION = "exercises";
const PROGRAMS_COLLECTION = "programs";
const fallbackTrack = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const pickTrack = (index: number) => curatedTracks[index % curatedTracks.length]?.url ?? fallbackTrack;
const defaultTimestamp = "2024-01-05T08:00:00.000Z";

const makeStep = (programId: string, exerciseId: string, duration: number, index: number): ProgramStep => ({
  id: `${programId}-step-${index}`,
  exerciseId,
  duration,
});

export const defaultPrograms: ProgramRecord[] = [
  {
    id: "drainage-matinal",
    name: "Drainage matinal 15'",
    notes: "Sequence express pour relancer le retour veineux des membres inferieurs.",
    musicUrl: pickTrack(0),
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    steps: [
      makeStep("drainage-matinal", "ankle-pumps", 60, 1),
      makeStep("drainage-matinal", "heel-slides", 75, 2),
      makeStep("drainage-matinal", "knee-circles", 60, 3),
      makeStep("drainage-matinal", "calf-raises", 90, 4),
      makeStep("drainage-matinal", "diaphragmatic-breathing", 120, 5),
    ],
  },
  {
    id: "upper-release",
    name: "Decongestion haut du corps",
    notes: "Mobilisation douce des membres superieurs + respiration.",
    musicUrl: pickTrack(1),
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    steps: [
      makeStep("upper-release", "arm-circles", 60, 1),
      makeStep("upper-release", "wrist-rolls", 45, 2),
      makeStep("upper-release", "shoulder-sweeps", 75, 3),
      makeStep("upper-release", "neck-fans", 45, 4),
      makeStep("upper-release", "diaphragmatic-breathing", 120, 5),
    ],
  },
  {
    id: "aqua-fluide",
    name: "Routine aqua fluide",
    notes: "Enchainement dans l'eau pour drainage global.",
    musicUrl: pickTrack(2),
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    steps: [
      makeStep("aqua-fluide", "water-forward-walk", 120, 1),
      makeStep("aqua-fluide", "water-side-steps", 90, 2),
      makeStep("aqua-fluide", "water-ankle-circles", 120, 3),
      makeStep("aqua-fluide", "water-soft-kicks", 180, 4),
      makeStep("aqua-fluide", "water-relax-walk", 180, 5),
    ],
  },
  {
    id: "aqua-guided-20",
    name: "Séance guidée piscine 20 min",
    notes: "Cours progressif dans l'eau pour relancer circulation + drainage.",
    musicUrl: pickTrack(3),
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    steps: [
      // Échauffement 5 min
      makeStep("aqua-guided-20", "water-forward-walk", 120, 1),
      makeStep("aqua-guided-20", "water-backward-walk", 90, 2),
      makeStep("aqua-guided-20", "water-side-steps", 90, 3),
      // Activation circulation 7 min
      makeStep("aqua-guided-20", "water-toe-raises", 120, 4),
      makeStep("aqua-guided-20", "water-aqua-bike", 120, 5),
      makeStep("aqua-guided-20", "water-soft-kicks", 180, 6),
      // Mobilité chevilles 5 min
      makeStep("aqua-guided-20", "water-ankle-circles", 120, 7),
      makeStep("aqua-guided-20", "water-foot-flex", 180, 8),
      // Retour au calme 3 min
      makeStep("aqua-guided-20", "water-relax-walk", 180, 9),
    ],
  },
];

async function seedExercises() {
  const exercisesRef = collection(firestore, EXERCISES_COLLECTION);
  const snapshot = await getDocs(exercisesRef);
  const existingIds = new Set(snapshot.docs.map((docSnap) => docSnap.id));
  const missingExercises = exerciseCatalog.filter((exercise) => !existingIds.has(exercise.id));
  if (!missingExercises.length) {
    console.log("Exercises already present (", existingIds.size, ") — skipping seed.");
    return;
  }
  await Promise.all(
    missingExercises.map((exercise) => setDoc(doc(firestore, EXERCISES_COLLECTION, exercise.id), exercise))
  );
  console.log(`Seeded ${missingExercises.length} exercise(s) into Firestore.`);
}

async function seedPrograms() {
  const programsRef = collection(firestore, PROGRAMS_COLLECTION);
  const snapshot = await getDocs(programsRef);
  const existingIds = new Set(snapshot.docs.map((docSnap) => docSnap.id));
  const missingPrograms = defaultPrograms.filter((program) => !existingIds.has(program.id));
  if (!missingPrograms.length) {
    console.log("Programs already present (", existingIds.size, ") — refreshing music tracks.");
  } else {
    await Promise.all(
      missingPrograms.map((program) => setDoc(doc(firestore, PROGRAMS_COLLECTION, program.id), program))
    );
    console.log(`Seeded ${missingPrograms.length} program(s) into Firestore.`);
  }

  await syncDefaultProgramMusic();
}

async function syncDefaultProgramMusic() {
  const updates = defaultPrograms.map((program) =>
    setDoc(
      doc(firestore, PROGRAMS_COLLECTION, program.id),
      { musicUrl: program.musicUrl },
      { merge: true }
    )
  );
  await Promise.all(updates);
  console.log(`Synchronized musicUrl on ${updates.length} default program(s).`);
}

export async function seedDefaultContent() {
  await Promise.all([seedExercises(), seedPrograms()]);
}
