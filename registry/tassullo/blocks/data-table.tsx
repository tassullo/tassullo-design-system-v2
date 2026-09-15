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
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
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
  type ReactTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  InboxIcon,
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
 */
export const caratteristiche = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
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
 */
export type MetaColonna = {
  titolo?: string
  larghezza?: string
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

  const ordine = colonna.getIsSorted()
  const prossimo =
    ordine === false ? "crescente" : ordine === "asc" ? "decrescente" : "nessun ordine"

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
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Seleziona la riga"
      />
    ),
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
   * **Vuole un contenitore ad altezza ferma per funzionare** (altrimenti non
   * c'è niente da far scorrere): `className` deve passare `flex-1 min-h-0`,
   * e il genitore deve avere un'altezza vera a cui arrivare —
   * `<AppShell contenuto="riempie">`.
   *
   * Il menu «Righe» e i salti di pagina spariscono: non c'è una pagina da
   * saltare. Resta solo il conto, in fondo.
   */
  perPagina?: (typeof PER_PAGINA)[number] | "infinito"
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
  selezione = false,
  colonneNascondibili = true,
  bloccaPrimaColonna = false,
  barra,
  className,
}: DataTableProps<TDato>) {
  const infinito = perPagina === "infinito"
  const [ordinamento, setOrdinamento] = React.useState<SortingState>([])
  const [filtri, setFiltri] = React.useState<ColumnFiltersState>([])
  const [ricerca, setRicerca] = React.useState("")
  const [visibilita, setVisibilita] = React.useState<ColumnVisibilityState>({})
  const [scelte, setScelte] = React.useState({})

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
  const colonneEffettive = React.useMemo(
    () => (selezione ? [colonnaSelezione<TDato>(), ...colonne] : colonne),
    [colonne, selezione]
  )

  const tabella = useTable({
    features: caratteristiche,
    data: dati,
    columns: colonneEffettive,
    globalFilterFn: "includesString",
    onSortingChange: setOrdinamento,
    onColumnFiltersChange: setFiltri,
    onGlobalFilterChange: setRicerca,
    onColumnVisibilityChange: setVisibilita,
    onRowSelectionChange: setScelte,
    initialState: {
      pagination: { pageIndex: 0, pageSize: infinito ? caricate : perPagina },
    },
    state: {
      sorting: ordinamento,
      columnFilters: filtri,
      globalFilter: ricerca,
      columnVisibility: visibilita,
      rowSelection: scelte,
    },
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
  const conFiltri = ricerca.length > 0 || filtri.length > 0
  const colonneVisibili = tabella.getVisibleFlatColumns().length

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

  return (
    <div className={cn("flex min-h-0 flex-col gap-4", className)}>
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
        className={cn(
          "overflow-hidden rounded-lg border bg-card",
          infinito &&
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
        <Table className="table-fixed">
          {/*
            `sticky top-0`: la testata resta ferma mentre **`table-container`**
            scorre — il `<div overflow-x-auto>` di `Table` qui sotto, che
            l'effetto in testa al componente spiega. Non la pagina: è il
            difetto di `anagrafe.tassullo.it` che questa forma corregge — lì
            lo scorrimento infinito è della pagina intera, e la testata se ne
            va con lei.
          */}
          <TableHeader className={cn(infinito && "sticky top-0 z-10")}>
            {tabella.getHeaderGroups().map((gruppo) => (
              <TableRow key={gruppo.id} className="hover:bg-transparent">
                {gruppo.headers.map((intestazione, indice) => (
                  <TableHead
                    key={intestazione.id}
                    className={cn(
                      (intestazione.column.columnDef.meta as MetaColonna | undefined)
                        ?.larghezza,
                      bloccaPrimaColonna &&
                        classiBloccate(indice, selezione)?.replace("bg-card", "bg-accent")
                    )}
                    aria-sort={
                      intestazione.column.getCanSort()
                        ? ariaSort(intestazione.column.getIsSorted())
                        : undefined
                    }
                  >
                    {intestazione.isPlaceholder ? null : (
                      <tabella.FlexRender header={intestazione} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {righe.length > 0 ? (
              <>
                {righe.map((riga) => (
                  <TableRow
                    key={riga.id}
                    className={cn("group/riga", infinito && "snap-start")}
                    data-state={riga.getIsSelected() ? "selected" : undefined}
                  >
                    {riga.getVisibleCells().map((cella, indice) => (
                      // `truncate` è il prezzo di `table-fixed`: con le larghezze
                      // decise dalle intestazioni, un testo più lungo della sua
                      // colonna **sborda** nella colonna accanto invece di
                      // allargarla: meglio tagliarlo coi puntini.
                      <TableCell
                        key={cella.id}
                        className={cn(
                          "truncate",
                          bloccaPrimaColonna && classiBloccate(indice, selezione)
                        )}
                      >
                        <tabella.FlexRender cell={cella} />
                      </TableCell>
                    ))}
                  </TableRow>
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
                  <TabellaVuota
                    filtrata={conFiltri}
                    vuoto={vuoto}
                    onPulisci={pulisci}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginazioneTabella
        tabella={tabella}
        conSelezione={selezione}
        infinito={infinito}
        nomeRighe={nomeRighe}
      />
    </div>
  )
}
