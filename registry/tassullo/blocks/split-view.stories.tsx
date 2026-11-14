import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'

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
 * - L'altezza di serie è 384px, che basta dentro una scheda o un dialogo
 *   piccolo. In un dialogo grande o in una pagina a tutta altezza la vista
 *   prende lo spazio che c'è: `className="h-auto min-h-64 flex-1"` dentro una
 *   colonna flessibile, `className="h-full"` in un contenitore con
 *   un'altezza sua. Il minimo tiene leggibili le due colonne quando la
 *   finestra è bassa.
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

const voci = Array.from({ length: 40 }, (_, i) => `Sistema ${String(i + 1).padStart(2, '0')} — intonaco deumidificante su muratura mista`)

function PaginaATuttaAltezza() {
  return (
    <div className="flex h-160 flex-col gap-3 rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Scegli un sistema</h2>
      <SplitView
        className="h-auto min-h-64 flex-1"
        etichettaSinistra="Sistemi"
        etichettaDestra="Anteprima"
        sinistra={
          <ul className="flex flex-col gap-2 text-sm">
            {voci.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        }
        destra={<p className="text-sm">Sistema 01: ciclo in tre strati, spessore complessivo 25 mm.</p>}
      />
    </div>
  )
}

/**
 * Elenco a sinistra e anteprima a destra in una pagina a tutta altezza: la
 * vista prende lo spazio sotto il titolo invece di fermarsi a 384px, e
 * l'elenco scorre dentro la sua colonna.
 */
export const ATuttaAltezza: Story = {
  name: 'A tutta altezza',
  args: { sinistra: null, destra: null },
  render: () => <PaginaATuttaAltezza />,
}

// La vista riempie il riquadro fino al fondo, oltre i 384px di serie, e la
// colonna dell'elenco scorre.
export const ATuttaAltezzaProva: Story = {
  name: 'A tutta altezza, prova',
  tags: ['!dev', '!autodocs'],
  args: { sinistra: null, destra: null },
  render: () => <PaginaATuttaAltezza />,
  play: async ({ canvasElement }) => {
    const vista = canvasElement.querySelector<HTMLElement>('[data-slot="split-view"]')!
    const riquadro = vista.parentElement!
    await waitFor(() => {
      const fondoVista = vista.getBoundingClientRect().bottom
      const fondoRiquadro = riquadro.getBoundingClientRect().bottom - parseFloat(getComputedStyle(riquadro).paddingBottom) - parseFloat(getComputedStyle(riquadro).borderBottomWidth)
      expect(Math.abs(fondoRiquadro - fondoVista)).toBeLessThan(1)
    })
    expect(vista.getBoundingClientRect().height).toBeGreaterThan(384)
    const elenco = within(canvasElement).getByRole('region', { name: 'Sistemi' })
    expect(elenco.scrollHeight).toBeGreaterThan(elenco.clientHeight)
    expect(elenco.getBoundingClientRect().height).toBeGreaterThan(384)
  },
}
