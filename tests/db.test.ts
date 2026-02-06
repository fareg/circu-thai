import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { exerciseCatalog } from "@/data/exercises";
import type { Exercise, ProgramRecord, SessionRecord } from "@/types";
import { exportAll, importAll } from "@/lib/db";

const mockCollections: Record<string, Map<string, Exercise | ProgramRecord | SessionRecord>> = {
  exercises: new Map(),
  programs: new Map(),
  sessions: new Map(),
};

type CollectionName = keyof typeof mockCollections;

vi.mock("@/lib/firebase", () => ({ firestore: {} }));

vi.mock("firebase/firestore", () => {
  const collection = (_db: unknown, name: CollectionName) => ({ name });
  const doc = (_db: unknown, name: CollectionName, id: string) => ({ collectionName: name, id });
  const setDoc = async (
    ref: { collectionName: CollectionName; id: string },
    data: Exercise | ProgramRecord | SessionRecord
  ) => {
    mockCollections[ref.collectionName].set(ref.id, data);
  };
  const deleteDoc = async (ref: { collectionName: CollectionName; id: string }) => {
    mockCollections[ref.collectionName].delete(ref.id);
  };
  const addDoc = async (collectionRef: { name: CollectionName }, data: SessionRecord) => {
    const id = randomUUID();
    mockCollections[collectionRef.name].set(id, data);
    return { id };
  };
  const orderBy = (field: string, direction: "asc" | "desc" = "asc") => ({ type: "orderBy", field, direction });
  const where = (field: string, op: string, value: unknown) => ({ type: "where", field, op, value });
  const query = (collectionRef: { name: CollectionName }, ...clauses: unknown[]) => ({ collection: collectionRef, clauses });
  const createSnapshot = (
    collectionName: CollectionName,
    id: string,
    data: Exercise | ProgramRecord | SessionRecord
  ) => ({
    id,
    exists: () => true,
    data: () => data,
    ref: { collectionName, id },
  });

  const applyWhere = (
    docs: ReturnType<typeof createSnapshot>[],
    clause?: { type: string; field: string; value: unknown }
  ) => {
    if (!clause || clause.type !== "where") {
      return docs;
    }
    return docs.filter((docSnapshot) => docSnapshot.data()[clause.field] === clause.value);
  };

  const applyOrder = (
    docs: ReturnType<typeof createSnapshot>[],
    clause?: { type: string; field: string; direction: "asc" | "desc" }
  ) => {
    if (!clause || clause.type !== "orderBy") {
      return docs;
    }
    return docs.sort((a, b) => {
      const aValue = a.data()[clause.field] ?? "";
      const bValue = b.data()[clause.field] ?? "";
      if (aValue === bValue) return 0;
      return clause.direction === "desc" ? (aValue < bValue ? 1 : -1) : aValue > bValue ? 1 : -1;
    });
  };

  const getDocs = async (
    input:
      | { name: CollectionName }
      | { collection: { name: CollectionName }; clauses: unknown[] }
  ) => {
    const collectionName = "collection" in input ? input.collection.name : input.name;
    const clauses = "collection" in input ? input.clauses : [];
    const snapshots = Array.from(mockCollections[collectionName].entries()).map(([id, value]) =>
      createSnapshot(collectionName, id, value)
    );
    const whereClause = clauses.find((clause) => (clause as { type?: string }).type === "where") as
      | { type: string; field: string; value: unknown }
      | undefined;
    const orderClause = clauses.find((clause) => (clause as { type?: string }).type === "orderBy") as
      | { type: string; field: string; direction: "asc" | "desc" }
      | undefined;
    const filtered = applyWhere(snapshots, whereClause);
    const ordered = applyOrder(filtered, orderClause);
    return { docs: ordered };
  };

  const onSnapshot = (
    target:
      | { name: CollectionName }
      | { collection: { name: CollectionName }; clauses: unknown[] }
      | { collectionName: CollectionName; id: string },
    callback: (payload: { docs: ReturnType<typeof createSnapshot>[] }) => void
  ) => {
    if ("collectionName" in target) {
      const data = mockCollections[target.collectionName].get(target.id);
      const snapshot = data
        ? createSnapshot(target.collectionName, target.id, data)
        : {
            id: target.id,
            exists: () => false,
            data: () => undefined,
            ref: target,
          };
      callback(snapshot);
      return () => undefined;
    }

    void getDocs(target).then((result) => callback(result));
    return () => undefined;
  };

  return { collection, doc, setDoc, deleteDoc, addDoc, orderBy, where, query, getDocs, onSnapshot };
});

const now = () => new Date().toISOString();

const makeProgram = (overrides: Partial<ProgramRecord> = {}): ProgramRecord => ({
  id: overrides.id ?? randomUUID(),
  name: overrides.name ?? "Flow",
  steps: overrides.steps ?? [
    { id: "step-1", exerciseId: exerciseCatalog[0].id, duration: 60 },
  ],
  musicUrl: overrides.musicUrl,
  notes: overrides.notes,
  createdAt: overrides.createdAt ?? now(),
  updatedAt: overrides.updatedAt ?? now(),
});

const makeSession = (overrides: Partial<SessionRecord> = {}): SessionRecord => ({
  id: overrides.id,
  programId: overrides.programId ?? "flow",
  completedAt: overrides.completedAt ?? now(),
  durationSeconds: overrides.durationSeconds ?? 120,
  interruptCount: overrides.interruptCount ?? 0,
});

beforeEach(() => {
  mockCollections.exercises.clear();
  mockCollections.programs.clear();
  mockCollections.sessions.clear();
});

describe("Firestore helpers", () => {
  it("replaces existing data when importing programs", async () => {
    await importAll({ programs: [makeProgram({ id: "alpha" })] });
    await importAll({ programs: [makeProgram({ id: "beta", name: "Beta" })] });

    const snapshot = await exportAll();
    expect(snapshot.programs).toHaveLength(1);
    expect(snapshot.programs[0].id).toBe("beta");
  });

  it("exports exercises, programs, and sessions with generated ids", async () => {
    const program = makeProgram({ id: "runner" });
    await importAll({
      exercises: exerciseCatalog,
      programs: [program],
      sessions: [
        makeSession({ programId: program.id, completedAt: "2024-01-05T10:00:00.000Z", durationSeconds: 90 }),
        makeSession({ id: "session-fixed", programId: program.id, completedAt: "2024-01-01T10:00:00.000Z" }),
      ],
    });

    const snapshot = await exportAll();
    expect(snapshot.exercises.length).toBe(exerciseCatalog.length);
    expect(snapshot.sessions[0].completedAt).toBe("2024-01-05T10:00:00.000Z");
    expect(snapshot.sessions[1].id).toBe("session-fixed");
  });
});
