import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Allow Slack OAuth redirect to hit the dev server via ngrok.
      // You can tighten this to a specific host later.
      allowedHosts: ['.ngrok-free.app'],
    },
  },
});
