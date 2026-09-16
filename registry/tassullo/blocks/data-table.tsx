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
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
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
  type ColumnPinningState,
  type ColumnSizingState,
  type Header,
  type ReactTable,
  type Row,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  InboxIcon,
  PinIcon,
  PinOffIcon,
  SearchIcon,
  SearchXIcon,
  SlidersHorizontalIcon,
} from "lucide-react"

import { cn } from "cn"
import { Button } from "@/registry/tassullo/ui/button"
import { Checkbox } from "@/registry/tassullo/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
 * albero (M3bis.1): a differenza delle funzioni di ordinamento, che una
 * colonna deve nominare per usarle, l'espansione resta inerte da sola finché
 * nessuno passa `getSottoRighe` — nessuna riga ha `subRows`, quindi
 * `getCanExpand()` è sempre falso e il ramo non lavora. Registrarla una volta
 * qui evita che ogni sessione della FASE 3bis che ne ha bisogno (M3bis.1,
 * M3bis.2, M3bis.5) debba biforcare `caratteristiche` in due costanti.
 *
 * `columnSizingFeature`/`columnResizingFeature`/`columnPinningFeature`
 * (M3bis.3, D17 riaperta) seguono la stessa logica: sempre registrate, mai
 * attive da sole. `enableColumnResizing`/`enableColumnPinning` restano `false`
 * finché la pagina non passa `ridimensionabile`/`colonneBloccabili` al
 * blocco — senza, `column.getCanResize()`/`getCanPin()` tornano `false` e i
 * due rami del render (`ManigliaRidimensiona`, `MenuBloccaColonna`) non
 * disegnano niente. `columnSizingFeature` resta comunque utile da sola anche
 * a `ridimensionabile` spento: è la stessa che dà a `colonna.getSize()` un
 * numero — 150 di default TanStack — usato per calcolare gli scarti del pin
 * generalizzato (v. `ancoraggioColonna`).
 */
export const caratteristiche = tableFeatures({
  columnFilteringFeature,
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
  filterFns: { includesString: filterFn_includesString },
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
 *   numero di pixel. È la regola 3 del `CLAUDE.md`, che vale anche negli
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
 * `larghezza` **si ignora** su una tabella `ridimensionabile`/`colonneBloccabili`
 * (M3bis.3): lì la larghezza di partenza si dichiara con `size` — il campo
 * *di TanStack*, sulla colonna stessa (`col.accessor("nome", { size: 220 })`),
 * non in `meta` — insieme a `minSize`/`maxSize` per i due estremi del
 * trascinamento. Restare sui nomi di TanStack è la stessa scelta di
 * `accessor`/`display`/`columns` più sopra: la documentazione che serve a chi
 * scrive una colonna resta la loro. Una colonna senza `size` assorbe lo
 * spazio che avanza, come senza `larghezza` — la stessa elasticità, un
 * meccanismo diverso (`<colgroup>`, non la prima riga di intestazioni).
 *
 * `sottototale` è la terza chiave, ed è **facoltativa quanto le altre due**:
 * senza, una tabella ad albero (M3bis.1, `getSottoRighe`) resta legittima —
 * mostra solo le righe figlie, senza nessun conto sul genitore. Quando c'è,
 * il blocco la chiama al posto della cella normale **sulle sole righe che
 * hanno figli** (`row.subRows.length > 0`), passandole i dati originali dei
 * figli diretti. **Una funzione, non un nome di operazione** (`"somma"`,
 * `"media"`): un subtotale di computo è quasi sempre un'unità di misura da
 * scrivere insieme al numero («12,4 m²», non «12.4»), e quella formattazione
 * è dominio della pagina, non del blocco — la stessa ragione per cui
 * `rowAggregationFeature` di TanStack non è fra le `caratteristiche` sopra:
 * qui l'albero è dato vero (`CLAUDE.md`), non un raggruppamento con una
 * funzione di aggregazione registrata a parte.
 */
export type MetaColonna<TDato = unknown> = {
  titolo?: string
  larghezza?: string
  sottototale?: (righeFiglie: TDato[], riga: TDato) => React.ReactNode
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
 * (`config/data-table.tsx`, tabella "Sort Labels", letto in M3bis.0): quattro
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
 * posto si disegna un trattino. Resta dentro il gradino 2 della scala 4bis —
 * sono stringhe di classi su un uso, non una modifica al componente — e le
 * misure escono da `--spacing`, non da valori arbitrari.
 *
 * **La casella di una riga con figli è a cascata**, per M3bis.1: `checked`
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
    meta: { larghezza: "w-10" } satisfies MetaColonna,
  })
}

/**
 * Il rientro e lo `chevron` di una riga d'albero (M3bis.1) — da mettere
 * **dentro il `cell` della colonna che identifica la riga**, non in una
 * colonna a sé: in un elenco annidato non c'è una colonna «struttura» separata
 * dal nome, come non c'è in un esploratore di file. Quale colonna sia lo
 * decide la pagina, componendo `<CellaAlbero riga={row}>{...}</CellaAlbero>`
 * nel proprio `cell` — lo stesso principio per cui le colonne restano di chi
 * le scrive.
 *
 * Il rientro è una tabella di classi Tailwind (`pl-0`, `pl-5`, …), non uno
 * `style` con un calcolo: sono utility vere, derivano da `--spacing` come
 * tutte le altre misure del tema, e non c'è bisogno del valore arbitrario che
 * la regola 3 vieta. Oltre il livello più profondo previsto la tabella si
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
 * (niente `size-8`): un rilievo di Francesco ha preso esattamente questo —
 * lo spaziatore, senza il margine negativo del bottone, alzava le righe senza
 * figli **più** di quelle con figli (49px contro 35,57px, misurato), il
 * difetto opposto a quello che sembrava a vederlo (righe «tutte uguali»
 * quando in realtà non lo erano affatto).
 *
 * **Il bottone del `chevron` non si distingue quando la riga è aperta e
 * ferma**: niente sfondo, niente bordo — identico a se stesso chiuso.
 * `Button` da sé darebbe al bottone un `bg-muted` pieno quando è lui ad avere
 * `aria-expanded="true"` (`aria-expanded:bg-muted`, nel `variant="ghost"` di
 * `ui/button.tsx`): la primitiva è corretta per un menu, dove serve segnare
 * quale grilletto è aperto, ma qui il segno di stato **è già** la freccia
 * ruotata — un secondo segno sul bottone stesso è ridondante (rilievo di
 * Francesco). Si spegne con `aria-expanded:bg-transparent`, che vince sul
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
 * Il bottone che apre/chiude il pannello di dettaglio di una riga (M3bis.2,
 * "Row Expansion") — una colonna a sé, non dentro `CellaAlbero`: a differenza
 * dell'albero (M3bis.1), qui non c'è una colonna che «identifica» la riga più
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
        // `<span className="flex items-center …">` (rilievo di Francesco:
        // il chevron stava più in alto delle altre celle della riga).
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
    meta: { larghezza: "w-10" } satisfies MetaColonna,
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
            quando il pannello monta, cioè solo a menu aperto. È scritto in
            `dropdown-menu.stories.tsx`, e qui è costato una passata del gate. */}
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
function classiBloccate(indice: number, conSelezione: boolean): string | undefined {
  const quante = conSelezione ? 2 : 1
  if (indice >= quante) return undefined
  const base =
    "sticky z-10 bg-card group-hover/riga:bg-muted/50 group-data-[state=selected]/riga:bg-muted"
  const bordo = indice === quante - 1 ? " border-r" : ""
  return `${base}${bordo} ${indice === 0 ? "left-0" : "left-10"}`
}

/* ────────────────────────────────────────────────────────────────────────
 * Resize e pin generalizzato (M3bis.3, D17 riaperta)
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Lo sticky di una colonna bloccata con `colonneBloccabili`, **calcolato**
 * invece che tabulato: a differenza di `classiBloccate` — che assume indice
 * 0/1 e due larghezze fisse (`w-10`, la sola colonna di selezione) — qui
 * qualunque colonna può bloccarsi, con qualunque larghezza acquisita, quindi
 * lo scarto dal bordo (`left`/`right`) va chiesto a TanStack:
 * `column.getStart("start")` somma le larghezze **acquisite** di tutte le
 * colonne bloccate a sinistra prima di questa, `getAfter("end")` la stessa
 * somma dal lato destro. Sono numeri, non classi — la stessa eccezione alla
 * regola 3 che `ridimensionabile` già documenta («larghezze acquisite
 * dall'utente»), estesa alle *posizioni* che quelle larghezze determinano.
 *
 * Il bordo (`border-r`/`border-l`) va sulla **sola colonna al bordo esterno**
 * del blocco bloccato — l'ultima a sinistra, la prima a destra — non su ogni
 * colonna bloccata: è il segno che lo scorrimento passa sotto, e su una
 * colonna di mezzo sarebbe un filo senza motivo in vista.
 */
function ancoraggioColonna<TDato extends RowData>(
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
 * **Non è un componente proprio** (`CLAUDE.md`, regola 4bis, `componenti-
 * propri.json`): resta locale a questo file, come `colonnaSelezione` o
 * `classiBloccate` — quel registro è per ciò che sta *al posto* di una
 * primitiva `ui/`, e una maniglia composta da un `<span>` e due gestori non
 * lo è.
 *
 * **La tastiera non arriva gratis** (D17, il quarto costo): il trascinamento
 * è un affordance da puntatore, e axe non direbbe niente su una maniglia
 * completamente muta da tastiera — è la stessa lezione di D15 sul calendario.
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
 * *trapassava* il filo invece di continuarlo (rilievo di Francesco). Qui la
 * zona sensibile (`role="separator"`, invariata: hit-area, tastiera, `aria-*`)
 * resta un `<span>` largo quanto prima, ma **il segno visivo è un unico
 * discendente centrato al suo interno** (`<span aria-hidden>`), che cambia
 * stato invece di duplicarsi: **invisibile a riposo** — niente riga fra le
 * colonne di un'intestazione che nessuno sta toccando, a differenza di
 * niko-table (rilievo di Francesco: intestazioni pulite, nessuna separazione
 * finché non si trascina) — poi visibile al passaggio del mouse o al fuoco da
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
}: {
  tabella: IstanzaTabella<TDato>
  tabellaRef: React.RefObject<HTMLTableElement | null>
  header: Header<CaratteristicheTabella, TDato, unknown>
  titolo: string
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
      tabIndex={0}
      // `preventDefault()` prima di delegare a TanStack, non dopo: in
      // Safari (non in Chrome, preso da Francesco) un `mousedown` non
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
      className="group/maniglia absolute inset-y-0 -right-1 z-20 w-2 shrink-0 cursor-col-resize touch-none focus-visible:outline-none"
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

/** I due stati vuoti, che non sono lo stesso stato. */
function TabellaVuota({
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
 * Il corpo della tabella — non virtualizzato e virtualizzato (M3bis.4)
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Le celle di una riga, nell'ordine giusto: con `colonneBloccabili` le
 * colonne bloccate si spostano ai due bordi (v. `intestazioni`, più sotto,
 * per la stessa ragione sulle intestazioni), altrimenti l'ordine dichiarato.
 * Condivisa fra `DataTableBody` e `DataTableVirtualizedBody`, che altrimenti
 * la scriverebbero identica due volte.
 */
function celleRiga<TDato extends RowData>(
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

type CorpoTabellaCondiviso<TDato extends RowData> = {
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
 * Il corpo non virtualizzato: ogni riga di `righe` è un `<tr>` vero, sempre
 * montato — la forma che `naturale`/`ferma`/`infinito` hanno sempre avuto.
 * Estratto in un componente a sé (prima era JSX inline in `DataTable`) perché
 * M3bis.5 (Data Grid) innesta invece `DataTableVirtualizedBody`, non questo:
 * un nome esportato per ciascuno dei due corpi evita che la Data Grid debba
 * ricopiare la logica di riga/pannello/sentinella da qui.
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
}: CorpoTabellaCondiviso<TDato> & {
  fermo: boolean
  pannelloRiga?: (riga: TDato) => React.ReactNode
  infinito: boolean
  totaleFiltrate: number
  sentinellaRef: React.RefObject<HTMLTableRowElement | null>
}) {
  return (
    <TableBody>
      {righe.length > 0 ? (
        <>
          {righe.map((riga) => {
            const celle = celleRiga(riga, colonneBloccabili)
            return (
              <React.Fragment key={riga.id}>
                <TableRow
                  className={cn("group/riga", fermo && "snap-start")}
                  data-state={riga.getIsSelected() ? "selected" : undefined}
                >
                  {celle.map((cella, indice) => {
                    // Il subtotale (M3bis.1, `meta.sottototale`) prende il
                    // posto della cella normale **solo sulle righe che
                    // hanno figli** — su una riga foglia non c'è niente da
                    // sommare, e `tabella.FlexRender` resta la via giusta.
                    const sottototale = riga.subRows.length
                      ? (cella.column.columnDef.meta as MetaColonna<TDato> | undefined)
                          ?.sottototale
                      : undefined
                    const ancoraCella = colonneBloccabili
                      ? ancoraggioColonna(tabella, cella.column, "cella")
                      : undefined
                    return (
                      // `truncate` è il prezzo di `table-fixed`: con le larghezze
                      // decise dalle intestazioni, un testo più lungo della sua
                      // colonna **sborda** nella colonna accanto invece di
                      // allargarla: meglio tagliarlo coi puntini.
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
                {pannelloRiga && riga.getIsExpanded() ? (
                  // Riga fratella, non figlia: subito dopo la riga che
                  // apre, colSpan su tutte le colonne visibili — è il
                  // pannello di M3bis.2, non l'albero di M3bis.1 (quello
                  // aggiunge righe vere al modello dati, questo ne
                  // disegna una in più solo per la vista).
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
          })}
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

/**
 * Il corpo virtualizzato (`perPagina="virtuale"`, M3bis.4): monta solo le
 * righe **davvero in vista**, non tutte quelle filtrate — la differenza con
 * `perPagina="infinito"`, che invece carica progressivamente e monta ogni
 * riga caricata per sempre. È la forma che regge 10.000 righe senza mai avere
 * 10.000 `<tr>` nel DOM.
 *
 * **La tecnica delle due righe-cuscinetto**, non `position: absolute` per
 * riga: un `<table>` non ha un contenitore libero su cui posizionare i figli
 * in assoluto senza rompere il flusso delle colonne (`<colgroup>`), quindi
 * qui si usa la stessa forma che TanStack stessa documenta per una `<table>`
 * vera — una riga vuota prima («quanto ho scorso oltre») e una dopo («quanto
 * resta da scorrere»), alte quanto lo spazio delle righe non montate.
 *
 * **`estimateSize` è un segnaposto, non una misura**: 44 è un valore di
 * partenza plausibile (vicino all'altezza di riga in densità normale), corretto
 * subito dalla misura vera — `measureElement`, passato come `ref` a ogni riga
 * — che legge l'altezza reale resa, densità compresa. La stessa disciplina di
 * `altezzaMax` più sotto in `DataTable`: si misura, non si assume; qui la
 * stima iniziale non è mai quella che l'utente vede a riposo, per più di un
 * fotogramma.
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
  /**
   * M3bis.5 — wiring privata per `<DataGrid>`: quando `true`, questo corpo
   * smette di gestire lui il fuoco e la tastiera **a livello di riga**
   * (niente `tabIndex` sulle `<tr>`, niente `onKeyDown`/`onFocus` di riga).
   * La Data Grid naviga **a livello di cella** — ogni cella è il proprio
   * bersaglio di fuoco — e se il corpo tenesse acceso anche il proprio giro
   * riga-per-riga i due meccanismi si pesterebbero i piedi (due gestori di
   * `ArrowUp`/`ArrowDown` sulla stessa pressione, uno dei quali cieco alla
   * colonna). `undefined`/`false`: comportamento invariato, quello di
   * M3bis.4.
   */
  senzaFocoRiga?: boolean
  /**
   * M3bis.5 — consegna a chi monta questo corpo la sola funzione di
   * scorrimento del virtualizzatore (`scrollToIndex`, già clampata), non
   * l'istanza intera: la Data Grid la usa per portare in vista una riga
   * fuori dalla finestra montata quando il fuoco si sposta verticalmente da
   * tastiera — lo stesso identico `vaiA` che questo corpo già usa per sé,
   * riutilizzato invece di duplicato. Chiamato a ogni render (nessun elenco
   * di dipendenze): `vaiA` chiude su `righe.length` corrente, e la chiamata
   * stessa costa solo l'assegnazione di un riferimento.
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
 * dati** — rilievo di Francesco su Prodotti: «37 righe» non dice cosa sono
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
  /**
   * Righe per pagina. Una di 10, 25, 50, 100 — oppure **`"infinito"`**: niente
   * pagine, si carica altro scorrendo.
   *
   * È la forma delle pagine **sola lista** — Prodotti, Norme, Certificazioni,
   * sidebar → lista → scheda — dove sotto la tabella non c'è altro (D19,
   * `docs/DECISIONI.md`; M3.10, coda). **Non** `"auto"` — una prima versione
   * pensava a righe-per-pagina calcolate per riempire lo schermo, scartata:
   * si discostava troppo dalla forma di shadcn (righe di riempimento per
   * pareggiare l'ultima pagina) mentre `anagrafe.tassullo.it` ha già lo
   * scorrimento infinito in produzione — la stessa lista, la stessa mole di
   * dati, un meccanismo noto e già collaudato.
   *
   * L'unico difetto di quell'implementazione — la testata scorre via con la
   * pagina, e si perde il nome delle colonne — è quello che questo blocco
   * corregge: la testata è `sticky` sul **contenitore** che scorre, non sulla
   * pagina.
   *
   * **Vuole `altezza="ferma"` per funzionare** (altrimenti non c'è niente
   * da far scorrere, e le righe oltre lo spazio disponibile restano
   * invisibili): quel prop calcola il tetto e apre lo scorrimento interno,
   * qui serve solo a dire che senza non ha senso. `className` deve inoltre
   * passare `flex-1 min-h-0`, e il genitore deve avere un'altezza vera a cui
   * arrivare — `<AppShell contenuto="riempie">`.
   *
   * Il menu «Righe» e i salti di pagina spariscono: non c'è una pagina da
   * saltare. Resta solo il conto, in fondo.
   *
   * **Confine accertato, da conoscere prima di promettere «stessa forma,
   * zero sforzo» su un'altra pagina**: `perPagina="infinito"` rivela
   * progressivamente un array **già tutto in `dati`** — non richiede altro
   * al server mentre si scorre. Va bene finché l'API della pagina restituisce
   * l'elenco intero in una chiamata sola (`generaProdotti` nella story lo
   * simula così, ed è anche il caso di Anagrafe oggi per Prodotti). Se una
   * futura pagina **sola lista** avesse un elenco paginato lato server — non
   * tutto scaricato in un colpo — «carica altro mentre scorro» diventerebbe
   * lavoro vero: un `onCaricaAltro`/`fetchNextPage` che questo blocco oggi
   * non ha. Verificare come arrivano i dati **prima** di assumere che il
   * pattern costi zero su una pagina nuova (valutazione del 2026-09-15,
   * `WORKLOG.md`).
   *
   * **`"virtuale"`** (M3bis.4) è la terza forma, non una variante delle
   * altre due: niente pagine come `"infinito"`, ma **niente crescita** del
   * DOM mentre si scorre — monta solo le righe davvero in vista
   * (`@tanstack/react-virtual`), non ogni riga caricata finora. È la forma
   * per un elenco **grande fin dall'inizio** (10.000 righe, non 40 che
   * crescono a 10.000 scorrendo): `"infinito"` su quella mole monterebbe
   * comunque 10.000 `<tr>` una volta arrivati in fondo, `"virtuale"` mai più
   * di una finestra. **Vuole `altezza="ferma"` per lo stesso motivo di
   * `"infinito"`** — senza un tetto non c'è una finestra da calcolare.
   * **Non compone con `pannelloRiga`**: il pannello di M3bis.2 inserisce una
   * riga vera in più nel DOM quando si apre, e il virtualizzatore conta le
   * righe per indice fisso (`righe.length`) — un conto che il pannello
   * sposterebbe ogni volta che una riga qualsiasi si espande. `getSottoRighe`
   * (l'albero di M3bis.1) invece compone senza problemi: le righe figlie
   * sono già righe vere nel modello dati, incluse nello stesso elenco piatto
   * che il virtualizzatore già scorre.
   */
  perPagina?: (typeof PER_PAGINA)[number] | "infinito" | "virtuale"
  /**
   * Il riquadro della tabella, in una di due forme — indipendente da
   * `perPagina`, che sceglie *come si caricano* le righe, non *quanto spazio
   * prende* il riquadro. `"naturale"` (default): l'altezza segue il
   * contenuto, la pagina intorno scorre — corretto quando la tabella è
   * **una sezione fra altre** (una `pagina-scheda`, dove sopra c'è un
   * breadcrumb, un'intestazione, magari un'altra tabella). `"ferma"`:
   * altezza calcolata sullo spazio che il genitore concede (la stessa misura
   * che finora girava solo per `"infinito"`, v. l'effetto più sotto),
   * intestazione ferma, scorrimento interno su `table-container`, piè
   * sempre visibile. È la forma corretta quando la tabella **è** la pagina —
   * `pagina-lista`, dentro `<AppShell contenuto="riempie">` — a
   * prescindere da come `perPagina` carica le righe: prima di questa
   * distinzione, la paginazione numerica non aveva mai il riquadro fermo, e
   * con più righe di quante ne stiano a schermo il piè — conteggio, salti di
   * pagina — usciva dalla vista finché non si scorreva **tutta** la pagina
   * (rilievo di Francesco, coda di M4.2). Con poche righe (`"ferma"`, 10
   * righe) il riquadro si restringe fino al contenuto — nessuno spazio
   * vuoto sotto, `flex-shrink` è già il predefinito di un elemento flex.
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
  /**
   * Colonne ridimensionabili da tastiera e da trascinamento (M3bis.3, D17
   * riaperta e generalizzata). Aggiunge a ogni intestazione una maniglia sul
   * bordo destro — `role="separator"`, frecce sinistra/destra per i passi da
   * tastiera, `Home` per tornare alla larghezza di partenza.
   *
   * **Sposta il calcolo delle larghezze da `meta.larghezza` (utility
   * Tailwind) a `size`/`minSize`/`maxSize`** sulla colonna (v. `MetaColonna`):
   * la tabella passa da `table-fixed` con larghezze nella prima riga a un
   * `<colgroup>` vero, perché una larghezza *acquisita* dall'utente è un
   * numero che nessuna classe del tema rappresenta.
   *
   * **Il costo che D17 chiedeva in mano prima di riaprirla**: le larghezze
   * acquisite sono pixel, e quindi **non seguono la densità** — la stessa
   * eccezione, per la stessa ragione, che `sidebar.tsx` già ha (`CLAUDE.md`
   * regola 5). Non è un difetto scoperto tardi: è scritto qui, ed è la
   * ragione per cui l'eccezione alla regola 3 (niente valori arbitrari) è
   * **questa e non un'altra** — «larghezze acquisite dall'utente», il perimetro
   * che D17 chiedeva di circoscrivere, non «larghezze» in generale. La
   * persistenza fra un caricamento e l'altro **resta fuori da questa sessione**:
   * `columnSizing` vive in uno stato interno del blocco, non in una prop
   * controllata — se una pagina futura vorrà salvarla (`localStorage`, profilo
   * utente) è lavoro a sé, annotato in `WORKLOG.md` e non promesso qui.
   */
  ridimensionabile?: boolean
  /**
   * Il pin **generalizzato** (M3bis.3): qualunque colonna, a sinistra o a
   * destra, da un menu nell'intestazione — non solo la prima colonna fissa di
   * `bloccaPrimaColonna`. Aggiunge a ogni intestazione bloccabile un piccolo
   * bottone con `PinIcon`, che apre "Blocca a sinistra" / "Blocca a destra" /
   * "Non bloccare".
   *
   * **Implica `ridimensionabile` internamente** (non serve passarlo insieme):
   * lo scarto sticky di una colonna bloccata (`left`/`right` in pixel) si
   * calcola dalle larghezze *acquisite* delle colonne che la precedono
   * (`column.getStart("start")`/`getAfter("end")` di TanStack), che senza il
   * `<colgroup>` di `ridimensionabile` non esistono. Le maniglie di
   * ridimensionamento restano nascoste finché non si passa anche
   * `ridimensionabile` esplicitamente — `colonneBloccabili` da solo blocca,
   * non ridimensiona.
   *
   * **Sostituisce `bloccaPrimaColonna` quando sono passati insieme**: i due
   * meccanismi disegnano lo sticky in due modi incompatibili (classi fisse
   * per indice contro scarti calcolati), e sovrapporli romperebbe l'uno o
   * l'altro. Con `colonneBloccabili` si blocca la prima colonna dal menu, non
   * dal prop.
   */
  colonneBloccabili?: boolean
  /**
   * Righe annidate (M3bis.1, "Tree"): dato un dato di riga, restituisce le
   * sue righe figlie, o `undefined`/`[]` per una riga senza figli. **Struttura
   * vera nel modello dati** — il caso reale è il "Computo metrico" di Studio,
   * dove ogni voce porta già le proprie righe di misurazione — e non
   * raggruppamento: non c'è `columnGroupingFeature` fra le `caratteristiche`,
   * di proposito (`WORKLOG.md`, valutazione niko-table).
   *
   * Da solo abilita **espandi/collassa e selezione a cascata**: entrambi sono
   * meccanica di TanStack (`rowExpandingFeature`/`rowSelectionFeature`,
   * sempre registrate) che resta inerte finché nessuna riga ha `subRows`. Non
   * disegna da sé il rientro e lo `chevron` — quello è `CellaAlbero`, da
   * comporre nella colonna che identifica la riga — e non calcola nessun
   * subtotale: quello è `meta.sottototale` su una colonna (v. `MetaColonna`).
   *
   * Passata a TanStack come `getSubRows`: la firma è la stessa, il nome è
   * tradotto perché è l'unica opzione di questa natura che il blocco espone —
   * a differenza delle colonne, dove restare fedeli ai nomi di TanStack tiene
   * valida la loro documentazione.
   */
  getSottoRighe?: (riga: TDato) => readonly TDato[] | undefined
  /**
   * Il pannello di dettaglio di una riga (M3bis.2, "Row Expansion",
   * porting da niko-table): contenuto **libero**, a differenza del
   * subtotale di `meta.sottototale`, che è sempre un numero formattato.
   * Restituire `null`/`undefined` per una riga toglie il chevron da quella
   * riga — non ogni riga deve avere per forza un dettaglio.
   *
   * Aggiunge da sé una colonna col chevron (`colonnaEspansione`), come
   * `selezione` aggiunge la propria: la pagina non la scrive. **Non è
   * `getSottoRighe`**: quello innesta righe vere nel modello dati (l'albero
   * di M3bis.1, il "Computo" con le sue misurazioni); questo apre una riga
   * in più, sempre fratella mai figlia, con qualunque markup la pagina
   * voglia — la scheda di un cliente sotto la sua riga d'elenco, non un
   * altro giro di celle della stessa tabella.
   *
   * La riga di dettaglio prende tutta la larghezza (`colSpan`) ed esce dalla
   * paginazione/dallo scorrimento infinito come farebbe qualunque riga in
   * più: apre e chiude, non pagina a parte.
   */
  pannelloRiga?: (riga: TDato) => React.ReactNode
  /**
   * Cosa mettere accanto alla ricerca: i filtri della pagina, le azioni di
   * massa.
   *
   * **Nella forma a funzione riceve le righe selezionate**, ed è la sola via
   * per cui la selezione esce dalla tabella. Non c'è una `onSelezione`, e la
   * mancanza è voluta: un `onSelezione` si notifica per forza da un
   * `useEffect`, le cui dipendenze oneste sarebbero le righe scelte — un array
   * nuovo a ogni render — e la funzione della pagina, quasi sempre scritta
   * inline. L'effetto riparte, chiama `setState` nella pagina, il render
   * riparte, e React **non interrompe il ciclo e non stampa niente**
   * (`CLAUDE.md`, le trappole; costò una sessione l'8 settembre 2026). Con la
   * funzione non c'è nessun effetto: è una chiamata in fase di render, pura, e
   * le azioni di massa stanno dove servono davvero, cioè nella barra.
   */
  barra?: React.ReactNode | ((scelti: TDato[]) => React.ReactNode)
  className?: string
  /**
   * Consegna l'istanza TanStack viva a ogni render — la via d'uscita per un
   * comando che questo blocco non traduce in un prop suo (`table.toggle
   * AllRowsExpanded()`, per dire): non tutto ciò che TanStack sa fare
   * merita un prop tradotto apposta, specie un comando usato una volta
   * sola in una story. Non è uno stato che diventa controllato — resta
   * interno al blocco, come sempre — è solo un modo per **comandarlo**
   * da fuori senza doverlo duplicare. Stesso principio delle `registra*`
   * di `<DataGrid>` (`data-grid.tsx`, M3bis.5): si registra una funzione,
   * non si solleva uno stato.
   */
  onTabellaPronta?: (tabella: IstanzaTabella<TDato>) => void
  /**
   * @internal Wiring privata per `<DataGrid>` (M3bis.5), non pensata per
   * essere passata da una pagina. Con `perPagina="virtuale"`, consegna a
   * `DataTableVirtualizedBody` il controllo del fuoco — la Data Grid lo
   * sposta lei, cella per cella, non riga per riga — e l'accesso allo
   * scorrimento verticale del virtualizzatore.
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
  cerca = "Cerca…",
  vuoto = { titolo: "Non c'è ancora niente" },
  nomeRighe = { singolare: "riga", plurale: "righe" },
  perPagina = 25,
  altezza = "naturale",
  piePagina = true,
  selezione = false,
  colonneNascondibili = true,
  bloccaPrimaColonna = false,
  ridimensionabile = false,
  colonneBloccabili = false,
  getSottoRighe,
  pannelloRiga,
  barra,
  className,
  onTabellaPronta,
  internoGriglia,
  attributiTabella,
}: DataTableProps<TDato>) {
  const infinito = perPagina === "infinito"
  const virtualizzata = perPagina === "virtuale"
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
    return risultato
  }, [colonne, selezione, pannelloRiga])

  const tabella = useTable({
    features: caratteristiche,
    data: dati,
    columns: colonneEffettive,
    globalFilterFn: "includesString",
    // `expanded` non è fra gli `onChange`/`state` sotto: resta uno stato
    // interno di TanStack (come `columnOrder`), perché nessun calcolo di
    // questo componente ha bisogno di leggerlo — a differenza di
    // `rowSelection`, letto per il conto in `PaginazioneTabella`.
    getSubRows: getSottoRighe ? (riga) => getSottoRighe(riga) : undefined,
    // Senza `pannelloRiga` resta `undefined`: `getCanExpand()` ricade sul
    // predefinito di TanStack (righe con `subRows`, l'albero di M3bis.1).
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
    initialState: {
      pagination: {
        pageIndex: 0,
        // `"virtuale"` non pagina affatto: tutte le righe filtrate entrano nel
        // modello, ed è `DataTableVirtualizedBody` a decidere quali montare
        // davvero. `Number.MAX_SAFE_INTEGER` invece di ricalcolare la
        // dimensione della pagina a ogni filtro (come fa `caricate` per
        // `"infinito"`): il modello di paginazione si limita comunque al
        // numero di righe vere, una pagina più grande del possibile non
        // cambia il risultato.
        pageSize: infinito ? caricate : virtualizzata ? Number.MAX_SAFE_INTEGER : perPagina,
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
   * `filtri` è un array nuovo a ogni render (`CLAUDE.md`, la trappola delle
   * dipendenze non primitive) — la chiave lo appiattisce in una stringa,
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
  const totaleFiltrate = tabella.getFilteredRowModel().rows.length
  React.useEffect(() => {
    totaleRef.current = totaleFiltrate
  })

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
   * di prima, spostata dalla cima al fondo. Rilievo di Francesco su uno
   * screenshot: dopo l'ultima riga intera si vedeva la barra grigia del suo
   * bordo, poi uno spazio bianco — l'inizio della riga successiva, tagliata
   * — poi il bordo del riquadro.
   *
   * **`max-height`, non `height`.** Un `max-height` non forza nessuna
   * crescita: un elenco più corto del tetto resta a restringersi come già
   * fa `flex-shrink` (§ sopra), invariato — qui si limita solo il caso in
   * cui il riquadro *vorrebbe* essere più alto di un multiplo esatto di riga.
   *
   * **Non si misura il riquadro stesso — bug preso da Francesco, due volte.**
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
   * `testata + N × riga` — terzo bug preso da Francesco sulla stessa
   * storia.** Moltiplicare un'altezza di riga (sottopixel,
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
      const contenitoreTop = contenitore.getBoundingClientRect().top
      const scarto = parseFloat(getComputedStyle(radice).rowGap) || 0
      const altezzaPiePagina = elPiePagina?.getBoundingClientRect().height ?? 0
      const disponibileTotale =
        radice.getBoundingClientRect().bottom - contenitoreTop - altezzaPiePagina - scarto

      const righeVere = [...contenitore.querySelectorAll<HTMLTableRowElement>("tbody tr")].filter(
        (riga) => !riga.hasAttribute("aria-hidden")
      )
      if (righeVere.length === 0) return

      let tetto = altezzaTestata
      for (const riga of righeVere) {
        const fondoRiga = riga.getBoundingClientRect().bottom - contenitoreTop
        if (fondoRiga > disponibileTotale) break
        tetto = fondoRiga
      }
      if (tetto <= altezzaTestata) return

      // Qualche pixel di margine sul confronto: due misure dello stesso
      // valore, prese in momenti diversi, possono differire di qualche
      // sottopixel per come il browser arrotonda un `sticky` appena si
      // aggancia — senza il margine il riquadro si vedeva scattare di un
      // paio di pixel mentre si scorreva, rilievo di Francesco («guarda come
      // si sposta "220 prodotti"»). Resta ben sotto un'altezza di riga vera
      // (30 px e oltre), quindi non nasconde mai una riga che è davvero
      // entrata o uscita.
      setAltezzaMax((prima) => (prima !== undefined && Math.abs(prima - tetto) < 4 ? prima : tetto))
    }

    ricalcola()
    const ro = new ResizeObserver(ricalcola)
    ro.observe(radice)
    if (elPiePagina) ro.observe(elPiePagina)
    if (testataRef.current) ro.observe(testataRef.current)
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

  return (
    <div ref={radiceRef} className={cn("flex min-h-0 flex-col gap-4", className)}>
      {cerca !== false || barra || colonneNascondibili ? (
        <div className="flex flex-wrap items-center gap-3">
          {cerca !== false ? (
            <RicercaTabella tabella={tabella} segnaposto={cerca} />
          ) : null}
          {typeof barra === "function" ? barra(scelti) : barra}
          {colonneNascondibili ? <VisibilitaColonne tabella={tabella} /> : null}
        </div>
      ) : null}

      <div
        ref={contenitoreRef}
        style={fermo ? { maxHeight: altezzaMax } : undefined}
        className={cn(
          "overflow-hidden rounded-lg border bg-card",
          fermo &&
            "flex min-h-0 flex-col [&_[data-slot=table-container]]:snap-y [&_[data-slot=table-container]]:snap-proximity"
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
          riga — rilievo di Francesco, la riga tagliata in cima che sembrava
          un'altra barra. `proximity` e non `mandatory`: si assesta sul
          confine più vicino solo quando lo scorrimento **finisce** lì
          accanto, non forza un salto a ogni gesto — con `mandatory` uno
          scorrimento breve verrebbe risucchiato alla riga più vicina anche
          quando si voleva solo scorrere di poco.

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
        <Table ref={tabellaRef} className="table-fixed" {...attributiTabella}>
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
          */}
          <TableHeader ref={testataRef} className={cn(fermo && "sticky top-0 z-10")}>
            <TableRow className="hover:bg-transparent">
              {intestazioni.map((intestazione, indice) => {
                const ancoraColonna = colonneBloccabili
                  ? ancoraggioColonna(tabella, intestazione.column, "intestazione")
                  : undefined
                const titoloColonna =
                  (intestazione.column.columnDef.meta as MetaColonna | undefined)?.titolo ??
                  intestazione.column.id
                return (
                  <TableHead
                    key={intestazione.id}
                    className={cn(
                      !conDimensioni &&
                        (intestazione.column.columnDef.meta as MetaColonna | undefined)
                          ?.larghezza,
                      bloccoLegacy &&
                        classiBloccate(indice, selezione)?.replace("bg-card", "bg-accent"),
                      ancoraColonna?.className,
                      // `relative` **solo se non già `sticky`**: `cn` (tailwind-merge)
                      // tratta le utility di posizionamento come un gruppo solo, e le due
                      // scritte insieme si scartano a vicenda — vince l'ultima scritta.
                      // Non serve comunque: `sticky` è già un contenimento per i figli
                      // `absolute` (la maniglia di `ManigliaRidimensiona`), come `relative`.
                      !ancoraColonna && (ridimensionabile || colonneBloccabili) && "relative"
                    )}
                    style={ancoraColonna?.style}
                    aria-sort={
                      intestazione.column.getCanSort()
                        ? ariaSort(intestazione.column.getIsSorted())
                        : undefined
                    }
                  >
                    {intestazione.isPlaceholder ? null : colonneBloccabili ? (
                      <div className="flex items-center justify-between gap-1">
                        <tabella.FlexRender header={intestazione} />
                        <MenuBloccaColonna colonna={intestazione.column} titolo={titoloColonna} />
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
                      />
                    ) : null}
                  </TableHead>
                )
              })}
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
            />
          )}
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
            infinito={infinito || virtualizzata}
            nomeRighe={nomeRighe}
          />
        </div>
      ) : null}
    </div>
  )
}
