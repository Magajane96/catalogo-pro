import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Servico indisponivel." }, { status: 503 });
    const { data, error } = await supabase.rpc("mark_public_order_whatsapp_sent", { p_order_id: body.orderId });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: Boolean(data) });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel atualizar o envio." }, { status: 400 });
  }
}
