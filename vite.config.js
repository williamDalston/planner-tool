    // vite.config.js
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig({
      plugins: [react()],
      root: './',
      build: {
        outDir: 'dist',
        rollupOptions: {
          // Explicitly mark Firebase modules as external to prevent Rollup from trying to bundle them
          external: [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            // Add any other specific firebase sub-modules you might import directly, e.g.:
            // 'firebase/storage',
            // 'firebase/functions',
          ],
        },
      },
    });
    