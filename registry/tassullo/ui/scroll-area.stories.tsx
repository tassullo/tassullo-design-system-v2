import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'

import { ScrollArea, ScrollBar } from '@/registry/tassullo/ui/scroll-area'
import { Separator } from '@/registry/tassullo/ui/separator'

/**
 * Un riquadro che scorre dentro la pagina, con la sua barra di scorrimento e
 * raggiungibile da tastiera.
 *
 * **Quando sì, quando no.** Serve ai riquadri: un elenco dentro un pannello,
 * il contenuto di un pannello ridimensionabile, il corpo lungo di un dialogo.
 * Non si usa per la pagina intera: lì scorre la finestra. Non serve nemmeno
 * per avere la barra sottile: il tema dà lo stesso aspetto a ogni barra di
 * scorrimento, in verticale e in orizzontale, anche a quella della pagina e
 * di un `div` con `overflow-auto`. Un elenco tanto lungo da chiedere una ricerca è un `combobox`
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
// che scorre da sé nelle due direzioni ha la barra larga 2.5 unità (10px, 15
// in densità touch), col colore del tema, anche dentro un sottoalbero scuro;
// e `ScrollArea` continua a nascondere la barra nativa.
function Riquadro({ id }: { id: string }) {
  return (
    <div data-prova={id} className="h-32 w-48 overflow-auto rounded-md border">
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
      <div data-density="touch">
        <Riquadro id="touch" />
      </div>
      <ScrollArea data-prova="componente" className="h-32 w-48 rounded-md border">
        <div className="h-64 p-3 text-sm">Il riquadro del componente.</div>
      </ScrollArea>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const riquadro = (id: string) => canvasElement.querySelector<HTMLElement>(`[data-prova="${id}"]`)!
    const spessori = (el: HTMLElement) => `${el.offsetWidth - el.clientWidth - 2}/${el.offsetHeight - el.clientHeight - 2}`
    const colore = (el: HTMLElement) => getComputedStyle(el).getPropertyValue('--scrollbar-thumb').trim()
    // Il Chromium delle prove nasconde ogni barra, e lo spessore lì è zero:
    // lo spessore vero si misura in WebKit.
    const nascoste = /Chrome/.test(navigator.userAgent)

    expect(spessori(riquadro('chiaro'))).toBe(nascoste ? '0/0' : '10/10')
    expect(spessori(riquadro('touch'))).toBe(nascoste ? '0/0' : '15/15')
    expect(colore(riquadro('chiaro'))).toContain('color-mix')
    expect(colore(riquadro('scuro'))).toContain('color-mix')
    expect(colore(riquadro('scuro'))).not.toBe(colore(riquadro('chiaro')))

    // Il componente: nessuna barra nativa, e il suo cursore ha un colore.
    const vista = riquadro('componente').querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!
    expect(vista.offsetWidth - vista.clientWidth).toBe(0)
    const cursore = await waitFor(() => {
      const el = riquadro('componente').querySelector<HTMLElement>('[data-slot="scroll-area-thumb"]')
      expect(el).toBeInTheDocument()
      return el as HTMLElement
    })
    expect(getComputedStyle(cursore).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  },
}
