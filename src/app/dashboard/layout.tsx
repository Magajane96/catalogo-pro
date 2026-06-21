import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardRealtime } from "@/components/dashboard-realtime";
import { createClient } from "@/lib/supabase/server";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: store } = supabase ? await supabase.from("stores").select("id,slug").maybeSingle() : { data: null };
  const { data: profile } = supabase ? await supabase.from("profiles").select("role").maybeSingle() : { data: null };
  return <DashboardShell storeSlug={store?.slug} isAdmin={profile?.role === "admin"}>
    <DashboardRealtime storeId={store?.id} />
    {children}
  </DashboardShell>;
}
