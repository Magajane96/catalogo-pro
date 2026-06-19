"use client";

import { useEffect } from "react";

export function StoreVisitTracker({ storeId, path }: { storeId: string; path: string }) {
  useEffect(() => {
    const payload = JSON.stringify({ storeId, path, referrer: document.referrer || null });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/visits", new Blob([payload], { type: "application/json" }));
      return;
    }
    fetch("/api/visits", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => null);
  }, [storeId, path]);

  return null;
}
