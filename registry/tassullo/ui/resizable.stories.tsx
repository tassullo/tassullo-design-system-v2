import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/registry/tassullo/ui/resizable'
import { ScrollArea } from '@/registry/tassullo/ui/scroll-area'

/**
 * `resizable.tsx` è identico all'originale: nessuna stringa ri-stilata. **È la
 * base dello `split-view` di M3.9**, dove servirà a mettere due testi di scheda
 * tecnica uno accanto all'altro.
 *
 * Non è Base UI: sotto c'è `react-resizable-panels`, ed è l'unica dipendenza
 * nuova di questo task insieme a `embla-carousel-react` del carosello. Non è
 * un'eccezione a D9 — D9 riguarda le primitive, e qui shadcn non offre una
 * versione Base UI: è la sua scelta a monte, ereditata, non una nostra.
 *
 * **Da tastiera funziona, ed è la cosa da provare.** La maniglia è un
 * `separator` con `tabindex`: `Tab` ci si ferma, le **frecce** spostano il
 * divisorio, `Home`/`Fine` lo portano agli estremi. Senza questo un pannello
 * ridimensionabile è utilizzabile solo col mouse — che per uno `split-view` di
 * confronto testi sarebbe grave.
 *
 * **Un pannello che si stringe è una regione che scorre**, e axe lo coglie: i
 * pannelli di `react-resizable-panels` portano `overflow: auto`, quindi appena
 * il contenuto sborda diventano una regione da scorrere — e senza un fermo di
 * tabulazione dentro, da tastiera non ci si arriva
 * (`scrollable-region-focusable`, misurato qui su `Verticale`). La risposta è
 * la `scroll-area` di questo stesso task, messa **dentro** il pannello: la
 * story `Verticale` la usa, ed è il modo in cui lo `split-view` di M3.9 dovrà
 * comporli.
 *
 * La maniglia è un filo di 1px, ma la **zona sensibile è più larga** dello
 * spessore che si vede (lo pseudo-elemento `after:`): si afferra senza doverla
 * centrare al pixel. `withHandle` aggiunge il grip visibile, e conviene
 * metterlo: un filo che si può trascinare, e non lo dice, non lo trascina
 * nessuno.
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

export const Predefinito: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-64 w-full max-w-2xl rounded-md border"
    >
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
  ),
}

/** In verticale, e senza grip: si vede quanto sia meno invitante da afferrare. */
export const Verticale: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="vertical"
      className="h-72 w-full max-w-lg rounded-md border"
    >
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
  ),
}

/**
 * Tre pannelli con minimi: nessuno può essere schiacciato sotto il 15%, così
 * non si perde un pannello per sbaglio trascinando fino in fondo.
 */
export const TrePannelli: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-64 w-full max-w-3xl rounded-md border"
    >
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
  ),
}
