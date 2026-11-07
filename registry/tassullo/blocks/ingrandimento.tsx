/**
 * `tassullo-ingrandimento` — un disegno o un'immagine in pagina, in scala, che
 * al tocco si apre a tutta finestra e si ingrandisce: pizzico, trascinamento e
 * doppio tocco sul telefono; rotella, «−», «+» e «Adatta» sulla scrivania;
 * `+`, `-`, `0` e le frecce da tastiera.
 *
 * Nasce dalla proposta #199 di Studio: i disegni tecnici che l'app genera, SVG
 * con quote e testi piccoli, che in pagina stanno in scala e non si leggono.
 * shadcn non ha niente del genere (chiesto all'MCP: «zoom», «lightbox»,
 * «image», «pan»; `@reui` ha solo una fila di bottoni di zoom senza gesti).
 * Gradino 4 della scala, approvato da Francesco il 2026-11-07.
 *
 * ── Si ingrandisce la misura, non l'immagine ────────────────────────────
 *
 * Lo zoom non è un `transform: scale`: è la **larghezza vera** del foglio che
 * cambia, e lo spostamento è un `translate`. Con `scale` il motore di resa può
 * ingrandire una copia già disegnata invece di ridisegnare il vettore, e il
 * disegno si sfoca proprio dove serve leggerlo; con la misura il browser
 * disegna l'SVG alla grandezza a cui lo si guarda, quindi nitido per
 * costruzione. È lo stesso principio di `tassullo-pdf-preview`.
 *
 * ── Due stati: quello che si vede e quello che chiedono i gesti ────────
 *
 * La vista (`scala`, `x`, `y`) sta in uno stato per disegnare e in un `ref`
 * per i gestori: fra due eventi di puntatore React non ha ancora ridisegnato,
 * e un gestore che leggesse lo stato partirebbe dal valore di due eventi fa.
 * Il `ref` si scrive solo dentro i gestori, mai durante il render. I limiti
 * (da «Adatta» a 8×, il foglio che non esce dalla finestra) si applicano a
 * ogni passo, perché la misura dell'area cambia ruotando il telefono.
 *
 * ── Safari sulla scrivania ──────────────────────────────────────────────
 *
 * Il pizzico del trackpad in Chromium e Firefox arriva come rotella con
 * `ctrlKey`; in Safari arriva come `gesturestart`/`gesturechange`, che
 * Playwright non sa simulare. Si ascoltano tutti e due; i `gesture*` si
 * ignorano mentre ci sono dita sullo schermo, perché su iOS arrivano insieme ai
 * Pointer Events e lo zoom si raddoppierebbe.
 */
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react"
import { cn } from "cn"
import { XIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/registry/tassullo/ui/dialog"
import { Button } from "@/registry/tassullo/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/registry/tassullo/ui/button-group"
import { intero } from "@/registry/tassullo/lib/numeri"

// L'ingrandimento va da «Adatta» (1) a otto volte tanto; «+» e «−» moltiplicano
// e dividono per una volta e mezza, il doppio tocco porta a due volte.
const SCALA_MAX = 8
const PASSO = 1.5
const SCALA_DOPPIO = 2
// Le frecce spostano di un decimo dell'area.
const SPOSTA = 0.1
// Un tocco è breve e fermo; il secondo, per essere doppio, arriva presto e vicino.
const TOCCO_MS = 300
const TOCCO_FERMO = 10
const DOPPIO_MS = 300
const DOPPIO_VICINO = 32

type Vista = { scala: number; x: number; y: number }
type Misure = { larghezza: number; altezza: number; margine: number }
type Punto = { x: number; y: number }

const VISTA_ADATTA: Vista = { scala: 1, x: 0, y: 0 }

const entro = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** La misura del foglio ad «Adatta»: intero dentro l'area, col margine. */
function adattata(m: Misure, rapporto: number) {
  const lw = Math.max(1, m.larghezza - 2 * m.margine)
  const lh = Math.max(1, m.altezza - 2 * m.margine)
  return lw / lh > rapporto ? { w: lh * rapporto, h: lh } : { w: lw, h: lw / rapporto }
}

/**
 * La vista dentro i limiti: la scala fra 1 e `SCALA_MAX`; su ogni asse, se il
 * foglio sta nell'area si centra, se è più grande non lascia un bordo vuoto.
 */
function limita(v: Vista, m: Misure, rapporto: number): Vista {
  const base = adattata(m, rapporto)
  const scala = entro(v.scala, 1, SCALA_MAX)
  const w = base.w * scala
  const h = base.h * scala
  const x = w <= m.larghezza ? (m.larghezza - w) / 2 : entro(v.x, m.larghezza - w, 0)
  const y = h <= m.altezza ? (m.altezza - h) / 2 : entro(v.y, m.altezza - h, 0)
  return { scala, x, y }
}

/**
 * Il rapporto larghezza/altezza del contenuto: dal `viewBox` dell'SVG, o dalla
 * misura naturale dell'immagine. `null` se non si sa ancora.
 */
function leggiRapporto(el: Element | null): number | null {
  const svg = el?.querySelector("svg")
  if (svg) {
    const vb = svg.viewBox.baseVal
    if (vb && vb.width > 0 && vb.height > 0) return vb.width / vb.height
    const w = svg.width.baseVal.value
    const h = svg.height.baseVal.value
    if (w > 0 && h > 0) return w / h
  }
  const img = el?.querySelector("img")
  if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
    return img.naturalWidth / img.naturalHeight
  }
  return null
}

/** Il contenuto: un nodo React, di solito un `<svg>`, oppure un'immagine da `src`. */
export type SorgenteIngrandimento =
  | {
      /** Il disegno, di solito un `<svg>` con `viewBox`. Resta vettoriale a ogni ingrandimento. */
      children: ReactNode
      src?: undefined
      alt?: undefined
    }
  | {
      /** L'indirizzo dell'immagine. */
      src: string
      /** Il testo alternativo dell'immagine. Di serie il titolo. */
      alt?: string
      children?: undefined
    }

function Contenuto({
  sorgente,
  alt,
  onCaricata,
}: {
  sorgente: SorgenteIngrandimento
  alt: string
  onCaricata?: () => void
}) {
  if (sorgente.src !== undefined) {
    return (
      <img
        src={sorgente.src}
        alt={sorgente.alt ?? alt}
        draggable={false}
        className="object-contain"
        onLoad={onCaricata}
      />
    )
  }
  return <>{sorgente.children}</>
}

export type AreaIngrandimentoProps = SorgenteIngrandimento & {
  /** Il nome dell'area per chi usa un lettore di schermo: di solito il titolo del disegno. */
  etichetta: string
  /**
   * Larghezza diviso altezza del contenuto. Di serie si legge dal `viewBox`
   * dell'SVG o dalla misura dell'immagine.
   */
  rapporto?: number
  /** L'area che si ingrandisce, per darle il fuoco all'apertura. */
  refArea?: RefObject<HTMLDivElement | null>
  className?: string
}

/**
 * La superficie che si ingrandisce, con i comandi sotto. Riempie il suo
 * contenitore, che deve avere un'altezza.
 */
export function AreaIngrandimento({
  etichetta,
  rapporto,
  refArea,
  className,
  ...sorgente
}: AreaIngrandimentoProps) {
  const areaNostra = useRef<HTMLDivElement>(null)
  const area = refArea ?? areaNostra
  const foglio = useRef<HTMLDivElement>(null)

  const [misure, setMisure] = useState<Misure | null>(null)
  const [rapportoLetto, setRapportoLetto] = useState<number | null>(null)
  const [vista, setVista] = useState<Vista>(VISTA_ADATTA)
  const rapportoUsato = rapporto ?? rapportoLetto

  // Per i gestori: l'ultima vista chiesta e le misure correnti.
  const vistaRef = useRef<Vista>(VISTA_ADATTA)
  const misureRef = useRef<Misure | null>(null)
  const rapportoRef = useRef<number | null>(null)

  const puntatori = useRef(new Map<number, Punto>())
  const pizzico = useRef<{ distanza: number; scala: number; u: number; v: number } | null>(null)
  const tocco = useRef<{ id: number; inizio: number; da: Punto; mosso: boolean } | null>(null)
  const ultimoTocco = useRef<{ t: number; p: Punto } | null>(null)
  const gesto = useRef<{ scala: number } | null>(null)

  const aiuto = useId()
  // Il rapporto dato da chi chiama vince su quello letto dal contenuto.
  const rapportoCorrente = () => rapporto ?? rapportoRef.current

  const imposta = (v: Vista) => {
    const m = misureRef.current
    const r = rapportoCorrente()
    const nuova = m && r ? limita(v, m, r) : v
    vistaRef.current = nuova
    setVista(nuova)
  }

  /** Porta la scala a `scala` tenendo fermo il punto `p` dell'area. */
  const zoomIntorno = (scala: number, p: Punto) => {
    const m = misureRef.current
    const r = rapportoCorrente()
    if (!m || !r) return
    const base = adattata(m, r)
    const prima = limita(vistaRef.current, m, r)
    const u = (p.x - prima.x) / (base.w * prima.scala)
    const v = (p.y - prima.y) / (base.h * prima.scala)
    const s = entro(scala, 1, SCALA_MAX)
    imposta({ scala: s, x: p.x - u * base.w * s, y: p.y - v * base.h * s })
  }

  const centro = (): Punto => {
    const m = misureRef.current
    return m ? { x: m.larghezza / 2, y: m.altezza / 2 } : { x: 0, y: 0 }
  }

  const sposta = (dx: number, dy: number) => {
    const m = misureRef.current
    const r = rapportoCorrente()
    if (!m || !r) return
    const prima = limita(vistaRef.current, m, r)
    imposta({ ...prima, x: prima.x + dx, y: prima.y + dy })
  }

  const ingrandisci = () => zoomIntorno(vistaRef.current.scala * PASSO, centro())
  const riduci = () => zoomIntorno(vistaRef.current.scala / PASSO, centro())
  const adatta = () => imposta(VISTA_ADATTA)

  // Il rapporto del contenuto, letto dal DOM: dal `viewBox`, o dall'immagine
  // quando ha finito di caricare.
  const leggiDalContenuto = () => {
    if (rapporto) return
    const r = leggiRapporto(foglio.current)
    if (r) {
      rapportoRef.current = r
      setRapportoLetto(r)
    }
  }

  // Le misure dell'area, lette quando cambiano.
  const misura = useEffectEvent(() => {
    const el = area.current
    if (!el) return
    const stile = getComputedStyle(el)
    const m: Misure = {
      larghezza: el.clientWidth,
      altezza: el.clientHeight,
      margine: Number.parseFloat(stile.paddingLeft) || 0,
    }
    misureRef.current = m
    setMisure(m)
    leggiDalContenuto()
  })

  useEffect(() => {
    const el = area.current
    if (!el) return
    const osservatore = new ResizeObserver(() => misura())
    osservatore.observe(el)
    return () => osservatore.disconnect()
  }, [area])

  // La rotella e i gesti del trackpad di Safari: ascoltatori non passivi,
  // perché `preventDefault` fermi lo scorrimento e lo zoom della pagina.
  // Quelli di React sono passivi e non lo possono fare.
  const ruota = useEffectEvent((e: WheelEvent) => {
    e.preventDefault()
    const el = area.current
    if (!el) return
    const passo = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1
    // Il pizzico del trackpad (rotella con `ctrlKey`) dà passi piccoli e fitti,
    // la rotella del mouse passi grandi e radi: due sensibilità.
    const fattore = Math.exp(-e.deltaY * passo * (e.ctrlKey ? 0.01 : 0.002))
    const r = el.getBoundingClientRect()
    zoomIntorno(vistaRef.current.scala * fattore, { x: e.clientX - r.left, y: e.clientY - r.top })
  })

  const gestoInizia = useEffectEvent((e: Event) => {
    e.preventDefault()
    if (puntatori.current.size > 0) return
    gesto.current = { scala: vistaRef.current.scala }
  })

  const gestoCambia = useEffectEvent((e: Event & { scale?: number; clientX?: number; clientY?: number }) => {
    e.preventDefault()
    const el = area.current
    if (!el || !gesto.current || puntatori.current.size > 0 || !e.scale) return
    const r = el.getBoundingClientRect()
    const p =
      e.clientX !== undefined && e.clientY !== undefined
        ? { x: e.clientX - r.left, y: e.clientY - r.top }
        : centro()
    zoomIntorno(gesto.current.scala * e.scale, p)
  })

  useEffect(() => {
    const el = area.current
    if (!el) return
    const suRuota = (e: WheelEvent) => ruota(e)
    const suInizia = (e: Event) => gestoInizia(e)
    const suCambia = (e: Event) => gestoCambia(e)
    const suFine = (e: Event) => {
      e.preventDefault()
      gesto.current = null
    }
    el.addEventListener("wheel", suRuota, { passive: false })
    el.addEventListener("gesturestart", suInizia)
    el.addEventListener("gesturechange", suCambia)
    el.addEventListener("gestureend", suFine)
    return () => {
      el.removeEventListener("wheel", suRuota)
      el.removeEventListener("gesturestart", suInizia)
      el.removeEventListener("gesturechange", suCambia)
      el.removeEventListener("gestureend", suFine)
    }
  }, [area])

  // Il livello annunciato a chi usa un lettore di schermo: quando il gesto si
  // ferma, non a ogni passo del pizzico.
  const percento = Math.round(vista.scala * 100)
  const [annuncio, setAnnuncio] = useState("")
  const primoAnnuncio = useRef(true)
  useEffect(() => {
    if (primoAnnuncio.current) {
      primoAnnuncio.current = false
      return
    }
    const t = setTimeout(() => setAnnuncio(`Ingrandimento ${intero(percento)}%`), 400)
    return () => clearTimeout(t)
  }, [percento])

  const punto = (e: PointerEvent<HTMLDivElement>): Punto => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const iniziaPizzico = () => {
    const m = misureRef.current
    const r = rapportoCorrente()
    const [a, b] = [...puntatori.current.values()]
    if (!m || !r || !a || !b) return
    const base = adattata(m, r)
    const v = limita(vistaRef.current, m, r)
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    pizzico.current = {
      distanza: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
      scala: v.scala,
      u: (mx - v.x) / (base.w * v.scala),
      v: (my - v.y) / (base.h * v.scala),
    }
  }

  const giu = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    // Col puntatore catturato il trascinamento continua anche fuori dall'area.
    // Un evento costruito a mano non ha un puntatore vero dietro, e la cattura
    // lancia: senza cattura il gesto funziona lo stesso.
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // nessun puntatore da catturare
    }
    const p = punto(e)
    puntatori.current.set(e.pointerId, p)
    if (puntatori.current.size === 1) {
      tocco.current = { id: e.pointerId, inizio: e.timeStamp, da: p, mosso: false }
    } else {
      tocco.current = null
      ultimoTocco.current = null
      if (puntatori.current.size === 2) iniziaPizzico()
    }
  }

  const muovi = (e: PointerEvent<HTMLDivElement>) => {
    const prima = puntatori.current.get(e.pointerId)
    if (!prima) return
    const p = punto(e)
    puntatori.current.set(e.pointerId, p)
    if (tocco.current?.id === e.pointerId) {
      if (Math.hypot(p.x - tocco.current.da.x, p.y - tocco.current.da.y) > TOCCO_FERMO) {
        tocco.current.mosso = true
      }
    }
    if (puntatori.current.size === 1) {
      sposta(p.x - prima.x, p.y - prima.y)
      return
    }
    const pz = pizzico.current
    const m = misureRef.current
    const r = rapportoCorrente()
    const [a, b] = [...puntatori.current.values()]
    if (!pz || !m || !r || !a || !b) return
    // Il punto del foglio che stava fra le dita resta fra le dita: così il
    // pizzico ingrandisce e sposta insieme.
    const base = adattata(m, r)
    const s = entro((pz.scala * Math.hypot(a.x - b.x, a.y - b.y)) / pz.distanza, 1, SCALA_MAX)
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    imposta({ scala: s, x: mx - pz.u * base.w * s, y: my - pz.v * base.h * s })
  }

  const su = (e: PointerEvent<HTMLDivElement>) => {
    if (!puntatori.current.has(e.pointerId)) return
    const p = punto(e)
    puntatori.current.delete(e.pointerId)
    if (puntatori.current.size < 2) pizzico.current = null
    // Da due dita a una: si riparte col pizzico per le dita che restano, se tornano due.
    if (puntatori.current.size === 2) iniziaPizzico()

    const t = tocco.current
    tocco.current = null
    if (e.type !== "pointerup" || !t || t.id !== e.pointerId || t.mosso) return
    if (e.timeStamp - t.inizio > TOCCO_MS) return
    const prima = ultimoTocco.current
    if (
      prima &&
      e.timeStamp - prima.t < DOPPIO_MS &&
      Math.hypot(p.x - prima.p.x, p.y - prima.p.y) < DOPPIO_VICINO
    ) {
      ultimoTocco.current = null
      // Ingrandito, torna ad «Adatta»; adattato, ingrandisce sul punto toccato.
      if (vistaRef.current.scala > 1.01) adatta()
      else zoomIntorno(SCALA_DOPPIO, p)
    } else {
      ultimoTocco.current = { t: e.timeStamp, p }
    }
  }

  const tasti = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    const m = misureRef.current
    const passoX = (m?.larghezza ?? 0) * SPOSTA
    const passoY = (m?.altezza ?? 0) * SPOSTA
    const azioni: Record<string, () => void> = {
      "+": ingrandisci,
      "=": ingrandisci,
      "-": riduci,
      _: riduci,
      "0": adatta,
      ArrowLeft: () => sposta(passoX, 0),
      ArrowRight: () => sposta(-passoX, 0),
      ArrowUp: () => sposta(0, passoY),
      ArrowDown: () => sposta(0, -passoY),
    }
    const azione = azioni[e.key]
    if (!azione) return
    e.preventDefault()
    azione()
  }

  const pronta = misure !== null && rapportoUsato !== null
  const v = pronta ? limita(vista, misure, rapportoUsato) : vista
  const base = pronta ? adattata(misure, rapportoUsato) : null
  const adattato = v.scala <= 1.001

  return (
    <div
      data-slot="ingrandimento-area"
      className={cn("flex min-h-0 flex-col", className)}
      onKeyDown={tasti}
    >
      <div
        ref={area}
        role="region"
        aria-label={etichetta}
        aria-roledescription="disegno ingrandibile"
        aria-describedby={aiuto}
        tabIndex={0}
        onPointerDown={giu}
        onPointerMove={muovi}
        onPointerUp={su}
        onPointerCancel={su}
        className={cn(
          "relative min-h-0 flex-1 touch-none overflow-hidden overscroll-contain bg-muted p-4 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset",
          adattato ? "cursor-zoom-in" : "cursor-grab active:cursor-grabbing",
        )}
      >
        <div
          ref={foglio}
          data-slot="ingrandimento-foglio"
          className={cn(
            "absolute top-0 left-0 bg-background text-foreground shadow-sm *:pointer-events-none *:block *:size-full",
            !pronta && "invisible",
          )}
          style={
            base
              ? {
                  width: base.w * v.scala,
                  height: base.h * v.scala,
                  transform: `translate(${v.x}px, ${v.y}px)`,
                }
              : undefined
          }
        >
          <Contenuto sorgente={sorgente} alt={etichetta} onCaricata={leggiDalContenuto} />
        </div>
      </div>

      <div
        data-slot="ingrandimento-comandi"
        className="flex flex-wrap items-center justify-center gap-2 border-t bg-background p-2"
      >
        {/* La percentuale ha una larghezza minima, o «Ingrandisci» si sposterebbe
            passando da 100% a 150%. */}
        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Riduci"
            focusableWhenDisabled
            className="aria-disabled:opacity-50"
            disabled={adattato}
            onClick={riduci}
          >
            <ZoomOutIcon />
          </Button>
          <ButtonGroupText className="min-w-16 justify-center bg-background font-normal text-muted-foreground tabular-nums dark:border-input dark:bg-input/30">
            {`${intero(percento)}%`}
          </ButtonGroupText>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Ingrandisci"
            focusableWhenDisabled
            className="aria-disabled:opacity-50"
            disabled={v.scala >= SCALA_MAX - 0.001}
            onClick={ingrandisci}
          >
            <ZoomInIcon />
          </Button>
        </ButtonGroup>
        <Button
          type="button"
          variant="outline"
          focusableWhenDisabled
          className="aria-disabled:opacity-50"
          disabled={adattato}
          onClick={adatta}
        >
          Adatta
        </Button>
        <span id={aiuto} className="sr-only">
          Con più e meno si ingrandisce, con le frecce ci si sposta, con zero si adatta alla finestra.
        </span>
        <span role="status" className="sr-only">
          {annuncio}
        </span>
      </div>
    </div>
  )
}

export type IngrandimentoProps = SorgenteIngrandimento & {
  /** Il titolo del disegno: sta in testa all'ingrandimento e dà il nome al bottone. */
  titolo: string
  /** Una riga sotto il titolo, nell'ingrandimento. */
  descrizione?: string
  /** Larghezza diviso altezza. Di serie si legge dal `viewBox` o dall'immagine. */
  rapporto?: number
  /** Le classi dell'anteprima in pagina, per esempio una larghezza massima. */
  className?: string
}

/**
 * Il disegno in pagina, in scala; al tocco, lo stesso disegno a tutta finestra
 * e ingrandibile.
 */
export function Ingrandimento({
  titolo,
  descrizione,
  rapporto,
  className,
  ...sorgente
}: IngrandimentoProps) {
  const anteprima = useRef<HTMLSpanElement>(null)
  const refArea = useRef<HTMLDivElement>(null)
  const [rapportoLetto, setRapportoLetto] = useState<number | null>(null)
  const rapportoUsato = rapporto ?? rapportoLetto

  const leggiDalContenuto = () => {
    if (rapporto) return
    const r = leggiRapporto(anteprima.current)
    if (r) setRapportoLetto(r)
  }
  const leggi = useEffectEvent(leggiDalContenuto)

  useEffect(() => {
    const el = anteprima.current
    if (!el) return
    const osservatore = new ResizeObserver(() => leggi())
    osservatore.observe(el)
    return () => osservatore.disconnect()
  }, [])

  return (
    <Dialog>
      <DialogTrigger
        data-slot="ingrandimento-anteprima"
        aria-label={`Ingrandisci ${titolo}`}
        className={cn(
          "relative block w-full cursor-zoom-in overflow-hidden rounded-md border bg-background text-foreground transition-colors outline-none hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
          className,
        )}
      >
        {/* Un `span` e non un `div`: dentro un bottone ci va solo testo in riga. */}
        <span
          ref={anteprima}
          aria-hidden
          className="block *:pointer-events-none *:block *:size-full"
          style={rapportoUsato ? { aspectRatio: rapportoUsato } : undefined}
        >
          <Contenuto sorgente={sorgente} alt="" onCaricata={leggiDalContenuto} />
        </span>
        <span className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-md border bg-background text-muted-foreground">
          <ZoomInIcon aria-hidden className="size-4" />
        </span>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        initialFocus={refArea}
        className="top-0 left-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 ring-0 sm:max-w-none"
      >
        <div className="flex items-center gap-3 border-b py-2 pr-2 pl-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle className="truncate leading-snug">{titolo}</DialogTitle>
            {descrizione ? (
              <DialogDescription className="truncate">{descrizione}</DialogDescription>
            ) : null}
          </div>
          <DialogClose render={<Button variant="ghost" size="icon" aria-label="Chiudi" />}>
            <XIcon />
          </DialogClose>
        </div>
        <AreaIngrandimento
          {...sorgente}
          etichetta={titolo}
          rapporto={rapportoUsato ?? undefined}
          refArea={refArea}
          className="flex-1"
        />
      </DialogContent>
    </Dialog>
  )
}
