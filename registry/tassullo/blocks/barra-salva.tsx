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
 * Dentro il guscio la barra prende i bordi dall'area del contenuto
 * (`data-slot="app-shell-contenuto"`), ovunque stia nel modulo: anche dentro
 * una `Card`, dove le app tengono i moduli delle schede (in Anagrafe, nove
 * pagine su nove). La prima forma li prendeva dallo spazio lasciato nel
 * modulo, e dentro una card la barra usciva rientrata del margine della card,
 * con un vuoto alto quanto lei in fondo alla card. Ora lo spazio in fondo lo
 * lascia l'area del contenuto, alzando il suo margine finché la barra c'è, e
 * nel modulo resta solo un segnaposto senza altezza, fuori dal flusso. Così
 * non copre la barra laterale, né la colonna laterale quando è aperta.
 *
 * Fuori dal guscio la barra prende i bordi dal segnaposto, allargato del
 * margine (`-mx-4`, come le tab ferme) e alto quanto lei.
 * I bordi si rimisurano quando l'area cambia larghezza (barra laterale chiusa
 * o aperta, colonna laterale) e quando la finestra cambia misura.
 *
 * `scroll-pb-16` sulla radice del documento, finché la barra c'è: è alta 14
 * unità più il bordo, e un campo raggiunto col `Tab` non le finisce sotto.
 *
 * ── I bordi senza render ─────────────────────────────────────────────────
 *
 * Fino alla v2.0.18 i bordi erano uno stato, scritto con `flushSync` dentro
 * l'osservatore. In WebKit, in una tab montata anche quando non si vede, con
 * la colonna laterale aperta: si cambia tab e si torna, l'area si stringe, e
 * il render sincrono eseguiva anche l'aggiornamento in attesa dell'elenco
 * fermo di `tassullo-elenco-dettaglio`, che cambiava l'altezza della pagina
 * dentro l'osservatore. La console scriveva «ResizeObserver loop completed
 * with undelivered notifications» (proposta #125, trovato da Anagrafe). Ora
 * i bordi si scrivono sull'elemento, e `data-misurata` toglie l'opacità zero:
 * stesso istante, prima che la pagina si disegni, e nessun render. Prova
 * `Pagine/Scheda a blocchi → Cambio di tab, prova`, in WebKit.
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
  const visibile = sporco || inCorso
  const posto = React.useRef<HTMLDivElement>(null)
  const barra = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    const el = posto.current
    if (!el) return
    // Nel guscio i bordi sono quelli dell'area del contenuto; fuori, quelli
    // del segnaposto, che il suo `-mx-4` allarga già del margine.
    const misurato = el.closest<HTMLElement>('[data-slot="app-shell-contenuto"]') ?? el
    // I bordi si scrivono sulla barra, senza un render: l'osservatore chiama
    // prima che la pagina si disegni, quindi nessun fotogramma con la barra
    // fuori posto. Un render sincrono qui eseguirebbe anche gli aggiornamenti
    // in attesa del resto della pagina, che cambierebbero le misure dentro
    // l'osservatore.
    const leggi = () => {
      const b = barra.current
      if (!b) return
      const r = misurato.getBoundingClientRect()
      b.style.left = `${r.left}px`
      b.style.width = `${r.width}px`
      b.dataset.misurata = ""
    }
    leggi()
    if (typeof ResizeObserver === "undefined") return
    const osservatore = new ResizeObserver(leggi)
    osservatore.observe(misurato)
    window.addEventListener("resize", leggi)
    return () => {
      osservatore.disconnect()
      window.removeEventListener("resize", leggi)
    }
  }, [visibile])

  if (!visibile) return null
  return (
    <>
      {/* Il segnaposto: fuori dal guscio tiene il posto della barra in fondo
          alla pagina, largo quanto lei; nel guscio il posto lo lascia l'area
          del contenuto, e il segnaposto esce dal flusso. */}
      <div
        ref={posto}
        data-slot="barra-salva-posto"
        aria-hidden
        className="-mx-4 h-14 shrink-0 in-data-[slot=app-shell-contenuto]:absolute in-data-[slot=app-shell-contenuto]:h-0 [html:has(&)]:scroll-pb-16"
      />
      <div
        ref={barra}
        data-slot="barra-salva"
        className={cn(
          "fixed bottom-0 z-10 flex flex-wrap items-center justify-end gap-x-3 gap-y-2 border-t border-border bg-background px-4 py-3",
          // Finché lo spazio non è misurato la barra non si vede e non si
          // clicca. Non `invisible`: la visibilità si eredita, e coi bottoni
          // in `transition-all` resterebbero nascosti per tutta la transizione
          // dopo che la barra è comparsa.
          "not-data-misurata:pointer-events-none not-data-misurata:opacity-0",
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
