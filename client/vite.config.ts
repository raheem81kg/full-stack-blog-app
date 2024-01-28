import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
   plugins: [react()],
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "./src"),
      },
   },
   // host: true, will expose the project in public addresses
   preview: {
      strictPort: true,
      host: true,
      port: 5173,
   },
});
