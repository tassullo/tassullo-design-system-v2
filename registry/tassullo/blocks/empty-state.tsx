/**
 * `tassullo-empty-state` — il «vuoto» dello standard unico di M3.5.
 *
 * `INTERFACCE.md` §1.1 di Anagrafe chiede, per il vuoto: «card guidata con una
 * frase e, quando c'è un'azione sensata, la CTA per uscirne. Mai una tabella
 * con la sola intestazione.» La primitiva `empty` (M3.5, appoggiata su
 * `Empty`/`EmptyHeader`/`EmptyMedia`/`EmptyTitle`/`EmptyDescription`/
 * `EmptyContent`) dà la forma nuda; questo blocco fissa la composizione che si
 * userebbe altrimenti riscritta uguale in ogni pagina — icona, titolo,
 * descrizione, azione — con **un** default che la primitiva lascia aperto:
 * il bordo tratteggiato è acceso, perché è la forma che ogni punto d'uso
 * finora ha scelto a mano (vedi `Primitive/Empty`, story `ConBordo`).
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { flushSync } from "react-dom"

import { cn } from "cn"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/tassullo/ui/empty"

export type EmptyStateProps = {
  /** L'icona nel cerchio in testa. Assente, lo stato resta senza icona. */
  icona?: ReactNode
  /** La frase, non un titolo tecnico: «Nessuna scheda in questa cartella». */
  titolo: ReactNode
  /** Cosa aspettarsi, o come cercare altrove. */
  descrizione?: ReactNode
  /**
   * La CTA per uscire dal vuoto, quando ce n'è una sensata. Se le strade sono
   * più d'una si passano più bottoni di fila, il principale per primo:
   * stanno su una riga; se non ci stanno tutte si impilano tutte, larghi
   * uguali.
   */
  azione?: ReactNode
  className?: string
}

// La larghezza che un'azione chiede: il suo contenuto, più i margini interni e
// il bordo. Si legge dal contenuto e non dal riquadro, che impilato è stirato.
function larghezzaNaturale(elemento: HTMLElement) {
  const intervallo = document.createRange()
  intervallo.selectNodeContents(elemento)
  const stile = getComputedStyle(elemento)
  const bordi = ["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"] as const
  return intervallo.getBoundingClientRect().width + bordi.reduce((n, lato) => n + (parseFloat(stile[lato]) || 0), 0)
}

// Le azioni stanno su una riga se ci stanno tutte; sennò si impilano tutte,
// non una parte. La misura si rifà quando cambia la larghezza dello stato vuoto
// o cambiano le azioni. Si osserva un riferimento alto zero e largo quanto lo
// stato vuoto: impilando cambia l'altezza, e un osservatore sullo stato vuoto
// si rivedrebbe cambiare nello stesso fotogramma.
function useImpilate(azione: ReactNode) {
  const contenuto = useRef<HTMLDivElement>(null)
  const metro = useRef<HTMLDivElement>(null)
  const [impilate, setImpilate] = useState(false)
  useLayoutEffect(() => {
    const riga = contenuto.current
    const vuoto = metro.current?.parentElement
    if (!riga || !metro.current || !vuoto || typeof ResizeObserver === "undefined") return
    const misura = () => {
      const figli = [...riga.children].filter((figlio): figlio is HTMLElement => figlio instanceof HTMLElement)
      const spazio = parseFloat(getComputedStyle(riga).columnGap) || 0
      const chiesta = figli.reduce((n, figlio) => n + larghezzaNaturale(figlio), 0) + spazio * Math.max(0, figli.length - 1)
      const stile = getComputedStyle(vuoto)
      const posto = vuoto.clientWidth - (parseFloat(stile.paddingLeft) || 0) - (parseFloat(stile.paddingRight) || 0)
      // Prima che la pagina si disegni: niente fotogramma con le azioni a metà.
      flushSync(() => setImpilate(chiesta > posto + 0.5))
    }
    const osservatore = new ResizeObserver(misura)
    osservatore.observe(metro.current)
    return () => osservatore.disconnect()
  }, [azione])
  return { contenuto, metro, impilate }
}

export function EmptyState({
  icona,
  titolo,
  descrizione,
  azione,
  className,
}: EmptyStateProps) {
  const { contenuto, metro, impilate } = useImpilate(azione)
  return (
    <Empty data-slot="empty-state" className={cn("relative border", className)}>
      {azione ? <div ref={metro} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-0" /> : null}
      <EmptyHeader>
        {icona ? <EmptyMedia variant="icon">{icona}</EmptyMedia> : null}
        <EmptyTitle>{titolo}</EmptyTitle>
        {descrizione ? (
          <EmptyDescription>{descrizione}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {/* Le azioni su una riga, larga quanto i bottoni: nel contenitore di
          serie, stretto 384px, tre bottoni andavano a capo uno e due. Se non
          ci stanno tutte si impilano tutte, larghe quanto la più larga. */}
      {azione ? (
        <EmptyContent
          ref={contenuto}
          data-impilate={impilate ? "" : undefined}
          className={cn("w-fit max-w-full", impilate ? "items-stretch" : "flex-row justify-center")}
        >
          {azione}
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
