/**
 * `tassullo-version-timeline` — lo storico delle revisioni di un documento:
 * stato, autore, data, e la selezione di due versioni da confrontare.
 * Dalla proposta #235: autore e data facoltativi, e un menu di comandi per
 * revisione (`azioni`), che resta un elenco dato dall'app e non un nodo
 * libero: il blocco decide la forma del menu, l'app solo le voci.
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
import { EllipsisVerticalIcon } from "lucide-react"

import { cn } from "cn"
import {
  Avatar,
  AvatarFallback,
} from "@/registry/tassullo/ui/avatar"
import { Badge } from "@/registry/tassullo/ui/badge"
import { Button } from "@/registry/tassullo/ui/button"
import { Checkbox } from "@/registry/tassullo/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/tassullo/ui/dropdown-menu"

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
  /** Chi l'ha scritta. Senza, la riga dell'autore non c'è. */
  autore?: string
  /** Quando. Senza, la data non c'è. */
  data?: Date
  descrizione?: string
}

/** Un comando su una revisione, nel menu «⋯» della sua voce. */
export type AzioneVersione = {
  etichetta: string
  onSelect: () => void
  /** In rosso: ripristina, elimina, tutto ciò che non si annulla con un clic. */
  distruttiva?: boolean
  /** Presente, il comando è spento e il motivo si legge sotto l'etichetta. */
  motivoSpenta?: string
}

export type VersionTimelineProps = {
  /** Dalla più recente alla più vecchia: è l'ordine in cui si leggono le revisioni di un documento. */
  revisioni: VersionTimelineEntry[]
  /** Mostra le checkbox di selezione e il bottone "Confronta". Assente per la sola lettura dello storico. */
  confrontabile?: boolean
  /** Le due revisioni scelte, quando l'app clicca "Confronta". La diff vera non è compito di questo blocco. */
  onConfronta?: (a: VersionTimelineEntry, b: VersionTimelineEntry) => void
  /**
   * I comandi di ogni revisione: «Carica nell'editor», «Valida…»,
   * «Ripristina». Un elenco vuoto toglie il menu da quella voce.
   */
  azioni?: (revisione: VersionTimelineEntry) => AzioneVersione[]
  className?: string
}

function MenuVersione({
  versione,
  azioni,
}: {
  versione: string
  azioni: AzioneVersione[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" className="-my-1" />}
        aria-label={`Azioni su ${versione}`}
      >
        <EllipsisVerticalIcon aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto max-w-(--available-width)">
        {azioni.map((azione) => (
          <DropdownMenuItem
            key={azione.etichetta}
            variant={azione.distruttiva ? "destructive" : "default"}
            disabled={Boolean(azione.motivoSpenta)}
            onClick={azione.onSelect}
          >
            {azione.motivoSpenta ? (
              <span className="flex flex-col">
                <span>{azione.etichetta}</span>
                <span className="text-xs">{azione.motivoSpenta}</span>
              </span>
            ) : (
              azione.etichetta
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function VersionTimeline({
  revisioni,
  confrontabile,
  onConfronta,
  azioni,
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
          const comandi = azioni?.(revisione) ?? []

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
                  className={cn("h-1.5 w-px shrink-0", indice !== 0 && "bg-border")}
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
                  <span className="ml-auto flex shrink-0 items-center gap-1">
                    {revisione.data ? (
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {revisione.data.toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                    {comandi.length > 0 ? (
                      <MenuVersione versione={revisione.versione} azioni={comandi} />
                    ) : null}
                  </span>
                </div>
                {revisione.autore ? (
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>{iniziali(revisione.autore)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{revisione.autore}</span>
                  </div>
                ) : null}
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
          className="self-start transition-colors"
          disabled={!dueSelezionate}
          onClick={() => dueSelezionate && onConfronta?.(dueSelezionate[1], dueSelezionate[0])}
        >
          Confronta {dueSelezionate ? `${dueSelezionate[1].versione} → ${dueSelezionate[0].versione}` : "le due versioni"}
        </Button>
      ) : null}
    </div>
  )
}
