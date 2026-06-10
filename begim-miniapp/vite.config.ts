import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  resolve: {
    alias: {
      // Общий слой данных (begim-shared) для Mini App и бэк-офиса.
      '@begim/shared': fileURLToPath(new URL('../begim-shared/index.ts', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    port: 5174,
    host: true,
    // Разрешаем хосты cloudflare/ngrok-туннелей, чтобы Mini App открывалась в Telegram.
    allowedHosts: true,
    fs: {
      // Разрешаем vite читать begim-shared, лежащий вне корня приложения.
      allow: ['..'],
    },
  },
});
