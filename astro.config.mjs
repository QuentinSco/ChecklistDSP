import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/server'; // <– adapter server

export default defineConfig({
  output: 'server',          // important pour les endpoints /api
  adapter: vercel(),         // <– on indique l’adapter
  integrations: [react()],
});
