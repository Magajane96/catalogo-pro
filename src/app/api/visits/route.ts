import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ ok: false }, { status: 503 });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";
    const agent = request.headers.get("user-agent") || "unknown";
    const visitorHash = await sha256(`${ip}:${agent}:${body.storeId}`);
    await supabase.from("store_visits").insert({
      store_id: body.storeId,
      visitor_hash: visitorHash,
      referrer: body.referrer || null,
      path: body.path || null,
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
