/**
 * `tassullo-split-view` — due colonne affiancate, con lo scorrimento che si
 * può tenere sincronizzato; sotto una certa larghezza **si impilano**.
 *
 * Chiesto all'MCP prima di scrivere (regola 4bis, gradino 1): shadcn non ha
 * un blocco così — solo la primitiva `resizable`, aggiunta apposta in M2.4
 * come base di questo blocco (commento di testa di `resizable.stories.tsx`).
 * Compone `resizable`: nessuna primitiva mancante, resta un blocco (gradino
 * 2/3), non un componente proprio — non entra in `componenti-propri.json`,
 * come gli altri blocchi di FASE 3.
 *
 * **La soglia guarda il contenitore, non lo schermo.** Stessa regola di
 * `page-header` (`docs/DECISIONI.md` §31): un `ResizeObserver` sul
 * contenitore misura la larghezza vera e passa a colonne impilate sotto
 * `SOGLIA_AFFIANCATO` — non una media query sulla viewport, perché questo
 * blocco vive dentro un layout (una colonna del guscio, una scheda), e la
 * larghezza dello schermo e quella del contenitore non sono la stessa cosa.
 * A 375px di contenitore — l'accettazione di M3.9 — il contenitore è già
 * sotto soglia: due colonne impilate, non affiancate a forza.
 *
 * **La colonna che scorre è la nostra, non quella di `ResizablePanel`.**
 * `Panel` (`react-resizable-panels`) rende **due** `<div>`: uno esterno, a
 * cui vanno `elementRef` e ogni altra prop passata — `overflow: visible`,
 * non scorre mai — e uno interno, generato dalla libreria, con
 * `overflow: auto` — è quello che scorre davvero, e non è raggiungibile
 * dall'esterno. Mettere `tabIndex`/`onScroll`/`elementRef` sul `Panel`
 * (primo tentativo di questa sessione) li posa sul div sbagliato: axe
 * continua a vedere una regione scorribile senza fuoco da tastiera
 * (`scrollable-region-focusable`, preso da `npm run test:a11y`, non
 * dichiarato). Il rimedio è lo stesso principio di `resizable.stories.tsx`
 * con `ScrollArea`: **non** fidarsi dello scorrimento automatico del
 * pannello, mettere dentro un elemento scorribile **nostro**
 * (`h-full overflow-auto`, `tabIndex={0}`, `role="region"`), a cui la
 * sincronia si aggancia col proprio `ref`. Il div automatico del pannello
 * resta, ma non scorre più lui: il nostro riempie esattamente lo spazio.
 *
 * **La sincronia è per rapporto, non per pixel.** Due colonne di lunghezza
 * diversa (un "prima" più corto di un "dopo") non hanno lo stesso
 * `scrollHeight`: sincronizzare `scrollTop` uguale le farebbe scorrere a
 * velocità diverse e disallineare a metà. Si sincronizza la **frazione**
 * scorsa (`scrollTop / (scrollHeight - clientHeight)`), applicata alla
 * stessa frazione sull'altra colonna — un flag (`sincroniaInCorso`) evita
 * il ping-pong fra i due handler `onScroll`.
 */
import { useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "cn"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/tassullo/ui/resizable"

const SOGLIA_AFFIANCATO = 448

function sincronizza(sorgente: HTMLElement | null, destinazione: HTMLElement | null) {
  if (!sorgente || !destinazione) return
  const scorribileSorgente = sorgente.scrollHeight - sorgente.clientHeight
  const rapporto = scorribileSorgente > 0 ? sorgente.scrollTop / scorribileSorgente : 0
  const scorribileDestinazione = destinazione.scrollHeight - destinazione.clientHeight
  destinazione.scrollTop = rapporto * Math.max(0, scorribileDestinazione)
}

type ColonnaProps = {
  contenuto: ReactNode
  etichetta?: string
  scrollRef: React.RefObject<HTMLDivElement | null>
  onScroll: () => void
}

function Colonna({ contenuto, etichetta, scrollRef, onScroll }: ColonnaProps) {
  return (
    <div
      ref={scrollRef}
      role="region"
      aria-label={etichetta}
      tabIndex={0}
      onScroll={onScroll}
      className="h-full overflow-auto"
    >
      {etichetta ? (
        <div className="sticky top-0 border-b bg-muted/80 px-3 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm">
          {etichetta}
        </div>
      ) : null}
      <div className="p-3">{contenuto}</div>
    </div>
  )
}

export type SplitViewProps = {
  sinistra: ReactNode
  destra: ReactNode
  /** Titolo della colonna, letto anche dai lettori di schermo come nome della regione che scorre. */
  etichettaSinistra?: string
  etichettaDestra?: string
  /** Lo scorrimento di una colonna trascina l'altra, per frazione percorsa. */
  sincronizzato?: boolean
  className?: string
}

export function SplitView({
  sinistra,
  destra,
  etichettaSinistra,
  etichettaDestra,
  sincronizzato,
  className,
}: SplitViewProps) {
  const contenitoreRef = useRef<HTMLDivElement>(null)
  const [affiancato, setAffiancato] = useState(true)
  const sinistraRef = useRef<HTMLDivElement>(null)
  const destraRef = useRef<HTMLDivElement>(null)
  const sincroniaInCorso = useRef(false)

  useEffect(() => {
    const el = contenitoreRef.current
    if (!el) return
    const osservatore = new ResizeObserver(([voce]) => {
      const larghezza = voce?.contentRect.width
      if (larghezza) setAffiancato(larghezza >= SOGLIA_AFFIANCATO)
    })
    osservatore.observe(el)
    return () => osservatore.disconnect()
  }, [])

  function alSincronizza(sorgente: HTMLElement | null, destinazione: HTMLElement | null) {
    if (!sincronizzato || sincroniaInCorso.current) return
    sincroniaInCorso.current = true
    sincronizza(sorgente, destinazione)
    requestAnimationFrame(() => {
      sincroniaInCorso.current = false
    })
  }

  return (
    <div ref={contenitoreRef} data-slot="split-view" className={cn("h-96", className)}>
      {affiancato ? (
        <ResizablePanelGroup orientation="horizontal" className="h-full rounded-md border">
          <ResizablePanel defaultSize={50}>
            <Colonna
              contenuto={sinistra}
              etichetta={etichettaSinistra}
              scrollRef={sinistraRef}
              onScroll={() => alSincronizza(sinistraRef.current, destraRef.current)}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <Colonna
              contenuto={destra}
              etichetta={etichettaDestra}
              scrollRef={destraRef}
              onScroll={() => alSincronizza(destraRef.current, sinistraRef.current)}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex h-full flex-col gap-3">
          <div className="flex-1 overflow-hidden rounded-md border">
            <Colonna
              contenuto={sinistra}
              etichetta={etichettaSinistra}
              scrollRef={sinistraRef}
              onScroll={() => alSincronizza(sinistraRef.current, destraRef.current)}
            />
          </div>
          <div className="flex-1 overflow-hidden rounded-md border">
            <Colonna
              contenuto={destra}
              etichetta={etichettaDestra}
              scrollRef={destraRef}
              onScroll={() => alSincronizza(destraRef.current, sinistraRef.current)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
