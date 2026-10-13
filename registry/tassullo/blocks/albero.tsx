/**
 * `tassullo-albero` — le righe annidate di una struttura, con la riga scelta.
 * Proposta #125 (Anagrafe), 13 ottobre 2026: l'albero dei blocchi di una
 * scheda tecnica, che l'app componeva con `Button` ghost e sei classi forzate.
 *
 * ── La scala ─────────────────────────────────────────────────────────────
 *
 * shadcn non ha un albero. Quello della `data-table` (`getSottoRighe`) è una
 * tabella: colonne, ordinamento, righe che si aprono. Qui non ci sono colonne
 * e niente si apre o si chiude: è l'indice di un documento, e la riga scelta
 * decide cosa mostra il riquadro accanto.
 *
 * ── Lista con `aria-current`, non `tree` ─────────────────────────────────
 *
 * Il ruolo `tree` di ARIA vuole che ogni riga sia un `treeitem` senza
 * controlli dentro: il menu di riga non ci può stare, e andrebbe portato
 * fuori dall'albero o su un tasto di scelta rapida. Un `treeitem` inoltre si
 * «seleziona», mentre qui la riga scelta dice dove si è, come la voce attiva
 * di un indice. Quindi: una `nav` col suo nome, liste annidate (il livello lo
 * dice l'annidamento, che i lettori di schermo annunciano da sé), un bottone
 * per riga con `aria-current`, il menu accanto. Dal `tree` si prende solo la
 * tastiera: una fermata del `Tab` e le frecce.
 *
 * ── Il riordino ──────────────────────────────────────────────────────────
 *
 * Fra fratelli, con `@dnd-kit` come le righe di `tassullo-data-table`. Si
 * trascina la riga intera, senza maniglia: il sensore parte dopo sei pixel,
 * quindi il clic resta un clic. Il sensore da tastiera non c'è, perché
 * `Invio` e `Spazio` sulla riga scelgono: da tastiera si riordina dal menu di
 * riga, dove il blocco aggiunge «Sposta su» e «Sposta giù». Sotto un altro
 * padre non si sposta ancora.
 */
"use client"

import * as React from "react"
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import { AlertCircleIcon, ArrowDownIcon, ArrowUpIcon, EllipsisVerticalIcon } from "lucide-react"

import { Button } from "@/registry/tassullo/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/tassullo/ui/dropdown-menu"

export type NodoAlbero = {
  id: string
  /** Il titolo della riga. Se è lungo va a capo. */
  titolo: React.ReactNode
  /**
   * Il nome della riga nel nome del suo menu («Azioni: …»), quando il titolo
   * non è un testo.
   */
  nome?: string
  figli?: readonly NodoAlbero[]
}

/** Dove sta una riga: serve a decidere cosa offrire nel suo menu. */
export type PostoAlbero<TNodo extends NodoAlbero = NodoAlbero> = {
  /** Il livello, da 1. */
  livello: number
  /** La riga che la contiene, o `null` al primo livello. */
  padre: TNodo | null
  /** Il posto fra le righe dello stesso padre, da 0. */
  indice: number
  /** Quante sono le righe dello stesso padre. */
  fratelli: number
  /**
   * Da chiamare nel clic di una voce del menu che porta il fuoco altrove,
   * per esempio su un campo che compare: chiuso il menu, il fuoco non torna
   * al suo bottone. `dove` restituisce l'elemento che lo prende, ed è letto
   * a menu chiuso, quando l'elemento c'è; senza `dove` il fuoco lo sposta
   * l'app.
   */
  fuocoAltrove: (dove?: () => HTMLElement | null) => void
}

/** Lo spostamento di una riga: lo stesso padre, un altro posto. */
export type MossaAlbero = {
  id: string
  /** La riga che la contiene, o `null` al primo livello. */
  padre: string | null
  /** Il posto di arrivo fra le righe dello stesso padre, da 0. */
  indice: number
}

/** Ciò che `ref` riceve. */
export type AlberoRef = {
  /** Porta il fuoco su una riga; senza argomento, sulla riga scelta. */
  focus: (id?: string) => void
}

export type AlberoProps<TNodo extends NodoAlbero = NodoAlbero> = {
  /** Il nome dell'albero per i lettori di schermo. */
  etichetta: string
  nodi: readonly TNodo[]
  /** La riga scelta. */
  scelto?: string | null
  onScegli?: (id: string, nodo: TNodo) => void
  /**
   * Il segno a destra del titolo: lo stato della riga, deciso dall'app. Di
   * solito un `AlberoSegno` o un `AlberoConto`.
   */
  segno?: (nodo: TNodo, posto: PostoAlbero<TNodo>) => React.ReactNode
  /**
   * Le voci del menu di una riga, come `DropdownMenuItem`. Senza, la riga non
   * ha menu, a meno che ci sia `onSposta`.
   */
  menu?: (nodo: TNodo, posto: PostoAlbero<TNodo>) => React.ReactNode
  /**
   * Accende il riordino fra le righe dello stesso padre: trascinando la riga,
   * e dal menu con «Sposta su» e «Sposta giù». L'albero non tiene l'ordine:
   * l'app applica la mossa ai suoi dati.
   */
  onSposta?: (mossa: MossaAlbero) => void
  /** Menu e riordino sono fermi; le righe si scelgono ancora. */
  fermo?: boolean
  ref?: React.Ref<AlberoRef>
  className?: string
}

// Il rientro di una riga e lo stile del suo titolo, per livello. Dal quinto in
// giù il rientro non cresce più: il titolo non avrebbe posto.
const RIENTRO = ["pl-2", "pl-6", "pl-10", "pl-14", "pl-18"]
const TITOLO = [
  "text-sm font-semibold",
  "text-xs font-semibold tracking-wide uppercase",
  "text-sm font-normal",
]

type Comuni<TNodo extends NodoAlbero> = Pick<AlberoProps<TNodo>, "segno" | "menu" | "onSposta"> & {
  scelto: string | null
  fermata: string | null
  fermo: boolean
  onScegli: (nodo: TNodo) => void
  onTasto: (evento: React.KeyboardEvent<HTMLElement>) => void
  onAttiva: (id: string) => void
  fuocoAltrove: (dove?: () => HTMLElement | null) => void
  tornaAlBottone: () => boolean | HTMLElement
}

// Il nome di una riga dove serve un testo: il suo `nome`, o il titolo se è
// già un testo.
function nomeDi(nodo: NodoAlbero) {
  if (nodo.nome) return nodo.nome
  return typeof nodo.titolo === "string" || typeof nodo.titolo === "number" ? String(nodo.titolo) : ""
}

// L'antenato che scorre per conto suo, se c'è: è lì dentro che la riga
// scelta si tiene in vista. La pagina non si tocca.
function riquadroCheScorre(elemento: HTMLElement) {
  for (let su = elemento.parentElement; su && su !== document.body; su = su.parentElement) {
    const scorre = getComputedStyle(su).overflowY
    if ((scorre === "auto" || scorre === "scroll") && su.scrollHeight > su.clientHeight) return su
  }
  return null
}

// Una riga trascinata si confronta solo con le righe dello stesso padre.
// Conta la riga sotto il puntatore, con le sue righe interne: un capitolo
// alto non si misura dal suo centro. Fuori da ogni riga, la più vicina.
const fraFratelli: CollisionDetection = (argomenti) => {
  const padre = argomenti.active.data.current?.padre
  const fratelli = {
    ...argomenti,
    droppableContainers: argomenti.droppableContainers.filter(
      (posto) => posto.data.current?.padre === padre
    ),
  }
  const sotto = pointerWithin(fratelli)
  return sotto.length > 0 ? sotto : closestCenter(fratelli)
}

/**
 * Le righe annidate di una struttura, con la riga scelta: l'indice di un
 * documento accanto al suo contenuto.
 */
export function Albero<TNodo extends NodoAlbero = NodoAlbero>({
  etichetta,
  nodi,
  scelto = null,
  onScegli,
  segno,
  menu,
  onSposta,
  fermo = false,
  ref,
  className,
}: AlberoProps<TNodo>) {
  const radice = React.useRef<HTMLElement>(null)
  const idContesto = React.useId()
  // La riga col fuoco: finché il fuoco resta nell'albero è lei la fermata del
  // `Tab`. Fuori dall'albero la fermata è la riga scelta, o la prima.
  const [attiva, setAttiva] = React.useState<string | null>(null)

  const righe = () => [...(radice.current?.querySelectorAll<HTMLElement>("[data-slot=albero-voce]") ?? [])]
  const rigaDi = (id: string | null) => righe().find((riga) => riga.dataset.id === id)

  const fermata = attiva ?? scelto ?? nodi[0]?.id ?? null

  React.useImperativeHandle(ref, () => ({
    focus: (id) => (rigaDi(id ?? scelto) ?? righe()[0])?.focus(),
  }))

  // La riga scelta resta in vista dentro il riquadro che scorre.
  React.useEffect(() => {
    const riga = rigaDi(scelto)
    const riquadro = riga ? riquadroCheScorre(riga) : null
    if (!riga || !riquadro) return
    const suo = riga.getBoundingClientRect()
    const intorno = riquadro.getBoundingClientRect()
    if (suo.top < intorno.top) riquadro.scrollTop -= intorno.top - suo.top
    else if (suo.bottom > intorno.bottom) riquadro.scrollTop += suo.bottom - intorno.bottom
    // `rigaDi` legge il DOM: conta la sola riga scelta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scelto])

  const onTasto = React.useCallback((evento: React.KeyboardEvent<HTMLElement>) => {
    const tutte = righe()
    const qui = tutte.indexOf(evento.currentTarget)
    const verso: Record<string, number> = {
      ArrowDown: qui + 1,
      ArrowUp: qui - 1,
      Home: 0,
      End: tutte.length - 1,
    }
    const arrivo = tutte[verso[evento.key] ?? -1]
    if (!arrivo) return
    evento.preventDefault()
    arrivo.focus()
  }, [])

  // Chiuso un menu, il fuoco torna al suo bottone, a meno che la voce scelta
  // non l'abbia portato altrove. Un menu solo è aperto alla volta.
  const altrove = React.useRef<true | (() => HTMLElement | null) | null>(null)
  const fuocoAltrove = React.useCallback((dove?: () => HTMLElement | null) => {
    altrove.current = dove ?? true
  }, [])
  const tornaAlBottone = React.useCallback(() => {
    const via = altrove.current
    altrove.current = null
    if (via === null) return true
    // L'elemento indicato, se c'è; sennò il fuoco resta a chi l'ha preso.
    return (via === true ? null : via()) ?? false
  }, [])

  const sensori = useSensors(
    // Sei pixel prima di partire: il clic sulla riga resta un clic.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Col dito si parte tenendo premuto: lo scorrimento resta uno scorrimento.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  function finito(evento: DragEndEvent) {
    const { active, over } = evento
    if (!over || active.id === over.id) return
    const arrivo = over.data.current as { padre: string | null; indice: number } | undefined
    if (!arrivo || arrivo.padre !== active.data.current?.padre) return
    onSposta?.({ id: String(active.id), padre: arrivo.padre, indice: arrivo.indice })
  }

  const comuni: Comuni<TNodo> = {
    segno,
    menu,
    onSposta,
    scelto,
    fermata,
    fermo,
    onScegli: (nodo) => onScegli?.(nodo.id, nodo),
    onTasto,
    onAttiva: setAttiva,
    fuocoAltrove,
    tornaAlBottone,
  }

  const lista = <Lista nodi={nodi} padre={null} livello={1} comuni={comuni} />

  return (
    <nav
      ref={radice}
      data-slot="albero"
      aria-label={etichetta}
      className={cn("flex flex-col", className)}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setAttiva(null)
      }}
    >
      {onSposta && !fermo ? (
        <DndContext
          id={idContesto}
          sensors={sensori}
          collisionDetection={fraFratelli}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={finito}
          accessibility={{ announcements: ANNUNCI, screenReaderInstructions: { draggable: "" } }}
        >
          {lista}
        </DndContext>
      ) : (
        lista
      )}
    </nav>
  )
}

// Il riordino col puntatore non ha niente da annunciare che chi lo fa non
// veda: gli annunci di serie, in inglese, si spengono.
const ANNUNCI = {
  onDragStart: () => undefined,
  onDragOver: () => undefined,
  onDragEnd: () => undefined,
  onDragCancel: () => undefined,
}

function Lista<TNodo extends NodoAlbero>({
  nodi,
  padre,
  livello,
  comuni,
}: {
  nodi: readonly TNodo[]
  padre: TNodo | null
  livello: number
  comuni: Comuni<TNodo>
}) {
  const righe = nodi.map((nodo, indice) => (
    <Riga key={nodo.id} nodo={nodo} padre={padre} livello={livello} indice={indice} fratelli={nodi.length} comuni={comuni} />
  ))
  return (
    <ul data-slot="albero-lista" className="flex flex-col gap-0.5">
      {comuni.onSposta && !comuni.fermo ? (
        <SortableContext items={nodi.map((nodo) => nodo.id)} strategy={verticalListSortingStrategy}>
          {righe}
        </SortableContext>
      ) : (
        righe
      )}
    </ul>
  )
}

function Riga<TNodo extends NodoAlbero>({
  nodo,
  padre,
  livello,
  indice,
  fratelli,
  comuni,
}: {
  nodo: TNodo
  padre: TNodo | null
  livello: number
  indice: number
  fratelli: number
  comuni: Comuni<TNodo>
}) {
  const { scelto, fermata, fermo, onSposta } = comuni
  const scelta = nodo.id === scelto
  const laFermata = nodo.id === fermata
  const spostabile = Boolean(onSposta) && !fermo
  const posto: PostoAlbero<TNodo> = { livello, padre, indice, fratelli, fuocoAltrove: comuni.fuocoAltrove }
  // Fuori da un `DndContext` l'aggancio non fa niente: la riga è una riga.
  const { listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: nodo.id,
    data: { padre: padre?.id ?? null, indice },
    disabled: !spostabile,
  })

  const nome = nomeDi(nodo)
  const voci = comuni.menu?.(nodo, posto)
  const conMenu = Boolean(voci) || Boolean(onSposta)
  const figli = (nodo.figli ?? []) as readonly TNodo[]

  return (
    <li
      ref={spostabile ? setNodeRef : undefined}
      data-slot="albero-nodo"
      // Solo lo spostamento, non la scala: una riga col titolo su due righe
      // non si schiaccia passando accanto a una più bassa.
      style={spostabile ? { transform: CSS.Translate.toString(transform), transition } : undefined}
      className={cn("flex flex-col gap-0.5", isDragging && "relative z-10 opacity-80")}
    >
      <div
        data-slot="albero-riga"
        data-scelta={scelta ? "" : undefined}
        className={cn(
          "group/riga flex items-center gap-1 rounded-md pr-1",
          scelta ? "bg-muted" : "hover:bg-muted/50",
          isDragging && "bg-muted"
        )}
      >
        <button
          ref={spostabile ? setActivatorNodeRef : undefined}
          type="button"
          data-slot="albero-voce"
          data-id={nodo.id}
          aria-current={scelta ? "true" : undefined}
          tabIndex={laFermata ? 0 : -1}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-md border border-transparent py-1.5 pr-1 text-left outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30",
            RIENTRO[Math.min(livello, RIENTRO.length) - 1],
            spostabile && "touch-manipulation"
          )}
          onClick={() => comuni.onScegli(nodo)}
          onKeyDown={comuni.onTasto}
          onFocus={() => comuni.onAttiva(nodo.id)}
          {...(spostabile ? listeners : undefined)}
        >
          <span
            data-slot="albero-titolo"
            className={cn("min-w-0 flex-1 break-words", TITOLO[Math.min(livello, TITOLO.length) - 1])}
          >
            {nodo.titolo}
          </span>
          {comuni.segno?.(nodo, posto)}
        </button>
        {conMenu ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={nome ? `Azioni: ${nome}` : "Azioni"}
                  tabIndex={laFermata ? 0 : -1}
                  disabled={fermo}
                  // Si vede al passaggio, col fuoco nella riga, sulla riga
                  // scelta e a menu aperto.
                  className={cn(
                    "shrink-0 group-focus-within/riga:opacity-100 group-hover/riga:opacity-100 aria-expanded:opacity-100",
                    !scelta && "opacity-0"
                  )}
                  onFocus={() => comuni.onAttiva(nodo.id)}
                />
              }
            >
              <EllipsisVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
              finalFocus={comuni.tornaAlBottone}
            >
              {voci}
              {onSposta ? (
                <>
                  {voci ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      disabled={indice === 0}
                      onClick={() => onSposta({ id: nodo.id, padre: padre?.id ?? null, indice: indice - 1 })}
                    >
                      <ArrowUpIcon />
                      Sposta su
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={indice === fratelli - 1}
                      onClick={() => onSposta({ id: nodo.id, padre: padre?.id ?? null, indice: indice + 1 })}
                    >
                      <ArrowDownIcon />
                      Sposta giù
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      {figli.length > 0 ? <Lista nodi={figli} padre={nodo} livello={livello + 1} comuni={comuni} /> : null}
    </li>
  )
}

const SEGNO = {
  pieno: "size-2 shrink-0 rounded-full bg-foreground",
  vuoto: "size-2 shrink-0 rounded-full border border-muted-foreground",
}

/**
 * Il segno di stato di una riga: un pallino pieno, uno vuoto, o un errore.
 * Con `nome` si legge anche senza vederlo; senza, è un disegno e basta, come
 * nella legenda, dove accanto c'è già il testo.
 */
export function AlberoSegno({
  tipo,
  nome,
  className,
}: {
  tipo: "pieno" | "vuoto" | "errore"
  /** Cosa dice il segno, per i lettori di schermo: «Con testo», «Da scrivere». */
  nome?: string
  className?: string
}) {
  const aria = nome ? ({ role: "img", "aria-label": nome } as const) : ({ "aria-hidden": true } as const)
  if (tipo === "errore") {
    return (
      <AlertCircleIcon
        data-slot="albero-segno"
        {...aria}
        className={cn("size-4 shrink-0 text-destructive-subtle-foreground", className)}
      />
    )
  }
  return <span data-slot="albero-segno" {...aria} className={cn(SEGNO[tipo], className)} />
}

/** Un conto al posto del segno, per una riga che ne contiene altre: «5 blocchi». */
export function AlberoConto({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="albero-conto"
      className={cn("shrink-0 text-xs font-normal tracking-normal text-muted-foreground normal-case", className)}
      {...props}
    />
  )
}

/** La legenda dei segni, sotto l'albero: una voce per segno. */
export function AlberoLegenda({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="albero-legenda"
      aria-label="Legenda"
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground [&>li]:flex [&>li]:items-center [&>li]:gap-1.5",
        className
      )}
      {...props}
    />
  )
}
