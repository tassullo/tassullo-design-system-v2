import { addons } from 'storybook/manager-api'

import { temaStorybook } from './tema-storybook'

/**
 * La cornice di Storybook — barra laterale, barra strumenti, pannelli — nei
 * colori Tassullo.
 *
 * ── Perché serve un file apposta ─────────────────────────────────────────
 *
 * Il *manager* di Storybook è un documento separato dal canvas: non carica
 * `src/index.css`, quindi non vede né i token né `.dark`. `var(--primary)`
 * qui dentro non risolve niente, e il tema vuole colori concreti.
 *
 * Da cui il rischio: una seconda palette scritta a mano, che diverge dalla
 * prima al primo ritocco. Per questo i valori arrivano da
 * `manager-palette.json`, **generato da `scripts/hex-to-oklch.ts`** insieme
 * al CSS del tema (`npm run theme:build`) — la fonte resta una sola.
 *
 * ── Chiaro o scuro ───────────────────────────────────────────────────────
 *
 * Il manager si tinge una volta sola, all'avvio: non ha un interruttore, e
 * quello in barra riguarda il canvas, cioè le story. Qui si segue quindi la
 * preferenza del sistema operativo, che è la scelta meno sorprendente — chi
 * lavora in scuro trova la style guide in scuro.
 *
 * La palette e la corrispondenza token → campo del tema stanno in
 * `tema-storybook.ts`, che le pagine Docs usano allo stesso modo.
 */
const scuro =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches

addons.setConfig({ theme: temaStorybook(scuro ? 'dark' : 'light') })
