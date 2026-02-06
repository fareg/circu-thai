import path from "node:path";
import { config } from "dotenv";

const cwd = process.cwd();
config({ path: path.join(cwd, ".env.local"), override: true });
config();

async function main() {
  try {
    const { seedDefaultContent } = await import("@/lib/seed");
    await seedDefaultContent();
    console.log("Firebase seeded with default catalog and programs.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed Firestore:", error);
    process.exit(1);
  }
}

void main();
