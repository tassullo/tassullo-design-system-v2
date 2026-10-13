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
 * ── Proposta #101 (Anagrafe), 12 ottobre 2026 ────────────────────────────
 *
 * Dall'uso nella scheda «Testi». `readOnly`: l'area non si modifica, quindi
 * l'editor le toglie il `tabindex`, e il blocco glielo rimette; la selezione
 * del documento va portata nell'area quando prende il fuoco, o in Safari i
 * tasti finiscono nel campo di prima (misurato: «prima» → «primaabc»).
 * `inserisci` sostituisce il prefisso appena scritto (restavano quattro
 * graffe). La forma di serie ammette gli spazi dentro le graffe, e la voce si
 * cerca senza: il motore di Anagrafe li toglie, quindi `{{ famiglia.nome }}`
 * è un dato valido. Forme scelte da Francesco su varianti rese: nell'elenco
 * le intestazioni di gruppo e la nota al posto del trattino; sulla pillola
 * senza valore gruppo e nome, e la nota in un tooltip. La pillola senza
 * valore non è più gialla ma neutra e tratteggiata (Francesco, stessa
 * sessione): un dato che cambia da una variante all'altra non è un avviso.
 * L'elenco per un giorno ha scorso con `ScrollArea`, perché la barra nativa
 * stava a fianco di quella della pagina, uguale. Con la barra predefinita
 * del tema (proposta #103) lo scorrimento è tornato nativo: stessa barra, e
 * un posto in meno nel giro del `Tab`.
 *
 * Tre aggiunte di Anagrafe alla stessa proposta. `secondaria` sulla voce: le
 * `voci` decidevano insieme cosa si propone e cosa è valido, e per avere un
 * elenco corto (19 righe invece di 77) l'app doveva vietare ciò che non
 * mostrava. Una voce secondaria non si mostra per prima ma si trova
 * cercandola (Francesco: un dato che esiste si deve poter inserire anche
 * senza valore); la prima stesura, `nascosta`, la toglieva del tutto. Le tre graffe: `{{{a}}}` rendeva `{`, una pillola grigia e `}`,
 * mentre chi legge la stringa ci trova un segnaposto sbagliato; la regola
 * sta in `segnapostoIn` e non nella `forma`, così vale per ogni forma e non
 * chiede un lookbehind. La `nota` anche nell'elenco che si apre scrivendo.
 *
 * Il tooltip è uno solo per campo, ancorato alla pillola indicata o
 * selezionata: le pillole sono DOM dell'editor e non possono essere il
 * `TooltipTrigger` del registry. Le classi sono quelle di `TooltipContent`,
 * con la freccia a `-translate-y-1/2` invece del valore arbitrario di
 * shadcn, che in `blocks/` il gate rifiuta.
 *
 * ── Proposta #107 (Anagrafe), 12 ottobre 2026 ────────────────────────────
 *
 * Dopo l'adozione della v2.0.10. Tre difetti, ognuno con una prova che sul
 * codice di prima fallisce in Chromium e in WebKit. La voce evidenziata era
 * un indice: se le voci cambiavano a elenco aperto (l'app le rilegge dopo un
 * salvataggio) l'evidenziazione scivolava e `Invio` inseriva un'altra voce;
 * ora si ricorda il `testo`. Il tooltip leggeva `selezionata ?? indicata`, e
 * col puntatore su una pillola mostrava la nota di quella selezionata. Nelle
 * voci dell'elenco il nome aveva `truncate` e cedeva il posto a nota e
 * valore: quattro voci che finiscono diverse si leggevano uguali. Ora ogni
 * voce è su due righe, come nell'elenco dei dati: in piccolo il nome, per
 * intero, e sotto in evidenza il valore, o al suo posto la nota (scelta da
 * Francesco fra cinque forme rese, `docs/DECISIONI.md` §76: col valore a
 * destra «si fa fatica a distinguere il valore dal nome»). Passando da una
 * pillola con la nota a una senza, il tooltip sfumava vuoto: ora tiene il
 * testo che aveva finché non è uscito.
 *
 * La forma di serie e la lettura del nome stanno in `lib/segnaposto.ts`,
 * senza React, per chi controlla lo stesso testo su un server. Il default di
 * `vuoto` è «Nessun dato» anche nell'elenco che si apre scrivendo. Filtro e
 * ricerca dell'elenco dei dati si possono tenere fuori: con `ColonnaLaterale`
 * la pagina chiude la colonna smettendo di renderla, e lo stato interno si
 * perdeva a ogni chiusura.
 *
 * **Le voci secondarie non ci sono più** (Francesco, stessa sessione): i dati
 * si mostrano sempre tutti, nella tendina e nell'elenco, perché chi scrive
 * una scheda la può finire mentre un altro reparto prepara i valori, e un
 * dato che non vede non lo cita. `secondaria`, `altri` e `meno` sono tolti
 * anche dai tipi (Francesco: «li mostriamo tutti e basta»): chi li passa
 * non compila finché non li toglie, ed è scritto nel prompt di adozione. Con
 * loro escono il bottone «Mostra altri N dati», la riga in fondo alla
 * tendina e la dipendenza da `button`.
 *
 * **Trascinando un dato segue il puntatore una pillola, non la voce intera**
 * (Francesco, provando: «riesco a inserirlo a inizio o fine frase e basta»).
 * L'immagine di serie è la voce dell'elenco, larga 280px: copriva il testo
 * e il segno del punto di rilascio. Il segno ora è largo 2px e del colore
 * del marchio.
 *
 * ── Proposta #110 (Anagrafe), 12 ottobre 2026 ────────────────────────────
 *
 * Dopo l'adozione della v2.0.11, quattro punti sul trascinamento.
 *
 * Il plugin `Dropcursor` di Tiptap non c'è più: il segno lo disegna il blocco.
 * Quello di serie chiede all'editor dove metterebbe **lui** ciò che si
 * trascina, e nello spazio vuoto risponde «una riga nuova», con un segno
 * orizzontale largo quanto il campo; ma `handleDrop` lì mette il dato in coda
 * alla riga più vicina. Ora segno e rilascio leggono il punto dalla stessa
 * funzione, `doveCade`. Sopra e sotto il testo il punto si decide dalla
 * posizione del puntatore e non da `posAtCoords`: misurato col mouse vero,
 * nello spazio sopra la prima riga Chromium rispondeva l'inizio della riga e
 * WebKit la posizione dopo la prima pillola.
 *
 * Una pillola presa senza essere selezionata si duplicava nello spazio vuoto:
 * `tr.deleteSelection()` toglieva la selezione, che non era lei. Ora si toglie
 * `view.dragging.node`, come fa l'editor; il campo c'è da `prosemirror-view`
 * 1.x ma non è nei tipi, quindi una prova lo tiene fermo.
 *
 * L'immagine in volo della pillola presa dal testo è la stessa dell'elenco
 * (Francesco, in un browser vero: quella di serie, la pillola intera centrata
 * sul puntatore, copriva il segno).
 *
 * Lo spazio automatico (scelta di Francesco): accanto a una lettera, a una
 * cifra. In più, deciso in sessione: anche accanto a un'altra pillola, che
 * nel documento è un valore e uscirebbe «Malta R4EN 1504-3». Spostando una
 * pillola si mette prima e si toglie poi, così lasciata dov'era ritrova gli
 * spazi che aveva; dove stava si toglie lo spazio rimasto di troppo. Un dato
 * inserito è una transazione sola con `closeHistory`: un passo di Annulla
 * suo. Ragioni e forme scartate in `docs/DECISIONI.md` §77.
 *
 * ── Proposta #115 (Anagrafe), 13 ottobre 2026 ────────────────────────────
 *
 * Dopo l'adozione della v2.0.12, due punti sullo spazio automatico. Ragioni e
 * forme scartate in `docs/DECISIONI.md` §78.
 *
 * La regola della #110, «non accanto alla punteggiatura», valeva uguale dai
 * due lati, e dopo una virgola o un punto il dato restava attaccato. Ora si
 * decide lato per lato (`staccaPrima`, `staccaDopo`): lo spazio c'è sempre,
 * con le eccezioni scritte accanto alle due espressioni. Deciso in sessione:
 * le virgolette dritte doppie si contano nella riga; l'apostrofo, dritto o
 * curvo, tiene il dato attaccato; ai segni della proposta si aggiunge `…`.
 * `togliDato` legge le stesse due funzioni, quindi toglie anche lo spazio
 * rimasto dopo una parentesi aperta. Una pillola lasciata dov'era non passa
 * più da «metti e togli»: non si tocca il documento, o una pillola attaccata
 * a mano si ritroverebbe staccata.
 *
 * Chi scrive una lettera o una cifra attaccata a una pillola: il plugin
 * `scrittura`. `handleTextInput` segna la transazione del testo digitato, e
 * `appendTransaction` aggiunge gli spazi in una transazione con
 * `closeHistory`, che la cronologia tiene come passo a sé anche se è
 * accodata. Così l'app riceve il testo una volta sola, già con lo spazio, e
 * un Annulla toglie lo spazio e lascia il carattere. Una transazione vuota
 * con `closeHistory` chiude il passo: senza, ciò che si scrive entro mezzo
 * secondo finirebbe nel passo dello spazio. Lo stesso per le transazioni
 * `paste`. Durante una composizione non si tocca niente: `apply` tiene da
 * parte il tratto composto, e a `compositionend` più un giro di eventi (i
 * cambiamenti rimasti l'editor li legge in un microtask) si guardano i suoi
 * capi. Provato in Chromium con una composizione vera mandata dal protocollo
 * del browser; in WebKit solo con transazioni simulate.
 *
 * Tre casi trovati mettendo la pillola in ogni posizione (Francesco, stessa
 * sessione: «casi che abbiamo dimenticato»). Lo spazio messo per una lettera
 * restava quando la lettera si cancellava, e una virgola scritta dopo dava
 * «Valore ,»: ora il plugin tiene il posto di quegli spazi (`tracce`) e li
 * toglie quando la lettera accanto viene tolta e al suo posto non c'è più
 * una lettera, una cifra o una pillola. Unendo due righe una pillola restava
 * attaccata alla parola dell'altra riga: `unioni` trova i punti in cui si è
 * tolto qualcosa a cavallo di due righe, e lì vale la regola del dato
 * inserito. `inserisci` con una selezione su più righe passava dal ramo del
 * testo qualunque, senza spazi: ora unisce le righe e mette il dato.
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
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { Node as NodoTiptap } from "@tiptap/core"
import { Document } from "@tiptap/extension-document"
import { Paragraph } from "@tiptap/extension-paragraph"
import { Text } from "@tiptap/extension-text"
import { UndoRedo } from "@tiptap/extensions"
import { closeHistory } from "@tiptap/pm/history"
import type { Node as NodoPM, NodeType, ResolvedPos, Slice } from "@tiptap/pm/model"
import {
  NodeSelection,
  Plugin,
  PluginKey,
  Selection,
  TextSelection,
  type EditorState,
  type Transaction,
} from "@tiptap/pm/state"
import type { EditorView } from "@tiptap/pm/view"
import { EditorContent, useEditor, type Editor, type JSONContent } from "@tiptap/react"
import { cn } from "cn"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/registry/tassullo/ui/command"
import { FORMA_SEGNAPOSTO } from "@/registry/tassullo/lib/segnaposto"
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
  /**
   * Perché il valore manca. Nell'elenco dei dati sta al posto del valore;
   * sulla pillola compare passandoci sopra o selezionandola.
   */
  nota?: string
}

/** Ciò che `ref` riceve: il fuoco, e l'inserimento da fuori. */
export type TestoSegnapostoRef = {
  focus: () => void
  /**
   * Inserisce un testo nel punto del cursore; un segnaposto diventa pillola.
   * Se prima del cursore c'è un prefisso appena scritto, il segnaposto lo
   * sostituisce. Il segnaposto prende lo spazio che gli serve da ogni lato:
   * prima sempre, tranne a inizio riga, dopo uno spazio, dopo un segno che
   * apre e dopo l'apostrofo; dopo sempre, tranne a fine riga, prima di uno
   * spazio e prima di un segno che chiude o che segue, come la virgola e il
   * punto. In un campo disabilitato o di sola lettura non fa niente.
   */
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
   *
   * Quella di serie è `FORMA_SEGNAPOSTO`, in `lib/segnaposto`: due graffe, un
   * nome senza spazi né graffe, due graffe. Fra le graffe e il nome ammette
   * `[^\S\n]`, cioè ogni spazio di JavaScript tranne l'a capo. Sono 24
   * caratteri: U+0009, U+000B, U+000C, U+000D, U+0020, U+00A0, U+1680, da
   * U+2000 a U+200A, U+2028, U+2029, U+202F, U+205F, U+3000 e U+FEFF. Chi
   * controlla lo stesso testo altrove, per esempio su un server, deve
   * togliere attorno al nome gli stessi caratteri, o la pillola e l'esito
   * del controllo non concordano: `nomeSegnaposto`, nello stesso file, legge
   * il nome così.
   */
  forma?: RegExp
  /** Il testo dell'elenco quando nessuna voce corrisponde. */
  vuoto?: string
  /**
   * Come si legge un dato che oggi non ha valore e non ha una `nota`: sulla
   * pillola passandoci sopra, e nell'elenco per i lettori di schermo, dove a
   * schermo c'è un trattino.
   */
  senzaValore?: string
  placeholder?: string
  disabled?: boolean
  /**
   * Il testo si legge e non si modifica: contrasto pieno, pillole coi valori,
   * raggiungibile col `Tab` e selezionabile. L'elenco non si apre e un dato
   * rilasciato non entra.
   */
  readOnly?: boolean
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

// Il posto che una pillola occupa nel testo di un paragrafo.
const PILLOLA_NEL_TESTO = "￼"

// `inline`, non `inline-flex`: un valore lungo va a capo come il testo, e
// `box-decoration-clone` ridisegna bordo e fondo su ogni riga.
const PILLOLA =
  "mx-px cursor-grab rounded-md border box-decoration-clone px-1 py-px select-none [&.ProseMirror-selectednode]:ring-2 [&.ProseMirror-selectednode]:ring-ring/40"
const PILLOLA_PER_STATO = {
  valore: "border-border bg-muted text-foreground",
  // Un posto che si riempirà, non un avviso: il rosso resta il solo errore.
  "senza-valore": "border-dashed border-border bg-transparent text-muted-foreground",
  sconosciuto:
    "border-destructive-border bg-destructive-subtle text-destructive-subtle-foreground",
}

// Le stesse classi di `Textarea`, sull'area di scrittura.
const AREA =
  "min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-lg whitespace-pre-wrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30 aria-disabled:cursor-not-allowed aria-disabled:bg-input/50 aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_p]:m-0"

type Magazzino = {
  voci: Map<string, VoceSegnaposto>
  senzaValore: string
  prefissi: readonly string[]
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

// I segnaposto in un testo. Uno attaccato a un'altra apertura, `{{{a}}}`, non
// lo è: chi legge la stringa da sinistra apre una graffa prima, e ci trova un
// segnaposto sbagliato. Resta testo, e l'errore si vede.
function* segnapostoIn(testo: string, riconosci: RegExp) {
  for (const trovato of testo.matchAll(riconosci)) {
    if (trovato.index > 0 && testo[trovato.index - 1] === trovato[0][0]) continue
    yield trovato
  }
}

// La voce di un segnaposto com'è scritto nel testo. Gli spazi non contano:
// `{{ famiglia.nome }}` è la voce `{{famiglia.nome}}`.
function voceDi(magazzino: Magazzino, testo: string) {
  return magazzino.voci.get(testo) ?? magazzino.voci.get(testo.replace(/\s+/g, ""))
}

// Il nome di un dato col suo gruppo: due «Nome» di gruppi diversi si
// distinguono.
function nomeDi(voce: VoceSegnaposto) {
  return voce.gruppo ? `${voce.gruppo} · ${voce.etichetta}` : voce.etichetta
}

declare module "@tiptap/core" {
  interface Storage {
    segnaposto: Magazzino
  }
}

// Tiptap appende l'editor all'elemento dell'area.
function editorDi(area: HTMLElement) {
  return (area as HTMLElement & { editor?: Editor }).editor
}

// Ciò che una pillola mostra, e in quale dei tre stati.
function aspetto(magazzino: Magazzino, scritto: string) {
  const voce = voceDi(magazzino, scritto)
  const stato: keyof typeof PILLOLA_PER_STATO = !voce
    ? "sconosciuto"
    : voce.valore
      ? "valore"
      : "senza-valore"
  return { voce, stato, testo: voce ? voce.valore || nomeDi(voce) : scritto }
}

// Ciò che segue il puntatore mentre si trascina un dato, dall'elenco o da
// dentro il testo: una pillola piccola, sotto e a destra del puntatore. Di suo
// il browser trascina l'immagine di ciò che si è preso, centrata sul
// puntatore, e copre il segno del punto in cui lo si lascia. Il browser la
// fotografa subito: l'elemento sta fuori vista per un attimo e poi si toglie.
function inVolo(carico: DataTransfer, stato: keyof typeof PILLOLA_PER_STATO, testo: string) {
  const pillola = document.createElement("span")
  pillola.setAttribute("data-slot", "testo-segnaposto-in-volo")
  pillola.className = `fixed -top-96 left-0 max-w-xs truncate text-sm ${PILLOLA} ${PILLOLA_PER_STATO[stato]}`
  pillola.textContent = testo
  document.body.append(pillola)
  carico.setDragImage(pillola, 0, 0)
  setTimeout(() => pillola.remove(), 0)
}

// Un testo che è un segnaposto, quello e basta.
function eUnDato(magazzino: Magazzino, testo: string) {
  const [solo, altro] = [...segnapostoIn(testo, magazzino.riconosci)]
  return Boolean(solo) && !altro && solo[0] === testo
}

// Il dato che una fetta porta, se porta quello e basta: una pillola presa dal
// testo, o il testo di un segnaposto arrivato da fuori.
function datoIn(fetta: Slice, tipo: NodeType, magazzino: Magazzino) {
  const primo = fetta.content.firstChild
  if (!primo || fetta.content.childCount !== 1) return null
  const dentro = primo.isTextblock ? primo.content : fetta.content
  const solo = dentro.childCount === 1 ? dentro.firstChild : null
  if (!solo) return null
  if (solo.type === tipo) return solo
  return solo.text && eUnDato(magazzino, solo.text) ? tipo.create({ testo: solo.text }) : null
}

// Il testo della riga prima e dopo un punto, con un posto per ogni pillola.
function primaDi($punto: ResolvedPos) {
  return $punto.parent.textBetween(0, $punto.parentOffset, undefined, PILLOLA_NEL_TESTO)
}
function dopoDi($punto: ResolvedPos) {
  return $punto.parent.textBetween($punto.parentOffset, $punto.parent.content.size, undefined, PILLOLA_NEL_TESTO)
}

// Lo spazio accanto a un dato si decide lato per lato. Prima del dato c'è
// sempre, tranne all'inizio della riga, dopo uno spazio e dopo un segno che
// apre; l'apostrofo, dritto o curvo, sta con questi: «l'» vuole il dato
// attaccato. Dopo il dato c'è sempre, tranne alla fine della riga, prima di
// uno spazio e prima di un segno che chiude o che segue.
const APRE = /[([«“‘'’]$/u
const CHIUDE = /^[.,;:!?…)\]»”’']/u

// Le virgolette dritte doppie non dicono da che parte guardano: si contano
// nella riga. La prima apre, la seconda chiude, e così via.
function fraVirgolette(prima: string) {
  return (prima.split('"').length - 1) % 2 === 1
}

function staccaPrima(prima: string) {
  if (!prima || /\s$/.test(prima) || APRE.test(prima)) return false
  return !(prima.endsWith('"') && fraVirgolette(prima))
}

function staccaDopo(dopo: string, prima: string) {
  if (!dopo || /^\s/.test(dopo) || CHIUDE.test(dopo)) return false
  return !(dopo.startsWith('"') && fraVirgolette(prima))
}

// Mette un dato al posto di ciò che sta fra `da` e `a`, con lo spazio che gli
// serve da ogni lato: la pillola ha un suo margine, a occhio sembra staccata,
// e nel documento uscirebbe «parola,Valore». Il cursore resta subito dopo il
// dato, prima dello spazio. È una transazione sola e apre un passo di Annulla
// suo: un `Ctrl+Z` toglie il dato insieme ai suoi spazi, e non ciò che si era
// scritto prima.
function mettiDato(tr: Transaction, da: number, a: number, dato: NodoPM) {
  const testoPrima = primaDi(tr.doc.resolve(da))
  const prima = staccaPrima(testoPrima)
  const dopo = staccaDopo(dopoDi(tr.doc.resolve(a)), testoPrima)
  const spazio = dato.type.schema.text(" ")
  tr.replaceWith(da, a, [...(prima ? [spazio] : []), dato, ...(dopo ? [spazio] : [])])
  const fine = da + (prima ? 1 : 0) + dato.nodeSize
  return closeHistory(tr.setSelection(TextSelection.create(tr.doc, fine)))
}

// Toglie la pillola che è stata spostata altrove, e lo spazio che le stava
// accanto se ora è di troppo: quello che un dato, lì, non avrebbe preso. Due
// spazi di fila, uno spazio a inizio o fine riga, davanti a una virgola o a
// un punto, dopo una parentesi aperta.
function togliDato(tr: Transaction, da: number, a: number) {
  tr.delete(da, a)
  const $qui = tr.doc.resolve(da)
  const prima = primaDi($qui)
  const dopo = dopoDi($qui)
  if (prima.endsWith(" ") && !staccaDopo(dopo, prima)) tr.delete(da - 1, da)
  else if (dopo.startsWith(" ") && !staccaPrima(prima)) tr.delete(da, da + 1)
}

// Una lettera o una cifra attaccata a una pillola: nel documento uscirebbe
// «Valoreprosegue».
const FINISCE_ATTACCATO = /[\p{L}\p{N}]$/u
const COMINCIA_ATTACCATO = /^[\p{L}\p{N}]/u

type Tratto = { da: number; a: number }

function unisci(uno: Tratto | null, altro: Tratto | null) {
  if (!uno || !altro) return uno ?? altro
  return { da: Math.min(uno.da, altro.da), a: Math.max(uno.a, altro.a) }
}

// Lo stesso tratto dopo una transazione: ciò che gli entra ai capi ne fa parte.
function sposta(tratto: Tratto, tr: Transaction) {
  return { da: tr.mapping.map(tratto.da, -1), a: tr.mapping.map(tratto.a, 1) }
}

// Il tratto che una transazione ha messo nel documento.
function trattoDi(tr: Transaction) {
  let tratto = null as Tratto | null
  for (const mappa of tr.mapping.maps) {
    if (tratto) tratto = { da: mappa.map(tratto.da, -1), a: mappa.map(tratto.a, 1) }
    mappa.forEach((_da, _a, da, a) => {
      tratto = unisci(tratto, { da, a })
    })
  }
  return tratto
}

// Ciò che una transazione dice a `scrittura`: che è testo digitato, che mette
// gli spazi, che una composizione è finita.
type Segno = { scritto?: boolean; spazi?: boolean; finita?: boolean; tracce?: Traccia[] }
// Uno spazio messo per una lettera: `s` è il suo posto, e la pillola gli sta
// prima o dopo. La lettera sta dall'altra parte.
type Traccia = { s: number; pillola: "prima" | "dopo" }
type Scrittura = { attesa: (Tratto & { id: number }) | null; messi: number; tracce: Traccia[] }

const chiaveScrittura = new PluginKey<Scrittura>("testoSegnapostoScrittura")

// Gli spazi ai due capi di un tratto appena scritto o incollato. Una lettera o
// una cifra che tocca una pillola rimasta fuori dal tratto prende uno spazio
// da quella parte. Di ciò che si incolla, un dato in testa o in coda prende
// gli spazi di un dato inserito. Il cursore resta dov'era: dopo ciò che si è
// scritto, e prima dello spazio che lo segue. È un passo di Annulla a sé: un
// `Ctrl+Z` toglie gli spazi e lascia ciò che si è scritto.
function spazi(stato: EditorState, { da, a }: Tratto, tipo: NodeType, incollato: boolean) {
  if (a <= da) return null
  const $da = stato.doc.resolve(da)
  const $a = stato.doc.resolve(a)
  if (!$da.parent.isTextblock || !$a.parent.isTextblock) return null
  const capo = (dentro: NodoPM | null, fuori: NodoPM | null, lettera: RegExp, comeDato: () => boolean) => {
    if (!dentro) return null
    if (dentro.type === tipo) return incollato && comeDato() ? "dato" : null
    return fuori?.type === tipo && lettera.test(dentro.text ?? "") ? "lettera" : null
  }
  const prima = capo($da.nodeAfter, $da.nodeBefore, COMINCIA_ATTACCATO, () => staccaPrima(primaDi($da)))
  const dopo = capo($a.nodeBefore, $a.nodeAfter, FINISCE_ATTACCATO, () => staccaDopo(dopoDi($a), primaDi($a)))
  if (!prima && !dopo) return null
  const tr = stato.tr
  if (dopo) tr.insertText(" ", a)
  if (prima) tr.insertText(" ", da)
  const tracce: Traccia[] = []
  if (prima === "lettera") tracce.push({ s: da, pillola: "prima" })
  if (dopo === "lettera") tracce.push({ s: a + (prima ? 1 : 0), pillola: "dopo" })
  return chiudi(stato, tr, tracce)
}

// Lo spazio aggiunto è un passo di Annulla a sé, e il cursore resta prima
// dello spazio che lo segue.
function chiudi(stato: EditorState, tr: Transaction, tracce: Traccia[] = []) {
  const { selection } = stato
  if (selection instanceof TextSelection && selection.empty) {
    tr.setSelection(TextSelection.create(tr.doc, tr.mapping.map(selection.head, -1)))
  }
  return closeHistory(tr.setMeta(chiaveScrittura, { spazi: true, tracce } satisfies Segno))
}

// Dove due righe sono diventate una, in una transazione: i punti in cui è
// stato tolto qualcosa che stava a cavallo di due righe.
function unioni(tr: Transaction) {
  const punti: number[] = []
  tr.mapping.maps.forEach((mappa, passo) => {
    for (let i = 0; i < punti.length; i++) punti[i] = mappa.map(punti[i], -1)
    const prima = tr.docs[passo]
    mappa.forEach((da, a, nuovoDa, nuovoA) => {
      if (nuovoDa === nuovoA && !prima.resolve(da).sameParent(prima.resolve(a))) punti.push(nuovoDa)
    })
  })
  return punti
}

// Unendo due righe, una pillola che si ritrova accanto al testo dell'altra
// riga prende lo spazio di un dato inserito lì.
function spazioAllUnione(stato: EditorState, punti: number[], tipo: NodeType) {
  const tr = stato.tr
  for (const punto of [...new Set(punti)].sort((uno, altro) => altro - uno)) {
    const $punto = stato.doc.resolve(punto)
    const prima = $punto.nodeBefore
    const dopo = $punto.nodeAfter
    if (!$punto.parent.isTextblock || !prima || !dopo) continue
    const serve =
      dopo.type === tipo
        ? staccaPrima(primaDi($punto))
        : prima.type === tipo && staccaDopo(dopoDi($punto), primaDi($punto))
    if (serve) tr.insertText(" ", punto)
  }
  return tr.docChanged ? chiudi(stato, tr) : null
}

// Lo spazio messo per una lettera se ne va con lei: cancellata la lettera, o
// sostituita con un segno, non resta «Valore ,». Resta se dall'altra parte
// c'è ancora una lettera, una cifra o una pillola. Sta nello stesso passo di
// Annulla della cancellazione.
function spaziRimasti(transazioni: readonly Transaction[], tracce: Traccia[], stato: EditorState, tipo: NodeType) {
  const daTogliere: number[] = []
  for (const traccia of tracce) {
    let s = traccia.s
    let tolta = false
    let vivo = true
    for (const tr of transazioni) {
      // La lettera sta dall'altra parte dello spazio rispetto alla pillola.
      const lettera = traccia.pillola === "prima" ? tr.mapping.mapResult(s + 1, 1) : tr.mapping.mapResult(s, -1)
      const spazio = tr.mapping.mapResult(s, 1)
      tolta ||= lettera.deleted
      vivo &&= !spazio.deleted
      s = spazio.pos
    }
    if (!tolta || !vivo || s + 1 > stato.doc.content.size || stato.doc.textBetween(s, s + 1) !== " ") continue
    const $prima = stato.doc.resolve(s)
    const $dopo = stato.doc.resolve(s + 1)
    const [pillola, altro, lato] =
      traccia.pillola === "prima"
        ? [$prima.nodeBefore, $dopo.nodeAfter, COMINCIA_ATTACCATO]
        : [$dopo.nodeAfter, $prima.nodeBefore, FINISCE_ATTACCATO]
    if (pillola?.type !== tipo) continue
    if (altro && (altro.type === tipo || lato.test(altro.text ?? ""))) continue
    daTogliere.push(s)
  }
  if (daTogliere.length === 0) return null
  const tr = stato.tr
  for (const s of daTogliere.sort((uno, altro) => altro - uno)) tr.delete(s, s + 1)
  return tr
}

// Chi scrive o incolla accanto a una pillola. La pillola ha un suo margine, e
// una lettera digitata subito dopo sembra staccata mentre nel testo non lo è.
function scrittura(tipo: NodeType) {
  return new Plugin<Scrittura>({
    key: chiaveScrittura,
    state: {
      init: () => ({ attesa: null, messi: 0, tracce: [] }),
      apply(tr, { attesa, messi, tracce }) {
        const segno = tr.getMeta(chiaveScrittura) as Segno | undefined
        if (segno?.spazi) messi += 1
        // Gli spazi messi per una lettera si seguono finché ci sono.
        if (tr.docChanged || segno?.tracce?.length) {
          tracce = tracce
            .map((traccia) => ({ ...traccia, esito: tr.mapping.mapResult(traccia.s, 1) }))
            .filter(({ esito }) => !esito.deleted)
            .map(({ pillola, esito }) => ({ s: esito.pos, pillola }))
            .concat(segno?.tracce ?? [])
        }
        if (segno?.finita) return { attesa: null, messi, tracce }
        if (attesa) attesa = { ...sposta(attesa, tr), id: attesa.id }
        // Ciò che entra mentre si compone si tiene da parte, una composizione
        // alla volta.
        const id: number | undefined = tr.getMeta("composition")
        const composto = tr.docChanged && id !== undefined ? trattoDi(tr) : null
        if (composto && id !== undefined) {
          attesa = { ...(attesa?.id === id ? unisci(attesa, composto)! : composto), id }
        }
        return { attesa, messi, tracce }
      },
    },
    props: {
      handleTextInput(vista, _da, _a, _testo, predefinita) {
        // Mentre si compone un carattere non si tocca niente: il testo
        // attorno deve restare fermo, o la composizione si interrompe.
        if (vista.composing) return false
        vista.dispatch(predefinita().setMeta(chiaveScrittura, { scritto: true } satisfies Segno))
        return true
      },
      handleDOMEvents: {
        // A composizione finita, e dopo che l'editor ne ha letto il testo, la
        // regola vale per ciò che si è composto.
        compositionend(vista) {
          setTimeout(() => {
            if (vista.isDestroyed || vista.composing) return
            const attesa = chiaveScrittura.getState(vista.state)?.attesa
            if (!attesa) return
            const tr = spazi(vista.state, attesa, tipo, false)
            const segno: Segno = { ...(tr?.getMeta(chiaveScrittura) as Segno | undefined), finita: true }
            vista.dispatch((tr ?? vista.state.tr).setMeta(chiaveScrittura, segno))
          })
          return false
        },
      },
    },
    appendTransaction(transazioni, prima, stato) {
      if (transazioni.some((tr) => tr.getMeta("history$"))) return null
      // Mentre si compone non si tocca niente.
      if (transazioni.some((tr) => tr.getMeta("composition") !== undefined)) return null
      let tratto: Tratto | null = null
      let incollato = false
      let punti: number[] = []
      for (const tr of transazioni) {
        if (tratto) tratto = sposta(tratto, tr)
        punti = punti.map((punto) => tr.mapping.map(punto, -1))
        if (!tr.docChanged) continue
        const segno = tr.getMeta(chiaveScrittura) as Segno | undefined
        const incolla = Boolean(tr.getMeta("paste"))
        if (segno?.scritto || incolla) {
          tratto = unisci(tratto, trattoDi(tr))
          incollato ||= incolla
        } else if (!segno) {
          punti.push(...unioni(tr))
        }
      }
      return (
        (tratto && spazi(stato, tratto, tipo, incollato)) ??
        spazioAllUnione(stato, punti, tipo) ??
        spaziRimasti(transazioni, chiaveScrittura.getState(prima)?.tracce ?? [], stato, tipo)
      )
    },
    // Dopo gli spazi il passo di Annulla si chiude: ciò che si scrive subito
    // dopo non finisce nello stesso passo.
    view: () => ({
      update(vista, prima) {
        const messi = chiaveScrittura.getState(vista.state)?.messi
        if (messi !== chiaveScrittura.getState(prima)?.messi) vista.dispatch(closeHistory(vista.state.tr))
      },
    }),
  })
}

// Dove cade ciò che si rilascia in un punto dello schermo. Nel testo, dov'è
// il puntatore. Nello spazio vuoto: sotto l'ultima riga, in coda a quella;
// sopra la prima, al suo inizio; fra due righe, in coda a quella di sopra. Di
// suo l'editor ne farebbe una riga nuova. Sopra e sotto il testo si guarda
// dove sta il puntatore e non cosa risponde il browser: lì ognuno dice una
// posizione diversa.
function doveCade(vista: EditorView, evento: MouseEvent) {
  const { doc } = vista.state
  const prima = vista.dom.firstElementChild?.getBoundingClientRect()
  const ultima = vista.dom.lastElementChild?.getBoundingClientRect()
  if (prima && evento.clientY < prima.top) return { pos: Selection.atStart(doc).from, nelTesto: false }
  if (ultima && evento.clientY > ultima.bottom) return { pos: Selection.atEnd(doc).from, nelTesto: false }
  const punto = vista.posAtCoords({ left: evento.clientX, top: evento.clientY })
  if (!punto) return null
  const $punto = doc.resolve(punto.pos)
  if ($punto.parent.isTextblock) return { pos: punto.pos, nelTesto: true }
  return { pos: Selection.near($punto, -1).from, nelTesto: false }
}

// Il segno del punto di rilascio: una barra verticale del colore del marchio,
// alta quanto la riga.
const SEGNO = "pointer-events-none absolute z-50 w-0.5 -translate-x-1/2 rounded-full bg-primary"

// Il trascinamento: l'immagine che segue il puntatore, il segno del punto in
// cui il dato cadrà, e il rilascio. Il segno e il rilascio leggono il punto
// dalla stessa funzione, quindi il segno non indica mai un altro posto.
function trascinamento(tipo: NodeType, magazzino: Magazzino) {
  return new Plugin({
    props: {
      handleDrop(vista, evento, fetta, spostato) {
        const cade = doveCade(vista, evento)
        if (!cade) return false
        const dato = datoIn(fetta, tipo, magazzino)
        // Nel testo, ciò che non è un dato solo lo mette l'editor.
        if (!dato && cade.nelTesto) return false
        const tr = vista.state.tr
        // Ciò che si sposta è il nodo trascinato; la selezione solo se si è
        // trascinata quella. Una pillola presa senza selezionarla non è la
        // selezione. Il campo `node` c'è ma non è fra i tipi dichiarati.
        const preso = (vista.dragging as { node?: NodeSelection } | null)?.node
        const origine = spostato ? (preso ?? vista.state.selection) : null
        if (dato && origine && cade.pos >= origine.from && cade.pos <= origine.to) {
          // Lasciata dov'era, davanti o dietro di sé: il testo non cambia.
          tr.setSelection(TextSelection.create(tr.doc, origine.to))
        } else if (dato) {
          // Prima si mette e poi si toglie: lasciata accanto a dov'era, la
          // pillola ritrova gli spazi che aveva.
          mettiDato(tr, cade.pos, cade.pos, dato)
          if (origine) {
            togliDato(tr, tr.mapping.map(origine.from, 1), tr.mapping.map(origine.to, -1))
          }
        } else {
          origine?.replace(tr)
          const dove = tr.mapping.map(cade.pos)
          const passi = tr.steps.length
          tr.replaceRange(dove, dove, fetta)
          const fine = tr.mapping.slice(passi).map(dove, 1)
          tr.setSelection(Selection.near(tr.doc.resolve(fine), -1))
        }
        vista.dispatch(tr.setMeta("uiEvent", "drop"))
        vista.focus()
        return true
      },
    },
    view(vista) {
      let segno: HTMLElement | null = null
      let ultimo: DragEvent | null = null
      let scadenza: ReturnType<typeof setTimeout> | undefined
      const togli = () => {
        clearTimeout(scadenza)
        segno?.remove()
        segno = null
        ultimo = null
      }
      const mostra = (evento: DragEvent) => {
        const cade = vista.editable ? doveCade(vista, evento) : null
        const cornice = vista.dom.offsetParent
        if (!cade || !cornice) return togli()
        const riga = vista.coordsAtPos(cade.pos)
        const origine = cornice.getBoundingClientRect()
        if (!segno) {
          segno = document.createElement("div")
          segno.setAttribute("data-slot", "testo-segnaposto-rilascio")
          segno.className = SEGNO
          cornice.append(segno)
        }
        segno.style.left = `${riga.left - origine.left}px`
        segno.style.top = `${riga.top - origine.top}px`
        segno.style.height = `${riga.bottom - riga.top}px`
        ultimo = evento
        // Un trascinamento finito altrove non avvisa: il segno non resta lì.
        clearTimeout(scadenza)
        scadenza = setTimeout(togli, 5000)
      }
      // Arriva dopo il gestore dell'editor, che ha già detto cosa si trascina.
      const parte = (evento: DragEvent) => {
        const fetta = vista.dragging?.slice
        const dato = fetta ? datoIn(fetta, tipo, magazzino) : null
        if (!dato || !evento.dataTransfer) return
        const { stato, testo } = aspetto(magazzino, dato.attrs.testo)
        inVolo(evento.dataTransfer, stato, testo)
      }
      const esce = (evento: DragEvent) => {
        if (!(evento.relatedTarget instanceof Node && vista.dom.contains(evento.relatedTarget))) togli()
      }
      vista.dom.addEventListener("dragstart", parte)
      vista.dom.addEventListener("dragover", mostra)
      vista.dom.addEventListener("dragleave", esce)
      vista.dom.addEventListener("drop", togli)
      vista.dom.addEventListener("dragend", togli)
      return {
        // Il testo è cambiato sotto un dato in volo: il segno segue.
        update(_vista, prima) {
          if (segno && ultimo && prima.doc !== vista.state.doc) mostra(ultimo)
        },
        destroy() {
          vista.dom.removeEventListener("dragstart", parte)
          vista.dom.removeEventListener("dragover", mostra)
          vista.dom.removeEventListener("dragleave", esce)
          vista.dom.removeEventListener("drop", togli)
          vista.dom.removeEventListener("dragend", togli)
          togli()
        },
      }
    },
  })
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
      prefissi: [],
      riconosci: espressione(FORMA_SEGNAPOSTO, []),
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
        const { voce, stato, testo } = aspetto(magazzino, node.attrs.testo)
        dom.setAttribute("data-stato", stato)
        dom.className = `${PILLOLA} ${PILLOLA_PER_STATO[stato]}`
        dom.textContent = testo
        // Ciò che si legge passando sopra la pillola o selezionandola: il nome
        // del dato, o perché il valore manca.
        if (!voce) delete dom.dataset.nota
        else dom.dataset.nota = voce.valore ? nomeDi(voce) : (voce.nota ?? magazzino.senzaValore)
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
          const cambi: { da: number; a: number; testo: string; comeTesto?: string }[] = []
          stato.doc.descendants((nodo, posizione) => {
            if (!nodo.isTextblock) return true
            const testo = nodo.textBetween(0, nodo.content.size, undefined, PILLOLA_NEL_TESTO)
            for (const trovato of segnapostoIn(testo, magazzino.riconosci)) {
              const da = posizione + 1 + trovato.index
              const a = da + trovato[0].length
              // Il cursore è dentro: lo si sta scrivendo o modificando.
              if ((from > da && from < a) || (to > da && to < a)) continue
              cambi.push({ da, a, testo: trovato[0] })
            }
            // Una pillola che ora ha un'apertura attaccata davanti torna
            // testo: nella stringa non è più un segnaposto.
            nodo.forEach((figlio, scarto) => {
              if (figlio.type !== tipo || scarto === 0) return
              const scritto: string = figlio.attrs.testo
              if (testo[scarto - 1] !== scritto[0]) return
              const da = posizione + 1 + scarto
              cambi.push({ da, a: da + 1, testo: "", comeTesto: scritto })
            })
            return false
          })
          if (cambi.length === 0) return null

          const tr = stato.tr
          for (const cambio of cambi.sort((uno, altro) => altro.da - uno.da)) {
            const nuovo = cambio.comeTesto
              ? stato.schema.text(cambio.comeTesto)
              : tipo.create({ testo: cambio.testo })
            tr.replaceWith(cambio.da, cambio.a, nuovo)
          }
          return tr
        },
      }),
      trascinamento(tipo, magazzino),
      scrittura(tipo),
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
  forma: RegExp,
  prefissi: readonly string[]
) {
  const magazzino = editor.storage.segnaposto
  magazzino.voci = new Map(voci.map((voce) => [voce.testo, voce]))
  magazzino.senzaValore = senzaValore
  magazzino.prefissi = prefissi
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
      for (const trovato of segnapostoIn(riga, riconosci)) {
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
        if (!testo || !editor.isEditable) return
        // Un prefisso appena scritto, col suo filtro di una parola: il
        // segnaposto lo sostituisce, come la scelta dall'elenco.
        const magazzino = editor.storage.segnaposto
        const { prefissi } = magazzino
        const aperta = leggiSessione(editor, prefissi)
        const sostituisce =
          aperta && !/\s/.test(aperta.query) && prefissi.some((p) => p && testo.startsWith(p))
        const { $from, $to } = editor.state.selection
        if (eUnDato(magazzino, testo) && $from.parent.isTextblock && $to.parent.isTextblock) {
          // Un dato entra già pillola, con lo spazio che gli serve attorno.
          const dato = editor.schema.nodes.segnaposto.create({ testo })
          const tr = editor.state.tr
          const [da, a] = sostituisce ? [aperta.da, aperta.a] : [$from.pos, $to.pos]
          // Una selezione su più righe: prima le righe si uniscono, e il dato
          // va dove si sono unite.
          const suPiuRighe = !sostituisce && !$from.sameParent($to)
          if (suPiuRighe) tr.delete(da, a)
          editor.view.dispatch(mettiDato(tr, da, suPiuRighe ? da : a, dato).scrollIntoView())
          editor.view.focus()
        } else if (sostituisce) {
          editor.view.dispatch(editor.state.tr.insertText(testo, aperta.da, aperta.a).scrollIntoView())
          editor.view.focus()
        } else {
          editor.chain().focus().insertContent({ type: "text", text: testo }).run()
        }
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
  forma = FORMA_SEGNAPOSTO,
  vuoto = "Nessun dato",
  senzaValore = "Senza valore",
  placeholder,
  disabled = false,
  readOnly = false,
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
  // La voce evidenziata si ricorda per il suo testo, non per il posto: se le
  // voci cambiano a elenco aperto resta lei. `null` è la prima.
  const [attivaTesto, setAttivaTesto] = React.useState<string | null>(null)
  const [senzaTesto, setSenzaTesto] = React.useState(!(value ?? defaultValue))
  // La pillola sotto il puntatore e quella selezionata: la loro nota si
  // legge in un tooltip.
  const [indicata, setIndicata] = React.useState<HTMLElement | null>(null)
  const [selezionata, setSelezionata] = React.useState<HTMLElement | null>(null)
  // La nota in mostra, con la sua pillola: resta mentre il tooltip sfuma.
  const [mostrata, setMostrata] = React.useState<{ pillola: HTMLElement; nota: string } | null>(null)
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
  // Se la voce evidenziata non c'è più, si torna alla prima.
  const attiva = Math.max(
    0,
    trovate.findIndex((voce) => voce.testo === attivaTesto)
  )

  // Le voci cambiano a ogni resa se l'app le scrive sul posto: ciò che conta
  // è il contenuto, in una chiave sola.
  const chiaveVoci = voci
    .map((voce) => [voce.testo, voce.etichetta, voce.valore, voce.nota].join("\u0000"))
    .join("\u0001")

  function aggiorna(editor: Editor, scrivendo: boolean) {
    if (!editor.isEditable) return setAperto(false)
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

    if (!continua || letta.query !== sessione?.query) setAttivaTesto(null)
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
    view.dispatch(mettiDato(state.tr, sessione.da, a, nodo).scrollIntoView())
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
      setAttivaTesto(trovate[(attiva + 1) % trovate.length].testo)
      return true
    }
    if (evento.key === "ArrowUp") {
      setAttivaTesto(trovate[(attiva - 1 + trovate.length) % trovate.length].testo)
      return true
    }
    if (evento.key === "Enter" || evento.key === "Tab") {
      scegli(editor, trovate[attiva])
      return true
    }
    return false
  }

  // La pillola selezionata, da tastiera o col dito, e quella sotto il
  // puntatore se c'è ancora.
  function guardaPillole(editor: Editor) {
    const { selection } = editor.state
    const dom =
      editor.isFocused && selection instanceof NodeSelection && selection.node.type.name === "segnaposto"
        ? editor.view.nodeDOM(selection.from)
        : null
    setSelezionata(dom instanceof HTMLElement ? dom : null)
    setIndicata((pillola) => (pillola?.isConnected ? pillola : null))
  }

  // I gestori dell'editor nascono una volta sola: chiamano l'ultima versione
  // di queste funzioni, che vedono lo stato di adesso.
  const adesso = React.useRef({ aggiorna, tasto, apriComeTesto, guardaPillole, onChange, onBlur, onFocus })
  React.useEffect(() => {
    adesso.current = { aggiorna, tasto, apriComeTesto, guardaPillole, onChange, onBlur, onFocus }
  })

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      UndoRedo,
      Segnaposto,
    ],
    content: daTesto(value ?? defaultValue ?? "", espressione(forma, voci)),
    editable: !disabled && !readOnly,
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
    onTransaction: ({ editor: mio }) => {
      adesso.current.guardaPillole(mio)
    },
    onBlur: () => {
      setAperto(false)
      setSelezionata(null)
      adesso.current.onBlur?.()
    },
    onFocus: ({ editor: mio }) => {
      adesso.current.guardaPillole(mio)
      adesso.current.onFocus?.(manigliaDi(mio))
    },
  })

  // Il puntatore sopra una pillola: premendo o trascinando la nota si toglie.
  // E il fuoco che arriva in un testo di sola lettura.
  React.useEffect(() => {
    if (!editor) return
    const area = editor.view.dom
    const sopra = (evento: MouseEvent) => {
      const bersaglio = evento.target instanceof Element ? evento.target : null
      setIndicata(bersaglio?.closest<HTMLElement>('[data-slot="testo-segnaposto-pillola"]') ?? null)
    }
    const via = () => setIndicata(null)
    const trascina = () => {
      setIndicata(null)
      setSelezionata(null)
    }
    // In sola lettura il fuoco arriva col `Tab` ma la selezione resterebbe
    // nel campo di prima, e in Safari ciò che si scrive va dov'è la
    // selezione: la si porta qui.
    const fuoco = () => {
      if (editor.isEditable) return
      const selezione = area.ownerDocument.getSelection()
      if (selezione && !area.contains(selezione.anchorNode)) selezione.collapse(area, 0)
    }
    area.addEventListener("mouseover", sopra)
    area.addEventListener("mouseleave", via)
    area.addEventListener("mousedown", via)
    area.addEventListener("dragstart", trascina)
    area.addEventListener("focus", fuoco)
    return () => {
      area.removeEventListener("mouseover", sopra)
      area.removeEventListener("mouseleave", via)
      area.removeEventListener("mousedown", via)
      area.removeEventListener("dragstart", trascina)
      area.removeEventListener("focus", fuoco)
    }
  }, [editor])

  React.useEffect(() => {
    if (editor) riempi(editor, voci, senzaValore, forma, prefissi)
    // `voci`, `forma` e `prefissi` contano per il contenuto: `chiaveVoci`, la
    // sorgente e la chiave dei prefissi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, chiaveVoci, senzaValore, forma.source, prefissi.join("\u0000")])

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
    editor?.setEditable(!disabled && !readOnly, false)
  }, [editor, disabled, readOnly])

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
    attributo(area, "aria-readonly", readOnly && !disabled ? "true" : undefined)
    // Un'area che non si modifica esce dal giro del `Tab`: in sola lettura ci
    // si rimette. Quando si modifica il suo posto lo dà l'editor.
    if (readOnly && !disabled) area.setAttribute("tabindex", "0")
    else if (disabled) area.removeAttribute("tabindex")
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
  }, [editor, id, etichetta, etichettataDa, descrittaDa, nonValido, disabled, readOnly])

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

  // Con l'elenco aperto la nota non si mostra: coprirebbe le voci. Fra la
  // pillola sotto il puntatore e quella selezionata vale la prima: è lì che
  // si sta guardando.
  const conNota = aperto ? null : (indicata ?? selezionata)
  const nota = conNota?.dataset.nota
  // Mentre il tooltip sfuma tiene la nota e la pillola che aveva: passando a
  // una pillola senza nota, come la rossa, non resta un riquadro vuoto.
  if (conNota && nota && (mostrata?.pillola !== conNota || mostrata.nota !== nota)) {
    setMostrata({ pillola: conNota, nota })
  }

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
      <TooltipPrimitive.Root open={Boolean(nota)}>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner
            anchor={mostrata?.pillola}
            side="top"
            sideOffset={6}
            className="isolate z-50"
          >
            <TooltipPrimitive.Popup
              data-slot="testo-segnaposto-nota"
              className="z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
            >
              {mostrata?.nota}
              <TooltipPrimitive.Arrow className="z-50 size-2.5 -translate-y-1/2 rotate-45 rounded-xs bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=top]:-bottom-2.5" />
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
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
              className="z-50 flex w-md max-w-(--available-width) origin-(--transform-origin) flex-col rounded-lg bg-popover text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
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
                    const voce = valore === "" ? undefined : trovate[Number(valore)]
                    if (voce) setAttivaTesto(voce.testo)
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
                              className="items-start [&>svg:last-child]:hidden"
                            >
                              {/* Come nell'elenco dei dati: in piccolo il
                                  nome, per intero anche su più righe, e
                                  sotto in evidenza il valore di oggi; se
                                  manca, il perché. */}
                              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span
                                  data-slot="testo-segnaposto-voce-nome"
                                  className="text-xs break-words text-muted-foreground group-data-selected/command-item:text-foreground"
                                >
                                  {voce.etichetta}
                                </span>
                                {voce.valore ? (
                                  <span className="font-medium break-words">{voce.valore}</span>
                                ) : (
                                  <span className="break-words text-muted-foreground group-data-selected/command-item:text-foreground">
                                    {voce.nota || (
                                      <>
                                        <span aria-hidden="true">—</span>
                                        <span className="sr-only">{senzaValore}</span>
                                      </>
                                    )}
                                  </span>
                                )}
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
  /**
   * Come si legge un dato che oggi non ha valore e non ha una `nota`. A
   * schermo c'è un trattino; questo testo è per i lettori di schermo.
   */
  senzaValore?: string
  /** Il testo quando nessun dato corrisponde. */
  vuoto?: string
  /**
   * Spegne l'elenco, per esempio mentre la pagina salva: filtro e ricerca non
   * rispondono, e i dati non si cliccano né si trascinano.
   */
  disabled?: boolean
  /**
   * Il gruppo scelto nel filtro; `null` li mostra tutti. Di serie lo tiene
   * l'elenco, e si perde quando la pagina smette di renderlo: passandolo, con
   * `onGruppo`, lo tiene la pagina. Lo stesso per `ricerca`.
   */
  gruppo?: string | null
  onGruppo?: (gruppo: string | null) => void
  /** Il testo scritto nella ricerca. */
  ricerca?: string
  onRicerca?: (ricerca: string) => void
  className?: string
}

const TUTTI = "\u0000tutti"

// Uno stato che la pagina può tenere fuori: se passa il valore vale il suo,
// altrimenti lo tiene il componente. Chi ascolta è avvisato in tutti e due i
// casi.
function useStato<T>(fuori: T | undefined, iniziale: T, onCambia?: (valore: T) => void) {
  const [dentro, setDentro] = React.useState(iniziale)
  const cambia = (valore: T) => {
    setDentro(valore)
    onCambia?.(valore)
  }
  return [fuori === undefined ? dentro : fuori, cambia] as const
}

/**
 * L'elenco dei dati da citare: in cima il filtro per gruppo e la ricerca,
 * che restano fermi, e sotto i dati, che scorrono, sotto il nome del loro
 * gruppo. Ci sono sempre tutti. Ogni dato mostra in piccolo il nome e in evidenza il valore di
 * oggi; se non ne ha, il motivo scritto nella sua `nota`, o un trattino. Si
 * clicca o si trascina dentro un `TestoSegnaposto`.
 */
export function TestoSegnapostoElenco({
  voci,
  onScegli,
  etichettaGruppi = "Dati di",
  tutti = "Tutti i dati",
  senzaValore = "Senza valore",
  vuoto = "Nessun dato",
  disabled = false,
  gruppo: gruppoFuori,
  onGruppo,
  ricerca,
  onRicerca,
  className,
}: TestoSegnapostoElencoProps) {
  const id = React.useId()
  const [scelto, setGruppo] = useStato(gruppoFuori, null, onGruppo)
  const [cercato, setCercato] = useStato(ricerca, "", onRicerca)
  const nomi = [...new Set(voci.map((voce) => voce.gruppo ?? "").filter(Boolean))]
  // Un gruppo che fra le voci non c'è, o non c'è più, vale «tutti».
  const gruppo = scelto !== null && nomi.includes(scelto) ? scelto : TUTTI
  const delGruppo = gruppo === TUTTI ? voci : voci.filter((voce) => voce.gruppo === gruppo)
  const mostrate = filtra(delGruppo, cercato)
  // Con tutti i dati in vista ogni gruppo ha la sua intestazione: due «Nome»
  // di gruppi diversi si distinguono. Scelto un gruppo, lo dice il filtro.
  const gruppi =
    gruppo === TUTTI && nomi.length > 1 ? raggruppa(mostrate) : [{ nome: "", voci: mostrate, da: 0 }]

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
              disabled={disabled}
              value={gruppo}
              onValueChange={(nuovo) => setGruppo(nuovo === null || nuovo === TUTTI ? null : nuovo)}
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
          disabled={disabled}
          value={cercato}
          onChange={(evento) => setCercato(evento.target.value)}
        />
      </div>
      {/* `relative`: i testi per i lettori di schermo, che sono posizionati,
          restano dentro ciò che scorre e non allungano la pagina. */}
      <div className="relative -mx-1 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-1 py-px">
        {mostrate.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{vuoto}</p>
        ) : null}
        {gruppi.map((delNome) => (
          <div
            key={delNome.nome}
            role="group"
            aria-label={delNome.nome || undefined}
            className="flex shrink-0 flex-col gap-1.5"
          >
            {delNome.nome ? (
              <span
                aria-hidden="true"
                data-slot="testo-segnaposto-dati-gruppo"
                className="px-1 pt-1 text-xs font-medium text-muted-foreground"
              >
                {delNome.nome}
              </span>
            ) : null}
            {delNome.voci.map((voce) => (
              <Item
                key={voce.testo}
                variant="outline"
                size="sm"
                className="shrink-0 cursor-grab flex-col items-start gap-0.5 text-left hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                render={
                  <button
                    type="button"
                    // Safari non porta il `Tab` su un bottone senza `tabIndex`
                    // scritto; i `Button` del design system ce l'hanno già.
                    tabIndex={0}
                    disabled={disabled}
                    draggable={!disabled}
                    onDragStart={(evento) => {
                      evento.dataTransfer.setData("text/plain", voce.testo)
                      evento.dataTransfer.effectAllowed = "copy"
                      inVolo(
                        evento.dataTransfer,
                        voce.valore ? "valore" : "senza-valore",
                        voce.valore || nomeDi(voce)
                      )
                    }}
                    onClick={() => onScegli?.(voce)}
                  />
                }
              >
                <span className="text-xs text-muted-foreground">{voce.etichetta}</span>
                {voce.valore ? (
                  <span className="text-base font-medium">{voce.valore}</span>
                ) : voce.nota ? (
                  // Perché il valore manca, al posto del valore.
                  <span className="text-sm text-muted-foreground">{voce.nota}</span>
                ) : (
                  <span className="text-base font-medium text-muted-foreground">
                    <span aria-hidden="true">—</span>
                    <span className="sr-only">{senzaValore}</span>
                  </span>
                )}
              </Item>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
