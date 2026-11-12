import { defineConfig, withFilter } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  // Relative by default so the built bundle works from any sub-path (e.g.
  // when it is served out of a Next.js `public/` folder at /qsort/).
  // Override with PUBLIC_BASE_PATH=/qsort/ if an absolute base is preferred.
  base: process.env.PUBLIC_BASE_PATH || "./",
  plugins: [
    withFilter(
      svgr({
        /* your options */
      }),
      { load: { id: /\.svg\?react$/ } },
    ),
    react(),
  ],
});
