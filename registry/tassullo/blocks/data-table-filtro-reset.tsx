/**
 * `data-table-filtro-reset` — un bottone «Reset» che cancella insieme tutti
 * i filtri per colonna di `tassullo-data-table` (le faccette, gli
 * intervalli, le date), e sparisce da sé quando non c'è niente da
 * cancellare. Porting di `data-table-clear-filter` (niko-table), M3bis.6.
 *
 * **Non tocca la ricerca globale né l'ordinamento**, a differenza di
 * `TableClearFilter` di niko-table (che li azzera entrambi di default,
 * `enableResetGlobalFilter`/`enableResetSorting` a `true`): nella pagina di
 * riferimento di Francesco ("Faceted Filter Table") il campo di ricerca
 * resta un controllo a parte, e mischiarlo in un solo bottone «Reset»
 * cancellerebbe un testo che l'utente ha appena scritto senza che il
 * bottone lo dica. Chi vuole quel comportamento lo scrive esplicitamente —
 * `tabella.setGlobalFilter("")`/`tabella.resetSorting()` accanto a
 * `<FiltroResetTutti>` — non è il default silenzioso.
 */
import type { RowData } from "@tanstack/react-table"
import { XIcon } from "lucide-react"

import { Button } from "@/registry/tassullo/ui/button"

import type { IstanzaTabella } from "./data-table"

export type FiltroResetTuttiProps<TDato extends RowData> = {
  /**
   * L'istanza viva della tabella — dal **secondo argomento** della forma a
   * funzione di `barra`, non da `tabellaRef`/`onTabellaPronta` (v. il
   * commento in `data-table-filtro-sfaccettato.tsx`: quella coppia consegna
   * l'istanza un render indietro, e qui si vedrebbe subito — il bottone
   * resterebbe visibile un render oltre quando i filtri tornano a zero, o
   * invisibile un render oltre quando il primo filtro viene impostato).
   */
  tabella: IstanzaTabella<TDato>
}

/**
 * Nella riga `barra` di `<DataTable>`, nella forma a funzione — stesso
 * motivo delle altre `Filtro*` di questo file (v. il commento in
 * `data-table-filtro-sfaccettato.tsx`): deve rileggere lo stato dei filtri
 * a ogni render per sapere se ha ancora qualcosa da cancellare.
 */
export function FiltroResetTutti<TDato extends RowData>({ tabella }: FiltroResetTuttiProps<TDato>) {
  const haFiltriAttivi = tabella.state.columnFilters.length > 0

  if (!haFiltriAttivi) return null

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => tabella.resetColumnFilters()}
    >
      <XIcon aria-hidden />
      Reset
    </Button>
  )
}
