/**
 * `tassullo-pdf-preview` — anteprima PDF incorporata, con navigazione pagine
 * e zoom.
 *
 * ── D8, la seconda scelta ─────────────────────────────────────────────────
 *
 * Chiesto all'MCP prima di scrivere (regola 4bis, gradino 1): shadcn non ha
 * un `pdf-viewer` o `document-preview`. Scelto `react-pdf` (D8, la seconda
 * delle quattro dopo `react-dropzone` di M3.6): è un **wrapper sottile** su
 * `pdfjs-dist`, non un visore già confezionato — `<Document>` carica il
 * file e `<Page>` disegna una pagina su un `<canvas>`, senza una propria
 * barra strumenti da disfare. La cornice, la paginazione e lo zoom sono
 * interamente nostri, com'è per `react-dropzone` in M3.6: la condizione che
 * D8 chiede per essere sostituibile senza toccare l'API del blocco.
 *
 * **Il worker non viene da una CDN.** La via più comune per `react-pdf` è
 * puntare `pdfjs.GlobalWorkerOptions.workerSrc` a `unpkg.com`: fuori
 * questione qui, perché farebbe dipendere l'anteprima da una richiesta di
 * rete a ogni apertura — lo stesso principio per cui `tema-font` porta Inter
 * in data URI invece di Google Fonts (CLAUDE.md §Le due trappole). Lo stack
 * è uniformemente Vite (CLAUDE.md §Cos'è questo repo), quindi il worker si
 * importa con la sintassi `?url` di Vite — `pdfjs-dist` è una dipendenza
 * diretta di `react-pdf` e risolve da `node_modules` in ogni app che installa
 * questo blocco, senza toccare l'API.
 *
 * **Livello di testo e annotazioni disattivati apposta.** `react-pdf` li
 * renderizza di default sovrapposti al canvas, ma richiedono un foglio di
 * stile proprio (`AnnotationLayer.css`/`TextLayer.css`) che il registry non
 * sa distribuire (non è un file che si copia via `target`, è un import di
 * pacchetto). Questo blocco è un'**anteprima**, non un lettore con testo
 * selezionabile: `renderTextLayer={false}` e `renderAnnotationLayer={false}`
 * tolgono il bisogno di quel CSS e il problema non si pone.
 *
 * **Caricamento e errore riusano lo standard di M3.5.** Il caricamento è
 * uno `Skeleton` alto come una pagina (`h-96`, non una delle tre `variante`
 * di `page-skeleton`, pensate per tabella/scheda/elenco, non per un
 * rettangolo intero — e non un rapporto d'aspetto scritto a parentesi
 * quadre, che la regola 3 vieta); l'errore è `ErrorState` — stesso confine già
 * scritto per `file-upload`: il messaggio arriva già tradotto da chi chiama,
 * questo blocco non sa nulla del perché un PDF non si è aperto.
 *
 * **`error` da solo non basta.** Verificato in Chromium: un 404 sul file fa
 * *lanciare* `<Document>` durante il render, non passare da `onLoadError` —
 * la promessa interna di `react-pdf` rifiuta prima che il componente riesca
 * a intercettarla. `error` copre i PDF che si scaricano ma non si parsano;
 * il confine di errore React qui sotto copre il resto, con lo stesso
 * `ErrorState`.
 *
 * **La pagina si adatta alla cornice, non a una scala assoluta.** Prima
 * versione: `<Page scale={zoom}>` con `zoom` iniziale a `1`, cioè la
 * dimensione reale del PDF (spesso più larga della cornice) — a 100% la
 * pagina usciva tagliata, rilievo di Francesco su Storybook. Un
 * `ResizeObserver` misura la larghezza disponibile e `<Page width={…}>`
 * ci scala dentro: `zoom` è ora relativo a quella misura, non alla pagina
 * reale — a 100% la pagina **combacia** con la cornice, non trabocca.
 */
import { Component, useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react"
import { Document, Page, pdfjs, type DocumentProps } from "react-pdf"
// `?url` è sintassi di Vite: il worker arriva come indirizzo di un file, non come modulo.
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"

import { cn } from "cn"
import { Button } from "@/registry/tassullo/ui/button"
import { ButtonGroup } from "@/registry/tassullo/ui/button-group"
import { ErrorState } from "@/registry/tassullo/blocks/error-state"
import { Skeleton } from "@/registry/tassullo/ui/skeleton"

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const ZOOM_MIN = 0.5
const ZOOM_MAX = 2.5
const ZOOM_PASSO = 0.25

type ConfineDocumentoProps = {
  messaggio: string
  onRiprova?: () => void
  children: ReactNode
}

class ConfineDocumento extends Component<ConfineDocumentoProps, { fallito: boolean }> {
  state = { fallito: false }

  static getDerivedStateFromError() {
    return { fallito: true }
  }

  render() {
    if (this.state.fallito) {
      return <ErrorState messaggio={this.props.messaggio} onRiprova={this.props.onRiprova} />
    }
    return this.props.children
  }
}

export type PdfPreviewProps = {
  /** Lo stesso `file` di `react-pdf`: URL, `File`/`Blob` o `ArrayBuffer`. */
  file: DocumentProps["file"]
  /** Il messaggio già tradotto, se il caricamento fallisce — mai un codice, mai la risposta grezza del server. */
  messaggioErrore?: string
  onRiprova?: () => void
  className?: string
}

export function PdfPreview({
  file,
  messaggioErrore = "Il PDF non si è aperto. Riprova o scarica il file.",
  onRiprova,
  className,
}: PdfPreviewProps) {
  const [numeroPagine, setNumeroPagine] = useState<number | null>(null)
  const [pagina, setPagina] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [larghezzaContenitore, setLarghezzaContenitore] = useState<number | null>(null)
  const contenitoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = contenitoreRef.current
    if (!el) return
    const osservatore = new ResizeObserver(([voce]) => {
      const larghezza = voce?.contentRect.width
      if (larghezza) setLarghezzaContenitore(larghezza)
    })
    osservatore.observe(el)
    return () => osservatore.disconnect()
  }, [])

  return (
    <div
      data-slot="pdf-preview"
      className={cn("flex flex-col gap-3 rounded-lg border bg-muted/30 p-3", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Pagina precedente"
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Pagina successiva"
            disabled={!numeroPagine || pagina >= numeroPagine}
            onClick={() => setPagina((p) => Math.min(numeroPagine ?? p, p + 1))}
          >
            <ChevronRightIcon />
          </Button>
        </ButtonGroup>
        <span className="text-sm text-muted-foreground tabular-nums">
          Pagina {pagina} di {numeroPagine ?? "—"}
        </span>
        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Riduci"
            disabled={zoom <= ZOOM_MIN}
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_PASSO).toFixed(2)))}
          >
            <ZoomOutIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Ingrandisci"
            disabled={zoom >= ZOOM_MAX}
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_PASSO).toFixed(2)))}
          >
            <ZoomInIcon />
          </Button>
        </ButtonGroup>
        <span className="text-sm text-muted-foreground tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div
        ref={contenitoreRef}
        className="flex justify-center overflow-auto rounded-md bg-background p-4"
      >
        <ConfineDocumento
          key={typeof file === "string" ? file : undefined}
          messaggio={messaggioErrore}
          onRiprova={onRiprova}
        >
          <Document
            file={file}
            loading={<Skeleton className="h-96 w-full max-w-md" />}
            error={<ErrorState messaggio={messaggioErrore} onRiprova={onRiprova} />}
            onLoadSuccess={({ numPages }) => setNumeroPagine(numPages)}
          >
            {larghezzaContenitore ? (
              <Page
                pageNumber={pagina}
                width={larghezzaContenitore * zoom}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<Skeleton className="h-96 w-full max-w-md" />}
              />
            ) : (
              <Skeleton className="h-96 w-full max-w-md" />
            )}
          </Document>
        </ConfineDocumento>
      </div>
    </div>
  )
}
