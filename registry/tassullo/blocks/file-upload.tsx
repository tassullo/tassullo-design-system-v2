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
 *
 * ── Miniature e tetto (proposta #165, passo #165a, 2026-11-01) ───────────
 *
 * `FileUploadList forma="miniature"` mette le immagini in una griglia, due
 * colonne e di più dove c'è posto (container query, non la finestra);
 * «Togli» accanto al nome, scelto da Francesco fra tre forme (sull'immagine,
 * accanto al nome, bottone di testo sotto). `massimo` e `presenti` sono il
 * tetto: al tetto il bottone si spegne e una frase lo dice (scelta fra
 * «sparisce», «spento con frase», «conto sempre visibile»). L'incolla da
 * appunti chiesto dalla proposta **non c'è**: Francesco l'ha tolto, restano
 * la scelta dal computer e il trascinamento.
 *
 * ── Tre forme in più (proposta #171, 2026-11-01) ─────────────────────────
 *
 * Anagrafe: con 5 screenshot il dialogo del supporto superava l'altezza di
 * un portatile da 14". Francesco ha scelto fra sei forme rese di tenerne tre,
 * scelte dall'app: `miniature-compatte` (A, «Togli» sull'immagine e nome
 * sotto: è quella del dialogo del supporto), `solo-immagini` (C) e
 * `righe-con-immagine` (H1, immagine 16:9 a sinistra, nome e peso a destra).
 * Il peso sparisce dalle due forme a griglia.
 */
import { useCallback, type ReactNode } from "react"
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
import { decimale, intero } from "@/registry/tassullo/lib/numeri"

const MESSAGGI_RIFIUTO: Record<string, string> = {
  "file-invalid-type": "Tipo di file non supportato",
  "file-too-large": "File troppo grande",
  "file-too-small": "File troppo piccolo",
  "too-many-files": "Troppi file in una volta",
}

function formattaDimensione(byte: number) {
  if (byte < 1024) return `${intero(byte)} B`
  const unita = ["KB", "MB", "GB"] as const
  let valore = byte / 1024
  let indice = 0
  while (valore >= 1024 && indice < unita.length - 1) {
    valore /= 1024
    indice++
  }
  return `${decimale(valore, valore < 10 ? 1 : 0)} ${unita[indice]}`
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
  /**
   * L'immagine della voce, con le forme a immagine di `FileUploadList`. Un `File` appena
   * scelto si passa così com'è: l'indirizzo locale lo apre e lo libera il
   * blocco. Una stringa è un indirizzo già pronto. Assente, la miniatura
   * mostra l'icona del file.
   */
  anteprima?: Blob | string
}

type FileUploadComuni = {
  /** I file accettati dopo la validazione di tipo e dimensione. Non carica: l'app decide come. */
  onFile: (file: File[]) => void
  /** I file scartati, con il motivo già tradotto in italiano. */
  onRifiutati?: (rifiutati: { file: File; errore: string }[]) => void
  /** Come l'`accept` nativo di `<input type="file">`: `{ "application/pdf": [".pdf"] }`. */
  accetta?: Accept
  dimensioneMassima?: number
  /**
   * Il tetto al numero di file, contando anche quelli già scelti
   * (`presenti`). Di una scelta che lo supera entrano i primi che ci stanno;
   * gli altri arrivano a `onRifiutati`. Al tetto il blocco si spegne, e
   * la cornice lo dice al posto della `descrizione`; accanto al bottone
   * della forma compatta la frase la scrive l'app.
   */
  massimo?: number
  /** Quanti file l'app tiene già, per il conto di `massimo`. Di serie 0. */
  presenti?: number
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
  massimo,
  presenti = 0,
  multiplo = true,
  disabilitato,
  forma = "zona",
  etichetta = "Trascina i file qui",
  descrizione,
  etichettaBottone = "Scegli dal computer",
  className,
}: FileUploadProps) {
  const posto =
    massimo === undefined ? Infinity : Math.max(0, massimo - presenti)
  const spento = disabilitato || posto === 0

  const onDrop = useCallback(
    (accettati: File[], rifiutati: FileRejection[]) => {
      const entrano = accettati.slice(0, posto)
      const scartati = [
        ...rifiutati.map((rifiutato) => ({
          file: rifiutato.file,
          errore: rifiutato.errors[0]?.message ?? "File rifiutato",
        })),
        ...accettati.slice(posto).map((file) => ({
          file,
          errore: `Oltre il massimo di ${intero(massimo ?? 0)} file`,
        })),
      ]
      if (entrano.length) onFile(entrano)
      if (scartati.length) onRifiutati?.(scartati)
    },
    [onFile, onRifiutati, posto, massimo]
  )

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    accept: accetta,
    maxSize: dimensioneMassima,
    multiple: multiplo,
    disabled: spento,
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
          disabled={spento}
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
        {posto === 0 ? (
          <EmptyDescription>
            Hai raggiunto il massimo di {intero(massimo ?? 0)} file. Togline
            uno per aggiungerne un altro.
          </EmptyDescription>
        ) : descrizione ? (
          <EmptyDescription>{descrizione}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={open}
          disabled={spento}
        >
          {etichettaBottone}
        </Button>
      </EmptyContent>
    </Empty>
  )
}

type FormaElenco =
  | "righe"
  | "miniature"
  | "miniature-compatte"
  | "solo-immagini"
  | "righe-con-immagine"

const GRIGLIA: Record<Exclude<FormaElenco, "righe">, string> = {
  miniature: "grid-cols-2 gap-3 @md:grid-cols-3 @3xl:grid-cols-4",
  "miniature-compatte": "grid-cols-3 gap-2 @xl:grid-cols-5",
  "solo-immagini": "grid-cols-3 gap-2 @xl:grid-cols-5",
  "righe-con-immagine": "grid-cols-1 gap-2 @xl:grid-cols-2",
}

export type FileUploadListProps = {
  file: FileUploadItem[]
  /** Assente, la riga non ha bottone di rimozione — il caso degli allegati già caricati che non si tolgono da qui. */
  onRimuovi?: (id: string) => void
  /**
   * `"righe"`, di serie: un file per riga. Per le immagini:
   * `"miniature"`, una griglia di miniature grandi, due colonne dove il
   * posto è poco e di più dove ce n'è; `"miniature-compatte"`, miniature
   * piccole col nome sotto e «Togli» sopra l'immagine, tre per riga sul
   * telefono e cinque dove c'è posto; `"solo-immagini"`, le stesse senza il
   * nome, che si legge passandoci sopra; `"righe-con-immagine"`, l'immagine
   * a sinistra e nome e peso a destra, una o due colonne.
   */
  forma?: FormaElenco
  className?: string
}

export function FileUploadList({
  file,
  onRimuovi,
  forma = "righe",
  className,
}: FileUploadListProps) {
  if (!file.length) return null

  if (forma !== "righe") {
    const Voce = VOCE[forma]
    return (
      <div className={cn("@container", className)}>
        <ul
          data-slot="file-upload-miniature"
          data-forma={forma}
          className={cn("grid", GRIGLIA[forma])}
        >
          {file.map((voce) => (
            <Voce key={voce.id} voce={voce} onRimuovi={onRimuovi} />
          ))}
        </ul>
      </div>
    )
  }

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

/**
 * L'immagine di una miniatura. Un `Blob` diventa un indirizzo locale quando
 * l'immagine entra nella pagina e si libera quando ne esce: con la funzione
 * di pulizia del `ref`, non con un effetto che riscriverebbe lo stato.
 */
function ImmagineMiniatura({
  anteprima,
  nome,
  className,
}: {
  anteprima: Blob | string
  nome: string
  className?: string
}) {
  const apri = useCallback(
    (immagine: HTMLImageElement | null) => {
      if (!immagine || typeof anteprima === "string") return
      const indirizzo = URL.createObjectURL(anteprima)
      immagine.src = indirizzo
      return () => URL.revokeObjectURL(indirizzo)
    },
    [anteprima]
  )

  return (
    <img
      ref={apri}
      src={typeof anteprima === "string" ? anteprima : undefined}
      alt={`Anteprima di ${nome}`}
      className={cn("aspect-4/3 w-full bg-muted object-cover", className)}
    />
  )
}

function Miniatura({
  voce,
  onRimuovi,
}: {
  voce: FileUploadItem
  onRimuovi?: (id: string) => void
}) {
  return (
    <li
      data-slot="file-upload-miniatura"
      data-stato={voce.stato}
      className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card text-sm data-[stato=fallito]:border-destructive-border data-[stato=fallito]:bg-destructive-subtle"
    >
      {voce.anteprima ? (
        <ImmagineMiniatura anteprima={voce.anteprima} nome={voce.nome} />
      ) : (
        <div className="flex aspect-4/3 w-full items-center justify-center bg-muted text-muted-foreground">
          <FileIcon className="size-6" />
        </div>
      )}
      <div className="flex items-start gap-1 p-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate font-medium">{voce.nome}</span>
          {voce.stato === "in-corso" ? (
            <Progress value={voce.progresso ?? 0} aria-label={voce.nome} />
          ) : voce.stato === "fallito" && voce.errore ? (
            <span className="text-destructive-subtle-foreground">
              {voce.errore}
            </span>
          ) : (
            <span className="text-muted-foreground tabular-nums">
              {formattaDimensione(voce.dimensione)}
            </span>
          )}
        </div>
        {/* Durante l'invio la miniatura non si toglie: al posto della dimensione c'è la barra. */}
        {onRimuovi && voce.stato !== "in-corso" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRimuovi(voce.id)}
            aria-label={`Togli ${voce.nome}`}
          >
            <XIcon />
          </Button>
        ) : null}
      </div>
    </li>
  )
}

type PropsVoce = {
  voce: FileUploadItem
  onRimuovi?: (id: string) => void
}

/** L'immagine, o l'icona del file se manca, nel rapporto della forma. */
function Anteprima({
  voce,
  className,
}: {
  voce: FileUploadItem
  className?: string
}) {
  return voce.anteprima ? (
    <ImmagineMiniatura
      anteprima={voce.anteprima}
      nome={voce.nome}
      className={className}
    />
  ) : (
    <div
      className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        className
      )}
    >
      <FileIcon className="size-5" />
    </div>
  )
}

/** «Togli» sopra l'immagine, nell'angolo; durante l'invio non c'è. */
function TogliSopra({ voce, onRimuovi }: PropsVoce) {
  if (!onRimuovi || voce.stato === "in-corso") return null
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-xs"
      className="absolute top-1 right-1"
      onClick={() => onRimuovi(voce.id)}
      aria-label={`Togli ${voce.nome}`}
    >
      <XIcon />
    </Button>
  )
}

/** Sotto il nome: la barra durante l'invio, il motivo se è fallito. */
function StatoVoce({ voce }: { voce: FileUploadItem }) {
  if (voce.stato === "in-corso") {
    return <Progress value={voce.progresso ?? 0} aria-label={voce.nome} />
  }
  if (voce.stato === "fallito" && voce.errore) {
    return (
      <span className="text-destructive-subtle-foreground">{voce.errore}</span>
    )
  }
  return null
}

const CORNICE_VOCE =
  "min-w-0 overflow-hidden rounded-lg border bg-card text-sm data-[stato=fallito]:border-destructive-border data-[stato=fallito]:bg-destructive-subtle"

function MiniaturaCompatta({ voce, onRimuovi }: PropsVoce) {
  return (
    <li
      data-slot="file-upload-miniatura"
      data-stato={voce.stato}
      className={cn("relative flex flex-col", CORNICE_VOCE)}
    >
      <Anteprima voce={voce} className="aspect-video w-full" />
      <TogliSopra voce={voce} onRimuovi={onRimuovi} />
      <div className="flex flex-col gap-1 px-2 py-1">
        <span className="truncate font-medium" title={voce.nome}>
          {voce.nome}
        </span>
        <StatoVoce voce={voce} />
      </div>
    </li>
  )
}

function SoloImmagine({ voce, onRimuovi }: PropsVoce) {
  return (
    <li
      data-slot="file-upload-miniatura"
      data-stato={voce.stato}
      title={voce.nome}
      className={cn("relative flex flex-col", CORNICE_VOCE)}
    >
      <Anteprima voce={voce} className="aspect-video w-full" />
      <TogliSopra voce={voce} onRimuovi={onRimuovi} />
      {voce.stato === "in-corso" ||
      (voce.stato === "fallito" && voce.errore) ? (
        <div className="px-2 py-1.5">
          <StatoVoce voce={voce} />
        </div>
      ) : null}
    </li>
  )
}

function RigaConImmagine({ voce, onRimuovi }: PropsVoce) {
  return (
    <li
      data-slot="file-upload-miniatura"
      data-stato={voce.stato}
      className={cn("flex items-center gap-3 p-1.5 pr-1", CORNICE_VOCE)}
    >
      <Anteprima voce={voce} className="aspect-video w-24 shrink-0 rounded-md" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-medium" title={voce.nome}>
          {voce.nome}
        </span>
        {voce.stato === "in-corso" ||
        (voce.stato === "fallito" && voce.errore) ? (
          <StatoVoce voce={voce} />
        ) : (
          <span className="text-muted-foreground tabular-nums">
            {formattaDimensione(voce.dimensione)}
          </span>
        )}
      </div>
      {onRimuovi && voce.stato !== "in-corso" ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          onClick={() => onRimuovi(voce.id)}
          aria-label={`Togli ${voce.nome}`}
        >
          <XIcon />
        </Button>
      ) : null}
    </li>
  )
}

const VOCE: Record<
  Exclude<FormaElenco, "righe">,
  (props: PropsVoce) => ReactNode
> = {
  miniature: Miniatura,
  "miniature-compatte": MiniaturaCompatta,
  "solo-immagini": SoloImmagine,
  "righe-con-immagine": RigaConImmagine,
}
