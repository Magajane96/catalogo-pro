"use client";

import { useMemo, useRef } from "react";
import { Copy, Download, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

export function StoreShareCard({ storeUrl, color }: { storeUrl: string; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileName = useMemo(() => `qr-code-${storeUrl.split("/").pop() || "loja"}.png`, [storeUrl]);

  async function copyLink() {
    await navigator.clipboard.writeText(storeUrl);
    toast.success("Link da loja copiado.");
  }

  function downloadQrCode() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = fileName;
    link.click();
  }

  return <section className="rounded-2xl border border-slate-200 bg-white p-6">
    <div className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-xl text-white" style={{ background: color }}><QrCode size={20} /></span>
      <div>
        <h3 className="font-display text-lg font-extrabold">Link e QR Code</h3>
        <p className="text-sm text-slate-500">Use nas redes sociais, embalagens e cartões.</p>
      </div>
    </div>
    <div className="mt-6 grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
      <div className="grid place-items-center rounded-2xl bg-slate-50 p-4">
        <QRCodeCanvas ref={canvasRef} value={storeUrl} size={148} bgColor="#f8fafc" fgColor="#17211c" includeMargin />
      </div>
      <div>
        <p className="break-all rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-600">{storeUrl}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={copyLink} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-extrabold"><Copy size={17} />Copiar link</button>
          <button type="button" onClick={downloadQrCode} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-white" style={{ background: color }}><Download size={17} />Baixar QR Code</button>
        </div>
      </div>
    </div>
  </section>;
}


