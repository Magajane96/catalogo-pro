import Link from "next/link";
import { Store } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="inline-flex items-center gap-2.5 font-display font-extrabold tracking-tight text-[#14261d]">
    <span className="grid size-10 place-items-center rounded-xl bg-brand text-white shadow-lg shadow-emerald-600/20"><Store size={21} strokeWidth={2.5} /></span>
    {!compact && <span className="text-lg">MGD <span className="text-brand">Catalogo</span> PRO</span>}
  </Link>;
}
