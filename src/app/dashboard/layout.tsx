import { DashboardRealtime } from "@/components/dashboard-realtime";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const [{ data: store }, { data: profile }] = supabase
    ? await Promise.all([
        supabase.from("stores").select("id, slug").maybeSingle(),
        supabase.from("profiles").select("role").maybeSingle(),
      ])
    : [{ data: null }, { data: null }];

  return (
    <DashboardShell storeSlug={store?.slug} isAdmin={profile?.role === "admin"}>
      <DashboardRealtime storeId={store?.id} />
      {children}
    </DashboardShell>
  );
}