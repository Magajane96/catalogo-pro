"use client";

import { ArrowDown, ArrowUp, GripVertical, Save, Star, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProductImage, updateProductImages } from "@/app/dashboard/actions";

type ProductImage = {
  id: string;
  url: string;
  storage_path: string | null;
  is_primary: boolean;
  position: number;
};

export function ProductImageManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(() => [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position));
  const [primaryId, setPrimaryId] = useState(() => items.find(image => image.is_primary)?.id || items[0]?.id || "");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const imageIds = useMemo(() => items.map(image => image.id).join(","), [items]);

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    setItems(current => {
      const copy = [...current];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  }

  function moveTo(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    setItems(current => {
      const copy = [...current];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  }

  function removeImage(id: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      await deleteProductImage(formData);
      setItems(current => current.filter(image => image.id !== id));
      if (primaryId === id) setPrimaryId(items.find(image => image.id !== id)?.id || "");
      toast.success("Imagem removida.");
      router.refresh();
    });
  }

  function saveOrder() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("product_id", productId);
      formData.set("primary_image_id", primaryId);
      formData.set("image_ids", imageIds);
      await updateProductImages(formData);
      toast.success("Galeria atualizada.");
      router.refresh();
    });
  }

  if (!items.length) return null;

  return <div className="mt-5 space-y-4">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((image, index) => <div
        key={image.id}
        draggable
        onDragStart={() => setDragIndex(index)}
        onDragOver={event => event.preventDefault()}
        onDrop={() => { if (dragIndex !== null) moveTo(dragIndex, index); setDragIndex(null); }}
        onDragEnd={() => setDragIndex(null)}
        className={`relative overflow-hidden rounded-xl border bg-white ${dragIndex === index ? "border-brand opacity-70" : "border-slate-200"}`}
      >
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
          <span className="grid size-7 place-items-center rounded-lg bg-white/90 text-slate-400 shadow"><GripVertical size={15} /></span>
          {primaryId === image.id && <span className="rounded-full bg-brand px-2 py-1 text-[10px] font-black text-white">PRINCIPAL</span>}
        </div>
        <img src={image.url} alt="Imagem do produto" className="aspect-square w-full object-cover" />
        <div className="absolute inset-x-2 bottom-2 grid grid-cols-4 gap-1">
          <button type="button" disabled={pending || index === 0} onClick={() => move(index, -1)} className="grid size-8 place-items-center rounded-lg bg-white text-slate-600 shadow disabled:opacity-40" aria-label="Mover imagem para cima"><ArrowUp size={15} /></button>
          <button type="button" disabled={pending || index === items.length - 1} onClick={() => move(index, 1)} className="grid size-8 place-items-center rounded-lg bg-white text-slate-600 shadow disabled:opacity-40" aria-label="Mover imagem para baixo"><ArrowDown size={15} /></button>
          <button type="button" disabled={pending} onClick={() => setPrimaryId(image.id)} className="grid size-8 place-items-center rounded-lg bg-white text-amber-500 shadow disabled:opacity-40" aria-label="Definir como foto principal"><Star size={15} fill={primaryId === image.id ? "currentColor" : "none"} /></button>
          <button type="button" disabled={pending} onClick={() => removeImage(image.id)} className="grid size-8 place-items-center rounded-lg bg-white text-red-600 shadow disabled:opacity-40" aria-label="Remover imagem"><Trash2 size={15} /></button>
        </div>
      </div>)}
    </div>
    <button type="button" disabled={pending} onClick={saveOrder} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-extrabold text-white disabled:opacity-50">
      <Save size={17} />Salvar ordem e foto principal
    </button>
  </div>;
}
