import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@ui': path.resolve(__dirname, '../UTPCanvasStoryBook/src'),
      '@myproject/ui': path.resolve(__dirname, '../UTPCanvasStoryBook/src/index.js'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['recharts'],
  },
  css: {
    lightningcss: {
      errorRecovery: true,
    },
    modules: {
      localsConvention: 'camelCase',
    },
  },
});


