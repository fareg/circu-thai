import type { Exercise } from "@/types";
import { ProgramRecord, SessionRecord } from "@/types";
import type { DocumentSnapshot } from "firebase/firestore";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

const EXERCISES_COLLECTION = "exercises";
const PROGRAMS_COLLECTION = "programs";
const SESSIONS_COLLECTION = "sessions";

const exercisesRef = collection(firestore, EXERCISES_COLLECTION);
const programsRef = collection(firestore, PROGRAMS_COLLECTION);
const sessionsRef = collection(firestore, SESSIONS_COLLECTION);

const normalizeExercise = (snapshot: DocumentSnapshot): Exercise | null => {
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data() as Exercise;
  return { ...data, id: data.id ?? snapshot.id };
};

const normalizeProgram = (snapshot: DocumentSnapshot): ProgramRecord | null => {
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data() as ProgramRecord;
  return { ...data, id: data.id ?? snapshot.id };
};

const normalizeSession = (snapshot: DocumentSnapshot): SessionRecord | null => {
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data() as SessionRecord;
  return { ...data, id: data.id ?? snapshot.id };
};

export function listenToPrograms(callback: (programs: ProgramRecord[]) => void) {
  const programsQuery = query(programsRef, orderBy("updatedAt", "desc"));
  return onSnapshot(programsQuery, (snapshot) => {
    const programs = snapshot.docs
      .map((docSnap) => normalizeProgram(docSnap))
      .filter((program): program is ProgramRecord => Boolean(program));
    callback(programs);
  });
}

export function listenToExercises(callback: (exercises: Exercise[]) => void) {
  const exercisesQuery = query(exercisesRef, orderBy("name", "asc"));
  return onSnapshot(exercisesQuery, (snapshot) => {
    const exercises = snapshot.docs
      .map((docSnap) => normalizeExercise(docSnap))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    callback(exercises);
  });
}

export function listenToProgram(id: string, callback: (program: ProgramRecord | null) => void) {
  const programDoc = doc(firestore, PROGRAMS_COLLECTION, id);
  return onSnapshot(programDoc, (snapshot) => {
    callback(normalizeProgram(snapshot));
  });
}

export function listenToSessions(programId: string | null, callback: (sessions: SessionRecord[]) => void) {
  const sessionsQuery = programId
    ? query(sessionsRef, where("programId", "==", programId), orderBy("completedAt", "desc"))
    : query(sessionsRef, orderBy("completedAt", "desc"));

  return onSnapshot(sessionsQuery, (snapshot) => {
    const sessions = snapshot.docs
      .map((docSnap) => normalizeSession(docSnap))
      .filter((session): session is SessionRecord => Boolean(session));
    callback(sessions);
  });
}

export async function saveProgram(record: ProgramRecord) {
  const now = new Date().toISOString();
  const payload: ProgramRecord = {
    ...record,
    createdAt: record.createdAt ?? now,
    updatedAt: now,
  };
  await setDoc(doc(firestore, PROGRAMS_COLLECTION, payload.id), payload, { merge: true });
}

export async function deleteProgram(id: string) {
  await deleteDoc(doc(firestore, PROGRAMS_COLLECTION, id));
}

export async function updateExerciseDetails(
  id: string,
  updates: Pick<Exercise, "name" | "description">
) {
  const now = new Date().toISOString();
  const payload = {
    ...updates,
    id,
    updatedAt: now,
  } satisfies Partial<Exercise>;
  await setDoc(doc(firestore, EXERCISES_COLLECTION, id), payload, { merge: true });
}

export async function logSession(entry: SessionRecord) {
  await addDoc(sessionsRef, entry);
}

export async function exportAll() {
  const [exercisesSnapshot, programsSnapshot, sessionsSnapshot] = await Promise.all([
    getDocs(query(exercisesRef, orderBy("name", "asc"))),
    getDocs(query(programsRef, orderBy("updatedAt", "desc"))),
    getDocs(query(sessionsRef, orderBy("completedAt", "desc"))),
  ]);

  const exercises = exercisesSnapshot.docs
    .map((docSnap) => normalizeExercise(docSnap)!)
    .filter(Boolean);
  const programs = programsSnapshot.docs
    .map((docSnap) => normalizeProgram(docSnap)!)
    .filter(Boolean);
  const sessions = sessionsSnapshot.docs
    .map((docSnap) => normalizeSession(docSnap)!)
    .filter(Boolean);

  return { exercises, programs, sessions };
}

export async function importAll(payload: {
  exercises?: Exercise[];
  programs?: ProgramRecord[];
  sessions?: SessionRecord[];
}) {
  if (payload.exercises) {
    const existingExercises = await getDocs(exercisesRef);
    await Promise.all(existingExercises.docs.map((docSnap) => deleteDoc(docSnap.ref)));
    await Promise.all(
      payload.exercises.map((exercise) => setDoc(doc(firestore, EXERCISES_COLLECTION, exercise.id), exercise))
    );
  }

  if (payload.programs) {
    const existingPrograms = await getDocs(programsRef);
    await Promise.all(existingPrograms.docs.map((docSnap) => deleteDoc(docSnap.ref)));
    await Promise.all(
      payload.programs.map((program) => setDoc(doc(firestore, PROGRAMS_COLLECTION, program.id), program))
    );
  }

  if (payload.sessions) {
    const existingSessions = await getDocs(sessionsRef);
    await Promise.all(existingSessions.docs.map((docSnap) => deleteDoc(docSnap.ref)));
    await Promise.all(
      payload.sessions.map((session) => {
        const sessionId = session.id ?? crypto.randomUUID();
        return setDoc(doc(firestore, SESSIONS_COLLECTION, sessionId), { ...session, id: sessionId });
      })
    );
  }
}

export type { ProgramRecord, SessionRecord };
