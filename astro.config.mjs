import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Allow Slack OAuth redirect to hit the dev server via ngrok.
      // You can tighten this to a specific host later.
      allowedHosts: ['.ngrok-free.app'],
    },
  },
});
