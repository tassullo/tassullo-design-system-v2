import type { Meta, StoryObj } from '@storybook/react-vite'

import { ScrollArea, ScrollBar } from '@/registry/tassullo/ui/scroll-area'
import { Separator } from '@/registry/tassullo/ui/separator'

/**
 * Un riquadro che scorre dentro la pagina, con la sua barra di scorrimento e
 * raggiungibile da tastiera.
 *
 * **Quando sì, quando no.** Serve ai riquadri: un elenco dentro un pannello,
 * il contenuto di un pannello ridimensionabile, il corpo lungo di un dialogo.
 * Non si usa per la pagina intera: lì la barra del browser è quella che tutti
 * sanno usare. Un elenco tanto lungo da chiedere una ricerca è un `combobox`
 * o un `command`, non un riquadro da scorrere.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/scroll-area
 * ```
 *
 * **Parti.** `ScrollArea` il riquadro, con l'altezza o la larghezza che lo
 * limita; `ScrollBar` con `orientation="horizontal"` per lo scorrimento in
 * orizzontale. Quella verticale c'è già.
 *
 * **Regole d'uso.** Il riquadro ha un limite esplicito — `h-64`, `h-full`
 * dentro un genitore alto — o non scorre mai. Una regione che scorre senza
 * controlli dentro si mette in una `ScrollArea` e non in un `div` con
 * `overflow-auto`, che da tastiera non si raggiunge.
 *
 * **Tastiera e accessibilità.** Quando il contenuto sborda, il riquadro
 * diventa un fermo di tabulazione con l'anello di fuoco, e le frecce lo
 * scorrono. La barra resta visibile, non solo al passaggio del mouse.
 */
const meta = {
  title: 'Primitive/ScrollArea',
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const norme = [
  'UNI EN 13707', 'UNI EN 13969', 'UNI EN 13859-1', 'UNI 11333',
  'UNI EN 1107-1', 'UNI EN 1109', 'UNI EN 1110', 'UNI EN 1928',
  'UNI EN 12311-1', 'UNI EN 12730', 'UNI EN 13501-1', 'UNI EN 1849-1',
  'UNI EN 1850-1', 'UNI EN 12691', 'UNI EN 13583', 'UNI 8178-1',
]

/**
 * Un elenco che scorre: `Tab` si ferma sul riquadro e le frecce lo scorrono.
 */
export const Predefinito: Story = {
  render: () => (
    <ScrollArea className="h-64 w-72 rounded-md border">
      <div className="p-3">
        <h4 className="mb-2 text-sm font-medium">Norme citate</h4>
        {norme.map((n) => (
          <div key={n}>
            <div className="py-1.5 font-mono text-xs">{n}</div>
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

/**
 * In orizzontale, con `ScrollBar orientation="horizontal"`.
 */
export const Orizzontale: Story = {
  render: () => (
    <ScrollArea className="w-96 rounded-md border">
      <div className="flex gap-3 p-3">
        {norme.slice(0, 8).map((n) => (
          <div
            key={n}
            className="flex size-28 shrink-0 items-center justify-center rounded-md bg-muted p-2 text-center font-mono text-xs"
          >
            {n}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}

/**
 * Un pannello con intestazione e piede fissi: scorre solo l'elenco in mezzo.
 */
export const DentroUnPannello: Story = {
  render: () => (
    <div className="flex w-72 flex-col rounded-md border">
      <div className="border-b px-3 py-2 text-sm font-medium">Riferimenti normativi</div>
      <ScrollArea className="h-56">
        <div className="px-3 py-2">
          {norme.map((n) => (
            <div key={n} className="py-1.5 font-mono text-xs">
              {n}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t px-3 py-2 text-xs text-muted-foreground tabular-nums">
        {norme.length} norme
      </div>
    </div>
  ),
}
