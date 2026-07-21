import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Vite automatically splits lazy imported page modules into separate chunks.
export default defineConfig({ plugins: [react()] });
