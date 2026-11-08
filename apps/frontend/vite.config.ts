import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Para Tailscale: reemplaza IP_LOCAL_TAILSCALE con tu IP de Tailscale
    // hmr: {
    //   host: 'IP_LOCAL_TAILSCALE',
    //   port: 5173,
    // },
  },
});
