import type { Meta, StoryObj } from '@storybook/react-vite'

import { scorriECambiaDensita } from '@/prove/scorri-densita'
import * as Griglia from '@/registry/tassullo/blocks/data-grid.stories'
import * as Tabella from '@/registry/tassullo/blocks/data-table.stories'

// Le scene di misura della passata WebKit (`npm run test:webkit`,
// `docs/DECISIONI.md` §70). Sono le scene con righe virtualizzate di tabella e
// griglia, riprese così come sono, con una prova che le scorre e cambia la
// densità: il ciclo di aggiornamenti delle righe virtualizzate esisteva solo
// in WebKit a 1×, e solo scorrendo. Col codice di prima Chromium lo trovava in
// 1 scena su 5, WebKit in 5 su 5.
//
// Questo file non entra in nessun item del registry: è imbracatura del gate.
// `!dev` e `!autodocs` lo tolgono dalla barra e da Docs; l'etichetta `webkit`
// è il filtro del progetto `storybook-webkit` di `vitest.config.ts`. Le
// passate di axe in Chromium le eseguono lo stesso, come ogni scena.
const meta = {
  title: 'Blocchi/Righe Virtualizzate, prove',
  parameters: { layout: 'padded' },
  tags: ['!dev', '!autodocs', 'webkit'],
} satisfies Meta

export default meta
type Story = StoryObj

// Una regola di axe spenta sulle sole tre scene della griglia, e a verbale:
// scorsa la griglia col mouse, la cella da cui entra `Tab` non è più montata
// (la virtualizzazione l'ha tolta), il riquadro che scorre resta senza nessun
// elemento raggiungibile da tastiera, e `Tab` non entra più nella griglia —
// misurato in Chromium e WebKit, `scrollable-region-focusable`. È un difetto
// della griglia, non di questa prova, e le scene di `data-grid.stories.tsx`
// non lo vedono perché si misurano ferme in cima. Quando la griglia terrà
// raggiungibile la cella d'ingresso anche scorsa, questo si toglie.
const GRIGLIA_SCORSA = {
  a11y: { config: { rules: [{ id: 'scrollable-region-focusable', enabled: false }] } },
}

// «Editabile» della griglia: sessanta voci di sole colonne di testo.
export const GrigliaEditabile: Story = {
  ...Griglia.Editabile,
  parameters: GRIGLIA_SCORSA,
  name: 'Griglia editabile, scorre e cambia densità',
  play: scorriECambiaDensita,
}

// «Celle Tipizzate» della griglia: numeri, scelte, date e caselle.
export const GrigliaCelleTipizzate: Story = {
  ...Griglia.CelleTipizzate,
  parameters: GRIGLIA_SCORSA,
  name: 'Griglia a celle tipizzate, scorre e cambia densità',
  play: scorriECambiaDensita,
}

// «Computo» della griglia: cinquecento voci.
export const GrigliaComputo: Story = {
  ...Griglia.Computo,
  parameters: GRIGLIA_SCORSA,
  name: 'Griglia del computo, scorre e cambia densità',
  play: scorriECambiaDensita,
}

// «Virtualizzata» della tabella: diecimila prodotti.
export const TabellaVirtualizzata: Story = {
  ...(Tabella.Virtualizzata as Story),
  name: 'Tabella virtualizzata, scorre e cambia densità',
  play: scorriECambiaDensita,
}

// «Piede Virtualizzato» della tabella: quattromila righe col totale in fondo.
export const TabellaPiedeVirtualizzato: Story = {
  ...(Tabella.PiedeVirtualizzato as Story),
  name: 'Tabella col piede virtualizzata, scorre e cambia densità',
  play: scorriECambiaDensita,
}
