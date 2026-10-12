import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'

import { ScrollArea, ScrollBar } from '@/registry/tassullo/ui/scroll-area'
import { Separator } from '@/registry/tassullo/ui/separator'

/**
 * Un riquadro che scorre dentro la pagina, con la sua barra di scorrimento e
 * raggiungibile da tastiera.
 *
 * **Quando sì, quando no.** Serve ai riquadri: un elenco dentro un pannello,
 * il contenuto di un pannello ridimensionabile, il corpo lungo di un dialogo.
 * Non si usa per la pagina intera: lì scorre la finestra. Non serve nemmeno
 * per avere la barra sottile: il tema dà a ogni barra di scorrimento, in
 * verticale e in orizzontale, la forma sottile e il colore del tema, anche a
 * quella della pagina e di un `div` con `overflow-auto`. Un elenco tanto lungo da chiedere una ricerca è un `combobox`
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
 * scorrono. La barra compare mentre si scorre o col puntatore sul riquadro.
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
            <div className="py-1.5 text-sm text-muted-foreground">{n}</div>
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
            className="flex size-28 shrink-0 items-center justify-center rounded-md bg-muted p-2 text-center text-sm text-muted-foreground"
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
            <div key={n} className="py-1.5 text-sm text-muted-foreground">
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

// La barra predefinita del tema, accanto a quella di `ScrollArea`: un `div`
// che scorre da sé ha la barra sottile col colore del tema, anche dentro un
// sottoalbero scuro; una utility che la nasconde continua a vincere; e
// `ScrollArea` nasconde la barra nativa e mostra la sua solo al passaggio.
function Riquadro({ id, className }: { id: string; className?: string }) {
  return (
    <div data-prova={id} className={`h-32 w-48 overflow-auto rounded-md border ${className ?? ''}`}>
      <div className="h-64 w-96 p-3">
        <button type="button" className="text-sm underline">
          Un controllo dentro
        </button>
      </div>
    </div>
  )
}

export const BarraPredefinitaProva: Story = {
  name: 'Barra predefinita, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div className="light rounded-md bg-background p-2 text-foreground">
        <Riquadro id="chiaro" />
      </div>
      <div className="dark rounded-md bg-background p-2 text-foreground">
        <Riquadro id="scuro" />
      </div>
      <Riquadro id="nascosta" className="no-scrollbar" />
      <ScrollArea data-prova="componente" className="h-32 w-48 rounded-md border">
        <div className="h-64 p-3 text-sm">Il riquadro del componente.</div>
      </ScrollArea>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const riquadro = (id: string) => canvasElement.querySelector<HTMLElement>(`[data-prova="${id}"]`)!
    const stile = (id: string) => getComputedStyle(riquadro(id))

    expect(stile('chiaro').scrollbarWidth).toBe('thin')
    expect(stile('scuro').scrollbarWidth).toBe('thin')
    // Il colore del cursore è quello del tema, e nel sottoalbero scuro cambia.
    expect(stile('chiaro').scrollbarColor).not.toBe('auto')
    expect(stile('scuro').scrollbarColor).not.toBe(stile('chiaro').scrollbarColor)
    expect(stile('chiaro').getPropertyValue('--scrollbar-thumb')).toContain('color-mix')
    // Una utility che nasconde la barra vince sulla regola del tema.
    expect(stile('nascosta').scrollbarWidth).toBe('none')

    // Il componente: nessuna barra nativa, e la sua compare al passaggio.
    const vista = riquadro('componente').querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!
    expect(getComputedStyle(vista).scrollbarWidth).toBe('none')
    const barra = await waitFor(() => {
      const el = riquadro('componente').querySelector<HTMLElement>('[data-slot="scroll-area-scrollbar"]')
      expect(el).toBeInTheDocument()
      return el as HTMLElement
    })
    const cursore = barra.querySelector<HTMLElement>('[data-slot="scroll-area-thumb"]')!
    expect(getComputedStyle(cursore).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(barra).opacity).toBe('0')
    await userEvent.hover(vista)
    await waitFor(() => expect(getComputedStyle(barra).opacity).toBe('1'))
    await userEvent.unhover(vista)
    await waitFor(() => expect(getComputedStyle(barra).opacity).toBe('0'))
  },
}
