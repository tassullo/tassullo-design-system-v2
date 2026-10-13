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
import type { ReactNode } from "react"

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
   * stanno su una riga; se non ci stanno si impilano, larghi uguali.
   */
  azione?: ReactNode
  className?: string
}

export function EmptyState({
  icona,
  titolo,
  descrizione,
  azione,
  className,
}: EmptyStateProps) {
  return (
    <Empty data-slot="empty-state" className={cn("border", className)}>
      <EmptyHeader>
        {icona ? <EmptyMedia variant="icon">{icona}</EmptyMedia> : null}
        <EmptyTitle>{titolo}</EmptyTitle>
        {descrizione ? (
          <EmptyDescription>{descrizione}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {/* Le azioni su una riga, larga quanto i bottoni: nel contenitore di
          serie, stretto 384px, tre bottoni andavano a capo uno e due. Se non
          ci stanno vanno a capo, e allora la riga è larga quanto lo spazio e
          ogni bottone la riempie: impilati sono larghi uguali. */}
      {azione ? (
        <EmptyContent className="w-fit max-w-full flex-row flex-wrap justify-center *:grow">{azione}</EmptyContent>
      ) : null}
    </Empty>
  )
}
