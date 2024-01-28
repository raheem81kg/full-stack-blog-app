import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
   const env = loadEnv(mode, process.cwd(), "");
   return {
      plugins: [react()],
      resolve: {
         alias: {
            "@": path.resolve(__dirname, "./src"),
         },
      },
      server: {
         proxy: {
            "/api": env.VITE_API_URL,
         },
      },
      // host: true, will expose the project in public addresses
      preview: {
         strictPort: true,
         host: true,
         port: 5173,
      },
   };
});
