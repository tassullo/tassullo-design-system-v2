/**
 * `tassullo-pagina-lista` — la pagina più ripetuta in assoluto (FASE 4, M4.2).
 *
 * In Anagrafe è Prodotti, Famiglie, Norme, Sistemi, Pubblicazioni, ChangeSets
 * — sei volte la stessa pagina, scritta sei volte: intestazione con azione
 * primaria, barra filtri, `data-table` con paginazione, stati vuoto /
 * caricamento / errore. Questo blocco è quella forma, ricavata componendo
 * ciò che il registry ha già — `tassullo-page-header`, `tassullo-data-table`,
 * `tassullo-empty-state`, `tassullo-error-state`, `tassullo-page-skeleton` —
 * zero primitive nuove, zero CSS di pagina.
 *
 * **`stato` sceglie fra tre rese, non tre booleani indipendenti** — stessa
 * ragione di `PaginaLogin` (M4.1): `caricamento` ed `errore` che potrebbero
 * essere veri insieme non hanno un senso da rendere. `pronto` (il default)
 * è l'unico stato in cui `dati` conta.
 *
 * **`vuotoIniziale` è un caso a parte da `vuoto`**, e sono due vuoti diversi
 * con la stessa causa apparente — «la tabella non ha righe» — ma un rimedio
 * diverso. `vuoto` (passato a `DataTable`) è *la ricerca o il filtro non
 * trovano niente*: si chiude togliendo il filtro, e `DataTable` lo rende da
 * sé. `vuotoIniziale` è *non esiste ancora nessuna riga*: la CTA non è
 * «pulisci i filtri», è «crea il primo record» — `EmptyState` al posto della
 * tabella, non dentro. `INTERFACCE.md` §1.1 di Anagrafe vuole i due stati
 * distinti, e il v1 li confondeva in un unico paragrafo. Senza
 * `vuotoIniziale`, una pagina con zero righe passa comunque a `DataTable`,
 * che rende la sola intestazione — corretto per un elenco che filtra a zero,
 * sbagliato per un elenco mai popolato: è la pagina che sa quale dei due casi
 * sta vivendo.
 */
import type { ReactNode } from "react"
import type { RowData } from "@tanstack/react-table"

import { cn } from "cn"
import {
  DataTable,
  type ColonnaTabella,
  type DataTableProps,
  type NomeRighe,
  type StatoVuoto,
} from "@/registry/tassullo/blocks/data-table"
import { EmptyState } from "@/registry/tassullo/blocks/empty-state"
import { ErrorState } from "@/registry/tassullo/blocks/error-state"
import { PageHeader, type AzionePagina, type LivelloPercorso } from "@/registry/tassullo/blocks/page-header"
import { PageSkeleton } from "@/registry/tassullo/blocks/page-skeleton"

export type VuotoIniziale = {
  icona?: ReactNode
  titolo: ReactNode
  descrizione?: ReactNode
  /** La CTA che crea il primo record — non «pulisci i filtri». */
  azione?: ReactNode
}

export type PaginaListaProps<TDato extends RowData> = {
  /** Il percorso dell'intestazione — passa a `PageHeader`, che lo porta nella fascia. */
  percorso: LivelloPercorso[]
  /** Le azioni di pagina — una sola `primaria`. */
  azioni?: AzionePagina[]
  colonne: ColonnaTabella<TDato>[]
  dati: TDato[]
  /** Uno dei tre stati. `pronto` di default: solo lì `dati` conta. */
  stato?: "pronto" | "caricamento" | "errore"
  /** Il messaggio d'errore, già tradotto — mai un codice, mai uno stack. */
  messaggioErrore?: ReactNode
  onRiprovaErrore?: () => void
  /**
   * *Non esiste ancora nessuna riga*, distinto dal vuoto-per-filtro che
   * `DataTable` gestisce da sé (`vuoto`). Assente, una `dati` vuota passa
   * comunque alla tabella, che rende solo l'intestazione — voluto per un
   * elenco che filtra a zero.
   */
  vuotoIniziale?: VuotoIniziale
  /** Passati a `DataTable`. */
  cerca?: DataTableProps<TDato>["cerca"]
  vuoto?: StatoVuoto
  nomeRighe?: NomeRighe
  perPagina?: DataTableProps<TDato>["perPagina"]
  bloccaPrimaColonna?: boolean
  barra?: DataTableProps<TDato>["barra"]
  /**
   * Passati a `DataTable` — le capacità di FASE 3bis (niko-table) rilevanti
   * per una pagina **sola lista**: colonne che si ridimensionano, si
   * bloccano, si riordinano, e un menu di riga condiviso fra tendina e tasto
   * destro. `idRiga` è **richiesto** insieme a `menuRiga` o a un futuro
   * riordino righe (v. `DataTableProps.idRiga`, `data-table.tsx`).
   */
  idRiga?: DataTableProps<TDato>["idRiga"]
  ridimensionabile?: DataTableProps<TDato>["ridimensionabile"]
  colonneBloccabili?: DataTableProps<TDato>["colonneBloccabili"]
  colonneRiordinabili?: DataTableProps<TDato>["colonneRiordinabili"]
  menuRiga?: DataTableProps<TDato>["menuRiga"]
  className?: string
}

export function PaginaLista<TDato extends RowData>({
  percorso,
  azioni,
  colonne,
  dati,
  stato = "pronto",
  messaggioErrore = "Non è stato possibile caricare l'elenco. Riprova.",
  onRiprovaErrore,
  vuotoIniziale,
  cerca,
  vuoto,
  nomeRighe,
  perPagina,
  bloccaPrimaColonna,
  barra,
  idRiga,
  ridimensionabile,
  colonneBloccabili,
  colonneRiordinabili,
  menuRiga,
  className,
}: PaginaListaProps<TDato>) {
  return (
    // `pagina-lista` **è** la pagina — a differenza di una tabella imbarcata
    // dentro una `pagina-scheda` (una fra più sezioni) — quindi riempie
    // sempre lo spazio che `<AppShell contenuto="riempie">` concede,
    // a prescindere da come `perPagina` carica le righe: `altezza="ferma"`
    // su `DataTable` (sotto) apre lo scorrimento interno tanto con
    // `perPagina="infinito"` quanto con una `perPagina` numerica — prima di
    // questa distinzione (`data-table.tsx`, `DataTableProps.altezza`) la
    // paginazione numerica non aveva questo riquadro, e con più righe di
    // quante ne stiano a schermo il piè usciva dalla vista finché non si
    // scorreva tutta la pagina (rilievo di Francesco, coda di M4.2).
    <div data-slot="pagina-lista" className={cn("flex h-full min-h-0 flex-col gap-4", className)}>
      <PageHeader percorso={percorso} azioni={azioni} />

      {stato === "caricamento" ? (
        <PageSkeleton variante="tabella" className="flex-1" />
      ) : stato === "errore" ? (
        <ErrorState messaggio={messaggioErrore} onRiprova={onRiprovaErrore} className="flex-1" />
      ) : vuotoIniziale && dati.length === 0 ? (
        <EmptyState
          icona={vuotoIniziale.icona}
          titolo={vuotoIniziale.titolo}
          descrizione={vuotoIniziale.descrizione}
          azione={vuotoIniziale.azione}
          className="mx-auto max-w-md"
        />
      ) : (
        <DataTable
          colonne={colonne}
          dati={dati}
          cerca={cerca}
          vuoto={vuoto}
          nomeRighe={nomeRighe}
          perPagina={perPagina}
          altezza="ferma"
          bloccaPrimaColonna={bloccaPrimaColonna}
          barra={barra}
          idRiga={idRiga}
          ridimensionabile={ridimensionabile}
          colonneBloccabili={colonneBloccabili}
          colonneRiordinabili={colonneRiordinabili}
          menuRiga={menuRiga}
          className="min-h-0 flex-1"
        />
      )}
    </div>
  )
}
