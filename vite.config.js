import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api and /tiles (map raster tiles) are proxied to the FastAPI backend
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:8000', '/tiles': 'http://localhost:8000' } },
});
