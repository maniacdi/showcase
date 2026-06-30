import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const src = path.resolve(__dirname, "./src");

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: { loadPaths: [src] },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
  },
  resolve: { alias: { "@": src } },
});
