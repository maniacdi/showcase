import { create } from "zustand";

interface BudgetState {
  open: boolean;
  plan: string | null;
  openWith: (plan?: string | null) => void;
  close: () => void;
}

// Drives the "request a quote" modal from the hero CTA and the pricing buttons.
export const useBudgetStore = create<BudgetState>()((set) => ({
  open: false,
  plan: null,
  openWith: (plan = null) => set({ open: true, plan }),
  close: () => set({ open: false }),
}));
