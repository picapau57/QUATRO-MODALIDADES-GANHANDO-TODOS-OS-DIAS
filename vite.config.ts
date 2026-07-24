import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

let _filename = "";
let _dirname = "";
try {
  if (typeof import.meta !== "undefined" && (import.meta as any)?.url) {
    _filename = fileURLToPath((import.meta as any).url);
    _dirname = path.dirname(_filename);
  } else if (typeof __filename !== "undefined") {
    _filename = __filename;
    _dirname = __dirname;
  } else {
    _dirname = process.cwd();
    _filename = path.join(_dirname, "vite.config.ts");
  }
} catch (e) {
  _dirname = process.cwd();
  _filename = path.join(_dirname, "vite.config.ts");
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(_dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
