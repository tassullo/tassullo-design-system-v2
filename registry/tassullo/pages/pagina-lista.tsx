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
import { useSoglia } from "@/registry/tassullo/hooks/use-soglia"

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
  // Passati a `DataTable` — le capacità rilevanti
  // per una pagina **sola lista**: colonne che si ridimensionano, si
  // bloccano, si riordinano, e un menu di riga condiviso fra tendina e tasto
  // destro. `idRiga` è **richiesto** insieme a `menuRiga` o a un futuro
  // riordino righe (v. `DataTableProps.idRiga`, `data-table.tsx`).
  /**
   * Passano a `tassullo-data-table`: colonne che si ridimensionano, si
   * bloccano, si riordinano, e il menu di riga dalla tendina o col tasto
   * destro. `idRiga` serve insieme a `menuRiga`.
   */
  idRiga?: DataTableProps<TDato>["idRiga"]
  ridimensionabile?: DataTableProps<TDato>["ridimensionabile"]
  colonneBloccabili?: DataTableProps<TDato>["colonneBloccabili"]
  colonneRiordinabili?: DataTableProps<TDato>["colonneRiordinabili"]
  menuRiga?: DataTableProps<TDato>["menuRiga"]
  // **La seconda faccia, per quando la tabella non ci sta.**
  //
  // Passandola, sotto `soglia` il blocco rende **questo** al posto della
  // `DataTable` — e con lei spariscono `cerca`, `barra` e la paginazione,
  // che sono contorno della tabella: i comandi della faccia stretta li porta
  // `facciaStretta` stessa. Testata, i tre `stato` e `vuotoIniziale` restano
  // del blocco, perché non cambiano con la larghezza.
  //
  // **Il blocco sceglie *quando*, non *cosa***: `useSoglia` è il bivio e sta nel
  // registry; la faccia stretta la scrive la pagina, perché le due facce non
  // sono la stessa lista impaginata due volte — quante colonne diventano un
  // raggruppamento, quale filtro sopravvive e cosa resta sulla scheda lo sa
  // solo chi quella lista la conosce.
  //
  // Assente, la pagina resta a una faccia a ogni larghezza.
  /**
   * La seconda forma della pagina, per quando la tabella non ci sta: sotto
   * `soglia` il blocco rende questo nodo al posto della tabella. Con la tabella
   * se ne vanno la ricerca, la `barra` e la paginazione; i comandi delle
   * schede li porta `facciaStretta`. La fascia, gli `stato` e `vuotoIniziale`
   * restano del blocco.
   *
   * Il blocco sceglie quando, la pagina scrive cosa: quale colonna diventa un
   * raggruppamento, quale filtro resta, cosa entra nella scheda. Assente, la
   * pagina ha una forma sola a ogni larghezza.
   */
  facciaStretta?: ReactNode
  /**
   * La media query che decide. Default **1024px**, la soglia di Officina
   * (`useDesktop()`); Studio RadarOpere usa 900. **Non si deriva da quante
   * colonne ha la tabella**: se la tabella non ci sta, la risposta è
   * scorrere — con `bloccaPrimaColonna` a tenere ferma la colonna
   * d'identità — non alzare la soglia, che sposterebbe sul telefono una
   * pagina che sulla scrivania funzionava.
   */
  soglia?: string
  // `"auto"` (default) lascia decidere a `soglia`. Le altre due rendono una
  // faccia **in modo deterministico**, e servono alle story: `useSoglia`
  // legge una media query sulla **finestra**, e la larghezza della finestra
  // non si commuta dal canvas di Storybook — una scena che dipendesse
  // dall'hook renderebbe, in una prova automatica, il ramo che capita.
  /**
   * `"auto"`, il predefinito, lascia decidere a `soglia`. `"tabella"` e
   * `"schede"` rendono una faccia fissa a ogni larghezza: per una scena di
   * documentazione o una prova automatica, dove la forma non deve dipendere
   * dalla finestra.
   */
  faccia?: "auto" | "tabella" | "schede"
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
  facciaStretta,
  soglia = "(min-width: 1024px)",
  faccia = "auto",
  className,
}: PaginaListaProps<TDato>) {
  const largoDavvero = useSoglia(soglia)
  const largo = faccia === "auto" ? largoDavvero : faccia === "tabella"
  const aSchede = !!facciaStretta && !largo

  return (
    // `pagina-lista` **è** la pagina — a differenza di una tabella imbarcata
    // dentro una `pagina-scheda` (una fra più sezioni) — quindi riempie
    // sempre lo spazio che `<AppShell contenuto="riempie">` concede,
    // a prescindere da come `perPagina` carica le righe: `altezza="ferma"`
    // su `DataTable` (sotto) apre lo scorrimento interno tanto con
    // `perPagina="infinito"` quanto con una `perPagina` numerica. Senza, con
    // più righe di quante ne stiano a schermo il piè uscirebbe dalla vista
    // finché non si scorre tutta la pagina.
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
      ) : aSchede ? (
        // Dopo `vuotoIniziale`, di proposito: «non esiste ancora niente» è
        // vero a ogni larghezza, e la CTA che crea il primo record non ha una
        // faccia stretta da sostituirle.
        //
        // `facciaStretta` **e non** la tabella: `cerca`, `barra` e la
        // paginazione sono contorno della `DataTable`, e se ne vanno con lei.
        facciaStretta
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
