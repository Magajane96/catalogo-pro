import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json(); const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Servico indisponivel." }, { status: 503 });
    const { data, error } = await supabase.rpc("create_public_order", { p_store_id: body.storeId, p_customer: body.customer, p_items: body.items });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch { return NextResponse.json({ error: "Nao foi possivel criar o pedido." }, { status: 400 }); }
}
