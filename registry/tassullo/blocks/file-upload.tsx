/**
 * `tassullo-file-upload` — dropzone e elenco, in due componenti che si usano
 * insieme.
 *
 * ── D8: la libreria, scelta qui ──────────────────────────────────────────
 *
 * `file-upload` è il primo dei blocchi FASE 3 con una dipendenza pesante
 * (`docs/DECISIONI.md`, D8 in `PIANO.md`). Prima di sceglierne una si è
 * chiesto all'MCP: shadcn non ha un `file-upload` o un `dropzone` — solo
 * `progress`, che qui si riusa per la barra di avanzamento, e `empty`, che
 * qui si riusa per la cornice tratteggiata dello stato inattivo (regola
 * 4bis, gradino 1 e 2: quello che c'è già non si reinventa).
 *
 * `react-dropzone` è la scelta: è un **hook puro** — `useDropzone` restituisce
 * solo `getRootProps`/`getInputProps`, senza una riga di markup propria da
 * disfare — quindi la forma resta interamente nostra, ed è la condizione che
 * D8 chiede per essere sostituibile senza toccare l'API del blocco. Due
 * conseguenze dirette sui criteri di accettazione di M3.6:
 *
 *   - **Errori per riga**: `getErrorMessage` intercetta i codici di rifiuto
 *     (tipo, dimensione, troppi file) e li traduce **una volta sola**, qui —
 *     l'app non vede mai `"file-too-large"`.
 *
 * **Tastiera senza trascinamento, ma non nella forma di default della
 * libreria.** `getRootProps` darebbe da sé `role="presentation"` +
 * `tabIndex`, con l'`<input type="file">` nascosto dentro — ed è esattamente
 * lo scarto rilevato dal gate: un `input` è **interattivo di suo**, e
 * annidarlo in un contenitore reso interattivo da `tabIndex`/`role` è la
 * violazione `nested-interactive`, non passabile ri-stilando (regola 4bis
 * non si applica: qui non è un colore, è la struttura). La cornice resta
 * **non interattiva** — solo bersaglio di trascinamento — e l'apertura del
 * selettore passa da un bottone vero, con `open()` che la libreria espone
 * apposta per questo: `noClick`/`noKeyboard` tolgono alla cornice il
 * comportamento di default, il bottone della style guide (focus, Invio,
 * Spazio) fa il resto senza bisogno di reinventarlo.
 *
 * ── I due componenti ──────────────────────────────────────────────────────
 *
 * `FileUpload` valida e seleziona; non carica niente da sé — l'upload vero
 * (endpoint, retry, annullamento a metà) è dell'app, che lo sa fare per il
 * proprio backend. `FileUploadList` renderizza un elenco di `FileUploadItem`
 * che l'app tiene in stato: in coda, in corso (con `progresso`), riuscito o
 * fallito — la stessa forma serve per gli allegati già caricati in
 * precedenza, passati con `stato: "riuscito"` e nessuna barra.
 */
import { useCallback } from "react"
import {
  CheckIcon,
  FileIcon,
  OctagonXIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { useDropzone, type Accept, type FileRejection } from "react-dropzone"

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
import { Progress } from "@/registry/tassullo/ui/progress"

const MESSAGGI_RIFIUTO: Record<string, string> = {
  "file-invalid-type": "Tipo di file non supportato",
  "file-too-large": "File troppo grande",
  "file-too-small": "File troppo piccolo",
  "too-many-files": "Troppi file in una volta",
}

function formattaDimensione(byte: number) {
  if (byte < 1024) return `${byte} B`
  const unita = ["KB", "MB", "GB"] as const
  let valore = byte / 1024
  let indice = 0
  while (valore >= 1024 && indice < unita.length - 1) {
    valore /= 1024
    indice++
  }
  return `${valore.toFixed(valore < 10 ? 1 : 0)} ${unita[indice]}`
}

export type FileUploadItem = {
  /** Identificatore stabile della riga: non l'indice, o rimuovere una riga sposta le altre. */
  id: string
  nome: string
  dimensione: number
  stato: "in-coda" | "in-corso" | "riuscito" | "fallito"
  /** 0–100. Ignorato fuori da `in-corso`. */
  progresso?: number
  /** Il motivo del fallimento, già tradotto: mai un codice, mai la risposta grezza del server. */
  errore?: string
}

type FileUploadComuni = {
  /** I file accettati dopo la validazione di tipo e dimensione. Non carica: l'app decide come. */
  onFile: (file: File[]) => void
  /** I file scartati, con il motivo già tradotto in italiano. */
  onRifiutati?: (rifiutati: { file: File; errore: string }[]) => void
  /** Come l'`accept` nativo di `<input type="file">`: `{ "application/pdf": [".pdf"] }`. */
  accetta?: Accept
  dimensioneMassima?: number
  multiplo?: boolean
  disabilitato?: boolean
  etichettaBottone?: string
  className?: string
}

export type FileUploadProps = FileUploadComuni &
  (
    | {
        /**
         * `"zona"`, di serie: la cornice dove trascinare i file, con titolo,
         * descrizione e bottone. `"bottone"`: il solo bottone, per stare fra
         * le azioni di una riga — «Sostituisci» accanto a un allegato che c'è
         * già. Il file si può trascinare anche sul bottone.
         */
        forma?: "zona"
        etichetta?: string
        descrizione?: string
      }
    | {
        forma: "bottone"
        etichetta?: never
        descrizione?: never
      }
  )

export function FileUpload({
  onFile,
  onRifiutati,
  accetta,
  dimensioneMassima,
  multiplo = true,
  disabilitato,
  forma = "zona",
  etichetta = "Trascina i file qui",
  descrizione,
  etichettaBottone = "Scegli dal computer",
  className,
}: FileUploadProps) {
  const onDrop = useCallback(
    (accettati: File[], rifiutati: FileRejection[]) => {
      if (accettati.length) onFile(accettati)
      if (rifiutati.length) {
        onRifiutati?.(
          rifiutati.map((rifiutato) => ({
            file: rifiutato.file,
            errore: rifiutato.errors[0]?.message ?? "File rifiutato",
          }))
        )
      }
    },
    [onFile, onRifiutati]
  )

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    accept: accetta,
    maxSize: dimensioneMassima,
    multiple: multiplo,
    disabled: disabilitato,
    noClick: true,
    noKeyboard: true,
    getErrorMessage: (errore) => MESSAGGI_RIFIUTO[errore.code] ?? errore.message,
  })

  // Il campo file nascosto sta fuori dal flusso: dentro la colonna della
  // cornice aggiungeva un intervallo sopra il titolo, e accanto al bottone
  // allargava il contenitore oltre la pagina in WebKit.
  if (forma === "bottone") {
    return (
      <div
        {...getRootProps()}
        data-slot="file-upload-bottone"
        data-drag-active={isDragActive}
        className={cn("relative inline-flex", className)}
      >
        <input
          {...getInputProps()}
          data-slot="file-upload-input"
          className="absolute"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={open}
          disabled={disabilitato}
          data-drag-active={isDragActive}
          // Le stesse classi col prefisso `dark:`: in scuro il bordo del
          // bottone `outline` è `dark:border-input`, che vincerebbe.
          className="data-[drag-active=true]:border-primary data-[drag-active=true]:bg-muted dark:data-[drag-active=true]:border-primary dark:data-[drag-active=true]:bg-muted"
        >
          <UploadIcon data-icon="inline-start" />
          {etichettaBottone}
        </Button>
      </div>
    )
  }

  return (
    <Empty
      {...getRootProps()}
      data-slot="file-upload-dropzone"
      data-drag-active={isDragActive}
      className={cn(
        "relative border transition-colors data-[drag-active=true]:border-primary data-[drag-active=true]:bg-muted",
        className
      )}
    >
      <input
        {...getInputProps()}
        data-slot="file-upload-input"
        className="absolute"
      />
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UploadIcon />
        </EmptyMedia>
        <EmptyTitle>{etichetta}</EmptyTitle>
        {descrizione ? <EmptyDescription>{descrizione}</EmptyDescription> : null}
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={open}
          disabled={disabilitato}
        >
          {etichettaBottone}
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export type FileUploadListProps = {
  file: FileUploadItem[]
  /** Assente, la riga non ha bottone di rimozione — il caso degli allegati già caricati che non si tolgono da qui. */
  onRimuovi?: (id: string) => void
  className?: string
}

export function FileUploadList({
  file,
  onRimuovi,
  className,
}: FileUploadListProps) {
  if (!file.length) return null

  return (
    <ul
      data-slot="file-upload-list"
      className={cn("flex flex-col gap-2", className)}
    >
      {file.map((riga) => (
        <li
          key={riga.id}
          data-slot="file-upload-item"
          data-stato={riga.stato}
          className="flex items-center gap-3 rounded-lg border p-2.5 text-sm data-[stato=fallito]:border-destructive-border data-[stato=fallito]:bg-destructive-subtle"
        >
          <EmptyMedia
            variant="icon"
            className={cn(
              "mb-0 shrink-0",
              riga.stato === "riuscito" &&
                "bg-success-subtle text-success-subtle-foreground",
              riga.stato === "fallito" &&
                "bg-destructive-subtle-foreground/10 text-destructive-subtle-foreground"
            )}
          >
            {riga.stato === "riuscito" ? (
              <CheckIcon />
            ) : riga.stato === "fallito" ? (
              <OctagonXIcon />
            ) : (
              <FileIcon />
            )}
          </EmptyMedia>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate font-medium">
                {riga.nome}
              </span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {formattaDimensione(riga.dimensione)}
              </span>
            </div>
            {riga.stato === "in-corso" ? (
              <Progress value={riga.progresso ?? 0} aria-label={riga.nome} />
            ) : null}
            {riga.stato === "fallito" && riga.errore ? (
              <p className="text-destructive-subtle-foreground">
                {riga.errore}
              </p>
            ) : null}
          </div>
          {onRimuovi ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onRimuovi(riga.id)}
              aria-label={`Rimuovi ${riga.nome}`}
            >
              <XIcon />
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
