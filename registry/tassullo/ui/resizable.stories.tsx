import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/registry/tassullo/ui/resizable'
import { ScrollArea } from '@/registry/tassullo/ui/scroll-area'

/**
 * Due o più pannelli affiancati, con un divisorio che si trascina per dare
 * più spazio all'uno o all'altro.
 *
 * **Quando sì, quando no.** Serve quando chi lavora deve decidere lui quanto
 * spazio dare a ciascuna parte: due testi da confrontare, un elenco accanto
 * al dettaglio. Per il confronto fra due versioni di un testo c'è già il
 * blocco `split-view`, costruito sopra. Se le proporzioni sono fisse, basta
 * una griglia. Il componente usa `react-resizable-panels`, non Base UI.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/resizable
 * ```
 *
 * **Parti e opzioni.** `ResizablePanelGroup` con `orientation`
 * (`horizontal` o `vertical`); `ResizablePanel` con `defaultSize` e
 * `minSize`, in percentuale; `ResizableHandle` fra un pannello e l'altro, con
 * `withHandle` per il grip visibile.
 *
 * **Regole d'uso.**
 *
 * - L'altezza si dà a un contenitore, e il gruppo va dentro in `h-full`. Una
 *   classe d'altezza sul gruppo stesso non ha effetto, perché la libreria gli
 *   scrive `height: 100%` in linea; senza un'altezza sopra, il gruppo prende
 *   quella del contenuto, e una `ScrollArea` in `h-full` collassa a zero.
 * - Un pannello che si può stringere è un pannello che scorre: il contenuto
 *   va dentro una `ScrollArea`, così la regione che scorre si raggiunge anche
 *   da tastiera.
 * - Si mette `withHandle`: un filo che si può trascinare, e non lo dice, non
 *   lo trascina nessuno. La zona che si afferra è comunque più larga del filo.
 * - `minSize` su ogni pannello, perché trascinando fino in fondo non se ne
 *   perda uno.
 *
 * **Tastiera e accessibilità.** Il divisorio è un fermo di tabulazione: le
 * frecce lo spostano, `Home` e `Fine` lo portano agli estremi.
 */
const meta = {
  title: 'Primitive/Resizable',
  component: ResizablePanelGroup,
} satisfies Meta<typeof ResizablePanelGroup>

export default meta
type Story = StoryObj<typeof meta>

function Riquadro({ titolo, testo }: { titolo: string; testo: string }) {
  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <h4 className="text-sm font-medium">{titolo}</h4>
      <p className="text-sm text-muted-foreground">{testo}</p>
    </div>
  )
}

/**
 * Due revisioni di una scheda affiancate, con il grip sul divisorio.
 */
export const Predefinito: Story = {
  render: () => (
    <div className="h-64 w-full max-w-2xl">
      <ResizablePanelGroup orientation="horizontal" className="h-full rounded-md border">
        <ResizablePanel defaultSize={50}>
          <Riquadro
            titolo="Revisione 3"
            testo="Membrana armata in poliestere, spessore 4 mm. Sovrapposizione 80 mm."
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Riquadro
            titolo="Revisione 4"
            testo="Membrana armata in poliestere, spessore 4 mm. Sovrapposizione 100 mm."
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

/**
 * In verticale e senza grip: il divisorio è solo un filo, e non dice di
 * potersi trascinare. Il contenuto di ogni pannello sta in una `ScrollArea`.
 */
export const Verticale: Story = {
  render: () => (
    <div className="h-72 w-full max-w-lg">
      <ResizablePanelGroup orientation="vertical" className="h-full rounded-md border">
        <ResizablePanel defaultSize={40}>
          <ScrollArea className="h-full">
            <Riquadro titolo="Anteprima" testo="Prima pagina della scheda tecnica." />
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>
          <ScrollArea className="h-full">
            <Riquadro
              titolo="Note interne"
              testo="Non pubblicate in officina. Il pannello si può stringere fino a
                far sbordare il testo: il contenuto sta dentro una ScrollArea, quindi
                la regione che scorre resta raggiungibile dal Tab."
            />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

/**
 * Tre pannelli con `minSize`: nessuno si può schiacciare fino a sparire.
 */
export const TrePannelli: Story = {
  render: () => (
    <div className="h-64 w-full max-w-3xl">
      <ResizablePanelGroup orientation="horizontal" className="h-full rounded-md border">
        <ResizablePanel defaultSize={25} minSize={15}>
          <Riquadro titolo="Elenco" testo="128 schede" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={15}>
          <Riquadro titolo="Scheda" testo="Guaina bituminosa TS-40" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={15}>
          <Riquadro titolo="Storico" testo="4 revisioni" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}
