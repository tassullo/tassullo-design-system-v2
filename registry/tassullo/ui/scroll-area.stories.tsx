import type { Meta, StoryObj } from '@storybook/react-vite'

import { ScrollArea, ScrollBar } from '@/registry/tassullo/ui/scroll-area'
import { Separator } from '@/registry/tassullo/ui/separator'

/**
 * **`scroll-area` è la risposta pronta al rilievo lasciato aperto da M2.3.**
 * Lì, sull'elenco lungo dentro lo `sheet`, axe aveva alzato
 * `scrollable-region-focusable`: una regione che scorre e non contiene
 * controlli va **raggiungibile dal fuoco**, o da tastiera non la si scorre —
 * il contenuto esiste e non c'è modo di arrivarci. In M2.3 si era chiusa a
 * mano mettendo `tabIndex` sul contenitore; da qui in poi la risposta di
 * sistema è questa primitiva, che il `Viewport` di Base UI rende focalizzabile
 * da sé e che porta già l'anello di fuoco (`focus-visible:ring-ring/50`).
 *
 * `scroll-area.tsx` è identico all'originale: nessuna stringa ri-stilata. Un
 * valore arbitrario ereditato, `ring-[3px]` sul fuoco del viewport, che è di
 * shadcn e non nostro.
 *
 * **Quando non usarla.** Non per la pagina intera — la barra di scorrimento
 * del browser è quella che tutti sanno usare, e sostituirla è un dispetto. La
 * `scroll-area` serve ai riquadri: un elenco dentro un pannello, una colonna
 * di norme, il corpo di un dialogo. E la barra è visibile: non è una di quelle
 * che compaiono solo al passaggio del mouse, che da touch non si vedono mai.
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
 * L'elenco che scorre. **Provalo da tastiera**: `Tab` si ferma sul riquadro
 * — è il fermo che in M2.3 mancava — e le frecce lo scorrono.
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

/** In orizzontale: serve la `ScrollBar` esplicita con `orientation`. */
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
 * Il caso di M2.3 rifatto per bene: un elenco lungo dentro un riquadro con
 * intestazione fissa. L'intestazione resta ferma, scorre solo l'elenco.
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
