import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Build de un solo archivo HTML autocontenido (fuentes e imágenes como data URIs).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-single',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
});
