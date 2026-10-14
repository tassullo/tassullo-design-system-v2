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
 * ── Fissa, non `sticky` ──────────────────────────────────────────────────
 *
 * La prima forma era `sticky bottom-0`: su una pagina più corta della
 * finestra la barra si posava subito sotto il contenuto, a metà schermo
 * (trovato fotografando `Pagine/Scheda`). Un elemento `sticky` non scende
 * mai sotto il suo posto. Ora la barra è `fixed` in fondo alla finestra, e
 * nella pagina resta al suo posto uno spazio alto quanto lei: a fine pagina
 * il contenuto finisce sopra la barra, non sotto.
 *
 * La larghezza la prende dallo spazio: stessi bordi dell'area del contenuto
 * del guscio, allargati del suo margine (`p-4`, che segue la densità), come
 * le tab ferme (`-mx-4 px-4`). Così non copre la barra laterale, né la
 * colonna laterale quando è aperta. Lo spazio si rimisura quando cambia
 * larghezza (barra laterale chiusa o aperta, colonna laterale) e quando la
 * finestra cambia misura.
 *
 * `scroll-pb-16` sulla radice del documento, finché la barra c'è: è alta 14
 * unità più il bordo, e un campo raggiunto col `Tab` non le finisce sotto.
 */
import * as React from "react"
import { flushSync } from "react-dom"
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
  const visibile = sporco || inCorso
  const posto = React.useRef<HTMLDivElement>(null)
  const [riquadro, setRiquadro] = React.useState<{ sinistra: number; larghezza: number } | null>(null)
  React.useLayoutEffect(() => {
    const el = posto.current
    if (!el || typeof ResizeObserver === "undefined") return
    const leggi = () => {
      const r = el.getBoundingClientRect()
      // Prima che la pagina si disegni: niente fotogramma con la barra fuori posto.
      flushSync(() =>
        setRiquadro((prima) =>
          prima?.sinistra === r.left && prima.larghezza === r.width ? prima : { sinistra: r.left, larghezza: r.width }
        )
      )
    }
    const osservatore = new ResizeObserver(leggi)
    osservatore.observe(el)
    window.addEventListener("resize", leggi)
    return () => {
      osservatore.disconnect()
      window.removeEventListener("resize", leggi)
    }
  }, [visibile])

  if (!visibile) return null
  return (
    <>
      {/* Il posto della barra nella pagina: a fine pagina il contenuto finisce sopra di lei. */}
      <div ref={posto} data-slot="barra-salva-posto" aria-hidden className="h-14 shrink-0 [html:has(&)]:scroll-pb-16" />
      <div
        data-slot="barra-salva"
        style={
          riquadro
            ? {
                left: `calc(${riquadro.sinistra}px - var(--spacing) * 4)`,
                width: `calc(${riquadro.larghezza}px + var(--spacing) * 8)`,
              }
            : undefined
        }
        className={cn(
          "fixed bottom-0 z-10 flex flex-wrap items-center justify-end gap-x-3 gap-y-2 border-t border-border bg-background px-4 py-3",
          !riquadro && "invisible",
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
    </>
  )
}
