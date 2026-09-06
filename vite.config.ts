import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages uses repo subpaths or root domain. 
// Using './' ensures that all asset paths are relative and work seamlessly on GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/database'],
          icons: ['lucide-react'],
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
