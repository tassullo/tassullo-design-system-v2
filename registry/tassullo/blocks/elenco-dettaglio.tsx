/**
 * `tassullo-elenco-dettaglio` — un elenco a larghezza fissa accanto al
 * dettaglio della voce scelta, in una cornice sola. Proposta #125 (Anagrafe),
 * 13 ottobre 2026: l'albero di una scheda con quaranta blocchi è più alto
 * della finestra, e scelta una riga in fondo la pagina tornava su a mostrare
 * il blocco lasciando la riga fuori vista.
 *
 * ── Perché un blocco nuovo ───────────────────────────────────────────────
 *
 * `tassullo-split-view` è un confronto: due colonne alla pari, 50 e 50, con
 * la maniglia, alte quanto il riquadro e ognuna col suo scorrimento. Qui le
 * due parti non sono alla pari: l'elenco ha una larghezza sola, il dettaglio
 * prende il resto ed è lui a scorrere con la pagina. Una colonna del guscio a
 * sinistra sarebbe della pagina intera, mentre l'elenco è di una tab.
 *
 * ── Perché la cornice è sua ──────────────────────────────────────────────
 *
 * `Card` ha `overflow-hidden`, che fa della card il riquadro di scorrimento
 * dei suoi figli: un elenco `sticky` lì dentro non resta fermo rispetto alla
 * finestra. Il blocco disegna la stessa cornice senza tagliare.
 *
 * ── Quanto è alto ciò che sta fermo sopra ────────────────────────────────
 *
 * Il guscio non dichiara l'altezza della fascia in una variabile, e le tab
 * ferme sono una ricetta di pagina: le due misure si scrivono come le scrive
 * già chi usa `scroll-pt-12` e `scroll-pt-24`. La fascia è 12 unità, le tab
 * altre 12; l'elenco sta 4 unità più sotto, il margine del contenuto.
 */
import * as React from "react"
import { cn } from "cn"

export type ElencoDettaglioProps = {
  /** L'elenco: di solito un `Albero`, col suo titolo sopra e la legenda sotto. */
  elenco: React.ReactNode
  /** Il nome della parte dell'elenco per i lettori di schermo. */
  etichettaElenco?: string
  /**
   * Cosa resta fermo in cima alla finestra sopra il blocco: `fascia` è la
   * fascia del guscio, `fascia-e-tab` la fascia più le tab ferme di una
   * scheda, `niente` una pagina senza guscio. L'elenco si ferma lì sotto.
   */
  sotto?: "niente" | "fascia" | "fascia-e-tab"
  /** Il dettaglio della voce scelta. */
  children: React.ReactNode
  /**
   * Ciò che sta in fondo al dettaglio, allineato al fondo della cornice anche
   * quando il dettaglio è più corto dell'elenco: per esempio la legenda dei
   * segni dell'elenco, che lì sta su una riga.
   */
  piede?: React.ReactNode
  className?: string
}

// Dove si ferma l'elenco e quanto può essere alto. L'altezza è la finestra
// meno ciò che sta sopra e sotto l'elenco a pagina non ancora scorsa, così la
// cornice intera, piede compreso, entra nella finestra senza scorrere: sopra
// la fascia (12), il margine del contenuto (4), le tab col loro stacco (14) e
// il margine della cornice (4); sotto, i due margini (8). Sono le misure di
// una cornice messa subito sotto le tab: se sopra c'è altro (una riga
// d'introduzione, un bottone), il blocco misura dove comincia davvero e
// toglie anche quello.
const FERMO = {
  niente: { classe: "@xl/elenco-dettaglio:top-4", alto: "calc(100svh - var(--spacing) * 12)" },
  fascia: { classe: "@xl/elenco-dettaglio:top-16", alto: "calc(100svh - var(--spacing) * 28)" },
  "fascia-e-tab": { classe: "@xl/elenco-dettaglio:top-28", alto: "calc(100svh - var(--spacing) * 42)" },
}

/**
 * Un elenco a larghezza fissa accanto al dettaglio della voce scelta.
 * L'elenco resta in vista mentre la pagina scorre.
 */
export function ElencoDettaglio({
  elenco,
  etichettaElenco,
  sotto = "fascia",
  children,
  piede,
  className,
}: ElencoDettaglioProps) {
  const fermo = FERMO[sotto]
  const cornice = React.useRef<HTMLDivElement>(null)
  // Dove comincia la cornice nel documento, a pagina non scorsa. Cambia se
  // cambia ciò che le sta sopra, o la larghezza: si rilegge quando cambia
  // l'altezza della pagina.
  const [sopra, setSopra] = React.useState<number | null>(null)
  React.useEffect(() => {
    const el = cornice.current
    if (!el || typeof ResizeObserver === "undefined") return
    const leggi = () => setSopra(Math.round(el.getBoundingClientRect().top + window.scrollY))
    const osservatore = new ResizeObserver(leggi)
    osservatore.observe(document.body)
    return () => osservatore.disconnect()
  }, [])
  // Sotto la cornice, a pagina non scorsa: il margine interno sopra
  // l'elenco (4), e sotto i due margini e il margine interno (8).
  const alto = sopra === null ? fermo.alto : `min(${fermo.alto}, calc(100svh - ${sopra}px - var(--spacing) * 12))`
  return (
    <div
      ref={cornice}
      data-slot="elenco-dettaglio"
      className={cn("@container/elenco-dettaglio rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10", className)}
    >
      <div className="flex flex-col gap-4 @xl/elenco-dettaglio:flex-row @xl/elenco-dettaglio:gap-6">
        <div
          data-slot="elenco-dettaglio-elenco"
          role={etichettaElenco ? "group" : undefined}
          aria-label={etichettaElenco}
          style={{ "--elenco-dettaglio-alto": alto } as React.CSSProperties}
          // Affiancato: una larghezza sola, fermo sotto ciò che sta in cima,
          // e se è più alto della finestra scorre per conto suo. Impilato:
          // sta sopra il dettaglio e scorre con la pagina.
          className={cn(
            "flex min-w-0 flex-col gap-3 border-b border-border pb-4",
            "@xl/elenco-dettaglio:sticky @xl/elenco-dettaglio:max-h-(--elenco-dettaglio-alto) @xl/elenco-dettaglio:w-2xs @xl/elenco-dettaglio:shrink-0 @xl/elenco-dettaglio:self-start @xl/elenco-dettaglio:overflow-y-auto @xl/elenco-dettaglio:border-r @xl/elenco-dettaglio:border-b-0 @xl/elenco-dettaglio:pr-4 @xl/elenco-dettaglio:pb-0",
            fermo.classe
          )}
        >
          {elenco}
        </div>
        <div data-slot="elenco-dettaglio-dettaglio" className="flex min-w-0 flex-1 flex-col gap-4">
          {children}
          {/* Il dettaglio è alto quanto l'elenco che ha accanto: il piede
              scende in fondo. */}
          {piede ? (
            <div data-slot="elenco-dettaglio-piede" className="mt-auto">
              {piede}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
