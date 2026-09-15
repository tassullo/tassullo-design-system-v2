/**
 * `tassullo-version-timeline` — lo storico delle revisioni di un documento:
 * stato, autore, data, e la selezione di due versioni da confrontare.
 *
 * Chiesto all'MCP prima di scrivere (regola 4bis, gradino 1): shadcn non ha
 * `timeline` né `stepper` — già accertato il 2026-09-09 per lo stepper
 * orizzontale del flusso di approvazione (WORKLOG, nota del 2026-09-09), che
 * resta un componente nostro **da confermare quando si farà** e non è
 * questo file. `version-timeline` invece è già nel piano (M3.7) e compone
 * `badge` + `avatar` + `checkbox` + `button` — nessuna primitiva mancante,
 * quindi resta un blocco (gradino 2/3), non un componente proprio: non entra
 * in `componenti-propri.json`, come `file-upload` e gli altri blocchi di
 * FASE 3 (CLAUDE.md, regola 4bis — quel registro serve solo a
 * `registry/tassullo/ui/`).
 *
 * **Il confronto è una selezione, non una diff.** Due checkbox per riga —
 * la terza si disabilita finché non se ne scarta una — e `onConfronta`
 * riceve le due voci scelte quando l'app clicca "Confronta". Renderizzare
 * la differenza vera è compito di `diff-view` (M3.9): qui il blocco si
 * ferma alla scelta, per lo stesso motivo per cui `FileUpload` non carica
 * niente da sé — il passo successivo appartiene a un altro pezzo del
 * design system.
 */
import { useState } from "react"

import { cn } from "cn"
import {
  Avatar,
  AvatarFallback,
} from "@/registry/tassullo/ui/avatar"
import { Badge } from "@/registry/tassullo/ui/badge"
import { Button } from "@/registry/tassullo/ui/button"
import { Checkbox } from "@/registry/tassullo/ui/checkbox"

export type StatoRevisione =
  | "bozza"
  | "in-revisione"
  | "approvato"
  | "rifiutato"
  | "superato"

const STATO: Record<
  StatoRevisione,
  { etichetta: string; className: string }
> = {
  bozza: {
    etichetta: "Bozza",
    className: "border-border bg-muted text-muted-foreground",
  },
  "in-revisione": {
    etichetta: "In revisione",
    className: "border-warning-border bg-warning-subtle text-warning-subtle-foreground",
  },
  approvato: {
    etichetta: "Approvato",
    className: "border-success-border bg-success-subtle text-success-subtle-foreground",
  },
  rifiutato: {
    etichetta: "Rifiutato",
    className: "border-destructive-border bg-destructive-subtle text-destructive-subtle-foreground",
  },
  superato: {
    etichetta: "Superato",
    className: "border-border text-muted-foreground",
  },
}

function iniziali(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parola) => parola[0]?.toUpperCase())
    .join("")
}

export type VersionTimelineEntry = {
  /** Identificatore stabile della revisione, non l'indice. */
  id: string
  /** Es. "v3", "Rev. 4". */
  versione: string
  stato: StatoRevisione
  autore: string
  data: Date
  descrizione?: string
}

export type VersionTimelineProps = {
  /** Dalla più recente alla più vecchia: è l'ordine in cui si leggono le revisioni di un documento. */
  revisioni: VersionTimelineEntry[]
  /** Mostra le checkbox di selezione e il bottone "Confronta". Assente per la sola lettura dello storico. */
  confrontabile?: boolean
  /** Le due revisioni scelte, quando l'app clicca "Confronta". La diff vera non è compito di questo blocco. */
  onConfronta?: (a: VersionTimelineEntry, b: VersionTimelineEntry) => void
  className?: string
}

export function VersionTimeline({
  revisioni,
  confrontabile,
  onConfronta,
  className,
}: VersionTimelineProps) {
  const [selezionate, setSelezionate] = useState<string[]>([])

  function alterna(id: string) {
    setSelezionate((prima) => {
      if (prima.includes(id)) return prima.filter((s) => s !== id)
      if (prima.length >= 2) return prima
      return [...prima, id]
    })
  }

  const dueSelezionate =
    selezionate.length === 2
      ? (selezionate
          .map((id) => revisioni.find((r) => r.id === id))
          .filter(Boolean) as VersionTimelineEntry[])
      : null

  return (
    <div data-slot="version-timeline" className={cn("flex flex-col gap-4", className)}>
      <ol className="flex flex-col">
        {revisioni.map((revisione, indice) => {
          const stato = STATO[revisione.stato]
          const ultima = indice === revisioni.length - 1

          return (
            <li
              key={revisione.id}
              data-slot="version-timeline-item"
              data-stato={revisione.stato}
              className="flex gap-3"
            >
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={cn("h-1 w-px shrink-0", indice !== 0 && "bg-border")}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-3 shrink-0 rounded-full border-2 bg-background border-border",
                    revisione.stato === "approvato" && "border-success",
                    revisione.stato === "rifiutato" && "border-destructive",
                    revisione.stato === "in-revisione" && "border-warning-border"
                  )}
                />
                {ultima ? null : (
                  <span aria-hidden="true" className="w-px flex-1 bg-border" />
                )}
              </div>
              <div className={cn("flex flex-1 flex-col gap-1.5", ultima ? "pb-0" : "pb-5")}>
                <div className="flex flex-wrap items-center gap-2">
                  {confrontabile ? (
                    <Checkbox
                      aria-label={`Seleziona ${revisione.versione} per il confronto`}
                      checked={selezionate.includes(revisione.id)}
                      disabled={
                        selezionate.length >= 2 && !selezionate.includes(revisione.id)
                      }
                      onCheckedChange={() => alterna(revisione.id)}
                    />
                  ) : null}
                  <span className="font-medium">{revisione.versione}</span>
                  <Badge variant="outline" className={stato.className}>
                    {stato.etichetta}
                  </Badge>
                  <span className="ml-auto shrink-0 text-sm text-muted-foreground tabular-nums">
                    {revisione.data.toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarFallback>{iniziali(revisione.autore)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{revisione.autore}</span>
                </div>
                {revisione.descrizione ? (
                  <p className="text-sm text-muted-foreground">{revisione.descrizione}</p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
      {confrontabile ? (
        <Button
          type="button"
          size="sm"
          className="self-start"
          disabled={!dueSelezionate}
          onClick={() => dueSelezionate && onConfronta?.(dueSelezionate[1], dueSelezionate[0])}
        >
          Confronta {dueSelezionate ? `${dueSelezionate[1].versione} → ${dueSelezionate[0].versione}` : "le due versioni"}
        </Button>
      ) : null}
    </div>
  )
}
