import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FontKey } from "@/themes/fontOptions";
import { DEFAULT_FONT_KEY } from "@/themes/fontOptions";
import { DEFAULT_STYLE, type DesignStyleKey } from "@/themes/designStyles";

export type ColorScheme = "light" | "dark";

interface PrefsState {
  colorScheme: ColorScheme;
  font: FontKey;
  style: DesignStyleKey;
  setColorScheme: (s: ColorScheme) => void;
  toggleColorScheme: () => void;
  setFont: (key: FontKey) => void;
  setStyle: (key: DesignStyleKey) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      colorScheme: "light",
      font: DEFAULT_FONT_KEY as FontKey,
      style: DEFAULT_STYLE,
      setColorScheme: (colorScheme) => set({ colorScheme }),
      toggleColorScheme: () =>
        set((s) => ({ colorScheme: s.colorScheme === "light" ? "dark" : "light" })),
      setFont: (font) => set({ font }),
      setStyle: (style) => set({ style }),
    }),
    { name: "showcase-prefs" },
  ),
);
