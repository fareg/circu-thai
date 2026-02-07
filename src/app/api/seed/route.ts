import { NextResponse } from "next/server";
import { seedDefaultContent } from "@/lib/seed";

const SEED_TOKEN = process.env.SEED_TRIGGER_TOKEN;

function extractToken(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const url = new URL(request.url);
  return url.searchParams.get("token") ?? undefined;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function handleSeed(request: Request) {
  if (!SEED_TOKEN) {
    return NextResponse.json({ error: "Seed route disabled" }, { status: 503 });
  }

  const provided = extractToken(request);
  if (!provided || provided !== SEED_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await seedDefaultContent();
    return NextResponse.json({ ok: true, message: "Seed executed" });
  } catch (error) {
    console.error("Seed route failed", error);
    return NextResponse.json({ ok: false, error: "Seed failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleSeed(request);
}

export async function GET(request: Request) {
  return handleSeed(request);
}
