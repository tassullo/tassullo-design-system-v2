import type { Meta, StoryObj } from '@storybook/react-vite'

import { DiffView } from '@/registry/tassullo/blocks/diff-view'

/**
 * Confronto prima/dopo, parola per parola — `diff` ×15 nella roadmap di
 * Anagrafe: il *change set* di una scheda tecnica **è** una diff, ed è il
 * meccanismo attorno a cui ruota il flusso di approvazione (`version-timeline`,
 * M3.7, manda qui le due revisioni scelte).
 *
 * ```tsx
 * <DiffView prima={revisione3.testo} dopo={revisione4.testo} />
 * <DiffView prima={revisione3.testo} dopo={revisione4.testo} modo="affiancato" />
 * ```
 *
 * `inline` fonde il confronto in un paragrafo solo (`<del>` barrato,
 * `<ins>` colorato); `affiancato` compone `SplitView` — due colonne
 * sincronizzate, che sotto 448px di contenitore si impilano da sole.
 */
const meta = {
  title: 'Blocchi/Confronto testi',
  component: DiffView,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DiffView>

export default meta
type Story = StoryObj<typeof meta>

const schedaRev3 =
  'Membrana armata in poliestere, spessore 4 mm, per impermeabilizzazione di coperture piane e inclinate. Sovrapposizione minima ai bordi 80 mm. Posa a doppio strato incrociato, saldatura a fiamma. Resistenza a compressione secondo UNI EN 998-2.'

const schedaRev4 =
  'Membrana armata in poliestere, spessore 4 mm, per impermeabilizzazione di coperture piane, inclinate e giardini pensili. Sovrapposizione minima ai bordi 100 mm. Posa a doppio strato incrociato, saldatura a fiamma. Resistenza a compressione secondo UNI EN 998-2:2024.'

/** Le due schede tecniche reali dell'accettazione di M3.9 — inline, il modo di default. */
export const SchedaTecnica: Story = {
  args: {
    prima: schedaRev3,
    dopo: schedaRev4,
    etichettaPrima: 'Rev. 3 — 18 giu 2026',
    etichettaDopo: 'Rev. 4 — 2 lug 2026',
  },
  render: (args) => (
    <div className="max-w-2xl">
      <DiffView {...args} />
    </div>
  ),
}

/** La stessa coppia, in `SplitView`: tolto a sinistra, aggiunto a destra, scorrimento sincronizzato. */
export const Affiancato: Story = {
  args: {
    prima: schedaRev3,
    dopo: schedaRev4,
    etichettaPrima: 'Rev. 3 — 18 giu 2026',
    etichettaDopo: 'Rev. 4 — 2 lug 2026',
    modo: 'affiancato',
  },
  render: (args) => (
    <div className="max-w-3xl">
      <DiffView {...args} />
    </div>
  ),
}

/** Testi identici: nessun `<del>`/`<ins>`, il paragrafo esce piatto. */
export const NessunaDifferenza: Story = {
  args: {
    prima: schedaRev4,
    dopo: schedaRev4,
  },
  render: (args) => (
    <div className="max-w-2xl">
      <DiffView {...args} />
    </div>
  ),
}
