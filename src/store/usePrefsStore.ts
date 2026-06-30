import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FontKey } from "@/themes/fontOptions";
import { DEFAULT_FONT_KEY } from "@/themes/fontOptions";

export type ColorScheme = "light" | "dark";

interface PrefsState {
  colorScheme: ColorScheme;
  font: FontKey;
  setColorScheme: (s: ColorScheme) => void;
  toggleColorScheme: () => void;
  setFont: (key: FontKey) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      colorScheme: "light",
      font: DEFAULT_FONT_KEY as FontKey,
      setColorScheme: (colorScheme) => set({ colorScheme }),
      toggleColorScheme: () =>
        set((s) => ({ colorScheme: s.colorScheme === "light" ? "dark" : "light" })),
      setFont: (font) => set({ font }),
    }),
    { name: "showcase-prefs" },
  ),
);
