import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const visitSchema = z.object({
  storeId: z.uuid(),
  referrer: z.string().trim().max(500).optional().nullable(),
  path: z.string().trim().max(300).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const payload = visitSchema.safeParse(await request.json());
    if (!payload.success) return NextResponse.json({ ok: false }, { status: 422 });
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ ok: false }, { status: 503 });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";
    const agent = request.headers.get("user-agent") || "unknown";
    const visitorHash = await sha256(`${ip}:${agent}:${payload.data.storeId}`);
    await supabase.from("store_visits").insert({
      store_id: payload.data.storeId,
      visitor_hash: visitorHash,
      referrer: payload.data.referrer || null,
      path: payload.data.path || null,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}
