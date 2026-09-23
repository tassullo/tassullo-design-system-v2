import type { Meta, StoryObj } from '@storybook/react-vite'

import { DiffView } from '@/registry/tassullo/blocks/diff-view'

/**
 * Il confronto fra due versioni di un testo, parola per parola: cosa è stato
 * tolto e cosa aggiunto.
 *
 * **Quando sì, quando no.** Si usa per mostrare cosa cambia fra due revisioni
 * di un documento: la scheda tecnica di oggi contro quella di ieri, un testo
 * prima e dopo la modifica. Per scegliere le due revisioni c'è
 * `tassullo-version-timeline`; per mettere due contenuti qualsiasi uno
 * accanto all'altro, senza segnare le differenze, `tassullo-split-view`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-diff-view
 * ```
 *
 * ```tsx
 * <DiffView prima={revisione3.testo} dopo={revisione4.testo} />
 * <DiffView prima={revisione3.testo} dopo={revisione4.testo} modo="affiancato" />
 * ```
 *
 * **Le prop.** `prima` e `dopo`, i due testi; `etichettaPrima` ed
 * `etichettaDopo`, «Prima» e «Dopo» se non si passano; `modo`: `"inline"`,
 * il predefinito, fonde il confronto in un paragrafo solo, con il tolto
 * barrato e l'aggiunto colorato; `"affiancato"` mette le due versioni in due
 * colonne che scorrono insieme, e che in un contenitore stretto si
 * impilano.
 *
 * **Regole d'uso.** Il confronto è fra testi: un documento salvato in un
 * formato strutturato si converte prima in testo. Due testi uguali danno un
 * paragrafo senza segni.
 *
 * **Tastiera e accessibilità.** Il testo tolto e quello aggiunto sono
 * `<del>` e `<ins>`, non soltanto colori; la legenda sopra dice quale è
 * quale.
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

/**
 * Due revisioni di una scheda tecnica, confrontate nel paragrafo.
 */
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

/**
 * La stessa coppia in due colonne: il tolto a sinistra, l'aggiunto a destra,
 * lo scorrimento insieme.
 */
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

/**
 * Due testi uguali: il paragrafo esce senza segni.
 */
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
