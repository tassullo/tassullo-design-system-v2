/**
 * `tassullo-data-table` — la tabella di dati, e l'unica forma che ne esiste
 * in tutte le app Tassullo.
 *
 * È il blocco che toglie più codice ad Anagrafe: Prodotti, Famiglie, Norme e
 * Pubblicazioni sono quattro volte la stessa tabella, riscritta quattro volte.
 *
 * ── Perché è un blocco e non una primitiva ──────────────────────────────
 *
 * Perché **shadcn un `data-table` non ce l'ha**, e non per dimenticanza: la
 * sua pagina è dichiaratamente una *guida* — «ogni tabella che ho scritto era
 * diversa; metterle tutte in un componente vuol dire perdere la flessibilità
 * che l'headless dà». Chiesto all'MCP prima di scrivere (regola 4bis, gradino
 * 1): nel registry ci sono `table` — le sei etichette HTML vestite — e
 * `data-table-demo`, che è un esempio e per lo stile `base-nova` non esiste
 * nemmeno. Quindi qui non c'è nessun originale da cui divergere, non c'è
 * snapshot in `registry/.upstream/` e non c'è riga in `componenti-propri.json`
 * — che è il registro di ciò che sta *al posto* di una primitiva, e questo non
 * sostituisce niente. Sta in `blocks/`, come il guscio e l'intestazione, e il
 * gate su questa cartella verifica la sola regola 3.
 *
 * La flessibilità che shadcn non vuole perdere, però, **noi non la vogliamo
 * pagare quattro volte**. La guida la lascia intera a chi la segue: features,
 * stato, chrome, paginazione, tutto da riassemblare a mano in ogni pagina. Ed
 * è esattamente il meccanismo con cui le app del v1 sono divergite — nessuna
 * ha scritto la tabella *male*, l'hanno scritta ognuna *un po' diversa*.
 *
 * ── La riga che divide ──────────────────────────────────────────────────
 *
 * **Le colonne restano di TanStack; il contorno è nostro.** Le colonne si
 * dichiarano con `creaColonne()`, che è `createColumnHelper` con la sola
 * generica delle caratteristiche già messa: chi le scrive scrive TanStack
 * vero, documentato da loro, e quando esce una versione nuova la
 * documentazione che gli serve è la loro. Il contorno — ricerca, ordinamento,
 * paginazione, selezione, colonne nascoste, i due stati vuoti — è la parte che
 * in quattro pagine si copia identica, e quella la tiene il blocco.
 *
 * ── TanStack Table v9, e cosa cambia rispetto a quello che si ricorda ────
 *
 * La v9 è **a caratteristiche**: si dichiara con `tableFeatures()` ciò che
 * serve, e il resto sparisce dal bundle. Cadono i `get*RowModel` fra le
 * opzioni — i modelli di riga si creano con `create*RowModel()` e si
 * registrano lì dentro — e cadono anche le funzioni di filtro e ordinamento
 * incorporate, che vanno registrate una per una. Chi ha in mente la v8
 * (`useReactTable`, `getCoreRowModel()`, `flexRender(...)`) sta ricordando
 * un'API che qui non c'è più: `useTable`, e `<table.FlexRender />` come
 * componente.
 *
 * ── Tre scostamenti dalla guida di shadcn, tutti voluti ─────────────────
 *
 * **1. Si cerca in tutta la tabella, non in una colonna.** La guida mette un
 * campo che filtra `email`, cioè una colonna scelta a mano; le pagine di
 * Anagrafe hanno una casella di ricerca sola che guarda tutto. Qui è
 * `globalFilteringFeature`, e le colonne che non devono entrarci lo dicono
 * con `enableGlobalFilter: false`.
 *
 * **2. L'intestazione ordina con un clic, non con un menu.** La guida offre
 * `DataTableColumnHeader`, che apre un menu con Asc/Desc/Nascondi. Da tastiera
 * sono quattro gesti (Tab, Invio, freccia, Invio) per fare la cosa che si fa
 * più spesso. Qui l'intestazione **è** il bottone che cicla crescente →
 * decrescente → nessun ordine: un Tab e un Invio. Nascondere una colonna resta
 * possibile, dal menu «Colonne», che è dove si va quando si vuole quello. Il
 * criterio di `PIANO.md` per questo task dice «ordinabile e filtrabile **da
 * tastiera**»: è quello a decidere fra le due forme.
 *
 * **3. Il `<th>` dichiara `aria-sort`.** La guida non lo fa, e axe non lo
 * pretende — ma è l'unico modo in cui un lettore di schermo sa che la tabella
 * è ordinata e come. Costa un attributo.
 *
 * ── Due stati vuoti, non uno ────────────────────────────────────────────
 *
 * «Nessun risultato» quando un filtro non trova niente e «nessun dato» quando
 * la tabella è vuota **non sono la stessa cosa**: il primo ha un rimedio (togli
 * il filtro) e il secondo no (crea il primo record). La guida di shadcn ne ha
 * uno solo, `No results.`, e su una tabella appena creata dice la cosa
 * sbagliata. Qui sono due, e il blocco sa distinguerli perché conosce sia le
 * righe filtrate sia quelle totali.
 *
 * Nota per **M3.5** (`empty-state`): qui i due stati usano la primitiva
 * `empty` così com'è. Quando M3.5 stabilirà lo standard unico, questo blocco
 * ci si appoggerà — il posto in cui intervenire è `TabellaVuota`, sotto, e
 * uno solo.
 */
import * as React from "react"
import {
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrHas,
  filterFn_inDateRange,
  filterFn_inNumberRange,
  filterFn_includesString,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type Header,
  type ReactTable,
  type Row,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type ExpandedState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToHorizontalAxis, restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  EllipsisVerticalIcon,
  GripVerticalIcon,
  InboxIcon,
  PinIcon,
  PinOffIcon,
  SearchIcon,
  SearchXIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react"

import { cn } from "cn"
import { Button } from "@/registry/tassullo/ui/button"
import { Checkbox } from "@/registry/tassullo/ui/checkbox"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/tassullo/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/tassullo/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/tassullo/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/tassullo/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/tassullo/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/tassullo/ui/table"

/* ────────────────────────────────────────────────────────────────────────
 * Le caratteristiche
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Ciò che le tabelle Tassullo sanno fare. Tutto quello che non è elencato qui
 * la v9 lo toglie dal bundle — quindi questa costante è, alla lettera, il
 * confine di ciò che una tabella del design system può fare.
 *
 * Le funzioni di ordinamento sono **quattro** perché le colonne di Anagrafe
 * sono di quattro nature: testo (`text`), codici con dentro dei numeri
 * (`alphanumeric`, che ordina `A10` dopo `A9` e non prima), date (`datetime`)
 * e tutto il resto (`basic`). Registrarle qui è ciò che permette a una colonna
 * di dire `sortFn: "datetime"` senza portarsi dietro la funzione.
 *
 * `rowExpandingFeature` **è registrata sempre**, non solo per le tabelle ad
 * albero: a differenza delle funzioni di ordinamento, che una
 * colonna deve nominare per usarle, l'espansione resta inerte da sola finché
 * nessuno passa `getSottoRighe` — nessuna riga ha `subRows`, quindi
 * `getCanExpand()` è sempre falso e il ramo non lavora. Registrarla una volta
 * qui evita di biforcare `caratteristiche` in due costanti, una per le
 * tabelle che la usano (albero, pannello di dettaglio, Data Grid) e una per
 * le altre.
 *
 * `columnSizingFeature`/`columnResizingFeature`/`columnPinningFeature`
 * seguono la stessa logica: sempre registrate, mai
 * attive da sole. `enableColumnResizing`/`enableColumnPinning` restano `false`
 * finché la pagina non passa `ridimensionabile`/`colonneBloccabili` al
 * blocco — senza, `column.getCanResize()`/`getCanPin()` tornano `false` e i
 * due rami del render (`ManigliaRidimensiona`, `MenuBloccaColonna`) non
 * disegnano niente. `columnSizingFeature` resta comunque utile da sola anche
 * a `ridimensionabile` spento: è la stessa che dà a `colonna.getSize()` un
 * numero — 150 di default TanStack — usato per calcolare gli scarti del pin
 * generalizzato (v. `ancoraggioColonna`).
 *
 * `columnOrderingFeature` (il riordino delle colonne) è la stessa storia
 * una volta di più: registrata sempre, ma `state.columnOrder` resta
 * governato da TanStack (l'array vuoto di partenza, ordine di dichiarazione)
 * finché nessuna intestazione viene trascinata — nessun `enable*` da
 * spegnere, a differenza di resize e pin: la feature non ha un simile,
 * `column.getIndex()`/`setColumnOrder()` esistono comunque, ed è
 * `colonneRiordinabili` (il prop) a decidere se un'intestazione porta la
 * maniglia che li usa.
 *
 * `arrHas` (i filtri sfaccettati) tiene la riga se il valore della
 * colonna è **uguale a uno** dei valori scelti — la forma giusta per un
 * filtro a scelta multipla su un valore scalare (`stato`, `famiglia`: una
 * riga ha un solo stato, non un elenco). `arrIncludes`/`arrIncludesSome`
 * risolvono il caso opposto, un valore-elenco sulla riga, che qui non
 * ricorre. Una colonna lo usa dichiarando `filterFn: "arrHas"`; TanStack
 * toglie da sé il filtro quando l'elenco scelto torna vuoto
 * (`autoRemove`), quindi `colonna.setFilterValue([])` e
 * `colonna.setFilterValue(undefined)` sono equivalenti.
 *
 * `inNumberRange`/`inDateRange` (`data-table-filtro-
 * intervallo.tsx`/`data-table-filtro-data.tsx`) tengono la riga se il suo
 * valore cade dentro `[min, max]` — un capo assente conta come aperto
 * (`-Infinity`/`Infinity`), quindi un intervallo con un solo estremo scelto
 * filtra comunque. Entrambe sono già pronte in TanStack, non scritte qui:
 * la sola differenza dal filtro di `arrHas` è che il valore della colonna è
 * un numero o una data, non un valore da confrontare a un elenco.
 */
export const caratteristiche = tableFeatures({
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  expandedRowModel: createExpandedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    arrHas: filterFn_arrHas,
    inNumberRange: filterFn_inNumberRange,
    inDateRange: filterFn_inDateRange,
  },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
})

/** La generica che ogni tipo di TanStack vuole per prima. */
export type CaratteristicheTabella = typeof caratteristiche

/**
 * Il costruttore delle colonne: `createColumnHelper` con la generica delle
 * caratteristiche già messa.
 *
 * ```tsx
 * const col = creaColonne<Prodotto>()
 * export const COLONNE = col.columns([
 *   col.accessor("codice", { header: "Codice", sortFn: "alphanumeric" }),
 *   col.accessor("aggiornato", { header: "Aggiornato", sortFn: "datetime" }),
 * ])
 * ```
 *
 * Non è una traduzione in italiano dell'API di TanStack, ed è una scelta:
 * `accessor`, `display` e `columns` restano i loro nomi, così la
 * documentazione che serve a chi scrive una colonna è quella di TanStack e non
 * una nostra parafrasi che invecchia.
 */
export function creaColonne<TDato extends RowData>() {
  return createColumnHelper<CaratteristicheTabella, TDato>()
}

/**
 * Ciò che una colonna dichiara **oltre** a TanStack, nel suo campo `meta`.
 *
 * Due sole chiavi, e nessuna delle due è facoltativa per capriccio:
 *
 * - `titolo` è l'etichetta leggibile, usata dal menu «Colonne». Senza, quel
 *   menu ricadrebbe sull'`id`, che è una chiave di dato (`aggiornatoIl`) e non
 *   una parola italiana;
 * - `larghezza` è una **utility Tailwind** (`"w-28"`, `"w-1/4"`), non un
 *   numero di pixel: niente valori arbitrari, nemmeno negli
 *   `style` inline: le misure escono da `--spacing`, quindi seguono la densità
 *   da sé.
 *
 * **Una colonna va lasciata senza `larghezza`**, ed è quella che assorbe lo
 * spazio che avanza — di solito il nome, che è anche la più elastica. Se tutte
 * la dichiarano e la somma non torna, il browser non se ne lamenta: **le
 * comprime tutte in proporzione**, e le larghezze scritte non sono più quelle
 * rese (misurato: `w-48` che valeva 288 rendeva 279). Non è un guasto, è un
 * modo silenzioso di non ottenere ciò che si è chiesto.
 *
 * `larghezza` **si ignora** su una tabella `ridimensionabile`/`colonneBloccabili`:
 * lì la larghezza di partenza si dichiara con `size` — il campo
 * *di TanStack*, sulla colonna stessa (`col.accessor("nome", { size: 220 })`),
 * non in `meta` — insieme a `minSize`/`maxSize` per i due estremi del
 * trascinamento. Restare sui nomi di TanStack è la stessa scelta di
 * `accessor`/`display`/`columns` più sopra: la documentazione che serve a chi
 * scrive una colonna resta la loro. Una colonna senza `size` assorbe lo
 * spazio che avanza, come senza `larghezza` — la stessa elasticità, un
 * meccanismo diverso (`<colgroup>`, non la prima riga di intestazioni).
 *
 * `sottototale` è la terza chiave, ed è **facoltativa quanto le altre due**:
 * senza, una tabella ad albero (`getSottoRighe`) resta legittima —
 * mostra solo le righe figlie, senza nessun conto sul genitore. Quando c'è,
 * il blocco la chiama al posto della cella normale **sulle sole righe che
 * hanno figli** (`row.subRows.length > 0`), passandole i dati originali dei
 * figli diretti. **Una funzione, non un nome di operazione** (`"somma"`,
 * `"media"`): un subtotale di computo è quasi sempre un'unità di misura da
 * scrivere insieme al numero («12,4 m²», non «12.4»), e quella formattazione
 * è dominio della pagina, non del blocco — la stessa ragione per cui
 * `rowAggregationFeature` di TanStack non è fra le `caratteristiche` sopra:
 * qui l'albero è dato vero, non un raggruppamento con una
 * funzione di aggregazione registrata a parte.
 *
 * `piede` è la quarta, ed è la **coda della tabella** — da non confondere con
 * `sottototale`, che è la coda di un *gruppo*. Le due si somigliano nella
 * firma e stanno in posti opposti: `sottototale` prende il posto della cella
 * su una riga che ha figli, `piede` disegna una riga in più dentro un
 * `<tfoot>`, sotto tutte. Il blocco la chiama **solo se la tabella dichiara
 * `piede`** (la prop di `DataTable`), passandole i dati delle righe che il
 * filtro lascia passare — v. lì per quali righe sono, che è la sola cosa
 * davvero da sapere prima di scrivere un totale.
 */
export type MetaColonna<TDato = unknown> = {
  titolo?: string
  larghezza?: string
  sottototale?: (righeFiglie: TDato[], riga: TDato) => React.ReactNode
  piede?: (righeFiltrate: TDato[]) => React.ReactNode
  /**
   * La colonna porta già, nel proprio `header`, un modo di bloccarsi (un
   * menu che compone ordinamento e pin insieme — `IntestazioneColonnaMenu`,
   * qui sotto, o una testata scritta a mano): `colonneBloccabili`
   * non le aggiunge anche il proprio `MenuBloccaColonna`, o comparirebbero
   * due grilletti di pin per la stessa colonna. Non spegne `colonneBloccabili`
   * sulla colonna — resta bloccabile, `getCanPin()`/`pin()` restano gli
   * stessi — spegne solo l'icona che il blocco aggiungerebbe da sé.
   */
  azioniProprie?: boolean
}

/** Una colonna già tipizzata sulle caratteristiche di casa. */
export type ColonnaTabella<TDato extends RowData> = ColumnDef<
  CaratteristicheTabella,
  TDato
>

/** L'istanza di tabella, per chi scrive una cella che deve parlare col resto. */
export type IstanzaTabella<TDato extends RowData> = ReactTable<
  CaratteristicheTabella,
  TDato
>

/* ────────────────────────────────────────────────────────────────────────
 * L'intestazione ordinabile
 * ──────────────────────────────────────────────────────────────────────── */

type IntestazioneColonnaProps<TDato extends RowData, TValore> = {
  colonna: Column<CaratteristicheTabella, TDato, TValore>
  titolo: string
  /** `"fine"` per le colonne di numeri, che si allineano a destra. */
  allinea?: "inizio" | "fine"
}

/**
 * Le due frasi di un verso d'ordinamento, per le sole `sortFn` dove «crescente»
 * e «decrescente» non bastano a farsi capire. Inventario da niko-table
 * (`config/data-table.tsx`, tabella "Sort Labels"): quattro
 * coppie, non una sola, perché il **tipo** della colonna cambia la frase
 * intera, non solo il verso — «dal meno recente» non è «crescente» con le
 * date al posto dei numeri, è un'altra frase.
 *
 * **Chiave `sortFn`, non una prop in più su `IntestazioneColonna`**: la
 * colonna dichiara già `sortFn: "datetime"` a TanStack per ordinare — farlo
 * dichiarare una seconda volta all'intestazione, con un nome diverso per lo
 * stesso fatto, è la duplicazione che il resto del blocco evita apposta
 * (`meta.titolo`, non due volte l'etichetta). `alphanumeric`/`text` non sono
 * in tabella: restano `crescente`/`decrescente`, la stessa frase che niko usa
 * per il testo (`"Asc"`/`"Desc"`). Nessuna colonna booleana oggi (nessuna
 * `sortFn` la copre, v. `caratteristiche`): la coppia False/True first di
 * niko resta un'annotazione, non un codice morto da scrivere per un caso che
 * non esiste ancora.
 */
const ETICHETTE_ORDINE: Record<string, { crescente: string; decrescente: string }> = {
  basic: {
    crescente: "dal più piccolo al più grande",
    decrescente: "dal più grande al più piccolo",
  },
  datetime: {
    crescente: "dal meno recente al più recente",
    decrescente: "dal più recente al meno recente",
  },
}

/**
 * L'intestazione di una colonna ordinabile: **è** il bottone, non lo apre.
 *
 * Il ciclo è a tre tempi — crescente, decrescente, nessun ordine — e il terzo
 * conta: senza, una colonna ordinata per sbaglio non si può più disordinare, e
 * l'unico modo di tornare all'ordine di partenza è ricaricare la pagina.
 *
 * Il nome accessibile dice **cosa fa il clic**, non com'è ora («Ordina per
 * Codice, crescente»): lo stato attuale lo porta già `aria-sort` sul `<th>`, e
 * ripeterlo nel bottone lo farebbe leggere due volte contraddicendosi.
 */
export function IntestazioneColonna<TDato extends RowData, TValore>({
  colonna,
  titolo,
  allinea = "inizio",
}: IntestazioneColonnaProps<TDato, TValore>) {
  if (!colonna.getCanSort()) {
    return (
      <span className={cn("block", allinea === "fine" && "text-right")}>
        {titolo}
      </span>
    )
  }

  const sortFn = colonna.columnDef.sortFn
  const etichette =
    (typeof sortFn === "string" && ETICHETTE_ORDINE[sortFn]) || {
      crescente: "crescente",
      decrescente: "decrescente",
    }

  const ordine = colonna.getIsSorted()
  const prossimo =
    ordine === false ? etichette.crescente : ordine === "asc" ? etichette.decrescente : "nessun ordine"

  const bottone = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => colonna.toggleSorting(undefined, false)}
      aria-label={`Ordina per ${titolo}: ${prossimo}`}
      className={cn(
        // Il margine negativo pareggia il `px-2.5` del bottone col `px-2` del
        // `<th>`, così l'intestazione si incolonna con le celle sotto invece di
        // stare rientrata di due pixel.
        "h-7 font-medium",
        allinea === "fine" ? "-mr-2" : "-ml-2"
      )}
    >
      <span>{titolo}</span>
      {ordine === "asc" ? (
        <ArrowUpIcon aria-hidden />
      ) : ordine === "desc" ? (
        <ArrowDownIcon aria-hidden />
      ) : (
        <ChevronsUpDownIcon aria-hidden className="text-muted-foreground" />
      )}
    </Button>
  )

  // `ml-auto` su un `inline-flex` dentro un `<th>` non sposta niente: il `<th>`
  // non è un contenitore flex, quindi il margine automatico non ha spazio da
  // distribuire. Per mandare a destra l'intestazione di una colonna di numeri
  // serve che a essere flex sia il contenitore.
  return allinea === "fine" ? (
    <div className="flex justify-end">{bottone}</div>
  ) : (
    bottone
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * L'intestazione a menu — la forma alternativa
 * ──────────────────────────────────────────────────────────────────────── */

// Ordinamento e blocco in **un solo grilletto** «⋮», invece dei due che
// `IntestazioneColonna` + `colonneBloccabili` mettono fianco a fianco.
//
// **È un'alternativa opt-in, non il default**, e la distinzione va tenuta:
// `IntestazioneColonna` resta la forma normale — il titolo *è* il bottone
// d'ordinamento, un clic e basta. Questa la si sceglie quando la testata si
// affolla: con `colonneBloccabili` acceso, ogni colonna porterebbe altrimenti
// freccia d'ordinamento **e** puntina, due bersagli per colonna moltiplicati
// per quante sono. Chi la usa dichiara `meta.azioniProprie: true` sulla
// colonna, o `colonneBloccabili` aggiungerebbe comunque la *sua* puntina e i
// grilletti di pin tornerebbero due.
//
// Il grilletto è invisibile finché non si passa sopra o non arriva il fuoco
// (`group-hover` / `group-focus-within`, col `group` sul contenitore qui
// dentro e non sulla `<th>`), e resta **acceso** quando la colonna è ordinata
// o bloccata: se lo stato c'è, il modo di toglierlo non si deve cercare.
// `text-foreground` e non un accento — il grilletto acceso legge come lo
// stesso testo del titolo.
//
// Da tastiera: `Tab` porta il fuoco sul grilletto di ogni intestazione, che
// si rivela da sé, e `Invio`/`Spazio` apre lo stesso menu.
/**
 * Ordinamento e blocco in un solo grilletto «⋮», al posto della freccia e
 * della puntina affiancate. È un'alternativa da scegliere colonna per
 * colonna, non il default: `IntestazioneColonna` resta la forma normale, col
 * titolo che è già il bottone d'ordinamento. Serve quando la testata si
 * affolla, per esempio con `colonneBloccabili` acceso.
 *
 * La colonna dichiara `meta.azioniProprie: true`, o `colonneBloccabili`
 * aggiungerebbe anche la sua puntina e i grilletti di blocco sarebbero due.
 *
 * Il grilletto compare al passaggio del puntatore e al fuoco, e resta
 * visibile quando la colonna è ordinata o bloccata. Da tastiera `Tab` lo
 * raggiunge in ogni intestazione, e `Invio` o `Spazio` aprono il menu.
 */
export function IntestazioneColonnaMenu<TDato extends RowData, TValore>({
  colonna,
  titolo,
}: Omit<IntestazioneColonnaProps<TDato, TValore>, "allinea">) {
  return (
    <div className="group flex min-w-0 items-center justify-between gap-1">
      {/* Il titolo torna testo semplice: qui a essere il bottone è il menu. */}
      <span className="min-w-0 truncate font-medium">{titolo}</span>
      <MenuAzioniColonna colonna={colonna} titolo={titolo} />
    </div>
  )
}

function MenuAzioniColonna<TDato extends RowData, TValore>({
  colonna,
  titolo,
}: Omit<IntestazioneColonnaProps<TDato, TValore>, "allinea">) {
  const ordine = colonna.getIsSorted()
  const posizionePin = colonna.getCanPin() ? colonna.getIsPinned() : false
  const attiva = !!ordine || !!posizionePin

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "-my-1 size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
              attiva && "text-foreground opacity-100"
            )}
          />
        }
        aria-label={`Azioni sulla colonna «${titolo}»`}
      >
        <EllipsisVerticalIcon aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Ordina</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => colonna.toggleSorting(false)}
            disabled={ordine === "asc"}
          >
            <ArrowUpIcon aria-hidden />
            Crescente
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => colonna.toggleSorting(true)}
            disabled={ordine === "desc"}
          >
            <ArrowDownIcon aria-hidden />
            Decrescente
          </DropdownMenuItem>
          {ordine ? (
            <DropdownMenuItem onClick={() => colonna.clearSorting()}>
              <XIcon aria-hidden />
              Rimuovi ordinamento
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        {colonna.getCanPin() ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Blocca</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => colonna.pin("start")}
                disabled={posizionePin === "start"}
              >
                <PinIcon aria-hidden />
                Blocca a sinistra
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => colonna.pin("end")}
                disabled={posizionePin === "end"}
              >
                <PinIcon aria-hidden className="-scale-x-100" />
                Blocca a destra
              </DropdownMenuItem>
              {posizionePin ? (
                <DropdownMenuItem onClick={() => colonna.pin(false)}>
                  <PinOffIcon aria-hidden />
                  Non bloccare
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Il valore di `aria-sort` che corrisponde allo stato di TanStack. */
function ariaSort(
  ordine: false | "asc" | "desc"
): "ascending" | "descending" | "none" {
  return ordine === "asc" ? "ascending" : ordine === "desc" ? "descending" : "none"
}

/* ────────────────────────────────────────────────────────────────────────
 * Le colonne che il blocco sa costruire da sé
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * La colonna delle caselle di selezione.
 *
 * **La casella «tutte» sa dire «alcune».** Base UI porta lo stato indeterminato
 * — `aria-checked="mixed"`, che è la cosa giusta — ma l'indicatore della
 * primitiva disegna una spunta anche lì, e una spunta che significa «alcune» è
 * un'informazione sbagliata data con sicurezza. Si rimedia **senza toccare la
 * primitiva**, con due classi passate da qui: la spunta si spegne e al suo
 * posto si disegna un trattino. Sono stringhe di classi su un uso, non una
 * modifica al componente, e le misure escono da `--spacing`.
 *
 * **La casella di una riga con figli è a cascata**: `checked`
 * conta anche `row.getIsAllSubRowsSelected()` (i figli sono stati scelti tutti
 * uno per uno, senza mai toccare la casella del genitore) e non solo
 * `row.getIsSelected()` (il genitore è stato scelto lui, e TanStack ha già
 * marcato anche l'intero sottoalbero — `mutateRowIsSelected` cascata da sé).
 * `onCheckedChange` resta `row.toggleSelected`: non serve un giro a mano sui
 * figli, è la stessa funzione che una riga senza figli già usa.
 */
export function colonnaSelezione<TDato extends RowData>() {
  const col = creaColonne<TDato>()
  return col.display({
    id: "selezione",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Seleziona tutte le righe della pagina"
        className="data-indeterminate:before:absolute data-indeterminate:before:h-0.5 data-indeterminate:before:w-2 data-indeterminate:before:rounded-full data-indeterminate:before:bg-current data-indeterminate:[&_svg]:invisible"
      />
    ),
    cell: ({ row }) => {
      const conFigli = row.subRows.length > 0
      const scelta = row.getIsSelected() || (conFigli && row.getIsAllSubRowsSelected())
      return (
        <Checkbox
          checked={scelta}
          indeterminate={conFigli && !scelta && row.getIsSomeSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Seleziona la riga"
          className="data-indeterminate:before:absolute data-indeterminate:before:h-0.5 data-indeterminate:before:w-2 data-indeterminate:before:rounded-full data-indeterminate:before:bg-current data-indeterminate:[&_svg]:invisible"
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    // `size`/`minSize`, non solo `larghezza`: su una tabella `ridimensionabile`/
    // `colonneBloccabili` la seconda si ignora (v. `MetaColonna`), e senza
    // `size` questa colonna utility diventerebbe l'unica **elastica** —
    // assorbirebbe tutto lo spazio che avanza invece delle colonne vere,
    // come fa senza `size` la colonna «azioni» (v. `colonnaAzioniRiga`).
    // 40px è la stessa larghezza che `w-10` rende oggi
    // (misurato: `Blocchi/Data Table` → `Prodotti`, non ridimensionabile).
    meta: { larghezza: "w-10" } satisfies MetaColonna,
    size: 40,
    minSize: 40,
  })
}

/**
 * Il rientro e lo `chevron` di una riga d'albero — da mettere
 * **dentro il `cell` della colonna che identifica la riga**, non in una
 * colonna a sé: in un elenco annidato non c'è una colonna «struttura» separata
 * dal nome, come non c'è in un esploratore di file. Quale colonna sia lo
 * decide la pagina, componendo `<CellaAlbero riga={row}>{...}</CellaAlbero>`
 * nel proprio `cell` — lo stesso principio per cui le colonne restano di chi
 * le scrive.
 *
 * Il rientro è una tabella di classi Tailwind (`pl-0`, `pl-5`, …), non uno
 * `style` con un calcolo: sono utility vere, derivano da `--spacing` come
 * tutte le altre misure del tema, e non c'è bisogno di un valore arbitrario.
 * Oltre il livello più profondo previsto la tabella si
 * satura sull'ultimo, invece di uscire dall'array: un livello in più
 * indenterebbe come il penultimo anziché rompersi.
 *
 * Il bottone è `size="icon"` — 32px in normale, **48 in touch** — la stessa
 * misura di `PaginazioneTabella`, e per la stessa ragione: `icon-sm` in touch
 * farebbe 42px, sotto i 44 di WCAG. Il margine negativo (`-my-2 -ml-2`) pareggia
 * l'altezza del bottone col `p-2` della cella, la stessa correzione che
 * `IntestazioneColonna` fa in testa alla tabella — senza, il bottone
 * diventerebbe l'elemento più alto della cella e la riga crescerebbe per
 * ospitarlo. **Una riga senza figli non ha bottone**, ma lo spaziatore al suo
 * posto deve pareggiare **solo la larghezza** (`w-8`), non anche l'altezza
 * (niente `size-8`): con `size-8` lo spaziatore, senza il margine negativo
 * del bottone, alzerebbe le righe senza figli **più** di quelle con figli
 * (49px contro 35,57px, misurato), e a vederle sembrano tutte uguali.
 *
 * **Il bottone del `chevron` non si distingue quando la riga è aperta e
 * ferma**: niente sfondo, niente bordo — identico a se stesso chiuso.
 * `Button` da sé darebbe al bottone un `bg-muted` pieno quando è lui ad avere
 * `aria-expanded="true"` (`aria-expanded:bg-muted`, nel `variant="ghost"` di
 * `ui/button.tsx`): la primitiva è corretta per un menu, dove serve segnare
 * quale grilletto è aperto, ma qui il segno di stato **è già** la freccia
 * ruotata — un secondo segno sul bottone stesso è ridondante. Si spegne con `aria-expanded:bg-transparent`, che vince sul
 * `bg-muted` della primitiva per specificità delle classi: **non si tocca
 * `ui/button.tsx`**, che resta giusto per chi la userà davvero come
 * grilletto di un menu.
 *
 * **Ma il passaggio del mouse deve tingerlo comunque**, aperto o chiuso —
 * spegnere lo stato non deve spegnere anche il riscontro dell'hover. Le due
 * regole `.aria-expanded\:bg-transparent[aria-expanded="true"]` e
 * `.hover\:bg-muted:hover` hanno la **stessa specificità** (una classe più un
 * selettore, in entrambe): a parità vince quella scritta dopo nel foglio di
 * stile compilato, e verificato in un browser vero non è detto sia la nostra
 * — un bottone aperto passato col mouse restava trasparente. Non si sistema
 * riordinando le classi nel JSX: l'ordine con cui Tailwind **compila** le
 * varianti non è quello con cui le si scrive. `aria-expanded:hover:bg-muted`
 * aggiunge un terzo selettore (`[aria-expanded="true"]:hover`), più
 * specifico di entrambi gli altri due per costruzione: vince sempre, in
 * qualunque ordine il foglio di stile li metta. `dark:aria-expanded:hover:bg-muted/50`
 * ripete la stessa tinta attenuata che `ghost` usa in scuro per l'hover
 * comune (`dark:hover:bg-muted/50`), o il bottone aperto sarebbe più scuro
 * di uno chiuso passandoci sopra il mouse in quella modalità.
 */
const RIENTRO_PER_LIVELLO = ["pl-0", "pl-5", "pl-10", "pl-15", "pl-20", "pl-25", "pl-30"]

export function CellaAlbero<TDato extends RowData>({
  riga,
  children,
}: {
  riga: Row<CaratteristicheTabella, TDato>
  children: React.ReactNode
}) {
  const livello = RIENTRO_PER_LIVELLO[Math.min(riga.depth, RIENTRO_PER_LIVELLO.length - 1)]
  const puoEspandere = riga.getCanExpand()
  const espansa = riga.getIsExpanded()

  return (
    <span className={cn("flex items-center gap-1", livello)}>
      {puoEspandere ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={riga.getToggleExpandedHandler()}
          aria-expanded={espansa}
          aria-label={espansa ? "Comprimi riga" : "Espandi riga"}
          className="-my-2 -ml-2 shrink-0 aria-expanded:bg-transparent aria-expanded:hover:bg-muted dark:aria-expanded:hover:bg-muted/50"
        >
          <ChevronRightIcon
            aria-hidden
            className={cn("transition-transform", espansa && "rotate-90")}
          />
        </Button>
      ) : (
        <span aria-hidden className="w-8 shrink-0" />
      )}
      <span className="truncate">{children}</span>
    </span>
  )
}

/**
 * Il bottone che apre/chiude il pannello di dettaglio di una riga — una
 * colonna a sé, non dentro `CellaAlbero`: a differenza dell'albero, qui non c'è una colonna che «identifica» la riga più
 * delle altre, e il pannello non è mai innestato nella struttura del dato —
 * è sempre un fratello della riga, mai un figlio (`getSottoRighe` resta
 * l'unica via per righe vere nel modello dati). Si aggiunge da sé quando
 * `pannelloRiga` è passato al blocco, come `colonnaSelezione` con `selezione`
 * — la pagina non la scrive.
 *
 * **Nessun bottone sulle righe che il pannello non copre**: `getCanExpand()`
 * segue `getRowCanExpand`, che il blocco imposta su `pannelloRiga(riga) !=
 * null` — una riga per cui la funzione non ha niente da mostrare non prende
 * un chevron che aprirebbe il vuoto.
 *
 * Stessa classe di `CellaAlbero` per il segno di apertura — niente sfondo,
 * niente bordo a riposo, hover comunque tinto — per la stessa ragione a
 * verbale lì: la freccia ruotata è già il segno di stato, un secondo sul
 * bottone sarebbe ridondante.
 */
export function colonnaEspansione<TDato extends RowData>() {
  const col = creaColonne<TDato>()
  return col.display({
    id: "espansione",
    header: () => <span className="sr-only">Dettaglio</span>,
    cell: ({ row }) => {
      if (!row.getCanExpand()) return null
      const espansa = row.getIsExpanded()
      return (
        // `flex items-center`: senza, il bottone (inline-flex) si allinea
        // alla riga di base del testo della cella invece che al suo centro
        // — lo stesso pareggio verticale che `CellaAlbero` fa col proprio
        // `<span className="flex items-center …">`: senza, il chevron starebbe
        // più in alto delle altre celle della riga.
        <span className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={row.getToggleExpandedHandler()}
            aria-expanded={espansa}
            aria-controls={`pannello-riga-${row.id}`}
            aria-label={espansa ? "Comprimi dettaglio riga" : "Espandi dettaglio riga"}
            className="-my-2 -ml-2 aria-expanded:bg-transparent aria-expanded:hover:bg-muted dark:aria-expanded:hover:bg-muted/50"
          >
            <ChevronRightIcon
              aria-hidden
              className={cn("transition-transform", espansa && "rotate-90")}
            />
          </Button>
        </span>
      )
    },
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    // `size`/`minSize` accanto a `larghezza` — v. il commento su
    // `colonnaSelezione`, stessa ragione.
    meta: { larghezza: "w-10" } satisfies MetaColonna,
    size: 40,
    minSize: 40,
  })
}

/* ────────────────────────────────────────────────────────────────────────
 * Il riordino manuale delle righe
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Porta `attributes`/`listeners` di dnd-kit dalla riga (`RigaCorpo`, che
 * chiama `useSortable` **una volta sola**) alla maniglia dentro la sua
 * cella (`ManigliaRiordinoRiga`), senza farli passare per `tabella.FlexRender`
 * — TanStack non sa cosa sia dnd-kit, e non deve saperlo.
 *
 * **Non due `useSortable({id: riga.id})` separati**, come la prima lettura
 * del sorgente niko-table suggerirebbe (loro ne chiamano uno in
 * `TableDraggableRow` per `setNodeRef`/`transform` e uno in
 * `TableRowDragHandle` per `attributes`/`listeners`): due chiamate con lo
 * **stesso id** registrano due nodi diversi nella stessa mappa di dnd-kit,
 * l'uno sovrascrive l'altro — il pattern che dnd-kit stesso documenta per
 * una maniglia separata dal nodo trascinato è una chiamata sola, con
 * `listeners` applicati altrove. Qui "altrove" è una colonna TanStack, che
 * non riceve prop extra dalla riga: il contesto è il tramite.
 */
const ContestoRigaTrascinabile = React.createContext<{
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners
} | null>(null)

/**
 * La maniglia (`⠿`), una colonna come `colonnaSelezione`/`colonnaEspansione`
 * — si aggiunge da sé quando `riordinabile` è passato, la pagina non la
 * scrive. Legge `attributes`/`listeners` dal contesto di riga: fuori da una
 * `<RigaCorpo trascinabile>` (cioè fuori da `riordinabile`) il contesto vale
 * `null` e il bottone resta un bottone qualunque, senza trascinamento — non
 * dovrebbe succedere (la colonna esiste solo quando `riordinabile` è attivo),
 * ma non è un motivo per non gestirlo.
 */
export function colonnaRiordino<TDato extends RowData>() {
  const col = creaColonne<TDato>()
  return col.display({
    id: "riordino",
    header: () => <span className="sr-only">Riordina</span>,
    cell: () => <ManigliaRiordinoRiga />,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    // `size`/`minSize` accanto a `larghezza` — v. il commento su
    // `colonnaSelezione`, stessa ragione.
    meta: { larghezza: "w-10" } satisfies MetaColonna,
    size: 40,
    minSize: 40,
  })
}

function ManigliaRiordinoRiga() {
  const contesto = React.useContext(ContestoRigaTrascinabile)
  return (
    // `flex items-center`: senza, il bottone (inline-flex) si allinea alla
    // riga di base del testo della cella invece che al suo centro — lo
    // stesso pareggio verticale di `colonnaEspansione`.
    <span className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        // `select-none`: stessa famiglia di difetto già presa in
        // `ManigliaRidimensiona` — Safari, non Chrome, avvia la
        // selezione/il trascinamento nativo di testo su un `mousedown` non
        // impedito. Lì il rimedio è `preventDefault()` nell'handler custom; qui
        // dnd-kit possiede già `onMouseDown` via `contesto?.listeners`, quindi
        // il rimedio è togliere il testo dalla contesa con `user-select: none`
        // invece di intercettare l'evento. Senza, il `<span className="sr-only">`
        // sotto la maniglia diventa il testo che Safari seleziona e trascina.
        className="-my-2 -ml-2 cursor-grab touch-none select-none active:cursor-grabbing"
        {...contesto?.attributes}
        {...contesto?.listeners}
      >
        <GripVerticalIcon aria-hidden className="text-muted-foreground" />
        <span className="sr-only">Trascina per riordinare la riga</span>
      </Button>
    </span>
  )
}

/**
 * Il guscio `DndContext`/`SortableContext` del riordino di riga: calcola l'indice di
 * partenza e d'arrivo dall'ordine **visibile** delle righe
 * (`tabella.getRowModel().rows`, non `dati` — con ordinamento/ricerca
 * disattivi mentre `riordinabile` è attivo, v. il prop, i due ordini
 * coincidono sempre) e passa il nuovo `dati` intero a `onRiordina`.
 *
 * Tre sensori, come niko-table: `MouseSensor`/`TouchSensor` per il
 * trascinamento vero, `KeyboardSensor` per Spazio/frecce/Escape — è quello
 * che rende il riordino completo anche da tastiera. `restrictToVerticalAxis`: le righe si
 * scambiano solo in verticale, un trascinamento in diagonale non stacca la
 * riga dalla sua colonna.
 *
 * Non rende markup proprio (`DndContext`/`SortableContext` sono puri
 * fornitori di contesto): può avvolgere tutto il riquadro della tabella,
 * `<table>` compreso, senza inserire un elemento fra `<div>` e `<table>` che
 * romperebbe la struttura.
 */
function DataTableRiordinoRighe<TDato extends RowData>({
  dati,
  righe,
  onRiordina,
  children,
}: {
  dati: TDato[]
  righe: Row<CaratteristicheTabella, TDato>[]
  onRiordina: (dati: TDato[]) => void
  children: React.ReactNode
}) {
  const idContesto = React.useId()
  const idRighe = React.useMemo<UniqueIdentifier[]>(() => righe.map((r) => r.id), [righe])

  const sensori = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    // `coordinateGetter: sortableKeyboardCoordinates`: il predefinito di `KeyboardSensor` muove di
    // 25px fissi a ogni freccia, in stile libero, non alla posizione della
    // riga vicina. Qui funzionava per un caso (righe alte 38-48px, un passo
    // che le supera quasi sempre), ma non per costruzione — la stessa causa
    // ha dato un riordino di **colonna** completamente muto da tastiera
    // (colonne larghe 140-220px, un passo che non le supera mai). Qui lo si
    // usa perché funzioni per costruzione, non per un margine fortunato.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const gestisciFineTrascinamento = React.useCallback(
    (evento: DragEndEvent) => {
      const { active, over } = evento
      if (active && over && active.id !== over.id) {
        const indicePartenza = idRighe.indexOf(active.id)
        const indiceArrivo = idRighe.indexOf(over.id)
        onRiordina(arrayMove(dati, indicePartenza, indiceArrivo))
      }
    },
    [idRighe, dati, onRiordina]
  )

  return (
    <DndContext
      id={idContesto}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={gestisciFineTrascinamento}
      sensors={sensori}
    >
      <SortableContext items={idRighe} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * Il menu di riga condiviso: tendina «⋯» e tasto destro
 *
 * Un solo elenco di voci si monta sia nella tendina «⋯» (`colonnaAzioniRiga`,
 * aggiunta da sé quando si passa `menuRiga` a `<DataTable>`, come già fanno
 * `selezione`/`pannelloRiga`/`riordinabile`) sia nel tasto destro sull'intera
 * riga (`RigaCorpo`, sotto). Non sono due elenchi scritti due volte: `menu`
 * è un `React.ReactNode` solo, la stessa istanza montata in due `Popup` di
 * Base UI diversi — chi scrive le voci non sa (e non deve sapere) da quale
 * dei due sta per essere aperta.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Quale dei due `Popup` sta montando le voci in questo momento — `dropdown`
 * per la tendina «⋯», `tastoDestro` per il menu sulla riga. `RowMenuItem`/
 * `RowMenuSeparator`/`RowMenuSub` lo leggono per scegliere la primitiva
 * giusta: `dropdown-menu` e `context-menu` sono due popup distinti di Base
 * UI (`Menu`/`ContextMenu`), non lo stesso componente con un nome diverso.
 */
const ContestoTipoMenuRiga = React.createContext<"dropdown" | "tastoDestro">("dropdown")

/**
 * La riga che il menu aperto sta mostrando. `unknown` e non la generica di
 * `<DataTable>`: un `React.Context` è per forza non generico, e
 * `useDataTableRow<TDato>()` restituisce già il tipo giusto a chi lo chiama.
 * `undefined` distingue "fuori da un menu di riga" da una riga vera il cui
 * valore sarebbe comunque falsy (`0`, `""`, `null`), che `useContext` da solo
 * non saprebbe dire.
 */
const ContestoRigaMenu = React.createContext<unknown>(undefined)

/**
 * Legge la riga che il menu di `menuRiga`/`colonnaAzioniRiga` sta montando.
 * Va chiamato da un `RowMenuItem`/`RowMenuSeparator`/`RowMenuSub`, o da un
 * loro discendente — mai altrove: fuori da un menu di riga non esiste una
 * riga da restituire, ed è un errore di programmazione da far esplodere
 * subito, non un caso limite da coprire con un valore finto.
 */
export function useDataTableRow<TDato>(): TDato {
  const riga = React.useContext(ContestoRigaMenu)
  if (riga === undefined) {
    throw new Error(
      "useDataTableRow() va chiamato dentro un RowMenuItem/RowMenuSeparator/RowMenuSub, montato dal menu di riga di <DataTable menuRiga> (o da colonnaAzioniRiga())."
    )
  }
  return riga as TDato
}

/**
 * Una voce che si monta **sia** nella tendina «⋯» sia nel tasto destro —
 * l'unica definizione, letta due volte. Stessa forma dei due originali
 * shadcn (`inset`/`variant`): sotto è davvero `DropdownMenuItem` o
 * `ContextMenuItem`, mai un terzo componente nostro che li imiti.
 */
export function RowMenuItem({
  variant = "default",
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  const tipo = React.useContext(ContestoTipoMenuRiga)
  return tipo === "dropdown" ? (
    <DropdownMenuItem variant={variant} inset={inset} {...props} />
  ) : (
    <ContextMenuItem variant={variant} inset={inset} {...props} />
  )
}

/** Il separatore condiviso — stessa ragione di `RowMenuItem`. */
export function RowMenuSeparator(props: React.ComponentProps<typeof DropdownMenuSeparator>) {
  const tipo = React.useContext(ContestoTipoMenuRiga)
  return tipo === "dropdown" ? (
    <DropdownMenuSeparator {...props} />
  ) : (
    <ContextMenuSeparator {...props} />
  )
}

/**
 * Il sottomenu condiviso — `trigger` è l'etichetta cliccabile che apre
 * `children`, la stessa coppia `SubTrigger`/`SubContent` che shadcn separa
 * in due componenti: qui **una** perché il tipo di popup (dropdown o tasto
 * destro) va deciso una volta sola per l'intera coppia, non per ciascuno.
 */
export function RowMenuSub({
  trigger,
  children,
}: {
  trigger: React.ReactNode
  children: React.ReactNode
}) {
  const tipo = React.useContext(ContestoTipoMenuRiga)
  if (tipo === "dropdown") {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{trigger}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>{children}</DropdownMenuSubContent>
      </DropdownMenuSub>
    )
  }
  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>{trigger}</ContextMenuSubTrigger>
      <ContextMenuSubContent>{children}</ContextMenuSubContent>
    </ContextMenuSub>
  )
}

/**
 * Il corpo della tendina «⋯» di riga — una colonna come `colonnaSelezione`/
 * `colonnaEspansione`, aggiunta da sé da `<DataTable menuRiga>` (in coda alle
 * colonne, mai scritta dalla pagina). Estratto in un componente a sé, non
 * scritto inline in `colonnaAzioniRiga` più sotto, perché serve uno stato
 * (`aperto`) — il `cell` di TanStack è una funzione pura, non potrebbe
 * tenerne uno da sé.
 *
 * **Si chiude da sé quando `table-container` scorre.** Base UI insegue il
 * grilletto (`trackAnchor`, di serie): finché la riga resta a schermo va
 * bene, ma una riga che esce dalla vista — sotto la testata *sticky*, o
 * sotto il bordo del riquadro — lascia il menu **ancorato a un punto vuoto**,
 * staccato dalla tabella e apparentemente rotto.
 * Inseguire per sempre non è la correzione giusta: un menu di riga non ha
 * senso quando la riga non si vede più, quindi si chiude, non si sposta.
 */
function MenuAzioniRiga<TDato>({
  riga,
  menu,
  ariaLabel,
}: {
  riga: TDato
  menu: React.ReactNode
  ariaLabel?: string
}) {
  const [aperto, setAperto] = React.useState(false)
  const grillettoRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (!aperto) return
    const contenitore = grillettoRef.current?.closest('[data-slot="table-container"]')
    if (!contenitore) return
    const chiudi = () => setAperto(false)
    contenitore.addEventListener("scroll", chiudi, { passive: true })
    return () => contenitore.removeEventListener("scroll", chiudi)
  }, [aperto])

  return (
    <DropdownMenu open={aperto} onOpenChange={setAperto}>
      <DropdownMenuTrigger
        ref={grillettoRef}
        render={<Button variant="ghost" size="icon" className="-my-1 ml-auto flex" />}
        aria-label={ariaLabel ?? "Azioni riga"}
      >
        <EllipsisVerticalIcon aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ContestoTipoMenuRiga.Provider value="dropdown">
          <ContestoRigaMenu.Provider value={riga}>{menu}</ContestoRigaMenu.Provider>
        </ContestoTipoMenuRiga.Provider>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function colonnaAzioniRiga<TDato extends RowData>({
  menu,
  enabledFor,
  ariaLabel,
}: {
  /** Le voci — `RowMenuItem`/`RowMenuSeparator`/`RowMenuSub`, scritte una sola volta. */
  menu: React.ReactNode
  /** Righe escluse dal menu (bloccate, di sola lettura): niente tendina, niente tasto destro. */
  enabledFor?: (riga: TDato) => boolean
  /** L'etichetta del grilletto per riga — di default generica, senza il nome della riga. */
  ariaLabel?: (riga: TDato) => string
}) {
  const col = creaColonne<TDato>()
  return col.display({
    id: "azioni",
    header: () => <span className="sr-only">Azioni</span>,
    cell: ({ row }) => {
      if (enabledFor && !enabledFor(row.original)) return null
      return (
        <MenuAzioniRiga
          riga={row.original}
          menu={menu}
          ariaLabel={ariaLabel ? ariaLabel(row.original) : undefined}
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    // `azioniProprie`: senza, `colonneBloccabili` aggiungerebbe il proprio
    // `MenuBloccaColonna` anche qui — un grilletto di pin per una colonna
    // che non porta un dato, ridondante rispetto al pin già raggiungibile
    // dal menu di ciascuna colonna vera.
    // La colonna resta bloccabile via API (`getCanPin()`/`pin()`), solo
    // senza un'icona propria.
    //
    // `size`/`minSize`, non solo `larghezza`: su una tabella
    // `ridimensionabile`/`colonneBloccabili` la seconda si ignora (v.
    // `MetaColonna`), e senza `size` questa colonna diventa l'unica
    // **elastica** della tabella — assorbe tutto lo spazio che avanza,
    // invece delle colonne vere, lasciando un vuoto enorme prima del
    // grilletto «⋯»: con una colonna ridimensionata, una fascia bianca larga
    // quanto metà tabella prima dei tre puntini. 48px è la stessa larghezza che
    // `w-12` rende oggi (misurato su un `w-10`, `Blocchi/Data Table` →
    // `Prodotti`: 40px non ridimensionabile — proporzionale a `w-12`).
    meta: { larghezza: "w-12", azioniProprie: true } satisfies MetaColonna,
    size: 48,
    minSize: 48,
  })
}

/* ────────────────────────────────────────────────────────────────────────
 * Il contorno
 * ──────────────────────────────────────────────────────────────────────── */

function RicercaTabella<TDato extends RowData>({
  tabella,
  segnaposto,
}: {
  tabella: IstanzaTabella<TDato>
  segnaposto: string
}) {
  const id = React.useId()
  return (
    <InputGroup className="w-full max-w-sm">
      <InputGroupAddon>
        <SearchIcon aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type="search"
        placeholder={segnaposto}
        aria-label={segnaposto}
        value={(tabella.state.globalFilter as string) ?? ""}
        onChange={(e) => tabella.setGlobalFilter(e.target.value)}
      />
    </InputGroup>
  )
}

/**
 * Il menu delle colonne. Mostra solo le colonne **con un accessore**: quelle di
 * comodo — la selezione, le azioni — non hanno un nome da leggere e nasconderle
 * non vuol dire niente.
 *
 * L'etichetta di ogni voce viene da `meta.titolo` se c'è, e solo in mancanza
 * dall'`id`. Un `id` è una chiave di dato (`aggiornatoIl`), non una parola
 * italiana: `capitalize` su una chiave dà «AggiornatoIl», che è peggio di
 * niente.
 */
function VisibilitaColonne<TDato extends RowData>({
  tabella,
}: {
  tabella: IstanzaTabella<TDato>
}) {
  const colonne = tabella
    .getAllColumns()
    .filter((c) => typeof c.accessorFn !== "undefined" && c.getCanHide())

  if (colonne.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="ml-auto" />}
      >
        <SlidersHorizontalIcon aria-hidden />
        Colonne
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* `DropdownMenuLabel` **vuole un `DropdownMenuGroup` attorno**: in Base
            UI è `Menu.GroupLabel`, che senza `Menu.Group` lancia — e lancia solo
            quando il pannello monta, cioè solo a menu aperto: a menu chiuso
            l'errore non si vede. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Colonne da mostrare</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {colonne.map((c) => (
            <DropdownMenuCheckboxItem
              key={c.id}
              checked={c.getIsVisible()}
              onCheckedChange={(v) => c.toggleVisibility(!!v)}
            >
              {(c.columnDef.meta as MetaColonna | undefined)?.titolo ?? c.id}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const PER_PAGINA = [10, 25, 50, 100]

/** Quante righe in più a ogni caricamento, in `perPagina="infinito"`. */
const PASSO_INFINITO = 40

/**
 * La paginazione: quante righe per pagina, a che pagina si è, e i quattro
 * salti.
 *
 * I bersagli sono `size="icon"` — 32px in normale, **48 in touch** — e non
 * `icon-sm`, che in touch farebbe 42 e starebbe sotto i 44 di WCAG. È la stessa
 * misura, e la stessa ragione, del menu del percorso in `page-header`.
 */
function PaginazioneTabella<TDato extends RowData>({
  tabella,
  conSelezione,
  infinito,
  nomeRighe,
}: {
  tabella: IstanzaTabella<TDato>
  conSelezione: boolean
  /**
   * Con `perPagina="infinito"` non c'è una «pagina»: sparisce tutta la fascia
   * di destra — il menu «Righe», «Pagina X di Y», i quattro salti — e resta
   * solo il conto, che è l'unica cosa ancora vera.
   */
  infinito: boolean
  nomeRighe: NomeRighe
}) {
  const perPagina = tabella.state.pagination?.pageSize ?? 10
  const pagina = (tabella.state.pagination?.pageIndex ?? 0) + 1
  const pagine = Math.max(tabella.getPageCount(), 1)
  const filtrate = tabella.getFilteredRowModel().rows.length
  const scelte = tabella.getFilteredSelectedRowModel().rows.length
  const nome = filtrate === 1 ? nomeRighe.singolare : nomeRighe.plurale

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <p
        className="text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {conSelezione
          ? `${scelte} di ${filtrate} ${nomeRighe.plurale} selezionate`
          : `${filtrate} ${nome}`}
      </p>

      {infinito ? null : (
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="righe-per-pagina"
              className="hidden text-sm font-medium sm:block"
            >
              Righe
            </label>
            <Select
              value={String(perPagina)}
              onValueChange={(v) => tabella.setPageSize(Number(v))}
              items={PER_PAGINA.map((n) => ({ value: String(n), label: String(n) }))}
            >
              <SelectTrigger
                id="righe-per-pagina"
                size="sm"
                aria-label="Righe per pagina"
                className="w-18"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PER_PAGINA.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm font-medium whitespace-nowrap tabular-nums">
            Pagina {pagina} di {pagine}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() => tabella.setPageIndex(0)}
              disabled={!tabella.getCanPreviousPage()}
              aria-label="Prima pagina"
            >
              <ChevronsLeftIcon aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => tabella.previousPage()}
              disabled={!tabella.getCanPreviousPage()}
              aria-label="Pagina precedente"
            >
              <ChevronLeftIcon aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => tabella.nextPage()}
              disabled={!tabella.getCanNextPage()}
              aria-label="Pagina successiva"
            >
              <ChevronRightIcon aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() => tabella.setPageIndex(pagine - 1)}
              disabled={!tabella.getCanNextPage()}
              aria-label="Ultima pagina"
            >
              <ChevronsRightIcon aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Le classi che bloccano a sinistra le prime colonne.
 *
 * Tre cose che una cella bloccata deve fare, e che nessuna fa da sé:
 *
 * 1. **avere un fondo opaco proprio.** Le righe sono trasparenti sul `bg-card`
 *    del riquadro; una cella `sticky` senza fondo lascerebbe scorrere il testo
 *    delle altre colonne **sotto** il proprio, che è illeggibile e sembra un
 *    guasto di resa;
 * 2. **seguire lo stato della riga.** Il fondo opaco vince su `hover:bg-muted/50`
 *    e su `data-[state=selected]:bg-muted` della riga, quindi la cella bloccata
 *    resterebbe bianca mentre il resto si tinge. Si riprendono dal gruppo della
 *    riga, e lo stack di colori è lo stesso — un velo di `muted` sopra `card`;
 * 3. **dire che è bloccata.** Il bordo a destra è il segno: lo scorrimento fa
 *    passare il contenuto **sotto** quel filo, e a quel punto la cosa si spiega
 *    da sé senza che nessuno scriva «scorri».
 *
 * `left-0` e `left-10` non sono numeri scelti: `10` è la larghezza della colonna
 * di selezione (`w-10` in `colonnaSelezione`), quindi la seconda colonna bloccata
 * si appoggia esattamente al bordo della prima. Entrambe derivano da `--spacing`,
 * quindi il blocco regge anche in densità touch.
 */
export function classiBloccate(indice: number, conSelezione: boolean): string | undefined {
  const quante = conSelezione ? 2 : 1
  if (indice >= quante) return undefined
  const base =
    "sticky z-10 bg-card group-hover/riga:bg-muted/50 group-data-[state=selected]/riga:bg-muted"
  const bordo = indice === quante - 1 ? " border-r" : ""
  return `${base}${bordo} ${indice === 0 ? "left-0" : "left-10"}`
}

/* ────────────────────────────────────────────────────────────────────────
 * Resize e pin di qualunque colonna
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Lo sticky di una colonna bloccata con `colonneBloccabili`, **calcolato**
 * invece che tabulato: a differenza di `classiBloccate` — che assume indice
 * 0/1 e due larghezze fisse (`w-10`, la sola colonna di selezione) — qui
 * qualunque colonna può bloccarsi, con qualunque larghezza acquisita, quindi
 * lo scarto dal bordo (`left`/`right`) va chiesto a TanStack:
 * `column.getStart("start")` somma le larghezze **acquisite** di tutte le
 * colonne bloccate a sinistra prima di questa, `getAfter("end")` la stessa
 * somma dal lato destro. Sono numeri, non classi — la stessa eccezione al
 * divieto di valori arbitrari che `ridimensionabile` già documenta («larghezze acquisite
 * dall'utente»), estesa alle *posizioni* che quelle larghezze determinano.
 *
 * Il bordo (`border-r`/`border-l`) va sulla **sola colonna al bordo esterno**
 * del blocco bloccato — l'ultima a sinistra, la prima a destra — non su ogni
 * colonna bloccata: è il segno che lo scorrimento passa sotto, e su una
 * colonna di mezzo sarebbe un filo senza motivo in vista.
 */
export function ancoraggioColonna<TDato extends RowData>(
  tabella: IstanzaTabella<TDato>,
  colonna: Column<CaratteristicheTabella, TDato, unknown>,
  contesto: "intestazione" | "cella"
): { className: string; style: React.CSSProperties } | undefined {
  const posizione = colonna.getIsPinned()
  if (!posizione) return undefined
  const fondo = contesto === "intestazione" ? "bg-accent" : "bg-card"
  const base = `sticky z-10 ${fondo} group-hover/riga:bg-muted/50 group-data-[state=selected]/riga:bg-muted`
  if (posizione === "start") {
    const bloccate = tabella.getStartVisibleLeafColumns()
    const ultima = bloccate[bloccate.length - 1]?.id === colonna.id
    return { className: cn(base, ultima && "border-r"), style: { left: colonna.getStart("start") } }
  }
  const bloccateFine = tabella.getEndVisibleLeafColumns()
  const prima = bloccateFine[0]?.id === colonna.id
  return { className: cn(base, prima && "border-l"), style: { right: colonna.getAfter("end") } }
}

/**
 * Il menu del pin, nell'intestazione (`colonneBloccabili`): "Blocca a
 * sinistra" / "Blocca a destra" / "Non bloccare". Sta a fianco del bottone
 * d'ordinamento (`IntestazioneColonna`), non al suo posto — la stessa
 * ragione per cui l'ordinamento resta un clic e non un menu (v. il commento
 * in testa al file): qui il menu **aggiunge** un'azione che un clic solo non
 * potrebbe rappresentare (tre stati, non un ciclo a due), non ne toglie una.
 *
 * `colonna.getCanPin()` torna sempre falso finché `enableColumnPinning`
 * (cablato su `colonneBloccabili`, in `DataTable`) è spento — nessun
 * controllo in più qui: è lo stesso meccanismo per cui `ManigliaRidimensiona`
 * resta invisibile senza `ridimensionabile`.
 */
function MenuBloccaColonna<TDato extends RowData>({
  colonna,
  titolo,
}: {
  colonna: Column<CaratteristicheTabella, TDato, unknown>
  titolo: string
}) {
  if (!colonna.getCanPin()) return null
  const posizione = colonna.getIsPinned()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="-my-2 -mr-2 shrink-0" />}
        aria-label={`Blocca colonna «${titolo}»`}
      >
        <PinIcon aria-hidden className={cn(posizione && "fill-current")} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{titolo}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => colonna.pin("start")} disabled={posizione === "start"}>
            <PinIcon aria-hidden />
            Blocca a sinistra
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => colonna.pin("end")} disabled={posizione === "end"}>
            <PinIcon aria-hidden className="-scale-x-100" />
            Blocca a destra
          </DropdownMenuItem>
          {posizione ? (
            <DropdownMenuItem onClick={() => colonna.pin(false)}>
              <PinOffIcon aria-hidden />
              Non bloccare
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Quanti pixel un passo da tastiera allarga o restringe la colonna. */
const PASSO_RIDIMENSIONA = 16

/**
 * La maniglia di ridimensionamento (`ridimensionabile`): un filo sul bordo
 * destro dell'intestazione, `role="separator"` — il ruolo ARIA per un
 * elemento che divide due regioni e si sposta, non un `slider` (che
 * rappresenterebbe un valore, non una divisione).
 *
 * **Non è una primitiva**: resta locale a questo file, come
 * `colonnaSelezione` o `classiBloccate` — una maniglia composta da un
 * `<span>` e due gestori non sta *al posto* di un componente di `ui/`.
 *
 * **La tastiera non arriva gratis**: il trascinamento è un affordance da
 * puntatore, e axe non direbbe niente su una maniglia completamente muta da
 * tastiera.
 * `onKeyDown` copre tre tasti: `ArrowLeft`/`ArrowRight` allargano o
 * restringono di `PASSO_RIDIMENSIONA`, `Home` torna alla larghezza di
 * partenza (`column.resetSize()`, che TanStack dà già fatta). `aria-valuenow`
 * porta la larghezza attuale, arrotondata — un pixel di troppo che un
 * lettore di schermo leggesse ad alta voce non aggiungerebbe informazione.
 *
 * **Un segno solo, non due.** Una prima stesura disegnava la barra-guida a
 * tutta altezza (il segno che niko-table porta durante il trascinamento, e
 * che qui mancava) come un secondo `<span>`, a fianco del filo dell'intestazione
 * — e i due non coincidevano: larghezze e scarti diversi, la guida
 * *trapassava* il filo invece di continuarlo. Qui la
 * zona sensibile (`role="separator"`, invariata: hit-area, tastiera, `aria-*`)
 * resta un `<span>` largo quanto prima, ma **il segno visivo è un unico
 * discendente centrato al suo interno** (`<span aria-hidden>`), che cambia
 * stato invece di duplicarsi: **invisibile a riposo** — niente riga fra le
 * colonne di un'intestazione che nessuno sta toccando, a differenza di
 * niko-table: intestazioni pulite, nessuna separazione finché non si
 * trascina — poi visibile al passaggio del mouse o al fuoco da
 * tastiera, e **a tutta altezza** durante il trascinamento vero. Un solo
 * elemento, una sola posizione, mai due segni da far coincidere.
 *
 * L'altezza durante il trascinamento viene dallo stesso meccanismo di prima:
 * un `<th>` non ritaglia l'overflow dei propri figli, quindi un discendente
 * assoluto più alto della cella disegna oltre il suo bordo, nelle righe sotto,
 * ed **eredita da solo** lo scorrimento orizzontale della tabella — niente
 * elemento a parte nel `table-container`, niente scarto da calcolare a mano.
 * Si misura da `tabellaRef` (l'intera `<table>`, non solo la testata): un
 * valore fisso in pixel, non `height: 100%` — la cella che lo contiene è alta
 * quanto la sola riga di intestazione, `100%` di *quella* sarebbe di nuovo
 * 40px.
 */
function ManigliaRidimensiona<TDato extends RowData>({
  tabella,
  tabellaRef,
  header,
  titolo,
  ultima,
}: {
  tabella: IstanzaTabella<TDato>
  tabellaRef: React.RefObject<HTMLTableElement | null>
  header: Header<CaratteristicheTabella, TDato, unknown>
  titolo: string
  /** L'intestazione è l'ultima a destra, nell'ordine in cui è resa. */
  ultima: boolean
}) {
  const colonna = header.column
  const min = colonna.columnDef.minSize ?? 20
  const max = colonna.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER
  const inTrascinamento = colonna.getIsResizing()

  const sposta = (delta: number) => {
    tabella.setColumnSizing((prima) => {
      const attuale = prima[colonna.id] ?? colonna.getSize()
      return { ...prima, [colonna.id]: Math.min(max, Math.max(min, attuale + delta)) }
    })
  }

  // Si legge `tabellaRef.current` in un effetto, non in fase di render — un
  // `ref` letto durante il render può restare indietro di un commit, ed è la
  // stessa cosa che il linter segnala (`react/refs`). Misurata **una volta
  // sola all'inizio del trascinamento**, non a ogni fotogramma: un
  // ridimensionamento orizzontale non cambia l'altezza della tabella, quindi
  // rimisurare ad ogni `mousemove` sarebbe lavoro senza un motivo.
  const [altezzaGuida, setAltezzaGuida] = React.useState<number>()
  React.useEffect(() => {
    if (inTrascinamento) setAltezzaGuida(tabellaRef.current?.getBoundingClientRect().height)
  }, [inTrascinamento, tabellaRef])

  return (
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label={`Ridimensiona colonna «${titolo}»`}
      aria-valuenow={Math.round(colonna.getSize())}
      aria-valuemin={min}
      aria-valuemax={max === Number.MAX_SAFE_INTEGER ? undefined : max}
      // **Fuori dall'ordine di `Tab`**, in ogni tabella: una maniglia per
      // colonna erano cinque, sei fermi prima delle righe, e servono di rado. La
      // tastiera le comanda dall'intestazione — `Alt` con `←`/`→` sul bottone
      // che ordina, v. `CellaIntestazione` — e nella Data Grid dalla cella.
      // Resta raggiungibile col puntatore, e le frecce funzionano ancora se ci
      // arriva il fuoco da un clic.
      tabIndex={-1}
      // `preventDefault()` prima di delegare a TanStack, non dopo: in
      // Safari (non in Chrome) un `mousedown` non
      // impedito fa scattare anche la selezione di testo nativa mentre si
      // trascina — un riempimento blu che segue il puntatore sopra
      // l'intestazione e le celle, la stessa selezione con cui si
      // evidenzia un paragrafo. Chrome la sopprime da sé qui, WebKit no:
      // la maniglia è un trascinamento, non un testo da selezionare.
      onMouseDown={(evento) => {
        evento.preventDefault()
        header.getResizeHandler()(evento)
      }}
      onTouchStart={header.getResizeHandler()}
      onKeyDown={(e) => {
        if (e.key === "Home") {
          e.preventDefault()
          colonna.resetSize()
          return
        }
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
        e.preventDefault()
        sposta(e.key === "ArrowRight" ? PASSO_RIDIMENSIONA : -PASSO_RIDIMENSIONA)
      }}
      // `group/maniglia` per il figlio sotto: la zona sensibile resta larga
      // (bersaglio da puntatore), il segno visivo è **solo** il filo centrato
      // — mai la zona intera, che coprirebbe la colonna accanto di un tocco
      // di colore appena sfiorata.
      //
      // A cavallo del bordo (`-right-1`) fra due colonne; **dentro** la
      // colonna (`right-0`) sull'ultima intestazione, qualunque colonna sia —
      // anche quella del «⋯» di `menuRiga`. Lì la metà esterna usciva dalla
      // tabella, e i suoi 4px allargavano `table-container`: la barra di
      // scorrimento orizzontale compariva su ogni tabella ridimensionabile,
      // anche con le colonne che ci stavano largamente.
      className={cn(
        "group/maniglia absolute inset-y-0 z-20 w-2 shrink-0 cursor-col-resize touch-none focus-visible:outline-none",
        ultima ? "right-0" : "-right-1"
      )}
    >
      <span
        aria-hidden
        style={inTrascinamento ? { height: altezzaGuida } : undefined}
        className={cn(
          "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors",
          "group-hover/maniglia:w-1 group-hover/maniglia:bg-primary/60",
          "group-focus-visible/maniglia:w-1 group-focus-visible/maniglia:bg-primary/60",
          inTrascinamento && "w-1 bg-primary"
        )}
      />
    </span>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * Il riordino di colonna
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Le colonne che il blocco aggiunge da sé — selezione, espansione, maniglia
 * di riordino **riga** — non entrano nel riordino di **colonna**: restano
 * sempre per prime, nel loro ordine fisso, per la stessa ragione per cui
 * sono le prime a essere anteposte in `colonneEffettive`. Un'intestazione il
 * cui id è qui dentro non riceve la maniglia e non chiama `useSortable` con
 * `disabled: false` — la stessa distinzione che `RIENTRO_PER_LIVELLO` non fa
 * mai per le colonne dichiarate dalla pagina, ma che qui serve perché queste
 * tre non sono "una colonna", sono chrome del blocco.
 */
const COLONNE_UTILITY = new Set(["selezione", "espansione", "riordino"])

/**
 * Porta `attributes`/`listeners` di dnd-kit dall'intestazione (`CellaIntestazione`,
 * che chiama `useSortable` **una volta sola**) alla sua maniglia
 * (`ManigliaRiordinoColonna`) — lo stesso tramite di `ContestoRigaTrascinabile`,
 * spiegato lì: due `useSortable({id: colonna.id})` separati
 * registrerebbero due nodi sullo stesso id nella mappa di dnd-kit, l'uno
 * sovrascriverebbe l'altro.
 *
 * **Perché una maniglia e non l'intestazione intera** (come mostra la
 * lettera del sorgente niko-table, `TableDraggableHeader`, che spreme
 * `attributes`/`listeners` sul `<th>` stesso): lì l'intestazione diventa
 * `role="button"` — e contiene già un bottone vero (`IntestazioneColonna`,
 * l'ordinamento) più, con `colonneBloccabili`, un secondo bottone (il menu
 * del pin). Un `role="button"` che contiene un `<button>` è la violazione
 * `nested-interactive` di axe, gravità *critical* — verificato provando
 * prima la lettera del sorgente, poi la scansione. La maniglia separata
 * (stesso principio della riga) tiene il `<th>` un `<th>` qualunque, con tre
 * controlli **fratelli**, mai annidati: ordina, trascina, blocca.
 */
const ContestoIntestazioneTrascinabile = React.createContext<{
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners
} | null>(null)

/**
 * La maniglia (`⠿`) di un'intestazione, accanto al bottone d'ordinamento —
 * mai al suo posto, per la stessa ragione per cui `MenuBloccaColonna` sta a
 * fianco e non sopra: azioni diverse, bottoni diversi. Legge `attributes`/
 * `listeners` dal contesto della cella; fuori da `colonneRiordinabili` non
 * si monta affatto (`CellaIntestazione` non la rende).
 */
function ManigliaRiordinoColonna({ titolo }: { titolo: string }) {
  const contesto = React.useContext(ContestoIntestazioneTrascinabile)
  return (
    <Button
      variant="ghost"
      size="icon"
      // `select-none`, stessa ragione di `ManigliaRiordinoRiga` sopra e di
      // `ManigliaRidimensiona`: senza, Safari seleziona e trascina come testo
      // lo `sr-only` sotto — verificato a occhio, il fermo immagine mostra i titoli
      // di due intestazioni sovrapposti, ingranditi e deformati, l'anteprima
      // nativa del trascinamento di un nodo di testo.
      className="-my-2 -ml-2 shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
      {...contesto?.attributes}
      {...contesto?.listeners}
    >
      <GripVerticalIcon aria-hidden className="text-muted-foreground" />
      <span className="sr-only">Trascina per riordinare la colonna «{titolo}»</span>
    </Button>
  )
}

/**
 * L'unica `<th>` che chiama `useSortable` — sempre, `trascinabile`
 * o no, con `disabled: !trascinabile` per la stessa ragione scritta su
 * `RigaCorpo`: le regole degli hook vogliono la stessa sequenza a
 * ogni render, e `intestazioni` è già estratto in un componente per riga
 * — qui per intestazione — apposta perché la conta possa cambiare (colonne
 * nascoste, `colonneBloccabili` che ne cambia l'ordine) senza rompere quella
 * regola.
 *
 * **Solo il `<th>` prende `ref`/`transform`** (lo scorrimento visivo durante
 * il trascinamento); `attributes`/`listeners` vanno alla maniglia via
 * contesto, mai qui — è la parte che tiene il `<th>` fuori da
 * `nested-interactive` (v. sopra). Le celle sotto **non seguono** il
 * trascinamento a fotogrammi: a differenza di niko-table (`TableDragAlongCell`,
 * un `useSortable` per cella per riga), qui l'ordine delle colonne è già
 * quello che TanStack calcola da `state.columnOrder` — `row.getVisibleCells()`
 * lo rispetta da sé, senza bisogno di un secondo hook per cella. Un
 * risparmio deliberato, non un limite scoperto tardi: con la virtualizzazione
 * e la Data Grid già in gioco, un `useSortable` per
 * ogni cella di ogni riga visibile avrebbe moltiplicato il costo per il solo
 * fotogramma della cella che scivola, mentre lo scatto dell'intera colonna al
 * rilascio (l'intestazione durante il trascinamento, il corpo dopo) è ciò
 * che il blocco promette — non un fotogramma per fotogramma sulle celle.
 */
function CellaIntestazione<TDato extends RowData>({
  tabella,
  tabellaRef,
  intestazione,
  indice,
  trascinabile,
  ridimensionabile,
  colonneBloccabili,
  bloccoLegacy,
  conDimensioni,
  selezione,
  ultima,
}: {
  tabella: IstanzaTabella<TDato>
  tabellaRef: React.RefObject<HTMLTableElement | null>
  intestazione: Header<CaratteristicheTabella, TDato, unknown>
  indice: number
  /** L'ultima intestazione resa: la sua maniglia sta dentro la tabella. */
  ultima: boolean
  trascinabile: boolean
  ridimensionabile: boolean
  colonneBloccabili: boolean
  bloccoLegacy: boolean
  conDimensioni: boolean
  selezione: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: intestazione.column.id,
    disabled: !trascinabile,
  })

  const stile: React.CSSProperties | undefined = trascinabile
    ? {
        // `CSS.Translate`, non `CSS.Transform` (letto da niko-table,
        // `TableDraggableHeader`): `Transform` porta anche `scaleX`/`scaleY`,
        // che dnd-kit calcola quando le due intestazioni che si scambiano
        // hanno larghezze diverse — qui la norma, non l'eccezione, con
        // `size`/`minSize` per colonna. Uno `scaleX` su un'intestazione di
        // testo lo deforma: si vede
        // solo trascinando su una colonna di larghezza diversa (`Codice`
        // 140px verso `Titolo` 320px), mai fra colonne della stessa
        // larghezza — la prova che non era la selezione nativa (già corretta
        // sopra) ma la scala. `Translate` scarta la scala e trasla soltanto,
        // la stessa animazione senza la distorsione.
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
      }
    : undefined

  const contestoIntestazione = React.useMemo(
    () => (trascinabile ? { attributes, listeners } : null),
    [trascinabile, attributes, listeners]
  )

  const ancoraColonna = colonneBloccabili
    ? ancoraggioColonna(tabella, intestazione.column, "intestazione")
    : undefined
  const metaColonna = intestazione.column.columnDef.meta as MetaColonna | undefined
  const titoloColonna = metaColonna?.titolo ?? intestazione.column.id

  return (
    <ContestoIntestazioneTrascinabile.Provider value={contestoIntestazione}>
      <TableHead
        ref={setNodeRef}
        style={{ ...ancoraColonna?.style, ...stile }}
        // **La tastiera della maniglia sta sull'intestazione.** La maniglia
        // non è un fermo di `Tab` (v. `ManigliaRidimensiona`): `Alt` con `←` o
        // `→`, dal bottone che ordina o da qualunque controllo dell'intestazione,
        // restringe o allarga la colonna dello stesso passo, entro `minSize` e
        // `maxSize`.
        onKeyDown={
          ridimensionabile && intestazione.column.getCanResize()
            ? (evento: React.KeyboardEvent) => {
                if (!evento.altKey || evento.ctrlKey || evento.metaKey) return
                if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return
                evento.preventDefault()
                const colonna = intestazione.column
                const min = colonna.columnDef.minSize ?? 20
                const max = colonna.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER
                const delta = evento.key === "ArrowRight" ? PASSO_RIDIMENSIONA : -PASSO_RIDIMENSIONA
                tabella.setColumnSizing((prima) => {
                  const attuale = prima[colonna.id] ?? colonna.getSize()
                  return { ...prima, [colonna.id]: Math.min(max, Math.max(min, attuale + delta)) }
                })
              }
            : undefined
        }
        className={cn(
          !conDimensioni &&
            (intestazione.column.columnDef.meta as MetaColonna | undefined)?.larghezza,
          bloccoLegacy &&
            classiBloccate(indice, selezione)?.replace("bg-card", "bg-accent"),
          ancoraColonna?.className,
          // `relative` **solo se non già `sticky`**: `cn` (tailwind-merge)
          // tratta le utility di posizionamento come un gruppo solo, e le due
          // scritte insieme si scartano a vicenda — vince l'ultima scritta.
          // Non serve comunque: `sticky` è già un contenimento per i figli
          // `absolute` (la maniglia di `ManigliaRidimensiona`), come `relative`.
          !ancoraColonna && (ridimensionabile || colonneBloccabili) && "relative",
          // `position: relative` per lo stesso motivo di `RigaCorpo`: contiene
          // l'ombra di `isDragging` (`zIndex`) sopra le intestazioni ferme —
          // ma solo quando `sticky` non lo fa già da sé (`ancoraColonna`).
          trascinabile && !ancoraColonna && "relative",
          trascinabile && isDragging && "bg-muted/50 opacity-80"
        )}
        aria-sort={
          intestazione.column.getCanSort()
            ? ariaSort(intestazione.column.getIsSorted())
            : undefined
        }
      >
        {intestazione.isPlaceholder ? null : trascinabile || colonneBloccabili ? (
          // `select-none` su **tutto** il contenitore, non solo sulla
          // maniglia: la maniglia è un bersaglio minuscolo (`size="icon"`)
          // accanto al testo del bottone d'ordinamento, e un trascinamento
          // che parte un pixel a destra atterra su quel testo — riproducibile
          // in Chrome quanto in Safari (a differenza della sola nota su
          // `ManigliaRidimensiona`, dove il bersaglio non ha testo vicino).
          // Senza, il browser avvia la selezione/il trascinamento nativo del
          // titolo della colonna invece del riordino di dnd-kit — l'anteprima
          // enorme e deformata di un nodo di testo.
          <div className="flex select-none items-center gap-1">
            {trascinabile ? <ManigliaRiordinoColonna titolo={titoloColonna} /> : null}
            <span className="min-w-0 flex-1">
              <tabella.FlexRender header={intestazione} />
            </span>
            {colonneBloccabili && !metaColonna?.azioniProprie ? (
              <MenuBloccaColonna colonna={intestazione.column} titolo={titoloColonna} />
            ) : null}
          </div>
        ) : (
          <tabella.FlexRender header={intestazione} />
        )}
        {ridimensionabile && intestazione.column.getCanResize() ? (
          <ManigliaRidimensiona
            tabella={tabella}
            tabellaRef={tabellaRef}
            header={intestazione}
            titolo={titoloColonna}
            ultima={ultima}
          />
        ) : null}
      </TableHead>
    </ContestoIntestazioneTrascinabile.Provider>
  )
}

/**
 * Il guscio `DndContext`/`SortableContext` del riordino di colonna — la
 * stessa forma di `DataTableRiordinoRighe`, con tre scarti voluti:
 *
 * **`restrictToHorizontalAxis`, non verticale**: le intestazioni si
 * scambiano in orizzontale, un trascinamento in diagonale non stacca la
 * colonna dalla riga di intestazioni.
 *
 * **`horizontalListSortingStrategy`**, la strategia gemella di
 * `verticalListSortingStrategy` per un elenco che scorre in riga.
 *
 * **Nessun `activationConstraint`**: niko-table ne mette uno (8px) perché lì
 * l'intera intestazione è l'area di trascinamento e deve distinguere un clic
 * sul bottone d'ordinamento annidato da un trascinamento vero. Qui la
 * maniglia è un elemento a sé (v. `ContestoIntestazioneTrascinabile`): non
 * c'è click da distinguere, la stessa ragione per cui `DataTableRiordinoRighe`
 * non ne ha uno.
 *
 * A differenza del riordino di riga, **non spegne nient'altro sulla
 * tabella** — ordinamento, filtri, paginazione e virtualizzazione restano
 * intatti: l'indice di partenza e d'arrivo si calcolano
 * sull'ordine delle **intestazioni** (`ordineIntestazioni`, sotto), che non
 * dipende da quali righe sono visibili o in che ordine — a differenza del
 * riordino di riga, dove l'indice viene dalle righe stesse.
 */
function DataTableRiordinoColonne({
  ordineIntestazioni,
  onRiordina,
  children,
}: {
  ordineIntestazioni: string[]
  onRiordina: (nuovoOrdine: string[]) => void
  children: React.ReactNode
}) {
  const idContesto = React.useId()

  const sensori = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    // `coordinateGetter: sortableKeyboardCoordinates`, non il predefinito di
    // `KeyboardSensor` — quello muove di 25px fissi a ogni freccia, un passo
    // che una riga alta 38-48px supera in una o due pressioni (da cui il
    // riordino di riga da tastiera sembra funzionare col predefinito),
    // ma che una colonna larga 140-220px non supera mai: `ArrowLeft` sposta
    // l'intestazione di 25px in stile libero e la rilascia lì, senza mai
    // arrivare a scavalcare la vicina — misurato qui (un solo `ArrowLeft`,
    // nessun riordino). `sortableKeyboardCoordinates` (da `@dnd-kit/sortable`,
    // non il predefinito di `@dnd-kit/core`) salta invece **alla posizione
    // della prossima/precedente intestazione nell'elenco**, qualunque sia la
    // sua larghezza — la stessa nozione di "vicino" che il mouse usa con
    // `closestCenter`.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const gestisciFineTrascinamento = React.useCallback(
    (evento: DragEndEvent) => {
      const { active, over } = evento
      if (active && over && active.id !== over.id) {
        const indicePartenza = ordineIntestazioni.indexOf(active.id as string)
        const indiceArrivo = ordineIntestazioni.indexOf(over.id as string)
        onRiordina(arrayMove(ordineIntestazioni, indicePartenza, indiceArrivo))
      }
    },
    [ordineIntestazioni, onRiordina]
  )

  return (
    <DndContext
      id={idContesto}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={gestisciFineTrascinamento}
      sensors={sensori}
    >
      <SortableContext items={ordineIntestazioni} strategy={horizontalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

/** I due stati vuoti, che non sono lo stesso stato. */
export function TabellaVuota({
  filtrata,
  vuoto,
  onPulisci,
}: {
  filtrata: boolean
  vuoto: StatoVuoto
  onPulisci: () => void
}) {
  if (filtrata) {
    return (
      <Empty className="border-0 bg-transparent">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Nessun risultato</EmptyTitle>
          <EmptyDescription>
            Nessuna riga corrisponde alla ricerca.
          </EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" size="sm" onClick={onPulisci}>
          Togli i filtri
        </Button>
      </Empty>
    )
  }

  return (
    <Empty className="border-0 bg-transparent">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon aria-hidden />
        </EmptyMedia>
        <EmptyTitle>{vuoto.titolo}</EmptyTitle>
        {vuoto.descrizione ? (
          <EmptyDescription>{vuoto.descrizione}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {vuoto.azione}
    </Empty>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * Il corpo della tabella — non virtualizzato e virtualizzato
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Le celle di una riga, nell'ordine giusto: con `colonneBloccabili` le
 * colonne bloccate si spostano ai due bordi (v. `intestazioni`, più sotto,
 * per la stessa ragione sulle intestazioni), altrimenti l'ordine dichiarato.
 * Condivisa fra `DataTableBody` e `DataTableVirtualizedBody`, che altrimenti
 * la scriverebbero identica due volte.
 */
export function celleRiga<TDato extends RowData>(
  riga: Row<CaratteristicheTabella, TDato>,
  colonneBloccabili: boolean
) {
  return colonneBloccabili
    ? [
        ...riga.getStartVisibleCells(),
        ...riga.getCenterVisibleCells(),
        ...riga.getEndVisibleCells(),
      ]
    : riga.getVisibleCells()
}

export type CorpoTabellaCondiviso<TDato extends RowData> = {
  tabella: IstanzaTabella<TDato>
  righe: Row<CaratteristicheTabella, TDato>[]
  colonneBloccabili: boolean
  bloccoLegacy: boolean
  selezione: boolean
  colonneVisibili: number
  vuoto: StatoVuoto
  conFiltri: boolean
  pulisci: () => void
}

/**
 * L'unica `<tr>` che chiama `useSortable` — sempre, `trascinabile`
 * o no: le regole degli hook vogliono la stessa sequenza a ogni render, e
 * `disabled: !trascinabile` (dnd-kit) è la via prevista per spegnerlo senza
 * un `if` prima dell'hook. Fuori da un `<DataTableRiordinoRighe>` (nessun
 * `DndContext` sopra) dnd-kit ricade sul proprio contesto predefinito —
 * `setNodeRef`/`transform`/`listeners` restano no-op, non lanciano — ma qui
 * non succede mai: la colonna `riordino` e questo wrapper si accendono
 * sempre insieme, mai l'uno senza l'altro.
 */
function RigaCorpo<TDato extends RowData>({
  riga,
  trascinabile,
  className,
  dataState,
  menuRiga,
  children,
}: {
  riga: Row<CaratteristicheTabella, TDato>
  trascinabile: boolean
  className?: string
  dataState?: string
  // Il tasto destro condiviso: lo stesso `menu` della tendina «⋯»
  // (`colonnaAzioniRiga`), montato qui dentro un `<ContextMenu>` che avvolge
  // l'intera `<tr>` — non un'altra colonna, un altro modo di raggiungere le
  // stesse voci. `abilitato` viene da `enabledFor`: la stessa domanda che
  // spegne la tendina sulla stessa riga spegne anche il tasto destro, non
  // due `if` scritti a mano in due punti diversi del blocco.
  /**
   * Il menu di riga sul tasto destro: lo stesso `menu` della tendina «⋯»,
   * attorno all'intera riga. `abilitato` falso lo spegne insieme alla
   * tendina.
   */
  menuRiga?: { menu: React.ReactNode; abilitato: boolean }
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: riga.id,
    disabled: !trascinabile,
  })

  const stile: React.CSSProperties | undefined = trascinabile
    ? {
        // `CSS.Translate`, non `CSS.Transform` — stessa correzione presa
        // sopra per `CellaIntestazione`: righe di altezza diversa
        // (`pannelloRiga` chiuso/aperto, editing in-riga) fanno
        // calcolare a dnd-kit anche uno `scaleY`, che `Transform` porta e
        // `Translate` scarta. Qui il rischio è più raro che sulle colonne —
        // le righe sono quasi sempre alte uguali — ma la stessa causa vale.
        transform: CSS.Translate.toString(transform),
        transition,
        // `position: relative` è il contenimento che l'ombra durante il
        // trascinamento (`zIndex`) chiede per stare sopra le righe ferme.
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
      }
    : undefined

  const contestoRiga = React.useMemo(
    () => (trascinabile ? { attributes, listeners } : null),
    [trascinabile, attributes, listeners]
  )

  const rigaTabella = (
    <TableRow
      ref={trascinabile ? setNodeRef : undefined}
      style={stile}
      className={cn(className, trascinabile && isDragging && "bg-muted/50 opacity-80")}
      data-state={dataState}
    >
      {children}
    </TableRow>
  )

  return (
    <ContestoRigaTrascinabile.Provider value={contestoRiga}>
      {menuRiga && menuRiga.abilitato ? (
        <ContextMenu>
          <ContextMenuTrigger render={rigaTabella} />
          <ContextMenuContent>
            <ContestoTipoMenuRiga.Provider value="tastoDestro">
              <ContestoRigaMenu.Provider value={riga.original}>
                {menuRiga.menu}
              </ContestoRigaMenu.Provider>
            </ContestoTipoMenuRiga.Provider>
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        rigaTabella
      )}
    </ContestoRigaTrascinabile.Provider>
  )
}

/**
 * La riga di `DataTableBody`, dietro `React.memo` (`chiaveMemoRiga`).
 * **Senza `chiaveMemoRiga` non cambia niente**:
 * il comparatore rifiuta sempre di fermare il render (torna `false`, "non
 * sono uguali") e questa riga si comporta come il `<tr>` inline di prima che
 * esistesse — ricalcolata a ogni giro come tutte le altre.
 *
 * Con `chiaveMemoRiga` attivo, lo stato di editing (`editingId`/`draft`/
 * `errors`) vive **fuori da `dati`** — mai un `isEditing` dentro la riga, che
 * sostituendo l'array farebbe ricalcolare ogni riga memoizzata a ogni tasto,
 * vanificando la memoizzazione stessa — e la pagina lo incolla in una
 * stringa per riga con `chiaveMemoRiga(riga.original)`. Il comparatore la
 * confronta insieme a `riga` (che TanStack ricrea solo quando cambiano
 * `dati`/`colonne`, mai per selezione o ordinamento)
 * e a tutto ciò che può cambiare il contenuto di una riga senza toccare quei
 * due: selezione, espansione, e — uguale per ogni riga dello stesso render,
 * ricalcolata una sola volta da `DataTableBody` — l'assetto delle colonne
 * (ordine, larghezze acquisite, pin, visibilità). Digitare in un campo di
 * modifica cambia solo la stringa di quella riga: le altre restano ferme.
 */
type RigaTabellaCorpoProps<TDato extends RowData> = {
  tabella: IstanzaTabella<TDato>
  riga: Row<CaratteristicheTabella, TDato>
  colonneBloccabili: boolean
  bloccoLegacy: boolean
  selezione: boolean
  colonneVisibili: number
  fermo: boolean
  trascinabile: boolean
  menuRiga?: { menu: React.ReactNode; abilitato: boolean }
  pannelloRiga?: (riga: TDato) => React.ReactNode
  /**
   * Stato derivato passato **esplicitamente**: quando il comparatore ferma
   * il render non richiama mai `riga.getIsSelected()`/`getIsExpanded()` per
   * conto suo — guarda solo le prop.
   */
  selezionata: boolean
  espansa: boolean
  /** `undefined` quando `chiaveMemoRiga` non è passato: nessuna memoizzazione. */
  chiaveMemo: string | undefined
  /** Impronta di ordine/larghezze/pin/visibilità delle colonne — uguale per ogni riga dello stesso render. */
  strutturaColonne: string
}

function RigaTabellaCorpoImpl<TDato extends RowData>({
  tabella,
  riga,
  colonneBloccabili,
  bloccoLegacy,
  selezione,
  colonneVisibili,
  fermo,
  trascinabile,
  menuRiga,
  pannelloRiga,
  selezionata,
  espansa,
}: RigaTabellaCorpoProps<TDato>) {
  const celle = celleRiga(riga, colonneBloccabili)
  return (
    <React.Fragment>
      <RigaCorpo
        riga={riga}
        trascinabile={trascinabile}
        className={cn("group/riga", fermo && "snap-start")}
        dataState={selezionata ? "selected" : undefined}
        menuRiga={menuRiga}
      >
        {celle.map((cella, indice) => {
          // Il subtotale (`meta.sottototale`) prende il posto
          // della cella normale **solo sulle righe che hanno figli** — su
          // una riga foglia non c'è niente da sommare, e `tabella.FlexRender`
          // resta la via giusta.
          const sottototale = riga.subRows.length
            ? (cella.column.columnDef.meta as MetaColonna<TDato> | undefined)?.sottototale
            : undefined
          const ancoraCella = colonneBloccabili
            ? ancoraggioColonna(tabella, cella.column, "cella")
            : undefined
          return (
            // `truncate` è il prezzo di `table-fixed`: con le larghezze
            // decise dalle intestazioni, un testo più lungo della sua
            // colonna **sborda** nella colonna accanto invece di allargarla:
            // meglio tagliarlo coi puntini.
            <TableCell
              key={cella.id}
              className={cn(
                "truncate",
                bloccoLegacy && classiBloccate(indice, selezione),
                ancoraCella?.className
              )}
              style={ancoraCella?.style}
            >
              {sottototale ? (
                sottototale(
                  riga.subRows.map((r) => r.original),
                  riga.original
                )
              ) : (
                <tabella.FlexRender cell={cella} />
              )}
            </TableCell>
          )
        })}
      </RigaCorpo>
      {pannelloRiga && espansa ? (
        // Riga fratella, non figlia: subito dopo la riga che apre, colSpan
        // su tutte le colonne visibili — è il pannello di dettaglio, non
        // l'albero (quello aggiunge righe vere al modello dati,
        // questo ne disegna una in più solo per la vista).
        <TableRow
          id={`pannello-riga-${riga.id}`}
          className={cn("hover:bg-transparent", fermo && "snap-start")}
        >
          <TableCell colSpan={colonneVisibili} className="bg-muted/30">
            {pannelloRiga(riga.original)}
          </TableCell>
        </TableRow>
      ) : null}
    </React.Fragment>
  )
}

const RigaTabellaCorpo = React.memo(RigaTabellaCorpoImpl, (precedenti, successive) => {
  // Senza `chiaveMemoRiga` (`chiaveMemo === undefined`) il comparatore
  // dichiara sempre "diverse": nessuna riga resta mai ferma, e il
  // comportamento è bit-per-bit quello di prima che questo componente
  // esistesse — nessuna regressione per le otto capacità già `DONE` che non
  // passano questo prop.
  if (successive.chiaveMemo === undefined) return false
  return (
    precedenti.riga === successive.riga &&
    precedenti.selezionata === successive.selezionata &&
    precedenti.espansa === successive.espansa &&
    precedenti.strutturaColonne === successive.strutturaColonne &&
    precedenti.chiaveMemo === successive.chiaveMemo &&
    precedenti.trascinabile === successive.trascinabile &&
    precedenti.menuRiga?.abilitato === successive.menuRiga?.abilitato
  )
}) as typeof RigaTabellaCorpoImpl

// Il corpo non virtualizzato: ogni riga di `righe` è un `<tr>` vero, sempre
// montato — la forma che `naturale`/`ferma`/`infinito` hanno sempre avuto.
// Estratto in un componente a sé perché
// la Data Grid innesta invece `DataTableVirtualizedBody`, non questo:
// un nome esportato per ciascuno dei due corpi evita che la Data Grid debba
// ricopiare la logica di riga/pannello/sentinella da qui.
/**
 * Il corpo della tabella senza virtualizzazione: ogni riga è un `<tr>`
 * sempre montato. È il corpo di `perPagina` numerica e di `"infinito"`.
 */
export function DataTableBody<TDato extends RowData>({
  tabella,
  righe,
  colonneBloccabili,
  bloccoLegacy,
  selezione,
  colonneVisibili,
  vuoto,
  conFiltri,
  pulisci,
  fermo,
  pannelloRiga,
  infinito,
  totaleFiltrate,
  sentinellaRef,
  trascinabile = false,
  menuRiga,
  chiaveMemoRiga,
}: CorpoTabellaCondiviso<TDato> & {
  fermo: boolean
  pannelloRiga?: (riga: TDato) => React.ReactNode
  infinito: boolean
  totaleFiltrate: number
  sentinellaRef: React.RefObject<HTMLTableRowElement | null>
  /** Righe trascinabili: vuole un `<DataTableRiordinoRighe>` sopra. */
  trascinabile?: boolean
  /** Il menu di riga condiviso: vedi `menuRiga` di `<DataTable>`. */
  menuRiga?: {
    menu: React.ReactNode
    enabledFor?: (riga: TDato) => boolean
  }
  /** Vedi `chiaveMemoRiga` di `<DataTable>`. */
  chiaveMemoRiga?: (riga: TDato) => string
}) {
  // Calcolata una volta per render, non per riga: è la stessa per tutte,
  // quindi entra nel comparatore di `RigaTabellaCorpo` come un unico
  // valore condiviso. Il costo si paga solo quando `chiaveMemoRiga` è
  // davvero passato — altrimenti resta una stringa vuota, mai letta dal
  // comparatore (che con `chiaveMemo === undefined` non guarda le prop).
  const strutturaColonne = chiaveMemoRiga
    ? [
        tabella.state.columnOrder.join(","),
        tabella.state.sorting.map((s) => `${s.id}:${s.desc}`).join(","),
        Object.entries(tabella.state.columnSizing)
          .map(([id, larghezza]) => `${id}:${larghezza}`)
          .join(","),
        tabella.state.columnPinning.start.join(","),
        tabella.state.columnPinning.end.join(","),
        Object.entries(tabella.state.columnVisibility)
          .map(([id, visibile]) => `${id}:${visibile}`)
          .join(","),
      ].join("|")
    : ""
  return (
    <TableBody>
      {righe.length > 0 ? (
        <>
          {righe.map((riga) => (
            <RigaTabellaCorpo
              key={riga.id}
              tabella={tabella}
              riga={riga}
              colonneBloccabili={colonneBloccabili}
              bloccoLegacy={bloccoLegacy}
              selezione={selezione}
              colonneVisibili={colonneVisibili}
              fermo={fermo}
              trascinabile={trascinabile}
              pannelloRiga={pannelloRiga}
              menuRiga={
                menuRiga
                  ? {
                      menu: menuRiga.menu,
                      abilitato: menuRiga.enabledFor ? menuRiga.enabledFor(riga.original) : true,
                    }
                  : undefined
              }
              selezionata={riga.getIsSelected()}
              espansa={pannelloRiga ? riga.getIsExpanded() : false}
              chiaveMemo={chiaveMemoRiga ? chiaveMemoRiga(riga.original) : undefined}
              strutturaColonne={strutturaColonne}
            />
          ))}
          {/*
            La sentinella di `perPagina="infinito"`: una riga vuota,
            invisibile (altezza di un pixel, `aria-hidden`), che
            l'`IntersectionObserver` guarda per sapere quando caricare il
            passo successivo. Sta **dopo** l'ultima riga vera, così entra
            in vista solo quando ci si è avvicinati davvero al fondo — non
            a ogni fotogramma. `righe.length < totaleFiltrate`: quando è
            già tutto caricato non c'è più niente da aspettare, e la
            sentinella sparisce.
          */}
          {infinito && righe.length < totaleFiltrate ? (
            <TableRow
              ref={sentinellaRef}
              aria-hidden
              className="border-0 hover:bg-transparent"
            >
              <TableCell colSpan={colonneVisibili} className="h-px p-0" />
            </TableRow>
          ) : null}
        </>
      ) : (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={colonneVisibili} className="p-0">
            <TabellaVuota filtrata={conFiltri} vuoto={vuoto} onPulisci={pulisci} />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  )
}

// Il corpo virtualizzato (`perPagina="virtuale"`): monta solo le
// righe **davvero in vista**, non tutte quelle filtrate — la differenza con
// `perPagina="infinito"`, che invece carica progressivamente e monta ogni
// riga caricata per sempre. È la forma che regge 10.000 righe senza mai avere
// 10.000 `<tr>` nel DOM.
//
// **La tecnica delle due righe-cuscinetto**, non `position: absolute` per
// riga: un `<table>` non ha un contenitore libero su cui posizionare i figli
// in assoluto senza rompere il flusso delle colonne (`<colgroup>`), quindi
// qui si usa la stessa forma che TanStack stessa documenta per una `<table>`
// vera — una riga vuota prima («quanto ho scorso oltre») e una dopo («quanto
// resta da scorrere»), alte quanto lo spazio delle righe non montate.
//
// **`estimateSize` è un segnaposto, non una misura**: 44 è un valore di
// partenza plausibile (vicino all'altezza di riga in densità normale), corretto
// subito dalla misura vera — `measureElement`, passato come `ref` a ogni riga
// — che legge l'altezza reale resa, densità compresa. La stessa disciplina di
// `altezzaMax` più sotto in `DataTable`: si misura, non si assume; qui la
// stima iniziale non è mai quella che l'utente vede a riposo, per più di un
// fotogramma.
/**
 * Il corpo virtualizzato, per `perPagina="virtuale"`: monta solo le righe
 * in vista, e regge decine di migliaia di righe senza tenerle tutte nel
 * DOM. L'altezza di ogni riga si misura su quella resa, densità compresa.
 */
export function DataTableVirtualizedBody<TDato extends RowData>({
  tabella,
  righe,
  colonneBloccabili,
  bloccoLegacy,
  selezione,
  colonneVisibili,
  vuoto,
  conFiltri,
  pulisci,
  scrollEl,
  senzaFocoRiga,
  alVirtualizzatore,
}: CorpoTabellaCondiviso<TDato> & {
  /**
   * L'elemento che scorre davvero — `[data-slot="table-container"]`, non il
   * riquadro bordato attorno (v. il commento sull'effetto di scorrimento
   * infinito in `DataTable`, stessa ragione). `null` finché `DataTable` non
   * l'ha ancora trovato: il virtualizzatore resta inerte, non un errore.
   */
  scrollEl: HTMLElement | null
  // Wiring privata per `<DataGrid>`: quando `true`, questo corpo
  // smette di gestire lui il fuoco e la tastiera **a livello di riga**
  // (niente `tabIndex` sulle `<tr>`, niente `onKeyDown`/`onFocus` di riga).
  // La Data Grid naviga **a livello di cella** — ogni cella è il proprio
  // bersaglio di fuoco — e se il corpo tenesse acceso anche il proprio giro
  // riga-per-riga i due meccanismi si pesterebbero i piedi (due gestori di
  // `ArrowUp`/`ArrowDown` sulla stessa pressione, uno dei quali cieco alla
  // colonna). `undefined`/`false`: fuoco e tastiera restano per riga.
  /**
   * Per `<DataGrid>`: il corpo lascia a lei il fuoco e la tastiera, che nella
   * griglia si muovono cella per cella e non riga per riga.
   */
  senzaFocoRiga?: boolean
  // Consegna a chi monta questo corpo la sola funzione di
  // scorrimento del virtualizzatore (`scrollToIndex`, già clampata), non
  // l'istanza intera: la Data Grid la usa per portare in vista una riga
  // fuori dalla finestra montata quando il fuoco si sposta verticalmente da
  // tastiera — lo stesso identico `vaiA` che questo corpo già usa per sé,
  // riutilizzato invece di duplicato. Chiamato a ogni render (nessun elenco
  // di dipendenze): `vaiA` chiude su `righe.length` corrente, e la chiamata
  // stessa costa solo l'assegnazione di un riferimento.
  /**
   * Per `<DataGrid>`: riceve la funzione che porta in vista una riga fuori
   * dalla finestra montata, quando il fuoco ci si sposta da tastiera.
   */
  alVirtualizzatore?: (vaiA: (indice: number) => void) => void
}) {
  const virtualizzatore = useVirtualizer({
    count: righe.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => 44,
    overscan: 10,
  })

  /**
   * La riga a fuoco da tastiera, per indice — non un `id`: un indice resta
   * confrontabile con `righe.length` per i confini (`Home`/`End`), e
   * `scrollToIndex` del virtualizzatore vuole comunque un indice.
   *
   * **Deve tornare dentro i confini in fase di render**, non in un
   * `useEffect`: un filtro può accorciare `righe` sotto l'indice a fuoco, e
   * senza questa riga la tastiera resterebbe puntata su una riga che non
   * esiste più per un giro di render — lo stesso pattern di
   * `chiaveFiltroVista` in `DataTable` per `caricate`.
   */
  const [focoRiga, setFocoRiga] = React.useState(0)
  const focoValido = righe.length === 0 ? 0 : Math.min(focoRiga, righe.length - 1)
  if (focoValido !== focoRiga) setFocoRiga(focoValido)

  /**
   * I nodi delle righe **montate**, per indice — non tutte esistono sempre:
   * solo quelle nella finestra visibile più l'`overscan`. `vaiA` scorre fino
   * all'indice voluto (che la monta, se non lo è già) e aggiorna `focoRiga`;
   * questo effetto — dopo **ogni** render, apposta senza dipendenze — sposta
   * il fuoco reale del browser sul nodo appena montato, quando c'è. È la
   * rottura nota della tastiera in una lista virtualizzata: senza questo
   * secondo passo, `scrollToIndex` porta la riga in vista ma il fuoco resta
   * sul vecchio nodo, magari già smontato.
   *
   * **`interagitoRef`, non l'effetto da solo**: senza questa guardia,
   * l'effetto girerebbe anche al primo montaggio e ruberebbe il fuoco alla
   * riga 0 non appena entra nel DOM — una tabella che si apre e si porta via
   * il fuoco dalla ricerca sopra di lei, mai il comportamento di nessun'altra
   * story del blocco. Diventa vero alla prima interazione vera con una riga
   * (`onFocus` nativo di un `Tab`, o una freccia già dentro la tabella): da
   * lì in poi l'effetto può muovere il fuoco lui stesso, perché è lì che
   * l'utente lo vuole.
   */
  const rigaRefs = React.useRef(new Map<number, HTMLTableRowElement>())
  const interagitoRef = React.useRef(false)
  React.useEffect(() => {
    if (senzaFocoRiga || !interagitoRef.current) return
    const nodo = rigaRefs.current.get(focoValido)
    if (nodo && document.activeElement !== nodo) nodo.focus()
  })

  const vaiA = (indice: number) => {
    const chiuso = Math.max(0, Math.min(righe.length - 1, indice))
    interagitoRef.current = true
    virtualizzatore.scrollToIndex(chiuso, { align: "auto" })
    if (!senzaFocoRiga) setFocoRiga(chiuso)
  }

  React.useEffect(() => {
    alVirtualizzatore?.(vaiA)
  })

  // Un "passo di pagina" quanto le righe attualmente in vista — non un
  // numero fisso: la stessa pressione di `PageDown` deve saltare di più su
  // uno schermo alto e di meno su uno stretto, come farebbe lo scorrimento
  // nativo del browser.
  const passoPagina = Math.max(virtualizzatore.getVirtualItems().length - 1, 1)

  const onKeyDownRiga = (evento: React.KeyboardEvent, indice: number) => {
    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault()
        vaiA(indice + 1)
        return
      case "ArrowUp":
        evento.preventDefault()
        vaiA(indice - 1)
        return
      case "Home":
        evento.preventDefault()
        vaiA(0)
        return
      case "End":
        evento.preventDefault()
        vaiA(righe.length - 1)
        return
      case "PageDown":
        evento.preventDefault()
        vaiA(indice + passoPagina)
        return
      case "PageUp":
        evento.preventDefault()
        vaiA(indice - passoPagina)
        return
    }
  }

  if (righe.length === 0) {
    return (
      <TableBody>
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={colonneVisibili} className="p-0">
            <TabellaVuota filtrata={conFiltri} vuoto={vuoto} onPulisci={pulisci} />
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  const elementiVirtuali = virtualizzatore.getVirtualItems()
  const primaAltezza = elementiVirtuali[0]?.start ?? 0
  const dopoAltezza =
    virtualizzatore.getTotalSize() - (elementiVirtuali[elementiVirtuali.length - 1]?.end ?? 0)

  /**
   * **A quale riga va il `tabIndex={0}`**: non sempre `focoValido`, che può
   * essere scorso fuori dalla finestra montata (`Tab` non trova niente da
   * raggiungere, e con `tabIndex={-1}` ovunque la tabella diventa
   * irraggiungibile da tastiera). Va alla riga **montata più vicina** a
   * `focoValido` — quando coincide è la stessa riga di sempre, quando
   * `focoValido` è fuori vista diventa il punto di ingresso più sensato per
   * chi preme `Tab` da fuori.
   */
  const indiceRovente = elementiVirtuali.reduce(
    (vicino, elemento) =>
      Math.abs(elemento.index - focoValido) < Math.abs(vicino - focoValido)
        ? elemento.index
        : vicino,
    elementiVirtuali[0]?.index ?? focoValido
  )

  return (
    <TableBody>
      {primaAltezza > 0 ? (
        <tr aria-hidden>
          <td colSpan={colonneVisibili} className="p-0" style={{ height: primaAltezza }} />
        </tr>
      ) : null}
      {elementiVirtuali.map((elemento) => {
        const riga = righe[elemento.index]
        if (!riga) return null
        const celle = celleRiga(riga, colonneBloccabili)
        return (
          <TableRow
            key={riga.id}
            ref={(nodo: HTMLTableRowElement | null) => {
              virtualizzatore.measureElement(nodo)
              if (nodo) rigaRefs.current.set(elemento.index, nodo)
              else rigaRefs.current.delete(elemento.index)
            }}
            tabIndex={senzaFocoRiga ? undefined : elemento.index === indiceRovente ? 0 : -1}
            onFocus={
              senzaFocoRiga
                ? undefined
                : () => {
                    interagitoRef.current = true
                    setFocoRiga(elemento.index)
                  }
            }
            onKeyDown={senzaFocoRiga ? undefined : (evento) => onKeyDownRiga(evento, elemento.index)}
            className="group/riga outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            data-state={riga.getIsSelected() ? "selected" : undefined}
          >
            {celle.map((cella, indice) => {
              const sottototale = riga.subRows.length
                ? (cella.column.columnDef.meta as MetaColonna<TDato> | undefined)?.sottototale
                : undefined
              const ancoraCella = colonneBloccabili
                ? ancoraggioColonna(tabella, cella.column, "cella")
                : undefined
              return (
                <TableCell
                  key={cella.id}
                  className={cn(
                    "truncate",
                    bloccoLegacy && classiBloccate(indice, selezione),
                    ancoraCella?.className
                  )}
                  style={ancoraCella?.style}
                >
                  {sottototale ? (
                    sottototale(
                      riga.subRows.map((r) => r.original),
                      riga.original
                    )
                  ) : (
                    <tabella.FlexRender cell={cella} />
                  )}
                </TableCell>
              )
            })}
          </TableRow>
        )
      })}
      {dopoAltezza > 0 ? (
        <tr aria-hidden>
          <td colSpan={colonneVisibili} className="p-0" style={{ height: dopoAltezza }} />
        </tr>
      ) : null}
    </TableBody>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * Il blocco
 * ──────────────────────────────────────────────────────────────────────── */

/** Cosa dire quando di righe non ce n'è nessuna, mai — non «non più». */
export type StatoVuoto = {
  titolo: string
  descrizione?: string
  /** Il gesto che rimedia: tipicamente il bottone che crea il primo record. */
  azione?: React.ReactNode
}

/**
 * Il nome della riga, per il conto in fondo alla tabella.
 *
 * **«Righe» è un nome tecnico, non quello con cui l'utente pensa i propri
 * dati**: «37 righe» non dice cosa sono
 * quelle 37 cose, «37 prodotti» sì. Il predefinito resta `riga`/`righe`,
 * generico per le tabelle che il piano non prevede di nominare (le story del
 * blocco, un elenco di appoggio dentro una scheda); ogni pagina che sa cosa
 * elenca lo dichiara.
 */
export type NomeRighe = { singolare: string; plurale: string }

export type DataTableProps<TDato extends RowData> = {
  colonne: ColonnaTabella<TDato>[]
  dati: TDato[]
  /**
   * L'identità di una riga — passata a TanStack come `getRowId`. **Senza,
   * l'id di una riga è il suo indice nell'array** (il predefinito di
   * TanStack): va bene finché `dati` cambia solo forma (un filtro, una
   * pagina), non ordine — è la riga stessa a restare all'indice che aveva.
   *
   * **`riordinabile` lo richiede**, e la ragione è specifica, non una
   * cautela generica: `useSortable` (dnd-kit) tiene per ogni id uno stato
   * interno che confronta la posizione *prima* e *dopo* un cambio di
   * layout, per capire se animare l'assestamento. Con l'id legato
   * all'indice, la riga che finisce in una data posizione non è mai "la
   * stessa riga di prima" per dnd-kit — è sempre "quella che sta lì ora" —
   * e il confronto vede un salto di rettangolo che non c'è, innescando
   * un'animazione di assestamento indesiderata sulla riga appena rilasciata
   * (misurato: uno scivolamento di ~150ms dopo il rilascio, assente nel
   * riferimento niko-table — che infatti passa `getRowId={(row) => row.id}`
   * nel proprio esempio). Con un id vero la riga resta la stessa entità
   * anche quando cambia posizione, e dnd-kit non vede niente da animare.
   */
  idRiga?: (riga: TDato) => string
  /**
   * Il segnaposto della casella di ricerca. `false` la toglie — per le tabelle
   * corte, dove cercare costa più che leggere.
   */
  cerca?: string | false
  /** Cosa dire quando `dati` è vuoto. */
  vuoto?: StatoVuoto
  /**
   * Il nome di una riga, per il conto in fondo — «37 prodotti», non «37
   * righe». Predefinito generico (`riga`/`righe`); ogni pagina che sa cosa
   * elenca lo dichiara.
   */
  nomeRighe?: NomeRighe
  // Righe per pagina. Una di 10, 25, 50, 100 — oppure **`"infinito"`**: niente
  // pagine, si carica altro scorrendo.
  //
  // È la forma delle pagine **sola lista** — Prodotti, Norme, Certificazioni,
  // sidebar → lista → scheda — dove sotto la tabella non c'è altro. **Non** `"auto"` — una prima versione
  // pensava a righe-per-pagina calcolate per riempire lo schermo, scartata:
  // si discostava troppo dalla forma di shadcn (righe di riempimento per
  // pareggiare l'ultima pagina) mentre `anagrafe.tassullo.it` ha già lo
  // scorrimento infinito in produzione — la stessa lista, la stessa mole di
  // dati, un meccanismo noto e già collaudato.
  //
  // L'unico difetto di quell'implementazione — la testata scorre via con la
  // pagina, e si perde il nome delle colonne — è quello che questo blocco
  // corregge: la testata è `sticky` sul **contenitore** che scorre, non sulla
  // pagina.
  //
  // **Vuole `altezza="ferma"` per funzionare** (altrimenti non c'è niente
  // da far scorrere, e le righe oltre lo spazio disponibile restano
  // invisibili): quel prop calcola il tetto e apre lo scorrimento interno,
  // qui serve solo a dire che senza non ha senso. `className` deve inoltre
  // passare `flex-1 min-h-0`, e il genitore deve avere un'altezza vera a cui
  // arrivare — `<AppShell contenuto="riempie">`.
  //
  // Il menu «Righe» e i salti di pagina spariscono: non c'è una pagina da
  // saltare. Resta solo il conto, in fondo.
  //
  // **Confine accertato, da conoscere prima di promettere «stessa forma,
  // zero sforzo» su un'altra pagina**: `perPagina="infinito"` rivela
  // progressivamente un array **già tutto in `dati`** — non richiede altro
  // al server mentre si scorre. Va bene finché l'API della pagina restituisce
  // l'elenco intero in una chiamata sola (`generaProdotti` nella story lo
  // simula così, ed è anche il caso di Anagrafe oggi per Prodotti). Se una
  // futura pagina **sola lista** avesse un elenco paginato lato server — non
  // tutto scaricato in un colpo — «carica altro mentre scorro» diventerebbe
  // lavoro vero: un `onCaricaAltro`/`fetchNextPage` che questo blocco oggi
  // non ha. Verificare come arrivano i dati **prima** di assumere che il
  // pattern costi zero su una pagina nuova.
  //
  // **`"virtuale"`** è la terza forma, non una variante delle
  // altre due: niente pagine come `"infinito"`, ma **niente crescita** del
  // DOM mentre si scorre — monta solo le righe davvero in vista
  // (`@tanstack/react-virtual`), non ogni riga caricata finora. È la forma
  // per un elenco **grande fin dall'inizio** (10.000 righe, non 40 che
  // crescono a 10.000 scorrendo): `"infinito"` su quella mole monterebbe
  // comunque 10.000 `<tr>` una volta arrivati in fondo, `"virtuale"` mai più
  // di una finestra. **Vuole `altezza="ferma"` per lo stesso motivo di
  // `"infinito"`** — senza un tetto non c'è una finestra da calcolare.
  // **Non compone con `pannelloRiga`**: il pannello di dettaglio inserisce una
  // riga vera in più nel DOM quando si apre, e il virtualizzatore conta le
  // righe per indice fisso (`righe.length`) — un conto che il pannello
  // sposterebbe ogni volta che una riga qualsiasi si espande. `getSottoRighe`
  // (l'albero) invece compone senza problemi: le righe figlie
  // sono già righe vere nel modello dati, incluse nello stesso elenco piatto
  // che il virtualizzatore già scorre.
  /**
   * Come si caricano le righe.
   *
   * - Un numero fra 10, 25, 50 e 100: le pagine, con il menu «Righe» e i salti
   *   di pagina.
   * - `"infinito"`: niente pagine, altre righe compaiono scorrendo. La testata
   *   resta ferma in cima al riquadro. Le righe devono essere già tutte in
   *   `dati`: il blocco le mostra man mano, non ne chiede altre al server.
   * - `"virtuale"`: niente pagine, e sono montate solo le righe in vista. Per
   *   un elenco grande fin dall'inizio, migliaia di righe. Non si combina con
   *   `pannelloRiga`; `getSottoRighe` sì.
   *
   * `"infinito"` e `"virtuale"` vogliono `altezza="ferma"`, con il genitore
   * che dà alla tabella un'altezza vera: `className="min-h-0 flex-1"` dentro
   * `<AppShell contenuto="riempie">`.
   */
  perPagina?: (typeof PER_PAGINA)[number] | "infinito" | "virtuale"
  // Il riquadro della tabella, in una di due forme — indipendente da
  // `perPagina`, che sceglie *come si caricano* le righe, non *quanto spazio
  // prende* il riquadro. `"naturale"` (default): l'altezza segue il
  // contenuto, la pagina intorno scorre — corretto quando la tabella è
  // **una sezione fra altre** (una `pagina-scheda`, dove sopra c'è un
  // breadcrumb, un'intestazione, magari un'altra tabella). `"ferma"`:
  // altezza calcolata sullo spazio che il genitore concede (la stessa misura
  // che finora girava solo per `"infinito"`, v. l'effetto più sotto),
  // intestazione ferma, scorrimento interno su `table-container`, piè
  // sempre visibile. È la forma corretta quando la tabella **è** la pagina —
  // `pagina-lista`, dentro `<AppShell contenuto="riempie">` — a
  // prescindere da come `perPagina` carica le righe: prima di questa
  // distinzione, la paginazione numerica non aveva mai il riquadro fermo, e
  // con più righe di quante ne stiano a schermo il piè — conteggio, salti di
  // pagina — usciva dalla vista finché non si scorreva **tutta** la pagina.
  // Con poche righe (`"ferma"`, 10
  // righe) il riquadro si restringe fino al contenuto — nessuno spazio
  // vuoto sotto, `flex-shrink` è già il predefinito di un elemento flex.
  /**
   * Il riquadro della tabella. `"naturale"`, il predefinito: l'altezza segue
   * il contenuto e scorre la pagina intorno — per una tabella che è una sezione
   * fra altre. `"ferma"`: il riquadro prende lo spazio che il genitore
   * concede, la testata resta ferma, le righe scorrono dentro e il piè resta
   * sempre in vista — per una tabella che è la pagina, con qualunque
   * `perPagina`. Con poche righe il riquadro si restringe al contenuto.
   */
  altezza?: "naturale" | "ferma"
  /**
   * Il piè — conteggio righe, e la fascia di paginazione se `perPagina` non
   * è `"infinito"` — si toglie del tutto per le tabelle **imbarcate**, di
   * appoggio dentro un'altra pagina (una scheda con più tabelle piccole,
   * dove il conteggio non aggiunge niente e i controlli di pagina
   * costerebbero più spazio di quanto la tabella stessa ne occupa). `true`
   * di default.
   */
  piePagina?: boolean
  /**
   * La **riga di totali in coda alla tabella** — un `<tfoot>`, dentro la
   * tabella e allineato alle colonne. Spento di default.
   *
   * ── `piede` non è `piePagina`, e la somiglianza dei due nomi è l'unica
   * cosa che hanno in comune ─────────────────────────────────────────────
   *
   * `piePagina` è la **fascia di paginazione** sotto il riquadro: conteggio
   * righe, avanti/indietro, righe per pagina. Non è una riga della tabella e
   * non si allinea a niente. `piede` è una **riga della tabella**: sta dentro
   * `<table>`, prende le stesse colonne, le stesse larghezze e lo stesso
   * ordine — compreso quello che `colonneBloccabili` rimescola. Si accendono
   * e si spengono a vicenda senza sapere l'una dell'altra.
   *
   * ── Cosa somma: le righe che il **filtro** lascia passare ──────────────
   *
   * Non la pagina corrente, e la differenza va scelta sapendo perché. Un
   * totale che cambia voltando pagina non è un totale che qualcuno possa
   * usare: si legge «1.284» in fondo alla pagina 1 e «903» in fondo alla 2,
   * e nessuno dei due è il numero che si stava cercando. E con
   * `perPagina="virtuale"` o `"infinito"` una pagina non esiste proprio —
   * `piede` deve voler dire la stessa cosa in tutti e tre i casi, o non vuol
   * dire niente. Quindi: **tutte le righe filtrate**, che è anche l'unica
   * lettura che risponde alla domanda vera, «quanto fa quello che sto
   * guardando».
   *
   * Conseguenza da scrivere nell'etichetta del piede, non da lasciare
   * indovinare: il numero **cambia col filtro e con la ricerca**, e non
   * cambia con l'ordinamento né con la pagina.
   *
   * Su una tabella ad albero (`getSottoRighe`) le righe passate sono quelle
   * di **primo livello**: sommare anche i figli conterebbe due volte lo
   * stesso importo. Il conto dei figli, se serve, è `sottototale`.
   *
   * ── Come si scrive ─────────────────────────────────────────────────────
   *
   * Il piede non ha un contenuto proprio: ogni colonna dichiara la sua cella
   * in `meta.piede`, e quelle che non la dichiarano restano vuote. È la
   * stessa forma dell'intestazione (`meta.titolo`), e per la stessa ragione:
   * così la cella segue la sua colonna quando la si nasconde, la si sposta,
   * la si ridimensiona o la si blocca a un bordo.
   *
   * Con una differenza rispetto all'intestazione: **una cella del piede si
   * prende lo spazio delle colonne che seguono e che una cella non ce
   * l'hanno** (v. `cellePiede` nel codice). Serve perché l'etichetta che dice
   * di cosa è il totale finisce nella prima colonna, e la prima colonna è
   * quasi sempre la più stretta — senza la fusione si legge «Totale — 1…»,
   * e non c'è gate che lo veda: il conto delle celle torna, axe tace, e la
   * stringa nel DOM è intera.
   *
   * **Una colonna bloccata non assorbe le vicine** (lo scarto dal bordo di
   * una cella bloccata è calcolato sulla sua larghezza, e fusa descriverebbe
   * una cella che non esiste): con `bloccaPrimaColonna` la prima colonna
   * torna quindi stretta, e se ci sta l'etichetta si tronca. Il rimedio è
   * scrivere `meta.piede` su una colonna **non** bloccata — misurato, non
   * dedotto: con `bloccaPrimaColonna` + `selezione` la cella
   * dell'etichetta resta a 96px, e con `colonneBloccabili` senza niente
   * bloccato la stessa etichetta si stende su 520.
   *
   * ```tsx
   * col.accessor("codice", { meta: { piede: (righe) => `${righe.length} prodotti` } })
   * col.accessor("revisione", {
   *   meta: { piede: (righe) => righe.reduce((n, r) => n + r.revisione, 0) },
   * })
   * ```
   */
  piede?: boolean
  // Linee verticali fra le colonne e bordo esterno. **Spento di default**, e
  // non per timidezza: la tabella di shadcn separa le righe e basta, e
  // accenderli ovunque cambierebbe l'aspetto di ogni tabella già composta.
  //
  // Si accende quando la tabella si legge **per colonne** invece che per
  // righe — un computo, un listino, una tabella di misure incolonnate — che è
  // il caso in cui l'occhio, a metà riga, perde di quale colonna sia il
  // numero che sta guardando. I fogli di computo li hanno;
  // `tassullo-foglio-gruppi` li ha
  // sempre, perché lì sono la forma del blocco e non un'opzione.
  //
  // Disegna le **sole linee verticali**, non il perimetro: quello ce l'ha già
  // il riquadro che contiene la tabella, e sovrapporne un secondo dà un doppio
  // bordo a un pixel di distanza.
  /**
   * Linee verticali fra le colonne. Spente di default. Si accendono quando la
   * tabella si legge per colonne — un computo, un listino, delle misure
   * incolonnate —, dove a metà riga l'occhio perde di quale colonna sia il
   * numero. Il bordo esterno lo dà già il riquadro.
   */
  bordiColonna?: boolean
  /** Aggiunge la colonna delle caselle. */
  selezione?: boolean
  /** Il menu «Colonne». Acceso di default. */
  colonneNascondibili?: boolean
  /**
   * Blocca a sinistra la colonna che identifica la riga — e la casella di
   * selezione, se c'è — così scorrendo in orizzontale non si perde di vista
   * *quale* riga si sta leggendo.
   *
   * Serve sotto una certa larghezza, e sotto quella larghezza serve **molto**:
   * a 341px di riquadro la tabella della story ne occupa 918, cioè due terzi
   * stanno fuori, e senza un riferimento fermo si legge una data senza sapere
   * di che prodotto sia.
   */
  bloccaPrimaColonna?: boolean
  // Colonne ridimensionabili da tastiera e da trascinamento. Aggiunge a ogni intestazione una maniglia sul
  // bordo destro — `role="separator"`, frecce sinistra/destra per i passi da
  // tastiera, `Home` per tornare alla larghezza di partenza.
  //
  // **Sposta il calcolo delle larghezze da `meta.larghezza` (utility
  // Tailwind) a `size`/`minSize`/`maxSize`** sulla colonna (v. `MetaColonna`):
  // la tabella passa da `table-fixed` con larghezze nella prima riga a un
  // `<colgroup>` vero, perché una larghezza *acquisita* dall'utente è un
  // numero che nessuna classe del tema rappresenta.
  //
  // **Il costo**: le larghezze acquisite sono pixel, e quindi **non seguono
  // la densità** — la stessa eccezione, per la stessa ragione, della
  // larghezza della `sidebar`. È l'unica eccezione al divieto di valori
  // arbitrari, e ha un perimetro stretto: «larghezze acquisite
  // dall'utente», non «larghezze» in generale. La persistenza fra un
  // caricamento e l'altro **non c'è**: `columnSizing` vive in uno stato
  // interno del blocco, non in una prop controllata.
  /**
   * Colonne che si allargano e si stringono, col trascinamento della maniglia
   * sul bordo destro dell'intestazione o, da tastiera, con `Alt`+`←`/`→`
   * sull'intestazione. Le larghezze si dichiarano con `size`, `minSize` e
   * `maxSize` sulla colonna, al posto di `meta.larghezza`.
   *
   * Da sapere: una larghezza scelta dall'utente è in pixel, quindi non segue la
   * densità, e non si conserva da un caricamento all'altro.
   */
  ridimensionabile?: boolean
  // Il pin **generalizzato**: qualunque colonna, a sinistra o a
  // destra, da un menu nell'intestazione — non solo la prima colonna fissa di
  // `bloccaPrimaColonna`. Aggiunge a ogni intestazione bloccabile un piccolo
  // bottone con `PinIcon`, che apre "Blocca a sinistra" / "Blocca a destra" /
  // "Non bloccare".
  //
  // **Implica `ridimensionabile` internamente** (non serve passarlo insieme):
  // lo scarto sticky di una colonna bloccata (`left`/`right` in pixel) si
  // calcola dalle larghezze *acquisite* delle colonne che la precedono
  // (`column.getStart("start")`/`getAfter("end")` di TanStack), che senza il
  // `<colgroup>` di `ridimensionabile` non esistono. Le maniglie di
  // ridimensionamento restano nascoste finché non si passa anche
  // `ridimensionabile` esplicitamente — `colonneBloccabili` da solo blocca,
  // non ridimensiona.
  //
  // **Sostituisce `bloccaPrimaColonna` quando sono passati insieme**: i due
  // meccanismi disegnano lo sticky in due modi incompatibili (classi fisse
  // per indice contro scarti calcolati), e sovrapporli romperebbe l'uno o
  // l'altro. Con `colonneBloccabili` si blocca la prima colonna dal menu, non
  // dal prop.
  /**
   * Colonne che si bloccano a sinistra o a destra, dal menu dell'intestazione:
   * «Blocca a sinistra», «Blocca a destra», «Non bloccare». Qualunque colonna,
   * non solo la prima. Da solo blocca e non ridimensiona: le maniglie
   * compaiono con `ridimensionabile`. Passato insieme a `bloccaPrimaColonna`,
   * lo sostituisce.
   */
  colonneBloccabili?: boolean
  // Riordino manuale delle **colonne** via trascinamento (stesso
  // `@dnd-kit/*` di `riordinabile`): aggiunge
  // a ogni intestazione trascinabile una maniglia (`⠿`), accanto al bottone
  // d'ordinamento — mai al posto dell'intestazione intera, che diventerebbe
  // un `role="button"` attorno a un bottone vero e la violazione
  // `nested-interactive` di axe (v. `ContestoIntestazioneTrascinabile`).
  //
  // **A differenza di `riordinabile`, non spegne niente**: ordinamento,
  // ricerca/filtri, paginazione e virtualizzazione restano tutti attivi
  // — l'indice di partenza e d'arrivo del trascinamento
  // viene dall'ordine delle **intestazioni**, non da quello delle righe, e
  // non diverge mai da `state.columnOrder` qualunque cosa succeda sotto.
  //
  // Le tre colonne che il blocco aggiunge da sé — selezione, espansione,
  // maniglia di riordino **riga** — restano sempre per prime e non si
  // trascinano (`COLONNE_UTILITY`): non sono "una colonna" nel senso in cui
  // lo sono quelle dichiarate da `colonne`, sono chrome del blocco.
  //
  // **Le celle non seguono il trascinamento a fotogrammi come niko-table**
  // (`TableDragAlongCell`, un `useSortable` per cella per riga): qui solo
  // l'intestazione scivola durante il trascinamento, il corpo scatta alla
  // nuova posizione al rilascio — `row.getVisibleCells()` rispetta già
  // `state.columnOrder` da sé. Uno scarto deliberato dal sorgente originale,
  // non un limite scoperto tardi: un `useSortable` per cella per riga
  // avrebbe un costo che cresce con `dati`, proprio dove la virtualizzazione
  // e la Data Grid esistono apposta per tenerlo basso.
  //
  // `state.columnOrder` resta uno stato interno del blocco, come `dimensioni`/
  // `ancoraggio` per resize e pin: nessuna pagina oggi salva un riordino di
  // colonna fra un caricamento e l'altro.
  /**
   * Colonne che si riordinano trascinandone l'intestazione per la maniglia
   * (`⠿`), accanto al bottone d'ordinamento. Ordinamento, ricerca, filtri e
   * paginazione restano attivi. Le colonne che il blocco aggiunge da sé —
   * selezione, espansione, maniglia di riga — restano sempre prime. Durante il
   * trascinamento si sposta l'intestazione, e il corpo segue al rilascio.
   * L'ordine non si conserva da un caricamento all'altro.
   */
  colonneRiordinabili?: boolean
  // Riordino manuale via trascinamento (`@dnd-kit/*`): aggiunge a ogni riga una maniglia (`⠿`) trascinabile da
  // mouse **e** da tastiera (Spazio per afferrare, frecce su/giù per
  // spostare, Spazio per rilasciare, Escape per annullare — `KeyboardSensor`
  // di dnd-kit, non farina di questo sacco).
  //
  // **Disabilita esplicitamente ordinamento e ricerca/filtri mentre è
  // attivo** — non un avviso, una conseguenza del prop: `enableSorting`/`enableColumnFilters`/
  // `enableGlobalFilter` vanno a `false` sulla tabella, la casella di
  // ricerca sparisce (`cerca` viene ignorato). La ragione non è di comodo:
  // il trascinamento calcola l'indice di partenza e d'arrivo dall'ordine
  // **visibile** delle righe (`tabella.getRowModel().rows`) e li applica
  // all'array **grezzo** passato in `dati` — un ordinamento o un filtro
  // attivi farebbero divergere i due, e la riga rilasciata finirebbe in un
  // punto diverso dall'array vero. Per lo stesso motivo forza tutte le righe
  // filtrate in una sola pagina (`perPagina`/`"infinito"`/`"virtuale"` non
  // si combinano: si vede tutto l'elenco, o l'indice visibile e quello reale
  // divergono altrettanto). **Non si combina** con le righe annidate
  // (`getSottoRighe`) né col pannello di dettaglio (`pannelloRiga`) — il
  // caso reale (un elenco piatto da riordinare a mano) non li richiede
  // insieme, e comporli avrebbe voluto dire ricalcolare l'indice sull'albero
  // invece che sull'array piatto.
  //
  // `onRiordina` riceve il `dati` intero nel nuovo ordine — lo stesso
  // principio di `barra`/`onTabellaPronta`: lo stato dei dati resta della
  // pagina, il blocco non lo tiene mai per sé.
  /**
   * Righe che si riordinano a mano, trascinandole per la maniglia (`⠿`), col
   * mouse o da tastiera: `Spazio` afferra, le frecce spostano, `Spazio`
   * rilascia, `Esc` annulla.
   *
   * Mentre è attivo, ordinamento, ricerca e filtri si spengono, e tutte le
   * righe stanno in una pagina sola: l'ordine che si vede deve essere quello
   * di `dati`. Non si combina con `getSottoRighe` né con `pannelloRiga`.
   * `onRiordina` riceve `dati` intero nel nuovo ordine: i dati restano della
   * pagina.
   */
  riordinabile?: {
    onRiordina: (dati: TDato[]) => void
  }
  // Righe annidate: dato un dato di riga, restituisce le
  // sue righe figlie, o `undefined`/`[]` per una riga senza figli. **Struttura
  // vera nel modello dati** — il caso reale è il "Computo metrico" di Studio,
  // dove ogni voce porta già le proprie righe di misurazione — e non
  // raggruppamento: non c'è `columnGroupingFeature` fra le `caratteristiche`,
  // di proposito.
  //
  // Da solo abilita **espandi/collassa e selezione a cascata**: entrambi sono
  // meccanica di TanStack (`rowExpandingFeature`/`rowSelectionFeature`,
  // sempre registrate) che resta inerte finché nessuna riga ha `subRows`. Non
  // disegna da sé il rientro e lo `chevron` — quello è `CellaAlbero`, da
  // comporre nella colonna che identifica la riga — e non calcola nessun
  // subtotale: quello è `meta.sottototale` su una colonna (v. `MetaColonna`).
  //
  // Passata a TanStack come `getSubRows`: la firma è la stessa, il nome è
  // tradotto perché è l'unica opzione di questa natura che il blocco espone —
  // a differenza delle colonne, dove restare fedeli ai nomi di TanStack tiene
  // valida la loro documentazione.
  /**
   * Righe annidate: dato un record, restituisce i suoi figli, o `undefined`
   * per un record senza. È struttura vera dei dati — le misurazioni di una
   * voce di computo —, non un raggruppamento. Abilita da solo espandi,
   * comprimi e la selezione a cascata; il rientro e il chevron li disegna
   * `CellaAlbero` nella colonna che identifica la riga, i subtotali
   * `meta.sottototale`.
   */
  getSottoRighe?: (riga: TDato) => readonly TDato[] | undefined
  // Il pannello di dettaglio di una riga (come in niko-table): contenuto **libero**, a differenza del
  // subtotale di `meta.sottototale`, che è sempre un numero formattato.
  // Restituire `null`/`undefined` per una riga toglie il chevron da quella
  // riga — non ogni riga deve avere per forza un dettaglio.
  //
  // Aggiunge da sé una colonna col chevron (`colonnaEspansione`), come
  // `selezione` aggiunge la propria: la pagina non la scrive. **Non è
  // `getSottoRighe`**: quello innesta righe vere nel modello dati (l'albero,
  // il "Computo" con le sue misurazioni); questo apre una riga
  // in più, sempre fratella mai figlia, con qualunque markup la pagina
  // voglia — la scheda di un cliente sotto la sua riga d'elenco, non un
  // altro giro di celle della stessa tabella.
  //
  // La riga di dettaglio prende tutta la larghezza (`colSpan`) ed esce dalla
  // paginazione/dallo scorrimento infinito come farebbe qualunque riga in
  // più: apre e chiude, non pagina a parte.
  /**
   * Il pannello di dettaglio di una riga: contenuto libero, sotto la riga, su
   * tutta la larghezza. Il blocco aggiunge da sé la colonna del chevron;
   * `null` per una riga senza dettaglio toglie il chevron da quella riga.
   * Non è `getSottoRighe`: quello aggiunge righe vere della tabella, questo
   * una riga di contenuto qualunque. Non si combina con
   * `perPagina="virtuale"`.
   */
  pannelloRiga?: (riga: TDato) => React.ReactNode
  // La coppia valore/`on…Change` delle righe aperte, come `aperto`/
  // `onApertoChange` di `confirm-dialog`. Senza la coppia lo stato resta del
  // blocco. Un cambio di `dati` fa ripartire il modello di righe di TanStack,
  // che di suo richiude tutte le righe aperte: qui succede solo quando le
  // righe non hanno un'identità stabile, cioè senza `idRiga` e senza la
  // coppia — l'id di riga è allora l'indice nell'array, e dopo un caricamento
  // la stessa posizione può essere un altro record.
  /**
   * Le righe aperte, dell'albero di `getSottoRighe` o del dettaglio di
   * `pannelloRiga`: `true` per tutte, oppure `{ [id della riga]: true }`.
   * Insieme a `onRigheEspanseChange` lo stato è della pagina, e un cambio di
   * `dati` non richiude niente. Senza, lo tiene il blocco: le righe restano
   * aperte fra un caricamento e l'altro se c'è `idRiga`, altrimenti si
   * richiudono a ogni cambio di `dati`.
   */
  righeEspanse?: ExpandedState
  /** Riceve le righe aperte a ogni apertura o chiusura. Vedi `righeEspanse`. */
  onRigheEspanseChange?: (righeEspanse: ExpandedState) => void
  // Il menu di riga condiviso:
  // `menu` sono le voci — scritte una sola volta con `RowMenuItem`/
  // `RowMenuSeparator`/`RowMenuSub`, che leggono la riga da
  // `useDataTableRow<TDato>()` — e si montano **sia** nella tendina «⋯» che
  // il blocco aggiunge da sé in coda alle colonne (`colonnaAzioniRiga`,
  // come `selezione`/`pannelloRiga` aggiungono la propria), **sia** nel
  // tasto destro sull'intera riga.
  //
  // `enabledFor` esclude una riga da **entrambe** le vie insieme — bloccata,
  // di sola lettura — con la stessa domanda: non due controlli scritti a
  // mano che potrebbero disallinearsi.
  //
  // **Il tasto destro non compone con `perPagina="virtuale"`**: la tendina
  // resta (è una cella come le altre, `DataTableVirtualizedBody` la rende
  // comunque), ma nessuna `<tr>` virtualizzata è avvolta in un
  // `<ContextMenu>` — lo stesso limite di `pannelloRiga` con la
  // virtualizzazione, per la stessa ragione: right-click resta
  // comunque una scorciatoia, mai l'unica via (v. `context-menu.stories.tsx`).
  /**
   * Il menu di riga, scritto una volta e raggiungibile in due modi: dalla
   * tendina «⋯» che il blocco aggiunge in coda alle colonne, e col tasto
   * destro sulla riga. Le voci si scrivono con `RowMenuItem`,
   * `RowMenuSeparator` e `RowMenuSub`, e leggono la riga con
   * `useDataTableRow<TDato>()`. `enabledFor` esclude una riga da tutte e due
   * le vie. Con `perPagina="virtuale"` resta la sola tendina.
   */
  menuRiga?: {
    menu: React.ReactNode
    enabledFor?: (riga: TDato) => boolean
    ariaLabel?: (riga: TDato) => string
  }
  // L'editing in-riga leggero: la via
  // d'uscita per lasciare che una pagina renda editabile un campo alla volta
  // senza pagare il costo della Data Grid (clipboard/fill/annulla-
  // ripeti) né aprire una scheda — il caso reale è una `pagina-lista` di
  // Anagrafe, non il "Computo" (che quei tre non li può fare a meno).
  //
  // **Non è un prop che accende l'editing**: quello resta lavoro della
  // pagina — colonne che, quando `riga.original` è quella in modifica,
  // rendono un `Input` invece del valore, con `onKeyDown` che salva su
  // `Invio` e annulla su `Esc` (v. la story `Editing In Riga`). Questo prop
  // è solo la **chiave di memoizzazione**: `<DataTable>` avvolge ogni riga
  // in `React.memo`, e lo stato di editing (`editingId`/`draft`/`errors`)
  // vive fuori da `dati` — mai un `isEditing` dentro la riga, che
  // sostituendo l'array farebbe ricalcolare **tutta** la tabella a ogni
  // tasto. Senza una chiave che lo dica, la riga memoizzata non lo saprebbe:
  // `chiaveMemoRiga` incolla quello stato esterno in una stringa per riga
  // (`` `${draft.nome}|${errori.nome ?? ""}` ``, tipicamente) — cambia solo
  // per la riga in modifica, e solo quella si ricalcola a ogni tasto. Torna
  // `""` (o qualunque stringa costante) per una riga che non c'entra: nessun
  // cambio, nessun render.
  //
  // **Senza questo prop, niente cambia**: il comparatore di memoizzazione
  // — senza una chiave torna sempre "diverse", cioè il comportamento di
  // sempre, un `<tr>` ricalcolato a ogni giro.
  //
  // **Non compone con `perPagina="virtuale"`**: la finestra montata dal
  // virtualizzatore ricalcola già ogni riga a ogni scorrimento
  // per misurarne l'altezza vera (`measureElement`), e il fuoco/tastiera di
  // `DataTableVirtualizedBody` sono chiusure nuove a ogni render — comporre
  // la memoizzazione lì avrebbe voluto dire riscrivere anche quella parte,
  // senza un caso reale che lo richieda (nessuna pagina edita un campo su
  // 10.000 righe virtualizzate). Scarto annotato, come `pannelloRiga` con la
  // stessa `perPagina="virtuale"`.
  /**
   * La chiave di memoizzazione per modificare un campo alla volta dentro la
   * riga. Le righe sono memoizzate, e lo stato della modifica sta fuori da
   * `dati`: questa funzione lo riduce a una stringa per riga — per esempio
   * `${bozza.nome}|${errori.nome ?? ""}` —, così a ogni tasto si ricalcola
   * solo la riga in modifica. Per le altre righe torna una stringa fissa.
   * L'editing lo scrivono le colonne della pagina; vedi la scena «Editing In
   * Riga». Non si combina con `perPagina="virtuale"`.
   */
  chiaveMemoRiga?: (riga: TDato) => string
  // Cosa mettere sotto la ricerca, in una riga propria: i filtri della
  // pagina, le azioni di massa. Non condivide la riga con la ricerca/il menu
  // Colonne — a differenza loro non va a capo da sé quando lo spazio manca
  // (col ritorno a capo automatico un filtro sfaccettato si spezzerebbe a
  // metà altezza fra le due righe).
  //
  // **Nella forma a funzione riceve le righe selezionate**, ed è la sola via
  // per cui la selezione esce dalla tabella. Non c'è una `onSelezione`, e la
  // mancanza è voluta: un `onSelezione` si notifica per forza da un
  // `useEffect`, le cui dipendenze oneste sarebbero le righe scelte — un array
  // nuovo a ogni render — e la funzione della pagina, quasi sempre scritta
  // inline. L'effetto riparte, chiama `setState` nella pagina, il render
  // riparte, e React **non interrompe il ciclo e non stampa niente**. Con la
  // funzione non c'è nessun effetto: è una chiamata in fase di render, pura, e
  // le azioni di massa stanno dove servono davvero, cioè nella barra.
  //
  // **Riceve anche l'istanza TanStack, come secondo argomento** (per i
  // filtri di `data-table-filtro-*.tsx`): è la via giusta per
  // comporre un componente reattivo allo stato dei filtri dentro `barra`,
  // **non** `tabellaRef`/`onTabellaPronta` — quella coppia consegna
  // l'istanza dopo il commit, in un `useEffect` senza dipendenze, apposta
  // per comandi imperativi one-off (`tabellaRef.current?.toggleAll
  // RowsExpanded()` in un `onClick`, mai per il render). Usarla per il
  // render di `barra` costava un giro intero indietro — un `<FiltroSfaccettato>`
  // dentro `barra={() => <X tabella={tabellaRef.current} />}` mostrava
  // sempre lo stato del render *precedente*, e in un caso preso qui (`Reset`
  // di `data-table-filtro-reset.tsx`, invisibile finché non arrivava
  // un'interazione qualunque successiva) il ritardo si vedeva a occhio.
  // `barra(scelti, tabella)` passa invece l'istanza della **stessa passata
  // di render**, senza indirizzo indiretto: zero ritardo, per costruzione.
  /**
   * Una riga sotto la ricerca, per i filtri della pagina e le azioni sulle
   * righe scelte. Come funzione riceve le righe selezionate e l'istanza della
   * tabella, `barra(scelti, tabella)`: è la via per le azioni di massa e per
   * i filtri di `tassullo-data-table-filtro-*`. Non c'è una `onSelezione`: la
   * selezione si usa qui dentro.
   */
  barra?:
    | React.ReactNode
    | ((scelti: TDato[], tabella: IstanzaTabella<TDato>) => React.ReactNode)
  className?: string
  // Consegna l'istanza TanStack viva a ogni render — la via d'uscita per un
  // comando che questo blocco non traduce in un prop suo (`table.toggle
  // AllRowsExpanded()`, per dire): non tutto ciò che TanStack sa fare
  // merita un prop tradotto apposta, specie un comando usato una volta
  // sola in una story. Non è uno stato che diventa controllato — resta
  // interno al blocco, come sempre — è solo un modo per **comandarlo**
  // da fuori senza doverlo duplicare. Stesso principio delle `registra*`
  // di `<DataGrid>` (`data-grid.tsx`): si registra una funzione,
  // non si solleva uno stato.
  /**
   * Consegna l'istanza della tabella, per un comando da dare dall'esterno —
   * per esempio `tabella.toggleAllRowsExpanded()` in un `onClick`. Non serve
   * per rendere qualcosa: per quello c'è `barra`.
   */
  onTabellaPronta?: (tabella: IstanzaTabella<TDato>) => void
  // @internal Wiring privata per `<DataGrid>`, non pensata per
  // essere passata da una pagina. Con `perPagina="virtuale"`, consegna a
  // `DataTableVirtualizedBody` il controllo del fuoco — la Data Grid lo
  // sposta lei, cella per cella, non riga per riga — e l'accesso allo
  // scorrimento verticale del virtualizzatore.
  /**
   * @internal Per `<DataGrid>`, non per le pagine: con
   * `perPagina="virtuale"` le lascia il fuoco e lo scorrimento del corpo.
   */
  internoGriglia?: {
    senzaFocoRiga: boolean
    alVirtualizzatore: (vaiA: (indice: number) => void) => void
  }
  /**
   * @internal Attributi passati al `<table>` così com'è (`role`,
   * `aria-*`, …). Serve a `<DataGrid>` per dichiarare `role="grid"` senza
   * che questo blocco debba conoscere quella semantica: nessuna tabella
   * non-Data-Grid ne ha bisogno, quindi non è nella parte pubblica della
   * documentazione del prop.
   */
  attributiTabella?: React.ComponentPropsWithoutRef<typeof Table>
}

/**
 * ```tsx
 * const col = creaColonne<Prodotto>()
 * const COLONNE = col.columns([
 *   colonnaSelezione<Prodotto>(),
 *   col.accessor("codice", {
 *     header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Codice" />,
 *     meta: { titolo: "Codice" },
 *     sortFn: "alphanumeric",
 *   }),
 * ])
 *
 * <DataTable colonne={COLONNE} dati={prodotti} cerca="Cerca un prodotto…" selezione />
 * ```
 */
export function DataTable<TDato extends RowData>({
  colonne,
  dati,
  idRiga,
  cerca = "Cerca…",
  vuoto = { titolo: "Non c'è ancora niente" },
  nomeRighe = { singolare: "riga", plurale: "righe" },
  perPagina = 25,
  altezza = "naturale",
  piePagina = true,
  piede = false,
  bordiColonna = false,
  selezione = false,
  colonneNascondibili = true,
  bloccaPrimaColonna = false,
  ridimensionabile = false,
  colonneBloccabili = false,
  colonneRiordinabili = false,
  riordinabile,
  getSottoRighe,
  pannelloRiga,
  righeEspanse,
  onRigheEspanseChange,
  menuRiga,
  chiaveMemoRiga,
  barra,
  className,
  onTabellaPronta,
  internoGriglia,
  attributiTabella,
}: DataTableProps<TDato>) {
  const trascinamento = !!riordinabile
  // Alias semplici, non composti: TypeScript restringe il tipo letterale di
  // `perPagina` da un confronto diretto come questo (le "aliased conditions"
  // di TS 4.4+), non da un `&&` in più — `infinito`/`virtualizzata` sotto,
  // che il riordino deve spegnere, non possono quindi essere la stessa
  // espressione usata più sotto per scegliere `pageSize`.
  const perPaginaInfinito = perPagina === "infinito"
  const perPaginaVirtuale = perPagina === "virtuale"
  // `"virtuale"` non si combina col riordino (v. il prop): monta una
  // finestra di righe, non l'elenco intero — l'indice visibile e quello
  // grezzo divergerebbero appena si scorre. Ricade su `"naturale"`.
  const infinito = perPaginaInfinito && !trascinamento
  const virtualizzata = perPaginaVirtuale && !trascinamento
  const fermo = altezza === "ferma"
  // `colonneBloccabili` implica `ridimensionabile`: lo scarto sticky del pin
  // generalizzato si calcola dalle larghezze acquisite (v. `MetaColonna`,
  // sopra), che senza il `<colgroup>` di `ridimensionabile` non esistono.
  const conDimensioni = ridimensionabile || colonneBloccabili
  // `colonneBloccabili` sostituisce `bloccaPrimaColonna`, non lo somma: i due
  // meccanismi disegnano lo sticky in due modi incompatibili (v. il prop).
  const bloccoLegacy = bloccaPrimaColonna && !colonneBloccabili
  const [ordinamento, setOrdinamento] = React.useState<SortingState>([])
  const [filtri, setFiltri] = React.useState<ColumnFiltersState>([])
  const [ricerca, setRicerca] = React.useState("")
  const [visibilita, setVisibilita] = React.useState<ColumnVisibilityState>({})
  const [scelte, setScelte] = React.useState({})
  /**
   * Le larghezze **acquisite** dall'utente (`ridimensionabile`/
   * `colonneBloccabili`). Resta uno stato interno — non una prop controllata
   * — perché nessuna pagina oggi salva un ridimensionamento fra un
   * caricamento e l'altro: è il limite scritto sul prop `ridimensionabile`,
   * non un'omissione silenziosa.
   */
  const [dimensioni, setDimensioni] = React.useState<ColumnSizingState>({})
  /** Il pin generalizzato (`colonneBloccabili`): quali colonne, e da che lato. */
  const [ancoraggio, setAncoraggio] = React.useState<ColumnPinningState>({
    start: [],
    end: [],
  })
  /**
   * L'ordine acquisito delle colonne (`colonneRiordinabili`).
   * `[]` di partenza: non un ordine "nessuno", è l'array vuoto che per
   * TanStack **significa** "usa l'ordine di dichiarazione" — lo stesso
   * predefinito che questa tabella aveva già prima che il prop esistesse
   * (`columnOrderingFeature` è registrata sempre, v. `caratteristiche`).
   */
  const [ordineColonne, setOrdineColonne] = React.useState<ColumnOrderState>([])
  /**
   * Le righe aperte. Della pagina quando passa `righeEspanse`, altrimenti di
   * questo stato. La pagina riceve ogni cambio in `onRigheEspanseChange` in
   * tutti e due i casi.
   */
  const [espanseInterne, setEspanseInterne] = React.useState<ExpandedState>({})
  const espanseControllate = righeEspanse !== undefined
  const espanse = espanseControllate ? righeEspanse : espanseInterne

  /**
   * Quante righe sono caricate. Solo `perPagina="infinito"`: cresce di
   * `PASSO_INFINITO` alla volta, quando la sentinella in fondo alla tabella
   * entra nel contenitore che scorre (v. l'effetto più sotto).
   */
  const [caricate, setCaricate] = React.useState(PASSO_INFINITO)

  /**
   * La colonna delle caselle si aggiunge qui e non la scrive la pagina: è
   * sempre la stessa, sempre per prima, e una pagina che se la scrivesse
   * sarebbe una pagina che *può* scriversela diversa.
   *
   * Il `useMemo` non è ottimizzazione: `colonne` che cambia identità a ogni
   * render farebbe ricostruire la tabella e perdere ordinamento e pagina.
   */
  const colonneEffettive = React.useMemo(() => {
    let risultato = colonne
    if (pannelloRiga) risultato = [colonnaEspansione<TDato>(), ...risultato]
    if (selezione) risultato = [colonnaSelezione<TDato>(), ...risultato]
    // La maniglia va per prima di tutte, davanti anche alla selezione: è il
    // primo gesto possibile su una riga quando si sta riordinando.
    if (trascinamento) risultato = [colonnaRiordino<TDato>(), ...risultato]
    // La tendina «⋯» va in coda, non in testa come le altre: è un'azione,
    // non un modo di leggere la riga.
    if (menuRiga) risultato = [...risultato, colonnaAzioniRiga<TDato>(menuRiga)]
    return risultato
  }, [colonne, selezione, pannelloRiga, trascinamento, menuRiga])

  const tabella = useTable({
    features: caratteristiche,
    data: dati,
    columns: colonneEffettive,
    globalFilterFn: "includesString",
    // Senza `idRiga` resta `undefined`: TanStack ricade sul proprio
    // predefinito, l'indice nell'array (v. il prop).
    getRowId: idRiga ? (riga) => idRiga(riga) : undefined,
    // Le righe aperte non si richiudono a un cambio di `dati` quando le righe
    // hanno un'identità stabile (v. `righeEspanse`). Con la coppia controllata
    // è anche l'unico modo giusto: la richiusura automatica passa da
    // `onExpandedChange`, e svuoterebbe lo stato della pagina.
    autoResetExpanded: !(espanseControllate || idRiga),
    onExpandedChange: (aggiorna) => {
      const nuove = typeof aggiorna === "function" ? aggiorna(espanse) : aggiorna
      if (!espanseControllate) setEspanseInterne(nuove)
      onRigheEspanseChange?.(nuove)
    },
    getSubRows: getSottoRighe ? (riga) => getSottoRighe(riga) : undefined,
    // Senza `pannelloRiga` resta `undefined`: `getCanExpand()` ricade sul
    // predefinito di TanStack (righe con `subRows`, l'albero).
    getRowCanExpand: pannelloRiga
      ? (riga) => pannelloRiga(riga.original) != null
      : undefined,
    onSortingChange: setOrdinamento,
    onColumnFiltersChange: setFiltri,
    onGlobalFilterChange: setRicerca,
    onColumnVisibilityChange: setVisibilita,
    onRowSelectionChange: setScelte,
    // `columnResizeMode: "onChange"`: la larghezza si aggiorna mentre si
    // trascina, non solo al rilascio — è il riscontro che rende il
    // trascinamento leggibile come tale, non un motivo di prestazioni (500
    // righe, nessun ricalcolo pesante per colonna).
    columnResizeMode: "onChange",
    enableColumnResizing: ridimensionabile,
    enableColumnPinning: colonneBloccabili,
    onColumnSizingChange: setDimensioni,
    onColumnPinningChange: setAncoraggio,
    onColumnOrderChange: setOrdineColonne,
    // `riordinabile`: spente **sulla tabella**, non solo nascoste
    // in chrome — l'ordine visibile deve coincidere con `dati` grezzo perché
    // il trascinamento mappi l'indice giusto (v. il prop).
    enableSorting: !trascinamento,
    enableColumnFilters: !trascinamento,
    enableGlobalFilter: !trascinamento,
    initialState: {
      pagination: {
        pageIndex: 0,
        // `"virtuale"` non pagina affatto: tutte le righe filtrate entrano nel
        // modello, ed è `DataTableVirtualizedBody` a decidere quali montare
        // davvero. `Number.MAX_SAFE_INTEGER` invece di ricalcolare la
        // dimensione della pagina a ogni filtro (come fa `caricate` per
        // `"infinito"`): il modello di paginazione si limita comunque al
        // numero di righe vere, una pagina più grande del possibile non
        // cambia il risultato. `trascinamento` vuole la stessa cosa, per lo
        // stesso motivo: una pagina sola non coprirebbe l'indice reale.
        pageSize: trascinamento
          ? Number.MAX_SAFE_INTEGER
          : perPaginaInfinito
            ? caricate
            : perPaginaVirtuale
              ? Number.MAX_SAFE_INTEGER
              : perPagina,
      },
    },
    state: {
      sorting: ordinamento,
      columnFilters: filtri,
      globalFilter: ricerca,
      columnVisibility: visibilita,
      rowSelection: scelte,
      columnSizing: dimensioni,
      columnPinning: ancoraggio,
      columnOrder: ordineColonne,
      expanded: espanse,
    },
  })

  // Nessun elenco di dipendenze: `tabella` è un oggetto nuovo a ogni
  // render (come `motore` in `<DataGrid>`), quindi non c'è una dipendenza
  // primitiva su cui fermarsi — deve girare a ogni render per non
  // consegnare mai un'istanza indietro di un commit.
  React.useEffect(() => {
    onTabellaPronta?.(tabella)
  })

  /**
   * Le righe scelte, per la barra. È un calcolo in fase di render e non un
   * effetto: vedi la nota su `barra` fra le props.
   */
  const scelti =
    typeof barra === "function"
      ? tabella.getFilteredSelectedRowModel().rows.map((r) => r.original)
      : []

  const righe = tabella.getRowModel().rows
  const conRighe = righe.length > 0
  const conFiltri = ricerca.length > 0 || filtri.length > 0
  const colonneVisibili = tabella.getVisibleFlatColumns().length

  /**
   * L'ordine di intestazioni e celle. **Nessuna caratteristica di
   * raggruppamento è registrata** (`caratteristiche`, sopra), quindi
   * `getHeaderGroups()` torna sempre un gruppo solo — le stesse colonne di
   * `getFlatHeaders()`/`getLeafHeaders()` — e le due liste sono
   * intercambiabili qui.
   *
   * **Con `colonneBloccabili` l'ordine cambia**: le colonne bloccate a
   * sinistra e a destra si spostano ai due bordi (`getStart…`/`getEnd…`),
   * qualunque posizione avessero fra le colonne dichiarate — è il modo con
   * cui TanStack tiene coerenti lo sticky e il `<colgroup>` sotto: un `<col>`
   * fuori ordine rispetto al `<th>`/`<td>` che descrive darebbe alla colonna
   * sbagliata la larghezza di un'altra.
   */
  const intestazioni = colonneBloccabili
    ? [
        ...tabella.getStartLeafHeaders(),
        ...tabella.getCenterLeafHeaders(),
        ...tabella.getEndLeafHeaders(),
      ]
    : (tabella.getHeaderGroups()[0]?.headers ?? [])

  /**
   * Le celle del piede, con le **fusioni**. Preso guardando la pagina e non
   * una misura: l'etichetta che dice *di cosa* è il totale finisce quasi
   * sempre nella prima colonna, e la prima colonna è quasi sempre la più
   * stretta — un codice, una casella. Con `table-fixed` e `truncate` il
   * risultato è «Totale — 1…», cioè la sola cella del piede che non è un
   * numero resa illeggibile. Nessun gate lo vede: il conto delle celle torna,
   * axe non ha niente da dire, e la stringa nel DOM è intera.
   *
   * La regola, e non ha bisogno di una prop: **una cella del piede si prende
   * lo spazio delle colonne che seguono e che una cella non ce l'hanno**,
   * fino alla prossima che ce l'ha. Se ogni colonna dichiara la sua, non si
   * fonde niente e il piede è colonna per colonna come l'intestazione; se il
   * piede è «un'etichetta e due numeri in fondo» — che è il caso normale —
   * l'etichetta si stende e i numeri restano sotto la loro colonna.
   *
   * **Le colonne bloccate non si assorbono.** Una cella bloccata porta uno
   * scarto dal bordo calcolato sulla propria larghezza (`ancoraggioColonna`,
   * `classiBloccate`): fusa con la vicina, quello scarto descriverebbe una
   * cella che non esiste più e il piede scivolerebbe rispetto alla testata.
   * Si fonde solo fra colonne con lo **stesso** stato di blocco, e mai dentro
   * le prime due di `bloccaPrimaColonna`.
   */
  const cellePiede = (() => {
    const dichiara = (h: (typeof intestazioni)[number]) =>
      (h.column.columnDef.meta as MetaColonna<TDato> | undefined)?.piede != null
    const bloccoDi = (h: (typeof intestazioni)[number], i: number) =>
      bloccoLegacy
        ? classiBloccate(i, selezione) ?? "libera"
        : String(h.column.getIsPinned() ?? "")
    const fuori: { intestazione: (typeof intestazioni)[number]; indice: number; colSpan: number }[] = []
    let i = 0
    while (i < intestazioni.length) {
      let colSpan = 1
      if (dichiara(intestazioni[i])) {
        while (
          i + colSpan < intestazioni.length &&
          !dichiara(intestazioni[i + colSpan]) &&
          bloccoDi(intestazioni[i + colSpan], i + colSpan) === bloccoDi(intestazioni[i], i)
        ) {
          colSpan++
        }
      }
      fuori.push({ intestazione: intestazioni[i], indice: i, colSpan })
      i += colSpan
    }
    return fuori
    /*
     * **Calcolato a ogni render, non memoizzato**, ed è una scelta. Le
     * dipendenze vere sono quattro e due non sono valori: l'ordine delle
     * colonne, quali dichiarano `meta.piede`, e soprattutto **quali sono
     * bloccate in questo momento** — `column.getIsPinned()`, che cambia
     * cliccando una voce di menu e non compare in nessuna prop. Una lista di
     * dipendenze che non la contenga produrrebbe un piede fuso con l'ordine
     * di prima: non un errore, una riga *sbagliata*. Il giro è su una decina
     * di colonne e non tocca le righe, quindi non c'è niente da risparmiare.
     */
  })()

  const pulisci = () => {
    setRicerca("")
    setFiltri([])
  }

  // `setPageSize` e non `initialState`: `initialState` conta solo al
  // montaggio, e `caricate` cambia dopo — a ogni passo dello scorrimento.
  React.useEffect(() => {
    if (infinito) tabella.setPageSize(caricate)
  }, [infinito, caricate, tabella])

  /**
   * Una ricerca o un filtro cambiano **l'insieme**, non solo l'ordine: senza
   * azzerare `caricate`, un filtro che lascia poche righe erediterebbe il
   * conto di un elenco molto più lungo, e tutte le righe rimaste
   * comparirebbero insieme invece che a passi di `PASSO_INFINITO`.
   *
   * **Aggiustato in fase di render, non in un `useEffect`**: è il pattern che
   * React stesso documenta per "resettare uno stato quando cambia un altro
   * valore" — un confronto con l'ultimo valore visto, e se è cambiato si
   * chiama `setState` **durante il render**, prima del commit, così non c'è
   * un giro di rendering in più né un effetto che tocca sempre `setState`.
   * `filtri` è un array nuovo a ogni render, e un confronto diretto
   * scatterebbe sempre — la chiave lo appiattisce in una stringa,
   * l'unica cosa confrontabile con `===`.
   */
  const chiaveFiltro = `${ricerca}|${filtri.map((f) => `${f.id}:${String(f.value)}`).join(",")}`
  const [chiaveFiltroVista, setChiaveFiltroVista] = React.useState(chiaveFiltro)
  if (infinito && chiaveFiltro !== chiaveFiltroVista) {
    setChiaveFiltroVista(chiaveFiltro)
    setCaricate(PASSO_INFINITO)
  }

  const contenitoreRef = React.useRef<HTMLDivElement>(null)
  const sentinellaRef = React.useRef<HTMLTableRowElement>(null)

  /**
   * L'elemento che scorre davvero (`perPagina="virtuale"`), passato al
   * virtualizzatore in `DataTableVirtualizedBody`: `[data-slot="table-
   * container"]`, lo stesso `<div overflow-x-auto>` di `ui/table.tsx` che
   * l'osservatore di `"infinito"` già cerca qui sotto, e per la stessa
   * ragione (v. quell'effetto). Uno stato, non un `ref` in più: il nodo non
   * esiste ancora al primo render, e il virtualizzatore lo vuole per
   * calcolare la finestra visibile.
   */
  const [elementoScorrevole, setElementoScorrevole] = React.useState<HTMLElement | null>(
    null
  )
  React.useEffect(() => {
    if (!virtualizzata) return
    setElementoScorrevole(
      contenitoreRef.current?.querySelector<HTMLElement>('[data-slot="table-container"]') ??
        null
    )
  }, [virtualizzata])

  /**
   * Il totale delle righe filtrate e ordinate — non solo quelle già
   * caricate. Sta in una `ref` e non in una dipendenza dell'effetto qui
   * sotto: cambia a ogni render (filtro, ordinamento) e l'effetto non deve
   * ripartire per questo, solo l'osservatore deve vedere il valore fresco
   * quando la sentinella entra in vista. Si aggiorna in un effetto **senza
   * dipendenze** — gira a ogni commit — e non durante il render: mutare una
   * `ref` mentre si rende è il genere di cosa che una doppia invocazione di
   * `StrictMode` rende visibile nel modo sbagliato.
   */
  const totaleRef = React.useRef(0)
  const righeFiltrate = tabella.getFilteredRowModel().rows
  const totaleFiltrate = righeFiltrate.length
  React.useEffect(() => {
    totaleRef.current = totaleFiltrate
  })

  /**
   * I dati che il piede somma (`piede`, v. la prop). Sono **le stesse righe
   * che `totaleFiltrate` conta** — non un secondo calcolo che potrebbe
   * divergerne: il numero in fondo alla tabella e il numero nella fascia di
   * paginazione devono dire la stessa cosa, o uno dei due mente.
   *
   * `getFilteredRowModel()` è memoizzato da TanStack e restituisce lo stesso
   * array finché dati, ricerca e filtri non cambiano, quindi il `.map()` non
   * ricomincia a ogni render: su una tabella virtualizzata da 5000 righe
   * sarebbe un giro completo dell'elenco per ogni fotogramma di
   * scorrimento. La dipendenza è il riferimento all'array, non un `.map()`
   * scritto inline, che sarebbe un array nuovo a ogni render.
   */
  const datiPiede = React.useMemo(
    () => (piede ? righeFiltrate.map((riga) => riga.original) : []),
    [piede, righeFiltrate]
  )

  /**
   * **Lo scorrimento infinito di `anagrafe.tassullo.it`, con la testata
   * ferma.** La produzione lo ha già, e funziona; il solo difetto — la
   * testata scorre via con la pagina, e si perde il nome delle colonne — è
   * un problema di **dove** scorre la pagina, non del meccanismo. Qui a
   * scorrere non è il documento: è `[data-slot="table-container"]`, il `<div
   * overflow-x-auto>` che `Table` (`ui/table.tsx`) già disegna attorno a ogni
   * tabella.
   *
   * **Non il riquadro bordato qui sotto** (`overflow-y-auto`), anche se è lì
   * che sembra scorrere. La CSS ha una regola poco nota (CSS Overflow
   * Module): un asse impostato e l'altro lasciato `visible` fa **calcolare
   * l'altro come `auto`** — quindi `overflow-x-auto` di `table-container`
   * porta con sé, gratis, un `overflow-y: auto` che nessuna classe dichiara.
   * Dentro un riquadro ad altezza ferma, è `table-container` — non il
   * riquadro — a restringersi e a prendersi lo scorrimento verticale vero: è
   * per questo che la testata `sticky top-0` sta ferma **senza** che il
   * riquadro debba scorrere lui, ed è per questo che l'osservatore guarda
   * `table-container`, preso col suo `data-slot` — lo stesso modo in cui
   * `page-header.tsx` trova la propria ancora — e non il riquadro attorno.
   *
   * La sentinella è l'ultima riga del corpo, vuota; quando entra in vista, si
   * caricano altre `PASSO_INFINITO` righe.
   *
   * **Si ricrea l'osservatore a ogni `caricate`**, e non è ridondanza: un
   * `IntersectionObserver` invoca il proprio callback una volta subito dopo
   * `observe()`, con lo stato attuale. Se l'elenco è più corto del
   * contenitore la sentinella resta visibile anche dopo aver caricato un
   * passo, e senza ricrearsi l'osservatore non se ne accorgerebbe mai —
   * ricreandosi, il callback riparte da solo finché la sentinella esce
   * davvero dalla vista o le righe finiscono. È il modo in cui un elenco
   * corto si riempie da sé, senza un caso a parte da scrivere.
   */
  React.useEffect(() => {
    if (!infinito) return
    const sentinella = sentinellaRef.current
    const radice = contenitoreRef.current?.querySelector<HTMLElement>(
      '[data-slot="table-container"]'
    )
    if (!sentinella || !radice) return

    const oss = new IntersectionObserver(
      (voci) => {
        if (!voci[0]?.isIntersecting) return
        setCaricate((prima) =>
          prima < totaleRef.current ? Math.min(prima + PASSO_INFINITO, totaleRef.current) : prima
        )
      },
      { root: radice, rootMargin: "200px" }
    )
    oss.observe(sentinella)
    return () => oss.disconnect()
  }, [infinito, caricate])

  const testataRef = React.useRef<HTMLTableSectionElement>(null)
  const [altezzaMax, setAltezzaMax] = React.useState<number | undefined>(undefined)
  /**
   * L'altezza dell'intestazione ferma, che diventa lo `scroll-padding-top` di
   * `table-container`. Le righe sono `snap-start`, e senza questo margine lo
   * snap le agganciava al bordo alto del riquadro, cioè **sotto** l'intestazione:
   * all'apertura il browser portava da sé la prima riga lì, e la tabella
   * partiva già scorsa di un'intestazione, con la prima riga nascosta. Col
   * margine la prima riga si aggancia a scorrimento zero, e ogni riga
   * agganciata cade subito sotto l'intestazione invece che dietro.
   */
  const [altezzaTestata, setAltezzaTestata] = React.useState<number | undefined>(undefined)
  /**
   * Misura la tabella per intero, per la barra-guida del trascinamento (v.
   * `ManigliaRidimensiona`). `Table` (`ui/table.tsx`) non passa `ref` con
   * `forwardRef`, ma non ne ha bisogno: spande `{...props}` sul `<table>`, e
   * da React 19 un `ref` dentro `props` arriva comunque all'elemento — lo
   * stesso meccanismo per cui `testataRef` qui sopra funziona già su
   * `TableHeader`.
   */
  const tabellaRef = React.useRef<HTMLTableElement>(null)

  const radiceRef = React.useRef<HTMLDivElement>(null)
  const piePaginaRef = React.useRef<HTMLDivElement>(null)

  /**
   * **Il riquadro finisce sempre su un confine di riga.** `flex-shrink`
   * (sopra) dà al riquadro l'altezza disponibile in pixel grezzi — non un
   * multiplo dell'altezza di riga — e senza questo effetto l'ultima striscia
   * mostra il **bordo di una riga in più**, tagliata: la stessa riga a metà
   * di prima, spostata dalla cima al fondo. Il sintomo: dopo l'ultima riga
   * intera si vedeva la barra grigia del suo
   * bordo, poi uno spazio bianco — l'inizio della riga successiva, tagliata
   * — poi il bordo del riquadro.
   *
   * **`max-height`, non `height`.** Un `max-height` non forza nessuna
   * crescita: un elenco più corto del tetto resta a restringersi come già
   * fa `flex-shrink` (v. sopra), invariato — qui si limita solo il caso in
   * cui il riquadro *vorrebbe* essere più alto di un multiplo esatto di riga.
   *
   * **Non si misura il riquadro stesso.**
   * Una prima stesura leggeva `contenitore.getBoundingClientRect().height`:
   * ridimensionare la finestra, o togliere un filtro, non faceva più
   * *crescere* il tetto — un difetto a **cricchetto**. Corretto togliendo il
   * tetto prima di misurare; ma il rimedio manipolava lo `style` dentro lo
   * stesso `ResizeObserver` che osservava **quell'elemento**, e in un
   * ridimensionamento continuo (il trascinamento del bordo della finestra,
   * non lo scatto singolo di un test) la scrittura poteva restare intrappolata
   * nel proprio giro di notifiche — a volte tornava all'altezza piena, a
   * volte no.
   *
   * La misura giusta **non tocca mai l'elemento che sta misurando**: si
   * osserva la **radice** (`radiceRef`, il guscio di tutto il blocco, alto
   * quanto glielo dà il genitore — non cambia mai per colpa nostra) e si
   * calcola quanto spazio resta per il riquadro sottraendo ciò che sta sopra
   * e sotto di lui — la barra di ricerca (la sua posizione, non la sua
   * altezza: `contenitore.getBoundingClientRect().top`, che dipende da cosa
   * viene *prima*, mai dall'altezza del riquadro stesso) e il piede della
   * paginazione (`piePaginaRef`, la sua altezza vera). Nessuno di questi
   * numeri dipende da quanto abbiamo appena scritto in `altezzaMax`: la
   * misura non può più mentire a se stessa, in un ridimensionamento singolo
   * come in uno continuo.
   *
   * **Il tetto è dove finisce davvero l'ultima riga che entra, non
   * `testata + N × riga`.** Moltiplicare un'altezza di riga (sottopixel,
   * `getBoundingClientRect` torna float) per N **amplifica** l'errore invece
   * di limitarlo a uno solo, e arrotondare il risultato per eccesso o per
   * difetto sposta il bordo del riquadro di una frazione di pixel rispetto
   * al bordo vero dell'ultima riga — due righe grigie a un pixel di
   * distanza, non allineate. Nascondere il bordo del riquadro in quel caso
   * era un rattoppo, non una correzione: si vedeva che mancava, non che era
   * allineato. Si scorre l'elenco delle righe **vere già rese** (non la
   * sentinella) e si prende il fondo esatto (`getBoundingClientRect().bottom`)
   * dell'ultima che entra nello spazio disponibile — lo stesso numero che
   * il bordo di quella riga sta già disegnando, non un multiplo ricostruito
   * a tavolino. Il bordo del riquadro **coincide** col bordo della riga,
   * non gli sta a un pixel di distanza: sembra una riga sola perché è quasi
   * la stessa riga.
   */
  React.useEffect(() => {
    if (!fermo) return
    const radice = radiceRef.current
    const contenitore = contenitoreRef.current
    // Il piè è facoltativo (`piePagina={false}`, le tabelle imbarcate):
    // quando manca, la sua altezza vale zero invece di bloccare la misura.
    const elPiePagina = piePaginaRef.current
    if (!radice || !contenitore) return

    const ricalcola = () => {
      const altezzaTestata = testataRef.current?.getBoundingClientRect().height ?? 0
      setAltezzaTestata(altezzaTestata)
      const contenitoreTop = contenitore.getBoundingClientRect().top
      const scarto = parseFloat(getComputedStyle(radice).rowGap) || 0
      const altezzaPiePagina = elPiePagina?.getBoundingClientRect().height ?? 0
      const disponibileTotale =
        radice.getBoundingClientRect().bottom - contenitoreTop - altezzaPiePagina - scarto

      const righeVere = [...contenitore.querySelectorAll<HTMLTableRowElement>("tbody tr")].filter(
        (riga) => !riga.hasAttribute("aria-hidden")
      )
      if (righeVere.length === 0) return

      /**
       * **Le righe si misurano fra loro, non contro il contenitore**, o
       * con un filtro messo e poi tolto il riquadro resterebbe basso come
       * quando le righe erano otto.
       *
       * `getBoundingClientRect` torna coordinate di **viewport**, e chi
       * scorre — `table-container`, un livello più dentro (v. il commento
       * del riquadro, sotto) — le sposta tutte. A contenitore scorso le
       * righe in cima danno un fondo **negativo** e l'ultima cade
       * esattamente sull'altezza corrente: misurato 370 contro i 586
       * disponibili, con `scrollTop` a 696. Il tetto si riscriveva quindi
       * col valore che aveva già, ed è un **cricchetto** — il riquadro sa
       * rimpicciolirsi e non sa più ricrescere. E peggiora da sé, perché è
       * il tetto basso a far ancorare il browser in fondo.
       *
       * Il rimedio non è rimettere `scrollTop` (funzionerebbe qui e si
       * romperebbe in virtualizzazione, dove `scrollTop` vale centinaia di
       * migliaia di pixel e le righe rese sono solo quelle a schermo): si
       * prende la cima della **prima riga resa** come zero. Le distanze fra
       * righe non dipendono da dove sta la barra di scorrimento, e le righe
       * sono alte uguali — quindi `testata + k righe` è il tetto giusto in
       * tutt'e due i casi.
       */
      const primaRigaTop = righeVere[0].getBoundingClientRect().top

      let tetto = altezzaTestata
      for (const riga of righeVere) {
        const fondoRiga = altezzaTestata + (riga.getBoundingClientRect().bottom - primaRigaTop)
        if (fondoRiga > disponibileTotale) break
        tetto = fondoRiga
      }
      if (tetto <= altezzaTestata) return
      // **A pixel interi, per difetto.** Righe di solo testo sono alte una
      // frazione di pixel (l'interlinea del corpo), e un tetto frazionario
      // lasciava il filo della riga di fondo accanto al bordo del riquadro,
      // due linee a un pixel di distanza. Per difetto, così il riquadro non
      // supera mai lo spazio disponibile e il filo della riga resta sotto il
      // bordo, fuori vista.
      tetto = Math.floor(tetto)

      // Qualche pixel di margine sul confronto: due misure dello stesso
      // valore, prese in momenti diversi, possono differire di qualche
      // sottopixel per come il browser arrotonda un `sticky` appena si
      // aggancia — senza il margine il riquadro si vedeva scattare di un
      // paio di pixel mentre si scorreva. Resta ben sotto un'altezza di riga vera
      // (30 px e oltre), quindi non nasconde mai una riga che è davvero
      // entrata o uscita.
      setAltezzaMax((prima) => (prima !== undefined && Math.abs(prima - tetto) < 4 ? prima : tetto))
    }

    ricalcola()
    const ro = new ResizeObserver(ricalcola)
    ro.observe(radice)
    if (elPiePagina) ro.observe(elPiePagina)
    if (testataRef.current) ro.observe(testataRef.current)
    /*
     * **E la tabella, o su `perPagina="virtuale"` il tetto non si mette mai**.
     * Gli altri tre osservati non cambiano mai altezza da soli:
     * servono a reagire alla finestra, non al contenuto. Con la
     * virtualizzazione le righe però **non ci sono ancora** quando l'effetto
     * gira — né alla chiamata diretta né alla prima notifica che
     * `ResizeObserver` consegna appena si osserva — e `ricalcola` esce sul
     * `righeVere.length === 0` senza che nulla lo richiami più.
     *
     * Misurato su `Blocchi/Data Table → Virtualizzata`, **6 aperture su 6**:
     * `righe 0` due volte e `max-height` mai scritto, mentre il calcolo
     * avrebbe dato **448px** contro i 477,4 che il riquadro teneva — cioè
     * l'ultima striscia mostrava 29px di una riga alta 37, che è esattamente
     * il difetto che questo effetto esiste per togliere. È una corsa, e qui
     * la perde sempre.
     *
     * La tabella invece **cresce** quando il virtualizzatore rende le righe, e
     * non si rimpicciolisce per colpa del tetto — sta dentro un contenitore
     * che scorre, quindi la sua altezza naturale non dipende da
     * `max-height`. Nessun anello di ritorno: solo una notifica in più quando
     * il contenuto arriva.
     */
    if (tabellaRef.current) ro.observe(tabellaRef.current)
    return () => ro.disconnect()
    /*
     * `conRighe` (`righe.length > 0`), non `righe.length`: il numero cresce a ogni passo
     * dello scorrimento infinito (`caricate`), e prima di questa riga
     * l'effetto si smontava e rimontava **a ogni passo** — l'osservatore
     * vecchio si disconnetteva, quello nuovo richiamava `ricalcola()` subito,
     * spesso un fotogramma prima che il layout del nuovo pezzo di righe si
     * fosse assestato del tutto: la causa vera del piccolo scatto durante lo
     * scorrimento. Le posizioni delle righe già rese non cambiano quando se
     * ne aggiungono altre dopo — l'osservatore non ha bisogno di ripartire
     * per quello, solo quando si passa da «zero righe» (lo stato vuoto) a
     * «almeno una», o viceversa.
     */
  }, [fermo, conRighe])

  // `riordinabile` spegne anche la casella di ricerca, non solo `enable
  // GlobalFilter` sulla tabella (v. il prop): a ricerca visibile ma senza
  // effetto sembrerebbe rotta, non disattivata apposta.
  const ricercaVisibile = cerca !== false && !trascinamento

  const contenuto = (
    <div ref={radiceRef} className={cn("flex min-h-0 flex-col gap-4", className)}>
      {ricercaVisibile || barra || colonneNascondibili ? (
        <div className="flex flex-col gap-3">
          {/* Riga 1: ricerca e menu Colonne. Riga 2: `barra` — i filtri della
              pagina, le azioni di massa. Due righe sempre, non una sola che
              va a capo da sé: con più di un paio di filtri sfaccettati (v.
              `data-table-filtro-sfaccettato.tsx`) il ritorno a capo
              automatico spezzerebbe un bottone a metà — la riga separerebbe
              due controlli a metà altezza invece di andare sotto per intero. */}
          {ricercaVisibile || colonneNascondibili ? (
            <div className="flex flex-wrap items-center gap-3">
              {ricercaVisibile ? (
                <RicercaTabella tabella={tabella} segnaposto={cerca as string} />
              ) : null}
              {colonneNascondibili ? <VisibilitaColonne tabella={tabella} /> : null}
            </div>
          ) : null}
          {barra ? (
            <div className="flex flex-wrap items-center gap-3">
              {typeof barra === "function" ? barra(scelti, tabella) : barra}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        ref={contenitoreRef}
        style={
          fermo
            ? ({
                maxHeight: altezzaMax,
                "--altezza-testata": altezzaTestata === undefined ? undefined : `${altezzaTestata}px`,
              } as React.CSSProperties)
            : undefined
        }
        className={cn(
          "overflow-hidden rounded-lg border bg-card",
          fermo &&
            "flex min-h-0 flex-col [&_[data-slot=table-container]]:snap-y [&_[data-slot=table-container]]:snap-proximity [&_[data-slot=table-container]]:scroll-pt-(--altezza-testata)"
        )}
      >
        {/*
          `overflow-hidden` — non `-y-auto` — perché qui basta **arrotondare
          l'angolo e ritagliare**: chi scorre davvero è `table-container`, un
          livello più dentro (v. il commento dell'effetto qui sopra).

          **Niente `flex-1`, di proposito.** Senza crescita forzata il
          riquadro prende solo l'altezza che il contenuto chiede — poche
          righe, riquadro basso, senza un vuoto sotto — e resta comunque
          capace di **restringersi** fino allo spazio che il genitore gli dà
          (`flex-shrink: 1` è il predefinito di un elemento flex, non c'è
          bisogno di dichiararlo): quando le righe superano lo spazio
          disponibile, il riquadro si ferma lì e `table-container` prende il
          sopravvento con lo scorrimento vero. `min-h-0` resta: è lui a
          togliere il pavimento «non scendo sotto il mio contenuto» che
          altrimenti impedirebbe la restrizione.

          **`snap-y`/`snap-proximity` su `table-container`**, non sul
          riquadro: senza, uno scorrimento libero può fermarsi a metà di una
          riga, e la riga tagliata in cima sembra un'altra barra. `proximity`
          e non `mandatory`: si assesta
          sul confine più vicino solo quando lo scorrimento **finisce** lì
          accanto, non forza un salto a ogni gesto.

          **Lo snap non c'entra con la testata coperta.** Se, con una colonna
          bloccata, l'intestazione mostra il testo di una riga al posto del
          proprio titolo, la causa è lo stacking: a **z-index pari** vince
          l'ordine nel DOM, e `<tbody>` viene dopo `<thead>`. Lo corregge lo
          `z-20` della `<TableHeader>`, più sotto; con quello lo snap è
          innocuo — verificato scrivendo `scrollTop` a mano su tredici
          posizioni, testata sempre corretta con lo snap attivo e spento. Un
          difetto di resa che sembra uno scroll-snap capriccioso si
          distingue misurando l'elemento colpito (`elementFromPoint`), non il
          valore di `scrollTop`.

          `[&_[data-slot=table-container]]:` e non una prop, perché quel
          `<div>` è dentro `Table` (`ui/table.tsx`) e non espone un
          `className` proprio — è lo stesso selettore per `data-slot` che
          l'osservatore usa poco sopra per trovarlo.
        */}
        {/*
          `table-fixed`, e non è un dettaglio di impaginazione.

          A larghezza **automatica** il browser dimensiona ogni colonna sul
          contenuto *della pagina corrente*: basta ordinare, o voltare pagina,
          e le righe visibili cambiano, cambia la stringa più lunga, e tutte le
          colonne **saltano**. Su una tabella paginata è un salto a ogni clic —
          preso guardando la story `Prodotti` e ordinando per codice.

          A larghezza fissa comandano le larghezze dichiarate nella **prima
          riga** di intestazioni, e il contenuto non ha più voce in capitolo: le
          colonne stanno ferme. Chi non dichiara `meta.larghezza` si spartisce
          ciò che avanza, in parti uguali.
        */}
        <Table
          ref={tabellaRef}
          className={cn(
            "table-fixed",
            // **Solo le linee verticali, non il perimetro**: il riquadro che
            // contiene la tabella ha già il proprio bordo, e aggiungerne uno
            // qui ne disegna **due** a un pixel di distanza — misurato,
            // tabella da 1406px dentro un contenitore da 1408. `tassullo-foglio-gruppi` invece il
            // perimetro ce l'ha, perché lì attorno alla tabella non c'è nessun
            // riquadro: la stessa classe in due posti diversi va guardata nel
            // contesto, non copiata.
            bordiColonna &&
              "[&_td]:border-e [&_td]:border-border [&_th]:border-e [&_th]:border-border [&_td:last-child]:border-e-0 [&_th:last-child]:border-e-0"
          )}
          {...attributiTabella}
        >
          {/*
            Il `<colgroup>` di `ridimensionabile`/`colonneBloccabili`: qui la
            larghezza non la dichiara più la prima riga di intestazioni
            (`meta.larghezza`), la dichiara TanStack — di partenza da `size`
            sulla colonna, poi dalle larghezze acquisite col trascinamento
            (`dimensioni`, lo stato sopra). **L'ordine dei `<col>` deve
            coincidere con quello di `<th>`/`<td>` sotto** (`intestazioni`,
            calcolato sopra): con `colonneBloccabili` le colonne bloccate si
            spostano ai bordi, e un `<col>` rimasto nell'ordine dichiarato
            darebbe la larghezza sbagliata alla colonna sbagliata.

            Una colonna senza `size` **non riceve `width`**, nemmeno se
            `column.getSize()` torna il default TanStack (150): è così che
            resta elastica, la stessa elasticità di una colonna senza
            `meta.larghezza` in una tabella non ridimensionabile — un
            meccanismo diverso, non un comportamento diverso.
          */}
          {conDimensioni ? (
            <colgroup>
              {intestazioni.map((intestazione) => (
                <col
                  key={intestazione.id}
                  style={
                    intestazione.column.columnDef.size != null ||
                    dimensioni[intestazione.column.id] != null
                      ? { width: intestazione.column.getSize() }
                      : undefined
                  }
                />
              ))}
            </colgroup>
          ) : null}
          {/*
            `sticky top-0`: la testata resta ferma mentre **`table-container`**
            scorre — il `<div overflow-x-auto>` di `Table` qui sotto, che
            l'effetto in testa al componente spiega. Non la pagina: è il
            difetto di `anagrafe.tassullo.it` che questa forma corregge — lì
            lo scorrimento infinito è della pagina intera, e la testata se ne
            va con lei.

            **`z-20`, non `z-10`.** Con `colonneBloccabili`, una colonna
            bloccata dà **sia** all'intestazione **sia** a ogni cella di
            corpo lo stesso `sticky z-10` (`ancoraggioColonna`, più sotto).
            `<thead>`/`<tbody>` non sono loro stessi posizionati: lo stacking
            context della `<th>` bloccata e quello della `<td>` bloccata
            bollono su, in pratica, allo stesso livello del genitore comune —
            e a **z-index pari** vince l'ordine nel DOM: `<tbody>` viene dopo
            `<thead>`, quindi la cella di corpo si dipinge *sopra* la
            testata. Con una colonna bloccata e la tabella scorsa anche di
            un solo pixel, la riga che in quel momento attraversa la fascia
            dei 40px della testata la copre — testo compreso, non
            un'illusione di scroll-snap: misurato con
            `document.elementFromPoint` sulla testata, che restituiva il
            `<td>` sottostante e non il `<th>`. Basta scorrere, in qualunque
            posizione.

            `z-20` sulla `<TableHeader>` mette l'intero stacking context
            della testata sopra quello di qualunque cella di corpo bloccata
            (`z-10`, invariato in `ancoraggioColonna`/`classiBloccate`): non
            serve toccare i due meccanismi di pin, basta che il genitore
            comune vinca il confronto a monte. Verificato scrivendo
            `document.elementFromPoint` sulla testata dopo aver bloccato
            «Nome» e scorso: torna lo `<span>` del titolo, non più la cella.
          */}
          <TableHeader ref={testataRef} className={cn(fermo && "sticky top-0 z-20")}>
            <TableRow className="hover:bg-transparent">
              {intestazioni.map((intestazione, indice) => (
                <CellaIntestazione
                  key={intestazione.id}
                  tabella={tabella}
                  tabellaRef={tabellaRef}
                  intestazione={intestazione}
                  indice={indice}
                  ultima={indice === intestazioni.length - 1}
                  trascinabile={
                    colonneRiordinabili && !COLONNE_UTILITY.has(intestazione.column.id)
                  }
                  ridimensionabile={ridimensionabile}
                  colonneBloccabili={colonneBloccabili}
                  bloccoLegacy={bloccoLegacy}
                  conDimensioni={conDimensioni}
                  selezione={selezione}
                />
              ))}
            </TableRow>
          </TableHeader>
          {virtualizzata ? (
            <DataTableVirtualizedBody
              tabella={tabella}
              righe={righe}
              colonneBloccabili={colonneBloccabili}
              bloccoLegacy={bloccoLegacy}
              selezione={selezione}
              colonneVisibili={colonneVisibili}
              vuoto={vuoto}
              conFiltri={conFiltri}
              pulisci={pulisci}
              scrollEl={elementoScorrevole}
              senzaFocoRiga={internoGriglia?.senzaFocoRiga}
              alVirtualizzatore={internoGriglia?.alVirtualizzatore}
            />
          ) : (
            <DataTableBody
              tabella={tabella}
              righe={righe}
              colonneBloccabili={colonneBloccabili}
              bloccoLegacy={bloccoLegacy}
              selezione={selezione}
              colonneVisibili={colonneVisibili}
              vuoto={vuoto}
              conFiltri={conFiltri}
              pulisci={pulisci}
              fermo={fermo}
              pannelloRiga={pannelloRiga}
              infinito={infinito}
              totaleFiltrate={totaleFiltrate}
              sentinellaRef={sentinellaRef}
              trascinabile={trascinamento}
              menuRiga={menuRiga}
              chiaveMemoRiga={chiaveMemoRiga}
            />
          )}
          {/*
            Il piede (`piede`, v. la prop). **Una volta sola, e qui.**

            Il piano lo dava «in due rami di render», per simmetria con i due
            posti in cui `meta.sottototale` compare — ma quei due posti sono i
            due *corpi* (`DataTableBody` e `DataTableVirtualizedBody`), e il
            subtotale sta lì perché è la cella di una riga. Il `<Table>` è
            **uno**: i due corpi si scambiano dentro di lui, e un `<tfoot>`
            scritto dopo il corpo vale per tutti e due. Scritto due volte
            sarebbe stato due `<tfoot>` in una tabella sola nel momento in cui
            uno dei due rami fosse cambiato.

            ── `sticky bottom-0`, ed è la scelta ──────────────────────────

            Il `<Table>` sta **dentro** `table-container`, cioè dentro ciò che
            scorre: senza sticky, su `altezza="ferma"` o
            `perPagina="virtuale"` il totale se ne va in fondo alle righe e non
            si vede più — che è il difetto che la testata ferma corregge in
            cima, preso qui dal verso opposto. L'alternativa era una fascia
            **fuori** dal contenitore scorrevole, e non regge: fuori dalla
            `<table>` non ci sono più le colonne, quindi un totale non si può
            allineare alla colonna che somma — diventa una riga di testo
            libero sotto la tabella, cioè un'altra cosa.

            Non è un `sticky` acceso a condizione: fuori da un contenitore che
            scorre davvero è **inerte per definizione** (non c'è scarto da
            compensare), quindi su `altezza="naturale"` non fa e non costa
            niente.

            `z-20`, e per la ragione esatta della testata (v. sopra): una cella
            bloccata del corpo porta `z-10`, e a z-index pari vincerebbe
            l'ordine nel DOM — il `<tfoot>` viene dopo `<tbody>`, quindi qui
            vincerebbe il piede, ma con `<thead>` in mezzo il confronto va
            fissato a monte una volta per tutte.

            `bg-accent` — opaco, e lo stesso della testata. Il default della
            primitiva è `bg-muted/50`, cioè **translucido**: appoggiato sopra
            le righe che gli scorrono sotto le lascerebbe trasparire, e il
            totale si leggerebbe sovrapposto a un numero qualsiasi. Ed è anche
            la risposta alla domanda «si legge come un totale o come un'altra
            riga di dati»: il piede prende il fondo della **cornice**, non
            quello delle righe.
          */}
          {piede ? (
            <TableFooter className="sticky bottom-0 z-20 bg-accent">
              <TableRow className="hover:bg-transparent">
                {cellePiede.map(({ intestazione, indice, colSpan }) => {
                  const cellaPiede = (
                    intestazione.column.columnDef.meta as MetaColonna<TDato> | undefined
                  )?.piede
                  // Lo stesso ancoraggio della testata, e non quello delle
                  // celle: `contesto: "cella"` porterebbe `bg-card` e le
                  // classi del sorvolo di riga, che qui non c'è.
                  const ancoraPiede = colonneBloccabili
                    ? ancoraggioColonna(tabella, intestazione.column, "intestazione")
                    : undefined
                  const bloccataLegacy = bloccoLegacy
                    ? classiBloccate(indice, selezione)
                    : undefined
                  return (
                    <TableCell
                      key={intestazione.id}
                      colSpan={colSpan > 1 ? colSpan : undefined}
                      className={cn(
                        "truncate",
                        bloccataLegacy,
                        ancoraPiede?.className,
                        // `classiBloccate` cabla `bg-card`, che sul piede
                        // sarebbe una cella di colore diverso dalle altre:
                        // il fondo si rimette dopo, e solo dove serve.
                        bloccataLegacy && "bg-accent"
                      )}
                      style={ancoraPiede?.style}
                    >
                      {cellaPiede ? cellaPiede(datiPiede) : null}
                    </TableCell>
                  )
                })}
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>

      {piePagina ? (
        <div ref={piePaginaRef}>
          <PaginazioneTabella
            tabella={tabella}
            conSelezione={selezione}
            // `virtualizzata` non ha nemmeno lei una «pagina»: stessa fascia
            // di destra tolta di `infinito`, per lo stesso motivo — tutte le
            // righe filtrate sono già nel modello, il salto da fare non c'è.
            // `trascinamento`: stessa ragione, una pagina sola.
            infinito={infinito || virtualizzata || trascinamento}
            nomeRighe={nomeRighe}
          />
        </div>
      ) : null}
    </div>
  )

  let risultato = contenuto
  if (trascinamento) {
    risultato = (
      <DataTableRiordinoRighe dati={dati} righe={righe} onRiordina={riordinabile.onRiordina}>
        {risultato}
      </DataTableRiordinoRighe>
    )
  }
  if (colonneRiordinabili) {
    risultato = (
      <DataTableRiordinoColonne
        ordineIntestazioni={intestazioni.map((h) => h.column.id)}
        onRiordina={(nuovoOrdine) => tabella.setColumnOrder(nuovoOrdine)}
      >
        {risultato}
      </DataTableRiordinoColonne>
    )
  }
  return risultato
}
