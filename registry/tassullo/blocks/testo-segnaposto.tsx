/**
 * `tassullo-testo-segnaposto` — un testo su più righe in cui i dati citati
 * (`{{famiglia.nome}}`) si vedono come pillole col **valore di oggi**. Il
 * valore che entra ed esce resta la stringa con i segnaposto. Proposta #98
 * (Anagrafe), forma scelta da Francesco l'11 ottobre 2026 fra due rese.
 *
 * ── La scala, gradino per gradino ────────────────────────────────────────
 *
 * 1. Chiesto all'MCP su `@shadcn` e `@reui` («mention», «autocomplete»,
 *    «textarea suggestions»): shadcn non ha niente; reui ha `autocomplete`
 *    (Base UI) e un editor Tiptap con le menzioni.
 * 2. `Autocomplete`/`Combobox` di Base UI su una `textarea`: letto il
 *    sorgente di `ComboboxInput` (1.8.0), è fatto per una riga sola. `Home`
 *    e `Fine` saltano all'inizio e alla fine di tutto il valore, `Esc` a
 *    elenco chiuso svuota il campo, le frecce aprono l'elenco.
 * 3. Una `textarea` con l'elenco al cursore: scritta e provata (prima
 *    stesura di questa sessione), ma una `textarea` non può mostrare una
 *    pillola, e chi redige leggeva sigle al posto dei dati.
 *
 * Quindi un blocco su Tiptap, come `tassullo-rich-text-editor`: schema
 * minimo (paragrafi, testo, un nodo `segnaposto`), il `Popover` di Base UI
 * per l'elenco (con l'`anchor` che `PopoverContent` non espone) e `Command`
 * per le voci.
 *
 * ── Un meccanismo solo per fare le pillole ───────────────────────────────
 *
 * Non ci sono regole d'inserimento né d'incolla: un plugin guarda il
 * documento dopo ogni transazione e trasforma in pillola **ogni testo che ha
 * la forma di un segnaposto**, tranne quello che ha il cursore dentro. Così
 * scritto a mano, incollato, trascinato da fuori o inserito da un bottone
 * fanno la stessa strada. E «il cursore dentro» è la modifica: il doppio
 * clic rimette il testo al posto della pillola col cursore prima della
 * chiusura, e quando il cursore ne esce il testo torna pillola.
 *
 * Le transazioni di annulla e ripeti si lasciano stare: rifare la pillola
 * lì dentro rimetterebbe ciò che si è appena annullato.
 *
 * ── Le pillole si ridisegnano senza toccare il documento ─────────────────
 *
 * Il nodo tiene il solo `testo`. Valore ed etichetta stanno nelle `voci`,
 * che l'app può caricare dopo: ogni pillola è una vista DOM iscritta a un
 * elenco di ascoltatori, e quando le voci cambiano si ridisegna. Il
 * documento, e quindi il valore, non cambia.
 *
 * ── I ruoli ──────────────────────────────────────────────────────────────
 *
 * L'area è `role="textbox"`, non `combobox`: è su più righe. axe esenta da
 * `scrollable-region-focusable` l'elenco di un `combobox`, riconoscendolo
 * dal ruolo; qui la regola si spegne nelle scene, perché l'elenco scorre con
 * le frecce dall'area, che tiene il fuoco. Gli `id` di elenco e voci li
 * genera cmdk: `Voci` li legge dal DOM.
 *
 * Un'etichetta `<label for>` non nomina un `contenteditable`: il blocco
 * cerca l'etichetta col proprio `id`, la collega con `aria-labelledby` e le
 * fa portare il fuoco nell'area.
 */
"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { Node as NodoTiptap } from "@tiptap/core"
import { Document } from "@tiptap/extension-document"
import { Paragraph } from "@tiptap/extension-paragraph"
import { Text } from "@tiptap/extension-text"
import { Dropcursor, UndoRedo } from "@tiptap/extensions"
import { NodeSelection, Plugin, PluginKey, Selection, TextSelection } from "@tiptap/pm/state"
import { EditorContent, useEditor, type Editor, type JSONContent } from "@tiptap/react"
import { cn } from "cn"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/registry/tassullo/ui/command"
import { Input } from "@/registry/tassullo/ui/input"
import { Item } from "@/registry/tassullo/ui/item"
import { Label } from "@/registry/tassullo/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/tassullo/ui/select"

export type VoceSegnaposto = {
  /** Il segnaposto com'è scritto nel valore, per esempio `{{famiglia.nome}}`. */
  testo: string
  /** Il nome del dato: si legge nell'elenco e si cerca. */
  etichetta: string
  /** Il titolo del gruppo. Le voci dello stesso gruppo stanno insieme. */
  gruppo?: string
  /** Il valore di oggi: è ciò che la pillola mostra. */
  valore?: string
  /** Perché il valore manca. Compare passando sopra la pillola. */
  nota?: string
}

/** Ciò che `ref` riceve: il fuoco, e l'inserimento da fuori. */
export type TestoSegnapostoRef = {
  focus: () => void
  /** Inserisce un testo nel punto del cursore; un segnaposto diventa pillola. */
  inserisci: (testo: string) => void
}

export type TestoSegnapostoProps = {
  /** Il testo, con i segnaposto scritti per esteso. Controllato. */
  value?: string
  /** Come `value`, ma non controllato. */
  defaultValue?: string
  onChange?: (valore: string) => void
  onBlur?: () => void
  /** Riceve il campo stesso: serve a sapere in quale inserire da fuori. */
  onFocus?: (campo: TestoSegnapostoRef) => void
  /** I dati che si possono citare. */
  voci: readonly VoceSegnaposto[]
  /** La stringa che apre l'elenco, o più di una. */
  prefisso?: string | readonly string[]
  /**
   * La forma di un segnaposto. Un testo che la rispetta diventa una pillola
   * anche se non è fra le voci: è il segnaposto sbagliato, e si vede.
   */
  forma?: RegExp
  /** Il testo dell'elenco quando nessuna voce corrisponde. */
  vuoto?: string
  /** Il testo accanto a una voce che oggi non ha valore. */
  senzaValore?: string
  placeholder?: string
  disabled?: boolean
  /** Il nome dell'area per i lettori di schermo, se non c'è un'etichetta. */
  etichetta?: string
  /** Il nome dell'elenco per i lettori di schermo. */
  etichettaElenco?: string
  id?: string
  name?: string
  ref?: React.Ref<TestoSegnapostoRef>
  "aria-labelledby"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean | "true" | "false"
  className?: string
}

const FORMA = /\{\{[^{}\s]+\}\}/
// Il posto che una pillola occupa nel testo di un paragrafo.
const PILLOLA_NEL_TESTO = "￼"

// `inline`, non `inline-flex`: un valore lungo va a capo come il testo, e
// `box-decoration-clone` ridisegna bordo e fondo su ogni riga.
const PILLOLA =
  "mx-px cursor-grab rounded-md border box-decoration-clone px-1 py-px select-none [&.ProseMirror-selectednode]:ring-2 [&.ProseMirror-selectednode]:ring-ring/40"
const PILLOLA_PER_STATO = {
  valore: "border-border bg-muted text-foreground",
  "senza-valore": "border-warning-border bg-warning-subtle text-warning-subtle-foreground",
  sconosciuto:
    "border-destructive-border bg-destructive-subtle text-destructive-subtle-foreground",
}

// Le stesse classi di `Textarea`, sull'area di scrittura.
const AREA =
  "min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-lg whitespace-pre-wrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30 aria-disabled:cursor-not-allowed aria-disabled:bg-input/50 aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_p]:m-0"

type Magazzino = {
  voci: Map<string, VoceSegnaposto>
  senzaValore: string
  // La forma più le voci scritte per esteso, in un'espressione sola.
  riconosci: RegExp
  ascoltatori: Set<() => void>
}

function espressione(forma: RegExp, voci: readonly VoceSegnaposto[]) {
  const scritte = voci
    .map((voce) => voce.testo)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((testo) => testo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  return new RegExp([...scritte, forma.source].join("|"), "gu")
}

const chiaveSegnaposto = new PluginKey("testoSegnaposto")

declare module "@tiptap/core" {
  interface Storage {
    segnaposto: Magazzino
  }
}

// Tiptap appende l'editor all'elemento dell'area.
function editorDi(area: HTMLElement) {
  return (area as HTMLElement & { editor?: Editor }).editor
}

const Segnaposto = NodoTiptap.create<Record<string, never>, Magazzino>({
  name: "segnaposto",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addStorage() {
    return {
      voci: new Map(),
      senzaValore: "",
      riconosci: espressione(FORMA, []),
      ascoltatori: new Set(),
    }
  },

  addAttributes() {
    return { testo: { default: "" } }
  },

  parseHTML() {
    return [
      {
        tag: "span[data-segnaposto]",
        getAttrs: (elemento) => ({ testo: elemento.getAttribute("data-segnaposto") }),
      },
    ]
  },

  renderHTML({ node }) {
    return ["span", { "data-segnaposto": node.attrs.testo }, node.attrs.testo]
  },

  renderText({ node }) {
    return node.attrs.testo
  },

  addNodeView() {
    return ({ node }) => {
      const magazzino = this.storage
      const dom = document.createElement("span")
      dom.setAttribute("data-slot", "testo-segnaposto-pillola")
      const disegna = () => {
        const voce = magazzino.voci.get(node.attrs.testo)
        const stato = !voce ? "sconosciuto" : voce.valore ? "valore" : "senza-valore"
        dom.setAttribute("data-stato", stato)
        dom.className = `${PILLOLA} ${PILLOLA_PER_STATO[stato]}`
        dom.textContent = voce ? voce.valore || voce.etichetta : node.attrs.testo
        if (!voce) dom.removeAttribute("title")
        else if (voce.valore) dom.title = voce.etichetta
        else dom.title = `${voce.etichetta}: ${voce.nota ?? magazzino.senzaValore}`
      }
      disegna()
      magazzino.ascoltatori.add(disegna)
      return {
        dom,
        destroy: () => {
          magazzino.ascoltatori.delete(disegna)
        },
      }
    }
  },

  addProseMirrorPlugins() {
    const magazzino = this.storage
    const tipo = this.type
    return [
      new Plugin({
        key: chiaveSegnaposto,
        appendTransaction(transazioni, _prima, stato) {
          const daGuardare = transazioni.some(
            (tr) => tr.docChanged || tr.selectionSet || tr.getMeta(chiaveSegnaposto)
          )
          const annulla = transazioni.some((tr) => tr.getMeta("history$"))
          if (!daGuardare || annulla) return null

          const { from, to } = stato.selection
          const cambi: { da: number; a: number; testo: string }[] = []
          stato.doc.descendants((nodo, posizione) => {
            if (!nodo.isTextblock) return true
            const testo = nodo.textBetween(0, nodo.content.size, undefined, PILLOLA_NEL_TESTO)
            for (const trovato of testo.matchAll(magazzino.riconosci)) {
              const da = posizione + 1 + trovato.index
              const a = da + trovato[0].length
              // Il cursore è dentro: lo si sta scrivendo o modificando.
              if ((from > da && from < a) || (to > da && to < a)) continue
              cambi.push({ da, a, testo: trovato[0] })
            }
            return false
          })
          if (cambi.length === 0) return null

          const tr = stato.tr
          for (const cambio of cambi.reverse()) {
            tr.replaceWith(cambio.da, cambio.a, tipo.create({ testo: cambio.testo }))
          }
          return tr
        },
      }),
    ]
  },
})

// Le voci nel magazzino del nodo. Le pillole si ridisegnano, e una
// transazione senza modifiche fa riguardare il documento: il testo che ora
// ha la forma di un segnaposto diventa pillola.
function riempi(
  editor: Editor,
  voci: readonly VoceSegnaposto[],
  senzaValore: string,
  forma: RegExp
) {
  const magazzino = editor.storage.segnaposto
  magazzino.voci = new Map(voci.map((voce) => [voce.testo, voce]))
  magazzino.senzaValore = senzaValore
  magazzino.riconosci = espressione(forma, voci)
  for (const disegna of magazzino.ascoltatori) disegna()
  editor.view.dispatch(
    editor.state.tr.setMeta(chiaveSegnaposto, true).setMeta("addToHistory", false)
  )
}

// Dalla stringa al documento: una riga, un paragrafo. Il ritorno è
// `editor.getText`, che per le pillole usa `renderText`.
function daTesto(testo: string, riconosci: RegExp): JSONContent {
  return {
    type: "doc",
    content: testo.split("\n").map((riga) => {
      const pezzi: JSONContent[] = []
      let da = 0
      for (const trovato of riga.matchAll(riconosci)) {
        if (trovato.index > da) pezzi.push({ type: "text", text: riga.slice(da, trovato.index) })
        pezzi.push({ type: "segnaposto", attrs: { testo: trovato[0] } })
        da = trovato.index + trovato[0].length
      }
      if (da < riga.length) pezzi.push({ type: "text", text: riga.slice(da) })
      return { type: "paragraph", content: pezzi }
    }),
  }
}

function inTesto(editor: Editor) {
  return editor.getText({ blockSeparator: "\n" })
}

// Minuscole, senza accenti, spezzato in parole: «qualita» trova «Qualità»,
// e `prestazione.fuoco` sono due parole come «prestazione fuoco».
function parole(testo: string) {
  return testo
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}

// Ogni parola scritta deve essere l'inizio di una parola dell'etichetta, del
// segnaposto o del nome del gruppo. L'inizio e non un pezzo qualunque: «res»
// trova «Resistenza» e non «prestazione».
function filtra(voci: readonly VoceSegnaposto[], query: string) {
  const cercate = parole(query)
  if (cercate.length === 0) return [...voci]
  return voci.filter((voce) => {
    const presenti = parole(`${voce.etichetta} ${voce.testo} ${voce.gruppo ?? ""}`)
    return cercate.every((cercata) =>
      presenti.some((presente) => presente.startsWith(cercata))
    )
  })
}

// I gruppi nell'ordine in cui compaiono; le voci senza gruppo per prime.
function raggruppa(voci: readonly VoceSegnaposto[]) {
  const gruppi = new Map<string, VoceSegnaposto[]>()
  for (const voce of voci) {
    const nome = voce.gruppo ?? ""
    const gruppo = gruppi.get(nome)
    if (gruppo) gruppo.push(voce)
    else gruppi.set(nome, [voce])
  }
  const sciolte = gruppi.get("")
  gruppi.delete("")
  const ordinati = [
    ...(sciolte ? [{ nome: "", voci: sciolte }] : []),
    ...[...gruppi].map(([nome, delGruppo]) => ({ nome, voci: delGruppo })),
  ]
  // `da` è il posto della prima voce del gruppo nell'elenco intero: le
  // frecce contano le voci di fila, da un gruppo all'altro.
  let da = 0
  return ordinati.map((gruppo) => {
    const conPosto = { ...gruppo, da }
    da += gruppo.voci.length
    return conPosto
  })
}

// `da` e `a` sono posizioni nel documento: dall'inizio del prefisso al
// cursore.
type Sessione = { da: number; a: number; query: string }

// Il prefisso più vicino al cursore, nello stesso paragrafo e senza pillole
// in mezzo, e ciò che è stato scritto dopo. Fra due prefissi che finiscono
// nello stesso punto vince il più lungo.
function leggiSessione(editor: Editor, prefissi: readonly string[]): Sessione | null {
  const { $from, empty } = editor.state.selection
  if (!empty || !$from.parent.isTextblock) return null
  const prima = $from.parent.textBetween(0, $from.parentOffset, undefined, PILLOLA_NEL_TESTO)
  let inizio = -1
  let fine = -1
  for (const prefisso of prefissi) {
    if (!prefisso) continue
    const dove = prima.lastIndexOf(prefisso)
    if (dove < 0) continue
    const doveFinisce = dove + prefisso.length
    if (doveFinisce > fine || (doveFinisce === fine && dove < inizio)) {
      inizio = dove
      fine = doveFinisce
    }
  }
  if (inizio < 0) return null
  const query = prima.slice(fine)
  if (query.includes(PILLOLA_NEL_TESTO)) return null
  return { da: $from.start() + inizio, a: $from.pos, query }
}

// Sta dentro il popup, quindi esiste solo a elenco montato: legge gli `id`
// che cmdk ha dato all'elenco e alla voce attiva, e tiene la voce in vista.
function Voci({
  attiva,
  onPronte,
  children,
}: {
  attiva: number
  onPronte: (elenco: string | undefined, voce: string | undefined) => void
  children: React.ReactNode
}) {
  const radice = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    const elenco = radice.current?.querySelector<HTMLElement>('[role="listbox"]')
    const voce = radice.current?.querySelectorAll<HTMLElement>('[role="option"]')[attiva]
    voce?.scrollIntoView({ block: "nearest" })
    onPronte(elenco?.id, voce?.id)
  })
  return (
    <div ref={radice} className="contents">
      {children}
    </div>
  )
}

// Ciò che il campo dà a chi sta fuori. Una per editor: `onFocus` e `ref`
// consegnano lo stesso oggetto.
const maniglie = new WeakMap<Editor, TestoSegnapostoRef>()

function manigliaDi(editor: Editor) {
  let maniglia = maniglie.get(editor)
  if (!maniglia) {
    maniglia = {
      focus: () => {
        editor.commands.focus()
      },
      // Testo e basta: se ha la forma di un segnaposto diventa pillola come
      // ogni altro testo.
      inserisci: (testo) => {
        if (testo) editor.chain().focus().insertContent({ type: "text", text: testo }).run()
      },
    }
    maniglie.set(editor, maniglia)
  }
  return maniglia
}

function attributo(elemento: HTMLElement, nome: string, valore: string | undefined) {
  if (valore === undefined) elemento.removeAttribute(nome)
  else elemento.setAttribute(nome, valore)
}

/**
 * Un testo su più righe in cui i dati citati si vedono come pillole col
 * valore di oggi. Il valore è una stringa, con i segnaposto scritti per
 * esteso.
 */
export function TestoSegnaposto({
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  voci,
  prefisso = "{{",
  forma = FORMA,
  vuoto = "Nessuna voce",
  senzaValore = "Senza valore",
  placeholder,
  disabled = false,
  etichetta,
  etichettaElenco = "Suggerimenti",
  id,
  ref,
  "aria-labelledby": etichettataDa,
  "aria-describedby": descrittaDa,
  "aria-invalid": nonValido,
  className,
}: TestoSegnapostoProps) {
  // La sessione resta anche a elenco chiuso: mentre l'elenco sfuma mostra
  // ancora le voci che aveva, non «nessuna voce».
  const [sessione, setSessione] = React.useState<Sessione | null>(null)
  const [aperto, setAperto] = React.useState(false)
  const [attiva, setAttiva] = React.useState(0)
  const [senzaTesto, setSenzaTesto] = React.useState(!(value ?? defaultValue))
  // L'inizio del prefisso chiuso con `Esc`: non si riapre finché non se ne
  // scrive un altro.
  const saltata = React.useRef<number | null>(null)
  const ultimoEmesso = React.useRef(value ?? defaultValue ?? "")
  // I testi già mandati all'app che non sono ancora tornati come `value`:
  // se l'app li rende in ritardo, sono l'eco di ciò che si è scritto e non
  // un valore deciso da fuori.
  const inViaggio = React.useRef(new Set<string>())

  const prefissi = typeof prefisso === "string" ? [prefisso] : prefisso
  const gruppi = React.useMemo(
    () => (sessione ? raggruppa(filtra(voci, sessione.query)) : []),
    [voci, sessione]
  )
  const trovate = gruppi.flatMap((gruppo) => gruppo.voci)

  // Le voci cambiano a ogni resa se l'app le scrive sul posto: ciò che conta
  // è il contenuto, in una chiave sola.
  const chiaveVoci = voci
    .map((voce) => [voce.testo, voce.etichetta, voce.valore, voce.nota].join("\u0000"))
    .join("\u0001")

  function aggiorna(editor: Editor, scrivendo: boolean) {
    const letta = leggiSessione(editor, prefissi)
    if (!letta) {
      saltata.current = null
      return setAperto(false)
    }
    if (saltata.current === letta.da) return setAperto(false)
    saltata.current = null

    const continua = aperto && sessione?.da === letta.da
    const quante = filtra(voci, letta.query).length
    const conSpazi = /\s/.test(letta.query)
    // Si comincia solo scrivendo: al prefisso appena digitato, o dentro un
    // filtro di una parola che trova qualcosa. Si smette quando non si trova
    // più niente e si è andati oltre la prima parola.
    const comincia = scrivendo && quante > 0 && (letta.query === "" || !conSpazi)
    const prosegue = continua && (quante > 0 || !conSpazi)
    if (!comincia && !prosegue) return setAperto(false)

    if (!continua || letta.query !== sessione?.query) setAttiva(0)
    setSessione(letta)
    setAperto(true)
  }

  function chiudiPerQuestoPrefisso() {
    if (aperto && sessione) saltata.current = sessione.da
    setAperto(false)
  }

  function scegli(editor: Editor, voce: VoceSegnaposto) {
    if (!aperto || !sessione) return
    const { state, view } = editor
    const { $from } = state.selection
    // Se il cursore è dentro un segnaposto scritto per esteso, la voce lo
    // sostituisce tutto, chiusura compresa.
    let a = $from.pos
    const inizioParagrafo = $from.start()
    const testo = $from.parent.textBetween(0, $from.parent.content.size, undefined, PILLOLA_NEL_TESTO)
    for (const trovato of testo.matchAll(editor.storage.segnaposto.riconosci)) {
      const fine = inizioParagrafo + trovato.index + trovato[0].length
      if (inizioParagrafo + trovato.index === sessione.da && fine > a) a = fine
    }
    const nodo = state.schema.nodes.segnaposto.create({ testo: voce.testo })
    view.dispatch(state.tr.replaceWith(sessione.da, a, nodo).scrollIntoView())
    view.focus()
    setAperto(false)
  }

  // La pillola torna il suo testo, col cursore prima della chiusura: da lì
  // si corregge a mano o si sceglie un'altra voce dall'elenco.
  function apriComeTesto(editor: Editor, posizione: number, testo: string) {
    const { state, view } = editor
    const chiusura = /[^\p{L}\p{N}]*$/u.exec(testo)?.[0].length ?? 0
    const cursore = posizione + testo.length - Math.max(chiusura, 1)
    const tr = state.tr.replaceWith(posizione, posizione + 1, state.schema.text(testo))
    view.dispatch(tr.setSelection(TextSelection.create(tr.doc, cursore)))
    view.focus()
  }

  function tasto(editor: Editor, evento: KeyboardEvent) {
    if (!aperto) {
      const { selection } = editor.state
      const pillola = selection instanceof NodeSelection && selection.node.type.name === "segnaposto"
      if (pillola && evento.key === "Enter" && editor.isEditable) {
        apriComeTesto(editor, selection.from, selection.node.attrs.testo)
        return true
      }
      return false
    }
    if (evento.key === "Escape") {
      // Chiude l'elenco e basta: il testo resta, e un dialogo intorno non
      // si chiude.
      evento.stopPropagation()
      chiudiPerQuestoPrefisso()
      return true
    }
    if (trovate.length === 0) return false
    if (evento.altKey || evento.ctrlKey || evento.metaKey || evento.shiftKey) return false
    if (evento.key === "ArrowDown") {
      setAttiva((attiva + 1) % trovate.length)
      return true
    }
    if (evento.key === "ArrowUp") {
      setAttiva((attiva - 1 + trovate.length) % trovate.length)
      return true
    }
    if (evento.key === "Enter" || evento.key === "Tab") {
      scegli(editor, trovate[attiva])
      return true
    }
    return false
  }

  // I gestori dell'editor nascono una volta sola: chiamano l'ultima versione
  // di queste funzioni, che vedono lo stato di adesso.
  const adesso = React.useRef({ aggiorna, tasto, apriComeTesto, onChange, onBlur, onFocus })
  React.useEffect(() => {
    adesso.current = { aggiorna, tasto, apriComeTesto, onChange, onBlur, onFocus }
  })

  const editor = useEditor({
    extensions: [Document, Paragraph, Text, UndoRedo, Dropcursor, Segnaposto],
    content: daTesto(value ?? defaultValue ?? "", espressione(forma, voci)),
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "data-slot": "testo-segnaposto-area",
        role: "textbox",
        "aria-multiline": "true",
        "aria-autocomplete": "list",
        "aria-haspopup": "listbox",
        class: AREA,
      },
      handleKeyDown: (vista, evento) => {
        const mio = editorDi(vista.dom)
        return mio ? adesso.current.tasto(mio, evento) : false
      },
      // Un dato rilasciato nello spazio vuoto sotto il testo va in coda alla
      // riga più vicina. Di suo l'editor ne farebbe una riga nuova.
      handleDrop: (vista, evento, fetta, spostato) => {
        const punto = vista.posAtCoords({ left: evento.clientX, top: evento.clientY })
        if (!punto || vista.state.doc.resolve(punto.pos).parent.isTextblock) return false
        const primo = fetta.content.firstChild
        if (!primo || fetta.content.childCount !== 1) return false
        const contenuto = primo.isTextblock ? primo.content : fetta.content
        const tr = vista.state.tr
        if (spostato) tr.deleteSelection()
        const dove = Selection.near(tr.doc.resolve(tr.mapping.map(punto.pos)), -1).from
        tr.insert(dove, contenuto)
        vista.dispatch(tr.setSelection(TextSelection.create(tr.doc, dove + contenuto.size)))
        vista.focus()
        return true
      },
      handleDoubleClickOn: (vista, _posizione, nodo, posizioneNodo) => {
        const mio = editorDi(vista.dom)
        if (!mio || !mio.isEditable || nodo.type.name !== "segnaposto") return false
        adesso.current.apriComeTesto(mio, posizioneNodo, nodo.attrs.testo)
        return true
      },
    },
    onUpdate: ({ editor: mio }) => {
      const testo = inTesto(mio)
      setSenzaTesto(mio.isEmpty)
      if (testo !== ultimoEmesso.current) {
        ultimoEmesso.current = testo
        inViaggio.current.add(testo)
        adesso.current.onChange?.(testo)
      }
      adesso.current.aggiorna(mio, true)
    },
    onSelectionUpdate: ({ editor: mio, transaction }) => {
      // Il cursore può essere uscito dal filtro senza che il testo cambi.
      if (!transaction.docChanged) adesso.current.aggiorna(mio, false)
    },
    onBlur: () => {
      setAperto(false)
      adesso.current.onBlur?.()
    },
    onFocus: ({ editor: mio }) => {
      adesso.current.onFocus?.(manigliaDi(mio))
    },
  })

  React.useEffect(() => {
    if (editor) riempi(editor, voci, senzaValore, forma)
    // `voci` e `forma` contano per il contenuto: `chiaveVoci` e la sorgente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, chiaveVoci, senzaValore, forma.source])

  // Il valore deciso da fuori.
  React.useEffect(() => {
    if (!editor || value === undefined) return
    if (value === ultimoEmesso.current) return inViaggio.current.clear()
    if (inViaggio.current.has(value)) return
    inViaggio.current.clear()
    ultimoEmesso.current = value
    editor.commands.setContent(daTesto(value, editor.storage.segnaposto.riconosci), {
      emitUpdate: false,
    })
    setSenzaTesto(editor.isEmpty)
  }, [editor, value])

  React.useEffect(() => {
    editor?.setEditable(!disabled, false)
  }, [editor, disabled])

  // Gli attributi dell'area, e l'etichetta: un `<label for>` non nomina un
  // `contenteditable`, quindi la si collega per `id` e le si fa portare il
  // fuoco.
  React.useEffect(() => {
    if (!editor) return
    const area = editor.view.dom
    attributo(area, "id", id)
    attributo(area, "aria-label", etichetta)
    attributo(area, "aria-describedby", descrittaDa)
    attributo(area, "aria-invalid", nonValido === true || nonValido === "true" ? "true" : undefined)
    attributo(area, "aria-disabled", disabled ? "true" : undefined)
    const label =
      id && !etichetta && !etichettataDa
        ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`)
        : null
    if (label && !label.id) label.id = `${id}-etichetta`
    attributo(area, "aria-labelledby", etichettataDa ?? label?.id)
    if (!label) return
    const fuoco = () => editor.commands.focus()
    label.addEventListener("click", fuoco)
    return () => label.removeEventListener("click", fuoco)
  }, [editor, id, etichetta, etichettataDa, descrittaDa, nonValido, disabled])

  React.useEffect(() => {
    if (!editor || aperto) return
    editor.view.dom.removeAttribute("aria-controls")
    editor.view.dom.removeAttribute("aria-activedescendant")
  }, [editor, aperto])

  React.useImperativeHandle(
    ref,
    () => (editor ? manigliaDi(editor) : { focus: () => {}, inserisci: () => {} }),
    [editor]
  )

  // L'elenco si ancora all'inizio del prefisso, letto dal documento a ogni
  // richiesta: mentre si scrive il filtro non si sposta.
  const inizio = React.useRef(0)
  const ancora = React.useMemo(
    () =>
      editor
        ? {
            contextElement: editor.view.dom,
            getBoundingClientRect() {
              const da = Math.min(inizio.current, editor.state.doc.content.size)
              const punto = editor.view.coordsAtPos(da)
              return new DOMRect(punto.left, punto.top, 0, punto.bottom - punto.top)
            },
          }
        : null,
    [editor]
  )
  React.useEffect(() => {
    if (sessione) inizio.current = sessione.da
  }, [sessione])

  if (!editor) return null

  let annuncio = ""
  if (aperto) {
    if (trovate.length === 0) annuncio = vuoto
    else annuncio = trovate.length === 1 ? "1 voce" : `${trovate.length} voci`
  }

  return (
    <div data-slot="testo-segnaposto" className={cn("relative w-full", className)}>
      {placeholder && senzaTesto ? (
        <span
          aria-hidden="true"
          data-slot="testo-segnaposto-placeholder"
          className="pointer-events-none absolute top-0 left-0 border border-transparent px-2.5 py-2 text-lg text-muted-foreground select-none md:text-sm"
        >
          {placeholder}
        </span>
      ) : null}
      <EditorContent editor={editor} />
      <span role="status" className="sr-only">
        {annuncio}
      </span>
      <PopoverPrimitive.Root
        open={aperto}
        onOpenChange={(apri, dettagli) => {
          if (apri) return
          if (dettagli.reason === "escape-key") chiudiPerQuestoPrefisso()
          else setAperto(false)
        }}
      >
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner
            anchor={ancora}
            side="bottom"
            align="start"
            sideOffset={4}
            className="isolate z-50"
          >
            <PopoverPrimitive.Popup
              data-slot="testo-segnaposto-elenco"
              aria-label={etichettaElenco}
              initialFocus={false}
              finalFocus={false}
              // Il clic su una voce non toglie il fuoco all'area.
              onMouseDown={(evento) => evento.preventDefault()}
              className="z-50 flex w-80 max-w-(--available-width) origin-(--transform-origin) flex-col rounded-lg bg-popover text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
            >
              <Voci
                attiva={attiva}
                onPronte={(elenco, voce) => {
                  if (!aperto) return
                  attributo(editor.view.dom, "aria-controls", elenco)
                  attributo(editor.view.dom, "aria-activedescendant", voce)
                }}
              >
                <Command
                  shouldFilter={false}
                  value={String(attiva)}
                  onValueChange={(valore) => {
                    const numero = Number(valore)
                    if (valore !== "" && Number.isInteger(numero)) setAttiva(numero)
                  }}
                >
                  <CommandList label={etichettaElenco}>
                    {trovate.length === 0 ? <CommandEmpty>{vuoto}</CommandEmpty> : null}
                    {gruppi.map((gruppo) => (
                      <CommandGroup key={gruppo.nome} heading={gruppo.nome || undefined}>
                        {gruppo.voci.map((voce, posto) => {
                          const valore = String(gruppo.da + posto)
                          return (
                            <CommandItem
                              key={valore}
                              value={valore}
                              onSelect={() => scegli(editor, voce)}
                              className="[&>svg:last-child]:hidden"
                            >
                              <span className="min-w-0 flex-1 truncate">{voce.etichetta}</span>
                              <span className="max-w-1/2 truncate text-muted-foreground group-data-selected/command-item:text-foreground">
                                {voce.valore || senzaValore}
                              </span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </Voci>
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  )
}

export type TestoSegnapostoElencoProps = {
  /** I dati che si possono citare. */
  voci: readonly VoceSegnaposto[]
  /** Il clic su un dato. Ogni dato si può anche trascinare dentro un testo. */
  onScegli?: (voce: VoceSegnaposto) => void
  /** L'etichetta del filtro per gruppo. */
  etichettaGruppi?: string
  /** La voce del filtro che li mostra tutti. */
  tutti?: string
  /** Il testo al posto del valore, per un dato che oggi non ne ha. */
  senzaValore?: string
  /** Il testo quando nessun dato corrisponde. */
  vuoto?: string
  className?: string
}

const TUTTI = "\u0000tutti"

/**
 * L'elenco dei dati da citare: in cima il filtro per gruppo e la ricerca,
 * che restano fermi, e sotto i dati, che scorrono. Ogni dato mostra in
 * piccolo il nome e in evidenza il valore di oggi; si clicca o si trascina
 * dentro un `TestoSegnaposto`.
 */
export function TestoSegnapostoElenco({
  voci,
  onScegli,
  etichettaGruppi = "Dati di",
  tutti = "Tutti i dati",
  senzaValore = "Senza valore",
  vuoto = "Nessun dato",
  className,
}: TestoSegnapostoElencoProps) {
  const id = React.useId()
  const [gruppo, setGruppo] = React.useState(TUTTI)
  const [cercato, setCercato] = React.useState("")
  const nomi = [...new Set(voci.map((voce) => voce.gruppo ?? "").filter(Boolean))]
  const delGruppo = gruppo === TUTTI ? voci : voci.filter((voce) => voce.gruppo === gruppo)
  const mostrate = filtra(delGruppo, cercato)

  return (
    <div
      data-slot="testo-segnaposto-dati"
      className={cn("flex min-h-0 flex-col gap-3", className)}
    >
      <div className="flex flex-col gap-2">
        {nomi.length > 1 ? (
          <>
            <Label htmlFor={`${id}-gruppo`}>{etichettaGruppi}</Label>
            <Select
              value={gruppo}
              onValueChange={(scelto) => setGruppo(scelto ?? TUTTI)}
              items={[
                { value: TUTTI, label: tutti },
                ...nomi.map((nome) => ({ value: nome, label: nome })),
              ]}
            >
              <SelectTrigger id={`${id}-gruppo`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TUTTI}>{tutti}</SelectItem>
                {nomi.map((nome) => (
                  <SelectItem key={nome} value={nome}>
                    {nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : null}
        <Input
          type="search"
          aria-label="Cerca un dato"
          placeholder="Cerca un dato"
          value={cercato}
          onChange={(evento) => setCercato(evento.target.value)}
        />
      </div>
      <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-1 py-px">
        {mostrate.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{vuoto}</p>
        ) : null}
        {mostrate.map((voce) => (
          <Item
            key={voce.testo}
            variant="outline"
            size="sm"
            className="shrink-0 cursor-grab flex-col items-start gap-0.5 text-left hover:bg-muted"
            render={
              <button
                type="button"
                draggable
                onDragStart={(evento) => {
                  evento.dataTransfer.setData("text/plain", voce.testo)
                  evento.dataTransfer.effectAllowed = "copy"
                }}
                onClick={() => onScegli?.(voce)}
              />
            }
          >
            <span className="text-xs text-muted-foreground">{voce.etichetta}</span>
            {voce.valore ? (
              <span className="text-base font-medium">{voce.valore}</span>
            ) : (
              <>
                <span className={cn(PILLOLA, PILLOLA_PER_STATO["senza-valore"], "cursor-grab")}>
                  {senzaValore}
                </span>
                {voce.nota ? (
                  <span className="text-xs text-muted-foreground">{voce.nota}</span>
                ) : null}
              </>
            )}
          </Item>
        ))}
      </div>
    </div>
  )
}
