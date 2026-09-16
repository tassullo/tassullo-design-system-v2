/**
 * `data-table-filtro-intervallo` — filtro a scorrimento su un intervallo
 * numerico, per una colonna di `tassullo-data-table`. Porting di
 * `data-table-slider-filter` (niko-table), M3bis.6 — aggiunto insieme al
 * filtro sfaccettato su richiesta di Francesco, che nella pagina di
 * riferimento di niko-table ("Faceted Filter Table") ne mostra l'uso su
 * `Price`.
 *
 * Stessa architettura di `data-table-filtro-sfaccettato.tsx`, e ne riusa
 * `righeSenzaFiltroColonna` per lo stesso motivo: il conteggio nel riquadro
 * si ricalcola sulle righe che passano ogni **altro** filtro, non sul
 * proprio. La colonna filtrata dichiara `filterFn: "inNumberRange"` —
 * registrato su `caratteristiche` in `data-table.tsx`, già pronto in
 * TanStack.
 *
 * Non si porta `column.getFacetedMinMaxValues()`/`getFacetedRowModel()` di
 * niko-table: sono un'altra caratteristica TanStack (`columnFacetingFeature`)
 * che `caratteristiche` non registra — introdurla per un solo dato, il
 * minimo e il massimo della colonna, costerebbe più di quanto rende. Min e
 * max, quando non passati a mano, si calcolano scandendo le righe correnti
 * (stessa idea di `useOpzioniSfaccettate`).
 *
 * Il grilletto: stessa forma decisa per il filtro sfaccettato dopo la
 * revisione di Francesco — il segno più diventa una X che cancella con un
 * clic, dentro allo stesso bottone (mouse-only, l'equivalente da tastiera è
 * il bottone "Cancella" nel riquadro). V. il commento su questo punto in
 * `data-table-filtro-sfaccettato.tsx`.
 */
import * as React from "react"
import type { Column, RowData } from "@tanstack/react-table"
import { PlusCircleIcon, XCircleIcon } from "lucide-react"

import { Button } from "@/registry/tassullo/ui/button"
import { Input } from "@/registry/tassullo/ui/input"
import { Label } from "@/registry/tassullo/ui/label"
import { Popover, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/registry/tassullo/ui/popover"
import { Separator } from "@/registry/tassullo/ui/separator"
import { Slider } from "@/registry/tassullo/ui/slider"

import type { CaratteristicheTabella, IstanzaTabella } from "./data-table"
import {
  BORDO_FILTRO,
  PopoverContentFerma,
  righeSenzaFiltroColonna,
} from "./data-table-filtro-sfaccettato"

function numeroDiRiga(
  riga: { getValue: (id: string) => unknown },
  accessore: string
): number | undefined {
  const grezzo = riga.getValue(accessore)
  const numero = typeof grezzo === "number" ? grezzo : Number(grezzo)
  return Number.isFinite(numero) ? numero : undefined
}

function formattaNumero(valore: number): string {
  return valore.toLocaleString("it-IT", { maximumFractionDigits: 0 })
}

export type FiltroIntervalloProps<TDato extends RowData> = {
  /** L'istanza viva della tabella — da `<DataTable onTabellaPronta>`. */
  tabella: IstanzaTabella<TDato>
  /** La colonna su cui filtrare. Deve dichiarare `filterFn: "inNumberRange"`. */
  accessore: string
  /** Il nome del filtro sul grilletto («Prezzo», «Quantità»…). */
  titolo: string
  /** Estremo minimo, invece di calcolarlo dai dati correnti. */
  min?: number
  /** Estremo massimo, invece di calcolarlo dai dati correnti. */
  max?: number
  /** Passo dello slider. Predefinito: 1, o il valore intero più vicino. */
  passo?: number
  /** Unità mostrata accanto ai valori («€», «kg»…). */
  unita?: string
}

/**
 * Il filtro, nella riga `barra` di `<DataTable>`, letto dal **secondo
 * argomento** della sua forma a funzione — `barra={(scelti, tabella) => ...}`,
 * non da `tabellaRef`/`onTabellaPronta` (v. il commento in
 * `data-table-filtro-sfaccettato.tsx`, valido identico qui: quella coppia
 * consegna l'istanza un render indietro).
 */
export function FiltroIntervallo<TDato extends RowData>({
  tabella,
  accessore,
  titolo,
  min: minManuale,
  max: maxManuale,
  passo,
  unita,
}: FiltroIntervalloProps<TDato>) {
  const [aperto, setAperto] = React.useState(false)
  const colonna = tabella.getColumn(accessore) as
    | Column<CaratteristicheTabella, TDato, unknown>
    | undefined
  const righeCore = tabella.getCoreRowModel().rows

  // Tutti gli hook prima di qualunque `return` — anche quando la colonna non
  // c'è, questo componente deve chiamarli nello stesso ordine a ogni render
  // (regola degli hook). Il controllo `!colonna` sta quindi **dopo**, appena
  // prima del render vero e proprio.
  const { min, max } = React.useMemo(() => {
    if (minManuale != null && maxManuale != null) return { min: minManuale, max: maxManuale }
    let mn = Number.POSITIVE_INFINITY
    let mx = Number.NEGATIVE_INFINITY
    for (const riga of righeCore) {
      const numero = numeroDiRiga(riga, accessore)
      if (numero === undefined) continue
      if (numero < mn) mn = numero
      if (numero > mx) mx = numero
    }
    if (!Number.isFinite(mn) || !Number.isFinite(mx)) return { min: 0, max: 100 }
    return { min: minManuale ?? mn, max: maxManuale ?? mx }
  }, [minManuale, maxManuale, righeCore, accessore])

  const valoreFiltro = colonna?.getFilterValue() as [number, number] | undefined
  const intervallo: [number, number] = valoreFiltro ?? [min, max]

  const righeFiltrate = righeSenzaFiltroColonna(tabella, righeCore, accessore)
  const conteggio = React.useMemo(() => {
    let trovate = 0
    for (const riga of righeFiltrate) {
      const numero = numeroDiRiga(riga, accessore)
      if (numero === undefined) continue
      if (numero >= intervallo[0] && numero <= intervallo[1]) trovate += 1
    }
    return trovate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [righeFiltrate, accessore, intervallo[0], intervallo[1]])

  const idBase = React.useId()

  if (!colonna) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`FiltroIntervallo: nessuna colonna "${accessore}" in questa tabella.`)
    }
    return null
  }

  const applica = (valore: [number, number] | undefined) => colonna.setFilterValue(valore)
  const azzera = () => applica(undefined)

  const onCampoMin = (testo: string) => {
    const numero = Number(testo)
    if (testo === "" || Number.isNaN(numero)) return
    applica([Math.min(numero, intervallo[1]), intervallo[1]])
  }
  const onCampoMax = (testo: string) => {
    const numero = Number(testo)
    if (testo === "" || Number.isNaN(numero)) return
    applica([intervallo[0], Math.max(numero, intervallo[0])])
  }

  return (
    <Popover open={aperto} onOpenChange={setAperto}>
      <PopoverTrigger
        render={<Button type="button" variant="outline" size="sm" className={BORDO_FILTRO} />}
      >
        {valoreFiltro ? (
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
        {valoreFiltro ? (
          <>
            <Separator orientation="vertical" />
            <span className="tabular-nums">
              {formattaNumero(valoreFiltro[0])} – {formattaNumero(valoreFiltro[1])}
              {unita ? ` ${unita}` : ""}
            </span>
          </>
        ) : null}
      </PopoverTrigger>
      <PopoverContentFerma align="start" className="flex w-64 flex-col gap-3">
        <PopoverHeader className="sr-only">
          <PopoverTitle>Filtro {titolo}</PopoverTitle>
        </PopoverHeader>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{titolo}</span>
          <span className="inline-flex h-5 items-center justify-center rounded-sm bg-secondary px-1.5 text-xs font-normal tabular-nums text-secondary-foreground">
            {conteggio}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={`${idBase}-min`} className="sr-only">
            {titolo}, valore minimo
          </Label>
          <Input
            id={`${idBase}-min`}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={intervallo[0]}
            onChange={(evento) => onCampoMin(evento.target.value)}
            className="h-8"
          />
          <span className="text-muted-foreground" aria-hidden>
            –
          </span>
          <Label htmlFor={`${idBase}-max`} className="sr-only">
            {titolo}, valore massimo
          </Label>
          <Input
            id={`${idBase}-max`}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={intervallo[1]}
            onChange={(evento) => onCampoMax(evento.target.value)}
            className="h-8"
          />
        </div>
        <Label htmlFor={`${idBase}-slider`} className="sr-only">
          {titolo}, intervallo
        </Label>
        <Slider
          id={`${idBase}-slider`}
          min={min}
          max={max}
          step={passo ?? 1}
          value={intervallo}
          onValueChange={(valore) => {
            if (Array.isArray(valore) && valore.length === 2) applica([valore[0], valore[1]])
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={azzera} disabled={!valoreFiltro}>
          Cancella
        </Button>
      </PopoverContentFerma>
    </Popover>
  )
}
