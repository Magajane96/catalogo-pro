import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const orderSchema = z.object({
  storeId: z.uuid(),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(8).max(30),
    email: z.union([z.email(), z.literal(""), z.null()]).optional(),
    notes: z.string().trim().max(500).optional(),
  }),
  items: z.array(z.object({
    product_id: z.uuid(),
    variant_id: z.uuid().optional().nullable(),
    variant_name: z.string().trim().max(240).optional().nullable(),
    quantity: z.number().int().min(1).max(999),
  })).min(1).max(50),
});

export async function POST(request: Request) {
  try {
    const payload = orderSchema.safeParse(await request.json());
    if (!payload.success) return NextResponse.json({ error: "Confira os dados do pedido e tente novamente." }, { status: 422 });
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Servico indisponivel." }, { status: 503 });
    const { data, error } = await supabase.rpc("create_public_order", { p_store_id: payload.data.storeId, p_customer: payload.data.customer, p_items: payload.data.items });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch { return NextResponse.json({ error: "Não foi possível criar o pedido." }, { status: 400 }); }
}

