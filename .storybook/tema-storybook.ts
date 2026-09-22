import { create } from 'storybook/theming'

import palette from './manager-palette.json'

/**
 * Il tema di Storybook nei colori Tassullo, in una modalità data.
 *
 * ── Perché due usi e una definizione sola ────────────────────────────────
 *
 * Serve in due posti che Storybook tiene separati: la **cornice**
 * (`manager.ts` — barra laterale, barra strumenti, pannelli) e le **pagine
 * Docs** (`preview.tsx`, attraverso `docs.container`). Scritto due volte,
 * divergerebbe al primo ritocco: la cornice direbbe un grigio, la pagina un
 * altro.
 *
 * ── Perché colori concreti e non `var(--…)` ──────────────────────────────
 *
 * Il tema di Storybook passa diversi valori da `polished` (`transparentize`,
 * `lighten`…) per derivarne bordi e hover, e `polished` non sa leggere né
 * `var()` né `oklch()`: lancia, e la pagina non si rende. I valori arrivano
 * quindi da `manager-palette.json`, **generato da `scripts/hex-to-oklch.ts`**
 * insieme al CSS del tema (`npm run theme:build`) — la fonte resta una sola,
 * e qui non si scrive nessun colore.
 *
 * ── Niente token della sidebar ───────────────────────────────────────────
 *
 * Fino al 2026-09-22 qui c'erano `sidebarBg`, `sidebarTextColor`,
 * `sidebarSelectedColor` e `sidebarBorderColor`, col proposito di dare alla
 * colonna di sinistra l'antracite di `--sidebar`. **Storybook 10 non ha quei
 * campi**: `create()` legge solo quelli che conosce e scarta gli altri senza
 * dirlo, quindi la colonna è sempre stata su `appBg`. Tolti, perché una riga
 * che non fa niente e dice di fare qualcosa è peggio di nessuna riga.
 */
export function temaStorybook(base: 'light' | 'dark') {
  const t = palette[base]

  return create({
    base,
    brandTitle: 'Tassullo Design System 2.0',
    brandUrl: '/',
    brandTarget: '_self',

    // Superfici: nella cornice e nella pagina Docs, lo stesso fondo che il
    // canvas prende dalla superficie «Pagina».
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

    // Barra strumenti (anche quella sopra ogni scena nelle pagine Docs)
    barBg: t.card,
    barTextColor: t['muted-foreground'],
    barSelectedColor: t['accent-ink'],
    barHoverColor: t['accent-ink'],

    // Campi
    inputBg: t.card,
    inputBorder: t.border,
    inputTextColor: t.foreground,
    inputBorderRadius: 6,

    fontBase:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    fontCode: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  })
}
