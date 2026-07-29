import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Default "/" for local dev. GitHub Actions sets VITE_BASE=/portfolio/
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  publicDir: "public",
});
