"use client";

import { useEffect, useState } from "react";
import { applyBrandToRoot, BRAND_PARAM, decodeBrand } from "@/themes/brand";
import { useBrandStore } from "@/store/useBrandStore";

/**
 * Keeps <html> in sync with the brand store (PrefsScript already applied it
 * before first paint). A shared link (?brand=…) wins over the stored brand
 * once and is saved, so the brand survives navigation.
 */
export default function BrandApplier() {
  const brand = useBrandStore((s) => s.brand);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cfg = decodeBrand(new URLSearchParams(window.location.search).get(BRAND_PARAM));
    if (cfg) {
      const s = useBrandStore.getState();
      // A link for a different business must not show this browser's old logo.
      if (s.brand?.name !== cfg.name) s.setLogo(null);
      s.setBrand(cfg);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) applyBrandToRoot(document.documentElement, brand);
  }, [brand, ready]);

  return null;
}
