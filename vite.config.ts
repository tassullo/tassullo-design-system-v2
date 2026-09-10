import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Porta fissa e non negoziabile: `public/r/` è servito qui, ed è l'indirizzo
  // del registry Tassullo dichiarato in components.json (docs/DECISIONI.md §9).
  // `strictPort` fa fallire l'avvio invece di scivolare su un'altra porta, che
  // renderebbe il registry irraggiungibile senza dirlo.
  server: { port: 5180, strictPort: true },
  resolve: {
    alias: [
      // L'ordine conta: `@/registry` è un sottopercorso di `@` e va risolto prima.
      {
        find: '@/registry',
        replacement: fileURLToPath(new URL('./registry', import.meta.url)),
      },
      // `@/prove` è l'imbracatura di misura (M2.9), non codice del registry:
      // vive in `.storybook/prove/` e nessun item la spedisce. Sta qui perché
      // le story la importino per nome invece che con tre livelli di `../`.
      {
        find: '@/prove',
        replacement: fileURLToPath(new URL('./.storybook/prove', import.meta.url)),
      },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
})
