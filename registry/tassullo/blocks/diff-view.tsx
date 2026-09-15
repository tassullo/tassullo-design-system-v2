/**
 * `tassullo-diff-view` — confronto prima/dopo fra due testi, evidenziato
 * **parola per parola**, non riga per riga.
 *
 * ── D8, la quarta e ultima ────────────────────────────────────────────────
 *
 * Chiesto all'MCP prima di scrivere (regola 4bis, gradino 1): shadcn non ha
 * un `diff` o un confronto testi già pronto. Scelto `diff` — il pacchetto `jsdiff`, D8 —
 * per lo stesso motivo di `react-dropzone` e `react-pdf`: **non** un widget
 * già confezionato, solo la funzione pura `diffWords(prima, dopo)` che
 * restituisce i segmenti (`{ value, added?, removed? }`); il rendering,
 * come sempre nei blocchi di FASE 3, resta interamente nostro. Zero
 * dipendenze a sua volta (verificato: `npm view diff dependencies` non
 * stampa niente), la condizione che D8 chiede per restare sostituibile.
 *
 * **Perché parola e non riga.** Il piano lo chiede esplicito (M3.9): una
 * scheda tecnica non è codice sorgente, è prosa — una revisione che cambia
 * "100 mm" in "80 mm" dentro la stessa frase, con un diff a riga intera,
 * mostrerebbe l'intera riga come cambiata e nasconderebbe la sola parola
 * che conta. `diffWords` (non `diffLines` né `diffChars`) è il livello
 * giusto: abbastanza fine da isolare "100" da "80", abbastanza grosso da
 * non spezzare "sovrapposizione" in lettere.
 *
 * **Due modalità, non due componenti.** `inline` (l'accettazione di M3.9,
 * "diff su due testi reali di scheda tecnica") fonde il confronto in un
 * unico paragrafo — `<del>` barrato per il tolto, `<ins>` per l'aggiunto,
 * gli stessi tag semantici HTML5 per una modifica, non `<span>` a caso.
 * `affiancato` compone `SplitView` (M3.9 stessa sessione): a sinistra il
 * "prima" con il tolto evidenziato, a destra il "dopo" con l'aggiunto —
 * la vista a due colonne sincronizzate che il piano chiede accanto al
 * confronto parola per parola, non un terzo blocco separato.
 *
 * **Il colore non basta da solo.** Il tolto è barrato oltre che rosso
 * (`line-through` su `<del>`), non solo il colore a distinguerlo
 * dall'aggiunto — la stessa cautela di `version-timeline` con badge e
 * icona insieme, non badge da soli.
 */
import { useMemo } from "react"
import { diffWords } from "diff"

import { cn } from "cn"
import { SplitView } from "@/registry/tassullo/blocks/split-view"

export type DiffViewProps = {
  prima: string
  dopo: string
  etichettaPrima?: string
  etichettaDopo?: string
  /** `inline` fonde il confronto in un paragrafo solo; `affiancato` usa due colonne sincronizzate. */
  modo?: "inline" | "affiancato"
  className?: string
}

function Legenda() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-destructive" />
        Tolto
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-success" />
        Aggiunto
      </span>
    </div>
  )
}

export function DiffView({
  prima,
  dopo,
  etichettaPrima = "Prima",
  etichettaDopo = "Dopo",
  modo = "inline",
  className,
}: DiffViewProps) {
  const segmenti = useMemo(() => diffWords(prima, dopo), [prima, dopo])

  if (modo === "affiancato") {
    return (
      <div data-slot="diff-view" className={cn("flex flex-col gap-3", className)}>
        <Legenda />
        <SplitView
          sinistra={
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {segmenti
                .filter((segmento) => !segmento.added)
                .map((segmento, indice) =>
                  segmento.removed ? (
                    <del
                      key={indice}
                      className="rounded-sm bg-destructive-subtle text-destructive-subtle-foreground line-through"
                    >
                      {segmento.value}
                    </del>
                  ) : (
                    <span key={indice}>{segmento.value}</span>
                  )
                )}
            </p>
          }
          destra={
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {segmenti
                .filter((segmento) => !segmento.removed)
                .map((segmento, indice) =>
                  segmento.added ? (
                    <ins
                      key={indice}
                      className="rounded-sm bg-success-subtle text-success-subtle-foreground no-underline"
                    >
                      {segmento.value}
                    </ins>
                  ) : (
                    <span key={indice}>{segmento.value}</span>
                  )
                )}
            </p>
          }
          etichettaSinistra={etichettaPrima}
          etichettaDestra={etichettaDopo}
          sincronizzato
        />
      </div>
    )
  }

  return (
    <div data-slot="diff-view" className={cn("flex flex-col gap-3", className)}>
      <Legenda />
      <p className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
        {segmenti.map((segmento, indice) => {
          if (segmento.added) {
            return (
              <ins
                key={indice}
                className="rounded-sm bg-success-subtle text-success-subtle-foreground no-underline"
              >
                {segmento.value}
              </ins>
            )
          }
          if (segmento.removed) {
            return (
              <del
                key={indice}
                className="rounded-sm bg-destructive-subtle text-destructive-subtle-foreground line-through"
              >
                {segmento.value}
              </del>
            )
          }
          return <span key={indice}>{segmento.value}</span>
        })}
      </p>
    </div>
  )
}
