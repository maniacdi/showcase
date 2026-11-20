import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BRAND_STORAGE_KEY, DEFAULT_BRAND, type BrandConfig } from "@/themes/brand";

interface BrandState {
  /** null = no brand: the showcase looks like itself. */
  brand: BrandConfig | null;
  /** Downscaled (<=256px) data URL. Never shared by URL. */
  logo: string | null;
  setBrand: (brand: BrandConfig) => void;
  patch: (partial: Partial<BrandConfig>) => void;
  setLogo: (logo: string | null) => void;
  reset: () => void;
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      brand: null,
      logo: null,
      setBrand: (brand) => set({ brand }),
      patch: (partial) => set((s) => ({ brand: { ...(s.brand ?? DEFAULT_BRAND), ...partial } })),
      setLogo: (logo) => set({ logo }),
      reset: () => set({ brand: null, logo: null }),
    }),
    { name: BRAND_STORAGE_KEY },
  ),
);
