import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// In development the dashboard talks to the API through this proxy, so both share one origin
// and the login cookie stays SameSite=Strict. In production nginx does the same.
const API = process.env.API_URL || "http://localhost:4000";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": API, "/uploads": API } },
  preview: { proxy: { "/api": API, "/uploads": API } },
});
