import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Actualiza el SW automáticamente cuando hay nueva versión
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "apple-touch-icon-valentine.png",
        "apple-touch-icon-christmas.png",
        "favicon-16x16.png",
        "favicon-32x32.png",
      ],
      manifest: {
        name: "MensajeMágico",
        short_name: "MensajeMágico",
        description: "Genera mensajes y cartas personalizadas con IA.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        orientation: "portrait",
        icons: [
          {
            src: "/favicon-16x16.png",
            sizes: "16x16",
            type: "image/png",
          },
          {
            src: "/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Cachear todos los assets generados por Vite
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        // Fallback para SPA: redirigir a index.html si la ruta no está en caché (offline)
        navigateFallback: "/index.html",
      },
    }),
  ],
});
