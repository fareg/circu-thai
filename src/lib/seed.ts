import { exerciseCatalog } from "@/data/exercises";
import { curatedTracks } from "@/lib/audio/library";
import type { Exercise, ProgramRecord, ProgramStep } from "@/types";
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
    id: "demo-flow",
    name: "Demo guidée 5'",
    notes: "Parcours express utilisé par le menu 'Y aller'.",
    musicUrl: pickTrack(0),
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    steps: [
      makeStep("demo-flow", "ankle-pumps", 45, 1),
      makeStep("demo-flow", "marching", 60, 2),
      makeStep("demo-flow", "arm-circles", 45, 3),
      makeStep("demo-flow", "glute-bridge", 60, 4),
      makeStep("demo-flow", "diaphragmatic-breathing", 90, 5),
    ],
  },
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
  {
    id: "aqua-dos-relief-15",
    name: "Soulagement dos eau 15'",
    notes: "Routine douce pour lombalgies légères avec appuis muraux.",
    musicUrl: pickTrack(4),
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    steps: [
      makeStep("aqua-dos-relief-15", "water-forward-walk", 90, 1),
      makeStep("aqua-dos-relief-15", "water-supported-knee-hugs", 120, 2),
      makeStep("aqua-dos-relief-15", "water-floating-cat-cow", 120, 3),
      makeStep("aqua-dos-relief-15", "water-lumbar-rotation", 120, 4),
      makeStep("aqua-dos-relief-15", "water-relax-walk", 180, 5),
    ],
  },
  {
    id: "aqua-dos-stabilisation",
    name: "Stabilisation lombaire piscine",
    notes: "Alternance renfo léger et mobilité pour dos sensible.",
    musicUrl: pickTrack(5),
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    steps: [
      makeStep("aqua-dos-stabilisation", "water-forward-walk", 90, 1),
      makeStep("aqua-dos-stabilisation", "water-hip-opener", 120, 2),
      makeStep("aqua-dos-stabilisation", "water-wall-squat-glide", 90, 3),
      makeStep("aqua-dos-stabilisation", "water-supported-knee-hugs", 120, 4),
      makeStep("aqua-dos-stabilisation", "water-floating-cat-cow", 120, 5),
      makeStep("aqua-dos-stabilisation", "water-lumbar-rotation", 120, 6),
      makeStep("aqua-dos-stabilisation", "water-relax-walk", 180, 7),
    ],
  },
  {
    id: "aqua-dos-express",
    name: "Dos léger express (eau)",
    notes: "Express 10' pour calmer les tensions avant ou après la journée.",
    musicUrl: pickTrack(6),
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    steps: [
      makeStep("aqua-dos-express", "water-supported-knee-hugs", 90, 1),
      makeStep("aqua-dos-express", "water-floating-cat-cow", 90, 2),
      makeStep("aqua-dos-express", "water-lumbar-rotation", 90, 3),
      makeStep("aqua-dos-express", "water-relax-walk", 120, 4),
    ],
  },
];

const EXERCISE_FIELDS_TO_SYNC = ["name", "description", "tags", "zone", "intensity", "defaultDuration", "sideSwitch"] as const;
type ExerciseSyncField = (typeof EXERCISE_FIELDS_TO_SYNC)[number];

const arraysAreEqual = (a?: unknown[], b?: unknown[]) => {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return Array.isArray(a) === Array.isArray(b);
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
};

function shouldUpdateExercise(current: Exercise, desired: Exercise) {
  return EXERCISE_FIELDS_TO_SYNC.some((field) => {
    const currentValue = current[field];
    const nextValue = desired[field];
    if (Array.isArray(currentValue) || Array.isArray(nextValue)) {
      return !arraysAreEqual(currentValue as unknown[], nextValue as unknown[]);
    }
    return currentValue !== nextValue;
  });
}

function buildExerciseUpdatePayload(exercise: Exercise, updatedAt: string): Pick<Exercise, ExerciseSyncField | "updatedAt"> {
  const base = EXERCISE_FIELDS_TO_SYNC.reduce((acc, field) => {
    acc[field] = exercise[field];
    return acc;
  }, {} as Record<ExerciseSyncField, Exercise[ExerciseSyncField]>);
  return { ...base, updatedAt };
}

async function seedExercises() {
  const exercisesRef = collection(firestore, EXERCISES_COLLECTION);
  const snapshot = await getDocs(exercisesRef);
  const existingById = new Map(snapshot.docs.map((docSnap) => [docSnap.id, docSnap.data() as Exercise]));

  const toCreate: Exercise[] = [];
  const toUpdate: { id: string; payload: Pick<Exercise, ExerciseSyncField | "updatedAt"> }[] = [];

  for (const exercise of exerciseCatalog) {
    const current = existingById.get(exercise.id);
    if (!current) {
      toCreate.push(exercise);
      continue;
    }
    if (shouldUpdateExercise(current, exercise)) {
      toUpdate.push({ id: exercise.id, payload: buildExerciseUpdatePayload(exercise, new Date().toISOString()) });
    }
  }

  if (!toCreate.length && !toUpdate.length) {
    console.log("Exercises already up to date (", existingById.size, ").");
    return;
  }

  if (toCreate.length) {
    await Promise.all(
      toCreate.map((exercise) => setDoc(doc(firestore, EXERCISES_COLLECTION, exercise.id), exercise))
    );
    console.log(`Seeded ${toCreate.length} new exercise(s) into Firestore.`);
  }

  if (toUpdate.length) {
    await Promise.all(
      toUpdate.map(({ id, payload }) => setDoc(doc(firestore, EXERCISES_COLLECTION, id), payload, { merge: true }))
    );
    console.log(`Updated ${toUpdate.length} exercise(s) from source catalog.`);
  }
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
