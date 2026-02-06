import { exportAll, importAll } from "@/lib/db";

export async function exportToJson() {
  const payload = await exportAll();
  return JSON.stringify(payload, null, 2);
}

export async function importFromJson(file: File) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  await importAll(parsed);
}
