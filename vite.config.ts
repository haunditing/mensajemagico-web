import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: "es2020", // Asegura compatibilidad con iOS 14+
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Actualiza el SW automáticamente cuando hay nueva versión
      injectRegister: "inline", // Inyecta el script de registro inline para evitar bloqueo de renderizado
      filename: "service-worker.js", // Cambiamos el nombre para evitar conflictos con caché antigua
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "apple-touch-icon-valentine.png",
        "apple-touch-icon-christmas.png",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
        "android-chrome-192x192-maskable.png",
        "android-chrome-512x512-maskable.png",
        "screenshot-mobile.png",
        "screenshot-desktop.png",
      ],
      manifest: {
        name: "MensajeMágico",
        short_name: "Mensaje",
        description: "Genera mensajes y cartas personalizadas con IA.",
        start_url: "/",
        display: "standalone",
        background_color: "#0f172a",
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
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-192x192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshot-mobile.png",
            sizes: "1080x1920",
            type: "image/png",
          },
          {
            src: "/screenshot-desktop.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
          },
        ],
      },
      workbox: {
        // Cachear todos los assets generados por Vite
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        // Fallback para SPA: redirigir a index.html si la ruta no está en caché (offline)
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes("/api/config/plans"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-config-cache",
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
            },
          },
        ],
      },
    }),
    {
      name: "defer-css",
      apply: "build",
      transformIndexHtml: {
        order: "post",
        handler(html) {
          return html.replace(
            /<link rel="stylesheet"([^>]*?)>/g,
            '<link rel="stylesheet"$1 media="print" onload="this.media=\'all\'">'
          );
        },
      },
    },
  ],
});
