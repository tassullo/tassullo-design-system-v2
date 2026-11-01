/**
 * `tassullo-pagina-supporto` — l'elenco delle richieste di supporto di chi
 * usa l'app (proposta #165, passo #165c).
 *
 * Ricavata da `frontend/src/pages/Supporto.tsx` di Anagrafe al commit
 * `589247a5`, che è a sua volta composta come la lista modello: fascia, uno
 * dei quattro stati, la tabella che scorre nel suo riquadro e, sotto 1024px,
 * le schede. Qui non legge i dati e non conosce il router: riceve le
 * richieste, lo stato e un `collegamento` che rende il titolo come varco
 * alla scheda (il `Link` del router nell'app).
 *
 * Il collegamento passa per un contesto e non per le colonne: le colonne
 * restano una costante fuori dal render, come chiede `tassullo-data-table`,
 * anche se l'app dà una funzione nuova a ogni render.
 */
import { createContext, useContext, type ReactElement, type ReactNode } from "react"
import { useRender } from "@base-ui/react/use-render"
import { LifeBuoyIcon, PlusIcon, RefreshCwIcon } from "lucide-react"

import { cn } from "cn"
import {
  creaColonne,
  DataTable,
  IntestazioneColonnaMenu,
  type IstanzaTabella,
} from "@/registry/tassullo/blocks/data-table"
import { FiltroResetTutti } from "@/registry/tassullo/blocks/data-table-filtro-reset"
import { FiltroSfaccettato } from "@/registry/tassullo/blocks/data-table-filtro-sfaccettato"
import { EmptyState } from "@/registry/tassullo/blocks/empty-state"
import { ErrorState } from "@/registry/tassullo/blocks/error-state"
import { PageHeader, type AzionePagina, type LivelloPercorso } from "@/registry/tassullo/blocks/page-header"
import { PageSkeleton } from "@/registry/tassullo/blocks/page-skeleton"
import { useSoglia } from "@/registry/tassullo/hooks/use-soglia"
import { intero } from "@/registry/tassullo/lib/numeri"
import {
  formattaDataOra,
  STATO_RICHIESTA,
  TIPO_RICHIESTA,
  type Richiesta,
} from "@/registry/tassullo/lib/supporto"
import { TONO } from "@/registry/tassullo/lib/toni"
import { Badge } from "@/registry/tassullo/ui/badge"
import { Button, buttonVariants } from "@/registry/tassullo/ui/button"
import { Card } from "@/registry/tassullo/ui/card"

export type PaginaSupportoProps = {
  /** Le richieste, dalla più recente. */
  richieste: Richiesta[]
  /** Uno dei tre stati. `pronto` di serie: solo lì `richieste` conta. */
  stato?: "pronto" | "caricamento" | "errore"
  /** Il messaggio d'errore, già tradotto. */
  messaggioErrore?: ReactNode
  onRiprovaErrore?: () => void
  /** Apre il dialogo «Apri una richiesta», montato nel guscio. */
  onApriRichiesta: () => void
  /** Rilegge l'elenco. Assente, la fascia non ha «Aggiorna». */
  onAggiorna?: () => void
  /** Mentre l'elenco si rilegge, «Aggiorna» è spento. */
  aggiornamentoInCorso?: boolean
  /**
   * L'elemento che rende il titolo come collegamento alla scheda: il `Link`
   * del router, `<Link to={`/supporto/${r.id}`} />`, o un `<a href>`. Il
   * blocco gli aggiunge il testo e le classi del collegamento.
   */
  collegamento: (richiesta: Richiesta) => ReactElement
  /** Il percorso della fascia. Di serie «Supporto». */
  percorso?: LivelloPercorso[]
  /**
   * `"auto"`, il predefinito, sceglie dalla finestra: la tabella da 1024px,
   * le schede sotto. `"tabella"` e `"schede"` fissano una forma, per una
   * scena o una prova automatica.
   */
  faccia?: "auto" | "tabella" | "schede"
  className?: string
}

const CollegamentoCtx = createContext<(richiesta: Richiesta) => ReactElement>(() => <a />)

const classiLink = cn(
  buttonVariants({ variant: "link", size: "sm" }),
  "h-auto justify-start p-0 text-left font-medium whitespace-normal",
)

function TitoloCollegato({ richiesta }: { richiesta: Richiesta }) {
  const collegamento = useContext(CollegamentoCtx)
  return useRender({
    defaultTagName: "a",
    render: collegamento(richiesta),
    props: { className: classiLink, children: richiesta.titolo },
  })
}

function BadgeStato({ stato }: { stato: Richiesta["stato"] }) {
  const s = STATO_RICHIESTA[stato]
  return <Badge className={TONO[s.tono]}>{s.testo}</Badge>
}

function BadgeTipo({ tipo }: { tipo: Richiesta["tipo"] }) {
  const t = TIPO_RICHIESTA[tipo]
  return (
    <Badge variant="secondary">
      <t.icona />
      {t.testo}
    </Badge>
  )
}

function Nuove({ n }: { n: number }) {
  return n > 0 ? (
    <Badge className="tabular-nums">
      {intero(n)} {n === 1 ? "nuova" : "nuove"}
    </Badge>
  ) : null
}

const OPZIONI_STATO = Object.entries(STATO_RICHIESTA).map(([value, s]) => ({ value, label: s.testo }))
const OPZIONI_TIPO = Object.entries(TIPO_RICHIESTA).map(([value, t]) => ({ value, label: t.testo }))

const col = creaColonne<Richiesta>()
const COLONNE = col.columns([
  col.accessor("titolo", {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Titolo" />,
    meta: { titolo: "Titolo", azioniProprie: true },
    sortFn: "text",
    // Senza `size`: è la colonna elastica, prende lo spazio che avanza.
    minSize: 240,
    cell: ({ row }) => <TitoloCollegato richiesta={row.original} />,
  }),
  col.accessor("tipo", {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Tipo" />,
    meta: { titolo: "Tipo", azioniProprie: true },
    sortFn: "text",
    filterFn: "arrHas",
    size: 150,
    minSize: 110,
    enableGlobalFilter: false,
    cell: ({ row }) => <BadgeTipo tipo={row.original.tipo} />,
  }),
  col.accessor("creato_il", {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Data" />,
    meta: { titolo: "Data", azioniProprie: true },
    sortFn: "datetime",
    size: 170,
    minSize: 130,
    enableGlobalFilter: false,
    cell: ({ getValue }) => <span className="tabular-nums">{formattaDataOra(getValue())}</span>,
  }),
  col.accessor("stato", {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Stato" />,
    meta: { titolo: "Stato", azioniProprie: true },
    sortFn: "text",
    filterFn: "arrHas",
    size: 160,
    minSize: 120,
    enableGlobalFilter: false,
    cell: ({ row }) => <BadgeStato stato={row.original.stato} />,
  }),
  col.accessor("n_risposte", {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Risposte" />,
    meta: { titolo: "Risposte", azioniProprie: true },
    sortFn: "basic",
    size: 170,
    minSize: 120,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <span className="flex flex-wrap items-center gap-2">
        <span className="tabular-nums">{intero(row.original.n_risposte)}</span>
        <Nuove n={row.original.non_lette} />
      </span>
    ),
  }),
])

function BarraFiltri({ tabella }: { tabella: IstanzaTabella<Richiesta> }) {
  return (
    <>
      <FiltroSfaccettato tabella={tabella} accessore="stato" titolo="Stato" opzioni={OPZIONI_STATO} />
      <FiltroSfaccettato tabella={tabella} accessore="tipo" titolo="Tipo" opzioni={OPZIONI_TIPO} />
      <FiltroResetTutti tabella={tabella} />
    </>
  )
}

// Una scheda per richiesta: il titolo è il varco alla scheda; sotto stato e
// tipo, poi data, risposte e quante sono nuove.
function SchedeRichieste({ richieste }: { richieste: Richiesta[] }) {
  return (
    // `p-px`: l'anello della `Card` sta fuori dalla scatola e `overflow-y-auto` lo taglierebbe.
    <ul data-slot="pagina-supporto-schede" className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-px">
      {richieste.map((r) => (
        <li key={r.id} className="shrink-0">
          <Card className="gap-2 p-3">
            <TitoloCollegato richiesta={r} />
            <span className="flex flex-wrap items-center gap-2">
              <BadgeStato stato={r.stato} />
              <BadgeTipo tipo={r.tipo} />
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="tabular-nums">{formattaDataOra(r.creato_il)}</span>
              <span>
                {r.n_risposte === 0
                  ? "Nessuna risposta"
                  : `${intero(r.n_risposte)} ${r.n_risposte === 1 ? "risposta" : "risposte"}`}
              </span>
              <Nuove n={r.non_lette} />
            </span>
          </Card>
        </li>
      ))}
    </ul>
  )
}

export function PaginaSupporto({
  richieste,
  stato = "pronto",
  messaggioErrore = "Le richieste non si caricano.",
  onRiprovaErrore,
  onApriRichiesta,
  onAggiorna,
  aggiornamentoInCorso = false,
  collegamento,
  percorso = [{ titolo: "Supporto" }],
  faccia = "auto",
  className,
}: PaginaSupportoProps) {
  const largoDavvero = useSoglia("(min-width: 1024px)")
  const largo = faccia === "auto" ? largoDavvero : faccia === "tabella"
  const azioni: AzionePagina[] = [
    { titolo: "Apri una richiesta", icona: PlusIcon, ruolo: "primaria", onClick: onApriRichiesta },
    ...(onAggiorna
      ? [
          {
            titolo: "Aggiorna",
            icona: RefreshCwIcon,
            ruolo: "secondaria" as const,
            onClick: onAggiorna,
            disabilitata: aggiornamentoInCorso,
          },
        ]
      : []),
  ]

  return (
    <CollegamentoCtx.Provider value={collegamento}>
      <div data-slot="pagina-supporto" className={cn("flex h-full min-h-0 flex-col gap-4", className)}>
        <PageHeader percorso={percorso} azioni={azioni} />
        {stato === "caricamento" ? (
          <PageSkeleton variante="tabella" className="flex-1" />
        ) : stato === "errore" ? (
          <ErrorState messaggio={messaggioErrore} onRiprova={onRiprovaErrore} className="flex-1" />
        ) : richieste.length === 0 ? (
          <EmptyState
            icona={<LifeBuoyIcon />}
            titolo="Nessuna richiesta"
            descrizione="Se qualcosa non funziona, se hai un'idea o una domanda, scrivici: la leggiamo noi e la risposta compare qui."
            azione={
              <Button size="sm" onClick={onApriRichiesta}>
                Apri una richiesta
              </Button>
            }
            className="mx-auto max-w-md"
          />
        ) : !largo ? (
          <SchedeRichieste richieste={richieste} />
        ) : (
          <DataTable
            colonne={COLONNE}
            dati={richieste}
            cerca="Cerca nel titolo…"
            nomeRighe={{ singolare: "richiesta", plurale: "richieste" }}
            perPagina="infinito"
            altezza="ferma"
            idRiga={(r) => String(r.id)}
            ridimensionabile
            colonneBloccabili
            barra={(_, tabella) => <BarraFiltri tabella={tabella} />}
            className="min-h-0 flex-1"
          />
        )}
      </div>
    </CollegamentoCtx.Provider>
  )
}
