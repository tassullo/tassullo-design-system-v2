import { fileURLToPath, URL } from 'node:url'

import { playwright } from '@vitest/browser-playwright'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

/**
 * Il gate di accessibilità (M2.9): axe-core su ogni story, in un browser
 * vero, a ogni `npm test`.
 *
 * ── Perché un browser vero e non jsdom ──────────────────────────────────
 *
 * Perché metà di ciò che axe misura non esiste in jsdom: il contrasto vuole
 * i colori **risolti** — i nostri token sono `oklch()` e `color-mix()` — e i
 * popup di Base UI spostano il fuoco dentro `requestAnimationFrame`, che
 * senza motore di resa non scatta. È lo stesso motivo per cui le misure di
 * M2.3 si erano dovute fare in Chromium dalla cartella temporanea: qui
 * quell'imbracatura smette di essere temporanea ed entra nel repo.
 *
 * ── Perché `headless: true` e non il pannello ───────────────────────────
 *
 * Perché il pannello del browser dell'app ha `document.visibilityState`
 * a `hidden`, e lì `requestAnimationFrame` **non scatta mai**: i popup
 * sembrano non rispondere alla tastiera mentre sono sani
 * (`docs/DECISIONI.md` §22). Chromium headless di Playwright non ha quel
 * difetto — la pagina si considera visibile.
 */
export default defineConfig({
  plugins: [
    tailwindcss(),
    storybookTest({ configDir: fileURLToPath(new URL('.storybook', import.meta.url)) }),
  ],
  resolve: {
    alias: [
      // Stesso ordine di `vite.config.ts`: `@/registry` è un sottopercorso
      // di `@` e va risolto prima.
      { find: '@/registry', replacement: fileURLToPath(new URL('./registry', import.meta.url)) },
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
  test: {
    name: 'storybook',
    setupFiles: ['./.storybook/vitest.setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
})
