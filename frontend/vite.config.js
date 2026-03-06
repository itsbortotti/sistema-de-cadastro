import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  appType: 'spa',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
    },
    // Garante que rotas do React Router (ex: /produtos-software) sirvam index.html
    strictPort: false,
  },
});
