// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // This tells Vite where your main HTML file is.
  // Assuming your index.html will be in the project root.
  root: './',
  build: {
    // This tells Vite to output the build files into a 'dist' folder.
    outDir: 'dist',
  },
});