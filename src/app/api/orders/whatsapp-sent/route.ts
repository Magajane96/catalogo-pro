import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const whatsappSentSchema = z.object({
  orderId: z.uuid(),
});

export async function POST(request: Request) {
  try {
    const payload = whatsappSentSchema.safeParse(await request.json());
    if (!payload.success) return NextResponse.json({ error: "Pedido inválido." }, { status: 422 });
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Servico indisponivel." }, { status: 503 });
    const { data, error } = await supabase.rpc("mark_public_order_whatsapp_sent", { p_order_id: payload.data.orderId });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: Boolean(data) });
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar o envio." }, { status: 400 });
  }
}


