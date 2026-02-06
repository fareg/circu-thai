import { webcrypto } from "node:crypto";

if (!globalThis.crypto) {
	// Ensure crypto.randomUUID is available during Vitest runs
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	globalThis.crypto = webcrypto as any;
}
