/**
 * `tassullo-error-state` — l'«errore» dello standard unico di M3.5.
 *
 * `INTERFACCE.md` §1.1 di Anagrafe chiede, per l'errore: un messaggio del
 * server quando è in italiano e specifico, uno generico altrimenti; mai uno
 * stack trace, mai un codice HTTP nudo in UI; un 403 diventa sempre «Non hai
 * i permessi per questa azione», mai il messaggio grezzo del backend. Quella
 * traduzione resta dell'app, che sa cosa il server ha davvero risposto —
 * questo blocco dà solo la forma in cui il messaggio, già tradotto, si mostra.
 *
 * È **la stessa primitiva del vuoto**, non `alert`: lo dice già la story
 * `Errore` di `Primitive/Empty`, scritta apposta in M3.5 come traccia per
 * questo blocco. Un errore che sostituisce un'intera sezione — la tabella non
 * si è caricata, la scheda non si è aperta — è uno **stato della pagina**,
 * non una riga di testo accanto al contenuto: la stessa composizione del
 * vuoto, tinta di `destructive-subtle`.
 */
import type { ReactNode } from "react"
import { OctagonXIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/registry/tassullo/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/tassullo/ui/empty"

export type ErrorStateProps = {
  /** L'icona nel cerchio in testa. `OctagonXIcon` di default. */
  icona?: ReactNode
  titolo?: ReactNode
  /** Il messaggio già tradotto per chi legge: mai un codice, mai uno stack. */
  messaggio: ReactNode
  /** La CTA per riprovare, quando l'errore è transitorio. */
  onRiprova?: () => void
  etichettaRiprova?: string
  className?: string
}

export function ErrorState({
  icona = <OctagonXIcon />,
  titolo = "Qualcosa non ha funzionato",
  messaggio,
  onRiprova,
  etichettaRiprova = "Riprova",
  className,
}: ErrorStateProps) {
  return (
    <Empty
      data-slot="error-state"
      className={cn(
        "border border-destructive-border bg-destructive-subtle text-destructive-subtle-foreground",
        className
      )}
    >
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-destructive-subtle-foreground/10"
        >
          {icona}
        </EmptyMedia>
        <EmptyTitle>{titolo}</EmptyTitle>
        <EmptyDescription className="text-destructive-subtle-foreground">
          {messaggio}
        </EmptyDescription>
      </EmptyHeader>
      {onRiprova ? (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onRiprova}>
            {etichettaRiprova}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
