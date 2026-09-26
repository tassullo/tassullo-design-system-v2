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
const configDir = fileURLToPath(new URL('.storybook', import.meta.url))
const setupFiles = ['./.storybook/vitest.setup.ts']

/**
 * ── Il secondo progetto: WebKit, sulle sole scene `webkit` ──────────────
 *
 * Il gate di accessibilità gira in Chromium, e un difetto che esiste solo in
 * WebKit non lo vede: il ciclo di aggiornamenti delle righe virtualizzate
 * (`docs/DECISIONI.md` §69) nasceva dagli arrotondamenti di WebKit a 1× e
 * Chromium lo trovava in 1 scena su 5. Il progetto `storybook-webkit` esegue
 * in WebKit le sole scene con l'etichetta `webkit` — scene di misura che
 * scorrono e cambiano densità —: 14–15 secondi. WebKit su tutte le scene ne
 * costava 41 e non ha trovato niente in più (§70). Si lancia con
 * `npm run test:webkit`.
 *
 * `deviceScaleFactor: 1` non è un'abitudine: a 2× WebKit rappresenta i mezzi
 * pixel, le righe da 36,5px restano tali e il ciclo non parte. È la densità
 * dei monitor da ufficio, cioè quella dove il difetto c'era.
 */
export default defineConfig({
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
    projects: [
      {
        extends: true,
        plugins: [tailwindcss(), storybookTest({ configDir })],
        test: {
          name: 'storybook',
          setupFiles,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        plugins: [tailwindcss(), storybookTest({ configDir, tags: { include: ['webkit'] } })],
        test: {
          name: 'storybook-webkit',
          setupFiles,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ contextOptions: { deviceScaleFactor: 1 } }),
            instances: [{ browser: 'webkit' }],
          },
        },
      },
    ],
  },
})
