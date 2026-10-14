/**
 * `tassullo-barra-salva` — «Salva» e «Annulla» di un modulo sempre
 * modificabile, in una barra ferma in fondo alla finestra. Proposta #125
 * (Anagrafe), 14 ottobre 2026: in fondo alla pagina i due bottoni non si
 * vedevano finché non si scorreva fin lì, e chi lavora in cima alla scheda
 * poteva dimenticare di salvare. Scelta da Francesco fra tre posizioni rese
 * (in fondo alla pagina, barra ferma, nella fascia); la fascia è scartata
 * anche perché in alto a destra stanno le azioni della pagina. Approvata come
 * blocco per tutte le schede che si modificano.
 *
 * ── La scala ─────────────────────────────────────────────────────────────
 *
 * shadcn non ha una barra di salvataggio: i suoi moduli mettono il bottone in
 * fondo al modulo. È una composizione di `Button` e `Spinner`, e la parte che
 * conta è dove sta e quando c'è.
 *
 * ── Le misure ────────────────────────────────────────────────────────────
 *
 * `-mx-4 -mb-4` la allargano sul margine dell'area del contenuto del guscio
 * (`p-4`, che segue la densità): mentre si scorre tocca il fondo della
 * finestra, e a fine pagina non si posa sopra il margine, che la farebbe
 * sembrare più alta. È la stessa ricetta delle tab ferme (`-mx-4 px-4`).
 * `scroll-pb-16` sulla radice del documento, finché la barra c'è: è alta 14
 * unità più il bordo, e un campo raggiunto col `Tab` non le finisce sotto.
 */
import * as React from "react"
import { cn } from "cn"

import { Button } from "@/registry/tassullo/ui/button"
import { Spinner } from "@/registry/tassullo/ui/spinner"

export type BarraSalvaProps = {
  /** Il modulo ha modifiche non salvate: la barra c'è. */
  sporco: boolean
  /** Il salvataggio è in corso: la barra resta, coi bottoni spenti. */
  inCorso?: boolean
  /** Scarta le modifiche e torna a ciò che è salvato. */
  onAnnulla: () => void
  /**
   * Il salvataggio, quando la barra non sta dentro il modulo. Senza, «Salva»
   * è il bottone d'invio del modulo che la contiene.
   */
  onSalva?: () => void
  /** La frase a sinistra dei bottoni. */
  testo?: React.ReactNode
  className?: string
}

/**
 * «Salva» e «Annulla» in una barra ferma in fondo alla finestra. Compare alla
 * prima modifica e sparisce dopo il salvataggio, o se si torna com'era.
 */
export function BarraSalva({
  sporco,
  inCorso = false,
  onAnnulla,
  onSalva,
  testo = "Modifiche non salvate",
  className,
}: BarraSalvaProps) {
  if (!sporco && !inCorso) return null
  return (
    <div
      data-slot="barra-salva"
      className={cn(
        "sticky bottom-0 z-10 -mx-4 -mb-4 flex flex-wrap items-center justify-end gap-x-3 gap-y-2 border-t border-border bg-background px-4 py-3 [html:has(&)]:scroll-pb-16",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">{testo}</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" disabled={inCorso} onClick={onAnnulla}>
          Annulla
        </Button>
        <Button type={onSalva ? "button" : "submit"} disabled={inCorso} onClick={onSalva}>
          {inCorso ? <Spinner data-icon="inline-start" /> : null}
          Salva
        </Button>
      </div>
    </div>
  )
}
