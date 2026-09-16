/**
 * `data-table-filtro-sfaccettato` — filtro a scelta multipla con conteggio
 * per opzione, per una colonna di `tassullo-data-table`. Porting da
 * niko-table (`data-table-faceted-filter` + `use-generated-options`),
 * M3bis.6.
 *
 * `data-table.tsx` ha già lo stato dei filtri per colonna
 * (`columnFilteringFeature`, sempre registrata): mancava solo l'interfaccia.
 * Questo file la aggiunge senza toccare `ui/` — è Popover + Command sopra
 * l'istanza TanStack che `<DataTable onTabellaPronta>` consegna.
 *
 * ── Cosa non si porta da niko-table, e perché ────────────────────────────
 *
 * Il loro `useGeneratedOptions` cammina **tutte** le colonne cercando quelle
 * con `meta.variant === "select" | "multiSelect"`, con tre strategie di
 * fusione fra opzioni statiche e generate (`preserve`/`augment`/`replace`).
 * Qui quel sistema di meta non esiste — M3bis.0 ha già deciso di non seguire
 * `DataTableRoot`/`detectFeaturesFromChildren` — quindi `useOpzioniSfaccettate`
 * lavora su **una** colonna alla volta, dichiarata esplicitamente da chi
 * scrive la pagina (`accessore`), ed è la sola forma coerente con come le
 * altre sessioni della FASE 3bis compongono `<DataTable>`.
 *
 * ── Il conteggio, e perché è quello e non un altro ───────────────────────
 *
 * «Ricalcolato sulle righe filtrate» (`PIANO.md`) vuol dire: le righe che
 * passano **tutti gli altri filtri** — colonna per colonna e la ricerca
 * globale — ma non il filtro di *questa* colonna. Altrimenti il proprio
 * filtro si morderebbe la coda: selezionare "Famiglia: Malte" farebbe sparire
 * ogni altra famiglia dalla propria tendina, che è l'esatto contrario di un
 * filtro a scelta multipla. `righeSenzaFiltroColonna` è il porting di
 * `getFilteredRowsExcludingColumn`: TanStack non ha un "filtered model
 * excluding column X" pronto, va ricostruito applicando a mano il
 * `filterFn` di ogni altra colonna attiva.
 *
 * ── Il check a sinistra, e perché non è la primitiva `Checkbox` ──────────
 *
 * Il segno di spunta sta a sinistra dell'etichetta, come in niko-table —
 * ma **non** è la primitiva `Checkbox`: quella è `CheckboxPrimitive.Root`
 * di Base UI, che rende `role="checkbox"` su un vero `<button>`, e un
 * bottone dentro un `<div role="option">` (`CommandItem`) è
 * `nested-interactive` per axe **a prescindere** da `aria-hidden`/
 * `tabIndex={-1}` — misurato qui: il messaggio del gate lo dice alla
 * lettera, «negative tabindex … does not prevent assistive technologies
 * from focusing the element». Un tentativo con `Checkbox` decorativa è
 * stato scritto e scartato per questo. Il segno è quindi un riquadro
 * disegnato a mano, con le stesse classi di stato di `Checkbox`
 * (`data-checked:border-primary data-checked:bg-primary…`) ma su uno
 * `<span aria-hidden>` — nessun ruolo, nessun elemento nativamente
 * interattivo, solo `CommandItem` resta un bersaglio da tastiera.
 *
 * `CommandItem` di questo registry porta anche un proprio segno di spunta
 * incorporato, sempre reso a destra (`ml-auto`, la stessa convenzione di
 * `SelectItem`) — qui inutile visto che il segno sta già a sinistra, e
 * **in mezzo** al conteggio se lasciato acceso: due elementi con `ml-auto`
 * si dividono lo spazio residuo, e il conteggio non arriverebbe mai al
 * bordo vero della riga. Si nasconde con `[&>svg:last-child]:hidden` — una
 * stringa di classi, non un tocco alla primitiva (gradino 2 di 4bis) — e il
 * conteggio, ultimo figlio rimasto con `ml-auto`, prende davvero l'ultimo
 * pixel.
 *
 * ── Il grilletto porta i valori scelti, non un numero ────────────────────
 *
 * Come niko-table: fino a due opzioni scelte, il grilletto mostra le loro
 * etichette come pillole; da tre in su, «N selezionati». Un conteggio da
 * solo («1», «2»…) non dice *cosa* è filtrato senza aprire la tendina — il
 * punto di un filtro visibile in barra.
 *
 * ── La «X» è dentro il bottone del grilletto, ed è solo per il mouse ─────
 *
 * Come in niko-table: da selezione fatta, l'icona del grilletto diventa una
 * X che cancella il filtro con un clic, senza aprire la tendina — non un
 * bottone separato accanto (scartato: Francesco l'ha corretto rivedendo
 * questa sessione, niko-table non ce l'ha). È però **solo** un'accortezza
 * per il mouse (`aria-hidden`, nessun `role`, nessun fuoco proprio): un
 * controllo vero — un `<button>`, o qualunque cosa con un ruolo interattivo
 * — annidato dentro il `<button>` del grilletto sarebbe HTML non valido e
 * `nested-interactive` per axe **anche con** `tabIndex={-1}` (misurato
 * altrove in questo file, sul segno di spunta delle opzioni — stesso
 * principio, stessa regola). L'equivalente da tastiera resta sempre
 * raggiungibile: "Cancella i filtri" dentro la tendina, un'azione vera con
 * `Invio`. Stesso compromesso già scritto per il `combobox` in D14
 * (`CLAUDE.md`) — un'azione mouse-only non è un buco, se altrove nello
 * stesso controllo esiste la stessa azione in una forma che la tastiera
 * raggiunge.
 */
import * as React from "react"
import type { Column, Row, RowData } from "@tanstack/react-table"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { CheckIcon, PlusCircleIcon, XCircleIcon } from "lucide-react"

import { cn } from "cn"
import { Badge } from "@/registry/tassullo/ui/badge"
import { Button } from "@/registry/tassullo/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/tassullo/ui/command"
import { Popover, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/registry/tassullo/ui/popover"
import { Separator } from "@/registry/tassullo/ui/separator"

import type { CaratteristicheTabella, IstanzaTabella } from "./data-table"

/**
 * Il bordo tratteggiato del grilletto di un filtro — non una variante di
 * `Button` (quella non esiste in shadcn, e comporrebbe un cambio di forma
 * sulla primitiva, il gradino da confermare esplicitamente): è la stessa
 * composizione che usa l'esempio shadcn del filtro sfaccettato,
 * `variant="outline"` più questa classe. Una costante sola, non la stringa
 * scritta a mano in ognuno dei quattro filtri, così uno scostamento
 * (colore, spessore) si cambia in un punto solo. `FiltroResetTutti` non la
 * usa: è un bottone pieno, non un filtro removibile.
 */
export const BORDO_FILTRO = "border-dashed"

/**
 * Come `PopoverContent` di `ui/popover.tsx`, con una sola differenza:
 * `collisionAvoidance={{ side: "shift", fallbackAxisSide: "none" }}`, che
 * quella primitiva non espone (aggiungerlo lì è un cambio di forma, non di
 * classi — il gradino che `CLAUDE.md` §4bis riserva a una conferma
 * esplicita, non a questa sessione). Qui la tendina resta **sempre sotto**
 * il grilletto, spostata in orizzontale se lo spazio manca, mai su un
 * fianco — i grilletti di questi filtri stanno in una riga di bottoni
 * affiancati che crescono in larghezza a ogni scelta (v. `barra` in
 * `data-table.tsx`); se Base UI sposta la tendina di lato per mancanza di
 * spazio sotto, resta agganciata al bordo che si sposta insieme al
 * bottone, e sembra "scappare" a ogni clic — misurato: nel riquadro
 * ridotto di uno storybook con l'addon aperto sotto, succede davvero.
 * Esportata: la usano anche `data-table-filtro-intervallo.tsx` e
 * `data-table-filtro-data.tsx`.
 */
export function PopoverContentFerma({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        collisionAvoidance={{ side: "shift", fallbackAxisSide: "none" }}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

/** Un'opzione del filtro: il valore che la colonna porta, e come si legge. */
export type OpzioneFiltro = {
  value: string
  label: string
  count?: number
}

/** `"pubblicato"` → `"Pubblicato"`. Solo la prima lettera: sono già parole. */
function formattaEtichetta(valore: string): string {
  return valore.length > 0 ? valore.charAt(0).toUpperCase() + valore.slice(1) : valore
}

/**
 * Le righe che passano ogni filtro **tranne** quello della colonna
 * `chiaveColonna` — colonna per colonna, più la ricerca globale. Porting di
 * `getFilteredRowsExcludingColumn` (niko-table): TanStack non applica un
 * singolo `filterFn` isolatamente, quindi si richiama quello già registrato
 * su ciascun'altra colonna attiva, uno a uno.
 *
 * **Esportata**: la usano anche `data-table-filtro-intervallo.tsx` e
 * `data-table-filtro-data.tsx` — stesso bisogno, «quante righe rispettano
 * gli altri filtri», sia per l'elenco delle opzioni sia per il conteggio nel
 * riquadro dell'intervallo.
 */
export function righeSenzaFiltroColonna<TDato extends RowData>(
  tabella: IstanzaTabella<TDato>,
  righeCore: readonly Row<CaratteristicheTabella, TDato>[],
  chiaveColonna: string,
): readonly Row<CaratteristicheTabella, TDato>[] {
  const altriFiltri = tabella.state.columnFilters.filter((filtro) => filtro.id !== chiaveColonna)
  const ricerca = tabella.state.globalFilter

  if (altriFiltri.length === 0 && !ricerca) return righeCore

  const filtraGlobale = ricerca ? tabella.getGlobalFilterFn() : undefined

  return righeCore.filter((riga) => {
    for (const filtro of altriFiltri) {
      const colonna = tabella.getColumn(filtro.id)
      const filtraColonna = colonna?.getFilterFn()
      if (filtraColonna && !filtraColonna(riga, filtro.id, filtro.value, () => {})) return false
    }
    if (filtraGlobale && !filtraGlobale(riga, "__globale__", ricerca, () => {})) return false
    return true
  })
}

/**
 * Le opzioni di un filtro sfaccettato su `chiaveColonna`, con il conteggio
 * ricalcolato sulle righe filtrate dalle **altre** colonne. Senza
 * `opzioniStatiche`, le opzioni sono i valori distinti che la colonna porta
 * — è la forma giusta per `stato`/`famiglia`, dove l'elenco possibile non è
 * dichiarato altrove. Un valore già scelto resta in elenco anche a conteggio
 * zero: toglierlo lo renderebbe impossibile da deselezionare.
 */
export function useOpzioniSfaccettate<TDato extends RowData>(
  tabella: IstanzaTabella<TDato>,
  chiaveColonna: string,
  opzioniStatiche?: OpzioneFiltro[],
): OpzioneFiltro[] {
  const righeCore = tabella.getCoreRowModel().rows
  const filtriColonna = tabella.state.columnFilters
  const ricerca = tabella.state.globalFilter

  return React.useMemo((): OpzioneFiltro[] => {
    const righeFiltrate = righeSenzaFiltroColonna(tabella, righeCore, chiaveColonna)
    const selezionate = new Set(
      (filtriColonna.find((filtro) => filtro.id === chiaveColonna)?.value as string[] | undefined) ?? []
    )

    const conteggi = new Map<string, number>()
    for (const riga of righeFiltrate) {
      const grezzo = riga.getValue(chiaveColonna) as unknown
      if (grezzo == null) continue
      const valore = String(grezzo)
      if (!valore) continue
      conteggi.set(valore, (conteggi.get(valore) ?? 0) + 1)
    }

    if (opzioniStatiche) {
      return opzioniStatiche
        .filter((opzione) => conteggi.has(opzione.value) || selezionate.has(opzione.value))
        .map((opzione) => ({ ...opzione, count: conteggi.get(opzione.value) ?? 0 }))
    }

    for (const valore of selezionate) {
      if (!conteggi.has(valore)) conteggi.set(valore, 0)
    }

    return Array.from(conteggi.entries())
      .map(([value, count]) => ({ value, label: formattaEtichetta(value), count }))
      .sort((a, b) => a.label.localeCompare(b.label, "it"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabella, righeCore, chiaveColonna, filtriColonna, ricerca, opzioniStatiche])
}

export type FiltroSfaccettatoProps<TDato extends RowData> = {
  /** L'istanza viva della tabella — da `<DataTable onTabellaPronta>`. */
  tabella: IstanzaTabella<TDato>
  /** La colonna su cui filtrare. Deve dichiarare `filterFn: "arrHas"`. */
  accessore: string
  /** Il nome del filtro sul grilletto («Stato», «Famiglia»…). */
  titolo: string
  /**
   * Elenco fisso delle opzioni, invece di derivarle dai dati. Utile quando i
   * valori possibili sono più dei valori presenti nella pagina corrente di
   * dati finti/di prova, o quando l'ordine non deve essere alfabetico.
   */
  opzioni?: OpzioneFiltro[]
}

/**
 * Il filtro, nella riga `barra` di `<DataTable>`. Va passato nella **forma a
 * funzione**, leggendo `tabella` dal suo **secondo argomento**
 * (`barra={(scelti, tabella) => <FiltroSfaccettato tabella={tabella} ... />}`)
 * — non da un `tabellaRef` riempito con `onTabellaPronta`: quella coppia
 * consegna l'istanza **dopo** il commit, in un effetto, ed è un render
 * indietro rispetto a quella che `barra` sta già ricevendo qui (misurato:
 * un `<FiltroResetTutti>` composto con `tabellaRef` restava invisibile un
 * render oltre il dovuto). `barra` va comunque nella forma a funzione e non
 * come nodo fisso, sempre per lo stesso motivo di fondo — rileggere uno
 * stato dei filtri che cambia da fuori (un'altra faccetta sulla stessa
 * barra, la ricerca globale) — ma ora la fonte giusta è l'argomento, non un
 * ref. V. il commento su `barra` in `data-table.tsx`.
 */
export function FiltroSfaccettato<TDato extends RowData>({
  tabella,
  accessore,
  titolo,
  opzioni: opzioniStatiche,
}: FiltroSfaccettatoProps<TDato>) {
  const [aperto, setAperto] = React.useState(false)
  const colonna = tabella.getColumn(accessore) as
    | Column<CaratteristicheTabella, TDato, unknown>
    | undefined
  const opzioni = useOpzioniSfaccettate(tabella, accessore, opzioniStatiche)

  if (!colonna) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`FiltroSfaccettato: nessuna colonna "${accessore}" in questa tabella.`)
    }
    return null
  }

  const selezionate = new Set((colonna.getFilterValue() as string[] | undefined) ?? [])

  const alternaOpzione = (valore: string) => {
    const nuove = new Set(selezionate)
    if (nuove.has(valore)) nuove.delete(valore)
    else nuove.add(valore)
    colonna.setFilterValue(nuove.size > 0 ? Array.from(nuove) : undefined)
  }

  const azzera = () => colonna.setFilterValue(undefined)

  const etichetteScelte = opzioni.filter((opzione) => selezionate.has(opzione.value))

  return (
    <Popover open={aperto} onOpenChange={setAperto}>
      <PopoverTrigger
        render={<Button type="button" variant="outline" size="sm" className={BORDO_FILTRO} />}
      >
        {selezionate.size > 0 ? (
          // Sostituisce il «+»: un clic cancella il filtro senza aprire la
          // tendina. Non è un controllo separato (niente `role`/fuoco
          // proprio) — un bottone vero qui dentro sarebbe `nested-interactive`
          // per axe (v. il commento in testa al file sul segno di spunta) —
          // quindi resta **solo** un'accortezza per il mouse: l'equivalente
          // da tastiera è "Cancella i filtri" nella tendina, sempre
          // raggiungibile con Invio dopo aver aperto il grilletto. Stesso
          // compromesso già scritto per il `combobox` in D14
          // (`CLAUDE.md`): l'azione resta disponibile in una forma
          // accessibile, non sparisce.
          <span
            aria-hidden
            onPointerDown={(evento) => evento.stopPropagation()}
            onClick={(evento) => {
              evento.stopPropagation()
              azzera()
            }}
            className="-my-1 -ml-1 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100"
          >
            <XCircleIcon aria-hidden />
          </span>
        ) : (
          <PlusCircleIcon aria-hidden />
        )}
        {titolo}
        {selezionate.size > 0 ? (
          <>
            {/* Nessuna altezza propria: `data-vertical:self-stretch` (di
                default su `Separator`) la fa alta quanto il bottone — un
                `h-4` fisso la fermava a metà, rilievo di Francesco. */}
            <Separator orientation="vertical" />
            {selezionate.size > 2 ? (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal tabular-nums">
                {selezionate.size} selezionati
              </Badge>
            ) : (
              etichetteScelte.map((opzione) => (
                <Badge key={opzione.value} variant="secondary" className="rounded-sm px-1 font-normal">
                  {opzione.label}
                </Badge>
              ))
            )}
          </>
        ) : null}
      </PopoverTrigger>
      <PopoverContentFerma align="start" className="w-56 p-0">
        {/* Un popover con contenuto interattivo è `role="dialog"` (v.
            `popover.stories.tsx`) e vuole un nome accessibile — qui in
            `sr-only`, perché il grilletto già dice "Stato"/"Famiglia" a chi
            vede lo schermo. */}
        <PopoverHeader className="sr-only">
          <PopoverTitle>Filtro {titolo}</PopoverTitle>
        </PopoverHeader>
        <Command>
          <CommandInput placeholder={titolo} />
          <CommandList>
            <CommandEmpty>Nessun risultato.</CommandEmpty>
            {/* Niente `CommandSeparator` qui dentro: `CommandList` è un
                `listbox` e un `separator` non è un figlio ammesso (v. la
                nota in `command.stories.tsx`). Due `CommandGroup` bastano a
                separare le opzioni da "Cancella i filtri". */}
            <CommandGroup>
              {opzioni.map((opzione) => {
                const scelta = selezionate.has(opzione.value)
                return (
                  <CommandItem
                    key={opzione.value}
                    value={opzione.label}
                    onSelect={() => alternaOpzione(opzione.value)}
                    // Il segno di spunta incorporato di `CommandItem` va a
                    // destra (`ml-auto`, v. il commento in testa al file):
                    // qui il segno sta a sinistra, e lasciarlo acceso
                    // conteso lo spazio col conteggio.
                    className="[&>svg:last-child]:hidden"
                  >
                    <span
                      aria-hidden
                      data-checked={scelta || undefined}
                      className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-input data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground"
                    >
                      {scelta ? <CheckIcon className="size-3.5" /> : null}
                    </span>
                    <span className="truncate">{opzione.label}</span>
                    {opzione.count !== undefined ? (
                      <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
                        {opzione.count}
                      </span>
                    ) : null}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selezionate.size > 0 ? (
              <CommandGroup>
                <CommandItem
                  value="cancella-filtri"
                  onSelect={azzera}
                  className="justify-center text-center [&>svg:last-child]:hidden"
                >
                  Cancella i filtri
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContentFerma>
    </Popover>
  )
}
