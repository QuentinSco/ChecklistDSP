import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    // mode: 'standalone' // optionnel, tu peux laisser vide au début
  }),
  integrations: [react()],
});
