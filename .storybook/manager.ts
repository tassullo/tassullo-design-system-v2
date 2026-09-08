import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

import palette from './manager-palette.json'

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
 * ── Perché la barra laterale usa i token della sidebar ───────────────────
 *
 * Perché è una sidebar. Nel tema Tassullo `--sidebar` è antracite anche in
 * modalità chiara, ed è la stessa colonna che le app hanno a sinistra: usare
 * qui gli stessi token vuol dire che la style guide **mostra** la sidebar
 * mentre la si sfoglia, invece di descriverla.
 */
const scuro =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches

const t = scuro ? palette.dark : palette.light

addons.setConfig({
  theme: create({
    base: scuro ? 'dark' : 'light',
    brandTitle: 'Tassullo Design System 2.0',
    brandUrl: '/',
    brandTarget: '_self',

    // Superfici della cornice
    appBg: t.background,
    appContentBg: t.background,
    appPreviewBg: t.background,
    appBorderColor: t.border,
    appBorderRadius: 6,

    // Testo
    textColor: t.foreground,
    textInverseColor: t.background,
    textMutedColor: t['muted-foreground'],

    // L'arancio del marchio è il colore della selezione, ed è l'unico posto
    // in cui compare: `--primary` non si usa mai per il testo (vale anche
    // qui), quindi per un testo arancione c'è `--accent-ink`.
    colorPrimary: t.primary,
    colorSecondary: t['accent-ink'],

    // Barra strumenti e barra laterale
    barBg: t.card,
    barTextColor: t['muted-foreground'],
    barSelectedColor: t['accent-ink'],
    barHoverColor: t['accent-ink'],

    // La colonna di sinistra è una sidebar, e prende i token della sidebar.
    sidebarBg: t.sidebar,
    sidebarTextColor: t['sidebar-foreground'],
    sidebarSelectedColor: t['sidebar-accent-foreground'],
    sidebarBorderColor: t['sidebar-border'],

    // Campi
    inputBg: t.card,
    inputBorder: t.border,
    inputTextColor: t.foreground,
    inputBorderRadius: 6,

    fontBase:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    fontCode: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  }),
})
