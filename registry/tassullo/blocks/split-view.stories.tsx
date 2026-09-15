import type { Meta, StoryObj } from '@storybook/react-vite'

import { SplitView } from '@/registry/tassullo/blocks/split-view'

/**
 * Due colonne affiancate — la base di `diff-view` (M3.9), ma riusabile da
 * sola ovunque serva un confronto: le traduzioni IT/EN (`affiancato` ×3
 * nella roadmap di Anagrafe), una scheda accanto alle sue note interne.
 *
 * Sotto 448px di **contenitore** — non di schermo, misurato con un
 * `ResizeObserver` come la fascia di `page-header` — le due colonne si
 * impilano. `sincronizzato` lega lo scorrimento delle due colonne per
 * frazione percorsa, non per pixel: utile quando le due lunghezze
 * differiscono, come in un confronto di revisioni.
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

/** Trascinabile dalla maniglia, come `resizable`; a tastiera la maniglia risponde alle frecce. */
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

/** Le due colonne scorrono insieme, per frazione percorsa — non allo stesso pixel, perché non hanno la stessa lunghezza. */
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

/** Sotto 448px di contenitore le colonne si impilano — l'accettazione di M3.9, provata qui a 375px. */
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
