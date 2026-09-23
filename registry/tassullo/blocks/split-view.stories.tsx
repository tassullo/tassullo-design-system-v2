import type { Meta, StoryObj } from '@storybook/react-vite'

import { SplitView } from '@/registry/tassullo/blocks/split-view'

/**
 * Due contenuti affiancati in due colonne, con una maniglia per spostare il
 * confine e, a scelta, lo scorrimento legato.
 *
 * **Quando sì, quando no.** Si usa per un confronto a vista: una traduzione
 * accanto al testo originale, una scheda accanto alle sue note, due revisioni.
 * Quando le differenze vanno segnate parola per parola si usa
 * `tassullo-diff-view`, che in modo affiancato è costruito su questo blocco.
 * Per dividere lo schermo di un'applicazione in pannelli liberi c'è la
 * primitiva `resizable`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-split-view
 * ```
 *
 * ```tsx
 * <SplitView
 *   sinistra={<TestoPrima />}
 *   destra={<TestoDopo />}
 *   etichettaSinistra="Rev. 3"
 *   etichettaDestra="Rev. 4"
 *   sincronizzato
 * />
 * ```
 *
 * **Le prop.** `sinistra` e `destra`, i due contenuti; `etichettaSinistra`
 * ed `etichettaDestra`, i titoli delle colonne; `sincronizzato`, lo
 * scorrimento di una colonna trascina l'altra.
 *
 * **Regole d'uso.**
 *
 * - In un contenitore più stretto di 448px le colonne si impilano: la soglia
 *   guarda il contenitore, non lo schermo.
 * - Con `sincronizzato` le colonne scorrono per la stessa frazione della loro
 *   lunghezza, non per gli stessi pixel: due testi di lunghezza diversa
 *   restano allineati dall'inizio alla fine.
 *
 * **Tastiera e accessibilità.** Ogni colonna è una regione con il nome della
 * sua etichetta, e riceve il fuoco per scorrere con la tastiera. La maniglia
 * fra le colonne si sposta con le frecce.
 */
const meta = {
  title: 'Blocchi/Vista affiancata',
  component: SplitView,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SplitView>

export default meta
type Story = StoryObj<typeof meta>

const testoLungo = Array.from(
  { length: 12 },
  (_, i) => `Riga ${i + 1} — membrana armata in poliestere, spessore 4 mm, posa a doppio strato.`
).join('\n')

/**
 * Due colonne con la maniglia: si trascina, o si sposta con le frecce.
 */
export const Predefinito: Story = {
  args: {
    sinistra: <p className="text-sm">Membrana armata in poliestere, spessore 4 mm. Sovrapposizione 80 mm.</p>,
    destra: <p className="text-sm">Membrana armata in poliestere, spessore 4 mm. Sovrapposizione 100 mm.</p>,
    etichettaSinistra: 'Rev. 3',
    etichettaDestra: 'Rev. 4',
  },
  render: (args) => (
    <div className="max-w-3xl">
      <SplitView {...args} />
    </div>
  ),
}

/**
 * Due testi di lunghezza diversa che scorrono insieme.
 */
export const Sincronizzata: Story = {
  args: {
    sinistra: <p className="text-sm whitespace-pre-line">{testoLungo}</p>,
    destra: (
      <p className="text-sm whitespace-pre-line">
        {testoLungo}
        {'\nRiga 13 — nota aggiunta in questa revisione.'}
      </p>
    ),
    etichettaSinistra: 'Rev. 3',
    etichettaDestra: 'Rev. 4',
    sincronizzato: true,
  },
  render: (args) => (
    <div className="max-w-3xl">
      <SplitView {...args} />
    </div>
  ),
}

/**
 * Un contenitore da 375px: le due colonne si impilano.
 */
export const ContenitoreStretto: Story = {
  args: {
    sinistra: <p className="text-sm">Membrana armata in poliestere, spessore 4 mm. Sovrapposizione 80 mm.</p>,
    destra: <p className="text-sm">Membrana armata in poliestere, spessore 4 mm. Sovrapposizione 100 mm.</p>,
    etichettaSinistra: 'Rev. 3',
    etichettaDestra: 'Rev. 4',
  },
  render: (args) => (
    <div className="w-[375px]">
      <SplitView {...args} />
    </div>
  ),
}
