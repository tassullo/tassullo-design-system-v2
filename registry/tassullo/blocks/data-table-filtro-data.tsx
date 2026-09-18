/**
 * `data-table-filtro-data` — filtro a intervallo di date, per una colonna
 * di `tassullo-data-table`. Porting di `data-table-date-filter` (niko-table,
 * solo la variante a intervallo — la pagina di riferimento di Francesco,
 * "Faceted Filter Table", usa solo quella), M3bis.6.
 *
 * La colonna filtrata dichiara `filterFn: "inDateRange"` — registrato su
 * `caratteristiche` in `data-table.tsx`, già pronto in TanStack: un capo
 * assente conta come aperto, quindi «dal 3 settembre in poi» è un filtro
 * valido con un solo estremo scelto.
 *
 * `Calendar` è la stessa primitiva di `ui/calendar.tsx` — nessun ri-stile —
 * con `mode="range"`, `locale={it}` e `captionLayout="dropdown"` (i menu
 * mese/anno, come `ConMenuMeseEAnno` nella sua story). **D15 resta**: la
 * tastiera non naviga la griglia dei giorni (`docs/DECISIONI.md`) — non è
 * un difetto di questa sessione, è il limite già accertato della primitiva.
 *
 * Stesso grilletto (icona che diventa una X cliccabile, mouse-only, v. il
 * commento in `data-table-filtro-sfaccettato.tsx`) e stessa idea di
 * "riquadro d'appoggio" del filtro a intervallo numerico — qui senza
 * conteggio: niko-table non lo mostra per le date, e un conteggio su un
 * intervallo che può restare aperto a un solo capo darebbe un numero che
 * cambia a ogni giorno del calendario, poco leggibile in un riquadro così
 * piccolo.
 */
import * as React from "react"
import type { Column, RowData } from "@tanstack/react-table"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { CalendarIcon, XCircleIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/registry/tassullo/ui/button"
import { Calendar } from "@/registry/tassullo/ui/calendar"
import { Popover, PopoverTrigger } from "@/registry/tassullo/ui/popover"
import { Separator } from "@/registry/tassullo/ui/separator"

import type { CaratteristicheTabella, IstanzaTabella } from "./data-table"
import { BORDO_FILTRO, PopoverContentFerma } from "./data-table-filtro-sfaccettato"

type IntervalloData = [number | undefined, number | undefined] | undefined

export type FiltroDataProps<TDato extends RowData> = {
  /** L'istanza viva della tabella — da `<DataTable onTabellaPronta>`. */
  tabella: IstanzaTabella<TDato>
  /** La colonna su cui filtrare. Deve dichiarare `filterFn: "inDateRange"`. */
  accessore: string
  /** Il nome del filtro sul grilletto («Aggiornato», «Pubblicato»…). */
  titolo: string
}

function formattaData(valore: number): string {
  return format(new Date(valore), "d MMM yyyy", { locale: it })
}

/**
 * Il filtro, nella riga `barra` di `<DataTable>`, letto dal **secondo
 * argomento** della sua forma a funzione — `barra={(scelti, tabella) => ...}`,
 * non da `tabellaRef`/`onTabellaPronta` (v. il commento in
 * `data-table-filtro-sfaccettato.tsx`, valido identico qui: quella coppia
 * consegna l'istanza un render indietro).
 */
export function FiltroData<TDato extends RowData>({
  tabella,
  accessore,
  titolo,
}: FiltroDataProps<TDato>) {
  const [aperto, setAperto] = React.useState(false)
  const colonna = tabella.getColumn(accessore) as
    | Column<CaratteristicheTabella, TDato, unknown>
    | undefined

  if (!colonna) {
    // `import.meta.env.DEV` e non `process.env.NODE_ENV`: `process` non
    // esiste in un'app Vite appena creata, e il typecheck del consumatore si
    // ferma su «Cannot find name 'process'» benché a runtime funzioni
    // (misurato nel gate di fine FASE 4, M4.6).
    if (import.meta.env.DEV) {
      console.warn(`FiltroData: nessuna colonna "${accessore}" in questa tabella.`)
    }
    return null
  }

  const valoreFiltro = colonna.getFilterValue() as IntervalloData
  const intervallo: DateRange = {
    from: valoreFiltro?.[0] != null ? new Date(valoreFiltro[0]) : undefined,
    to: valoreFiltro?.[1] != null ? new Date(valoreFiltro[1]) : undefined,
  }
  const haValore = Boolean(intervallo.from || intervallo.to)

  const applica = (nuovo: DateRange | undefined) => {
    const from = nuovo?.from?.getTime()
    const to = nuovo?.to?.getTime()
    colonna.setFilterValue(from || to ? [from, to] : undefined)
  }
  const azzera = () => colonna.setFilterValue(undefined)

  return (
    <Popover open={aperto} onOpenChange={setAperto}>
      <PopoverTrigger
        render={<Button type="button" variant="outline" size="sm" className={BORDO_FILTRO} />}
      >
        {haValore ? (
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
          <CalendarIcon aria-hidden />
        )}
        {titolo}
        {haValore ? (
          <>
            <Separator orientation="vertical" />
            {intervallo.from && intervallo.to ? (
              <span>
                {formattaData(intervallo.from.getTime())} – {formattaData(intervallo.to.getTime())}
              </span>
            ) : (
              <span>
                {formattaData((intervallo.from ?? intervallo.to)!.getTime())}
              </span>
            )}
          </>
        ) : null}
      </PopoverTrigger>
      <PopoverContentFerma className="w-auto p-0" align="start" aria-label={`Calendario, filtro ${titolo}`}>
        <Calendar mode="range" locale={it} captionLayout="dropdown" selected={intervallo} onSelect={applica} />
      </PopoverContentFerma>
    </Popover>
  )
}
