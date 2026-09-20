/**
 * `tassullo-pagina-dashboard` — la home applicativa (FASE 4, M4.4).
 *
 * Nessuna app Tassullo ce l'ha ancora fatta bene — non esiste un
 * `Dashboard.tsx` da leggere come per le altre tre pagine modello — e la
 * `ROADMAP.md` di Anagrafe prevede una tab Metriche e un quadro sinottico di
 * prodotto. Le quattro capacità che `PIANO.md` §M4.4 chiede sono le stesse
 * di ogni cruscotto che si sia mai visto: una fila di **indicatori**, **due
 * grafici**, la **tabella delle attività recenti**, un'**area avvisi**. Il
 * blocco le compone da ciò che il registry ha già — `page-header`,
 * `page-skeleton`, `error-state`, `card`, `table`, `alert`, `toni` — zero
 * primitive nuove, zero CSS di pagina, e i grafici veri restano quelli di
 * `Primitive/Chart` (Recharts, M1.7).
 *
 * ── `indicatori` è un item a sé; `grafici` no ───────────────────────────
 *
 * Un indicatore — etichetta, valore, tendenza — è la stessa forma ovunque:
 * fissarla vuol dire non riscriverla mai in nessuna app. Da M4ter.7 quella
 * forma **non sta più qui**: è `tassullo-indicatori`, che si installa da solo
 * — tre app la riscrivevano identica (Anagrafe AdminBC, Studio Admin,
 * RadarOpere) e nessuna poteva prendersela senza la dashboard intera. Questa
 * pagina la **ricompone**, e non ne tiene una copia: né nel contenuto né
 * nello scheletro del caricamento, che monta la stessa `GrigliaIndicatori`.
 *
 * Un grafico invece non ha una forma sola: `Primitive/Chart` da solo mostra
 * barre, linee, aree, torta e ciambella, ciascuno con
 * `Card`/`ChartContainer`/`config` propri — nessun denominatore comune sotto
 * cui incapsularli senza perdere ciò che li rende diversi. `grafici` è quindi
 * una **tupla di due nodi**, stessa libertà di `documenti` in
 * `tassullo-pagina-scheda` e di `barra` in `tassullo-data-table`: il blocco
 * fissa che siano **due**, non cosa siano. Il chiamante porta già la propria
 * `Card` con dentro `ChartContainer` — qui non si annida una card dentro
 * un'altra.
 *
 * ── La tabella delle attività è `tassullo-data-table`, spogliata ─────────
 *
 * Scelta di Francesco il 2026-09-18, presa **guardando le tre varianti
 * affiancate sugli stessi dati**, non in astratto: primitiva `table` nuda,
 * `DataTable` col solo ordinamento, e `DataTable` col menu di riga. Vince la
 * seconda — ricerca, menu delle colonne e piè di pagina spenti, altezza
 * naturale, resta la freccia di ordinamento sulle tre intestazioni.
 *
 * **La soglia che ne è uscita, e che vale oltre questo blocco**: serve una
 * qualunque opzione — ordina, cerca, nascondi, pagina, menu di riga — e
 * allora si monta `DataTable` spegnendo le altre; non ne serve nessuna, e
 * allora la primitiva `table` con la cornice di `DataTable`
 * (`overflow-hidden rounded-lg border`, che la primitiva non porta da sé).
 * Ciò che non si fa **mai** è aggiungere a mano un'opzione a una tabella
 * semplice: rifare l'intestazione ordinabile significa riscrivere
 * `IntestazioneColonna`, che è la duplicazione che la regola 4bis esiste per
 * impedire.
 *
 * ── Le soglie sono sul contenitore, non sul viewport ─────────────────────
 *
 * La dashboard vive dentro `tassullo-app-shell`, e la colonna laterale si
 * apre e si chiude portandosi via ~256px: con `xl:grid-cols-4` i quattro
 * riquadri resterebbero quattro anche quando lo spazio vero si è ristretto,
 * perché la finestra non è cambiata. Il blocco dichiara quindi **da sé**
 * `@container/dashboard` sulla propria radice — non lo chiede al guscio, o
 * senza guscio le soglie non scatterebbero mai e la griglia resterebbe a una
 * colonna per sempre — e le griglie misurano quello. È la stessa ragione già
 * scritta in `tassullo-page-header`, che usa `@container/fascia` e non `md:`.
 *
 * `@container/dashboard` resta, e lo misura `DueGrafici` (`@3xl/dashboard`).
 * La fila di indicatori invece misura **il proprio**: da quando è un item a
 * sé dichiara `@container/indicatori` e la soglia guarda quello, o installata
 * fuori di qui non troverebbe mai il contenitore che nomina — due colonne per
 * sempre, senza errore. Dentro la dashboard non cambia niente: la fila è un
 * figlio a piena larghezza di questa colonna, quindi misura la stessa
 * larghezza di prima.
 *
 * ── Le larghezze si dichiarano, o le prende la data ──────────────────────
 *
 * L'ordine è **chi / cosa / quando**: il soggetto per primo, l'azione al
 * centro, la data in coda. Solo «Attività» resta senza `meta.larghezza` —
 * è la colonna elastica, quella che si prende ciò che avanza. Senza
 * larghezze dichiarate «Quando» si prendeva un terzo della tabella per
 * mostrare undici caratteri: è lo stesso difetto della colonna «azioni»
 * preso in M3bis.11b, e la causa è la stessa — in una tabella a colonne
 * fisse, una colonna senza larghezza è elastica.
 *
 * ── L'icona di tendenza non si colora mai, e la regola sta nel blocco ────
 *
 * È la stessa regola misurata su `Primitive/Chart`, story `Scostamenti`: un
 * aumento non è un successo e un calo non è un errore. Il ragionamento per
 * esteso sta adesso in `tassullo-indicatori`, che è dove sta il codice.
 *
 * ── `avvisi`: un tono dichiarato, `chiudibile` per riga ───────────────────
 *
 * Ogni avviso porta il proprio `tono` (`TONO_ALERT`, `lib/toni.ts`) — lo
 * stesso vocabolario a quattro voci di badge e colonne di stato, non un
 * quinto colore inventato qui. `chiudibile` più `onChiudiAvviso` bastano a
 * chi vuole poterlo togliere dalla vista: il blocco non tiene uno stato
 * proprio degli avvisi, perché è l'app a sapere se un avviso richiuso deve
 * anche segnarsi come letto sul server — la stessa ragione per cui
 * `modifica` in `tassullo-pagina-scheda` è controllabile e non solo interno.
 * Se `onChiudiAvviso` non è passato, `chiudibile` non compare: un bottone
 * che non farebbe niente è peggio di un bottone assente.
 *
 * ── L'ordine in pagina non è l'ordine del piano ───────────────────────────
 *
 * `PIANO.md` elenca le quattro capacità come «indicatori, due grafici,
 * tabella, avvisi» — l'ordine in cui si sono pensate, non quello in cui si
 * leggono. In pagina gli avvisi stanno **in cima**: sono l'unica delle
 * quattro sezioni che chiede attenzione prima del resto («la sincronizzazione
 * con SAP è ferma da tre ore» non deve aspettare lo scorrimento sotto due
 * grafici). Indicatori, grafici e attività restano nell'ordine del piano.
 */
import * as React from "react"
import type { ComponentType, ReactNode } from "react"
import {
  CheckCircle2Icon,
  CircleAlertIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import { cn } from "cn"
import {
  DataTable,
  IntestazioneColonna,
  creaColonne,
} from "@/registry/tassullo/blocks/data-table"
import { ErrorState } from "@/registry/tassullo/blocks/error-state"
import { GrigliaIndicatori, Indicatori, type Indicatore } from "@/registry/tassullo/blocks/indicatori"
import { PageHeader, type AzionePagina, type LivelloPercorso } from "@/registry/tassullo/blocks/page-header"
import { PageSkeleton } from "@/registry/tassullo/blocks/page-skeleton"
import { TONO_ALERT, TONO_CHIUSURA } from "@/registry/tassullo/lib/toni"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/registry/tassullo/ui/alert"
import { Button } from "@/registry/tassullo/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/tassullo/ui/card"

/** Un'icona Lucide, o qualunque componente che accetti una `className`. */
type Icona = ComponentType<{ className?: string }>

/**
 * Ri-esportato da `tassullo-indicatori`, dove la forma adesso vive: la riga
 * è un item a sé (M4ter.7) e la dashboard la ricompone. Resta esportato di
 * qui perché è il tipo di `PaginaDashboardProps.indicatori`.
 */
export type { Indicatore }

export type AttivitaRecente = {
  /** Identificatore stabile della riga, non l'indice. */
  id: string
  /** Cosa è successo — «Ha aggiornato la scheda UNI EN 1090». */
  descrizione: ReactNode
  utente?: string
  quando: Date
  /** Es. un `<Badge>` di tipo attività. Libero, come `distintivo` in `tassullo-pagina-scheda`. */
  distintivo?: ReactNode
}

/** I quattro toni che `TONO_ALERT` copre — `neutro` non c'è: un avviso è per definizione qualcosa che chiede attenzione. */
type TonoAvviso = keyof typeof TONO_ALERT

export type AvvisoDashboard = {
  id: string
  tono: TonoAvviso
  /** Assente, prende l'icona di default del tono. */
  icona?: ReactNode
  titolo: ReactNode
  descrizione?: ReactNode
  /** Es. un bottone verso la pagina che risolve l'avviso. */
  azione?: ReactNode
  /** Richiede `onChiudiAvviso`: senza, il bottone non comparirebbe comunque. */
  chiudibile?: boolean
}

export type PaginaDashboardProps = {
  /** Il percorso dell'intestazione — passa a `PageHeader`, che lo porta nella fascia. */
  percorso: LivelloPercorso[]
  azioni?: AzionePagina[]
  indicatori: Indicatore[]
  /**
   * Esattamente due — il piano ne chiede due, non "una lista di grafici". Il
   * chiamante porta la propria `Card` con `ChartContainer` dentro: qui non si
   * annida una card in un'altra.
   */
  grafici: [ReactNode, ReactNode]
  attivita: AttivitaRecente[]
  messaggioAttivitaVuote?: string
  avvisi?: AvvisoDashboard[]
  /** Assente, `chiudibile` non mostra il bottone anche se richiesto dall'avviso. */
  onChiudiAvviso?: (id: string) => void
  /** Uno dei tre stati. `pronto` di default: solo lì il resto delle prop conta. */
  stato?: "pronto" | "caricamento" | "errore"
  /** Il messaggio d'errore, già tradotto — mai un codice, mai uno stack. */
  messaggioErrore?: ReactNode
  onRiprovaErrore?: () => void
  className?: string
}

const ICONA_TONO: Record<TonoAvviso, Icona> = {
  success: CheckCircle2Icon,
  info: InfoIcon,
  warning: TriangleAlertIcon,
  destructive: CircleAlertIcon,
}


function DueGrafici({ grafici }: { grafici: [ReactNode, ReactNode] }) {
  return (
    <div className="grid grid-cols-1 gap-4 @3xl/dashboard:grid-cols-2">
      {grafici[0]}
      {grafici[1]}
    </div>
  )
}

const colAttivita = creaColonne<AttivitaRecente>()

/**
 * `tassullo-data-table` spogliata, non la primitiva `table` — scelta di
 * Francesco il 2026-09-18, davanti alle tre varianti messe a confronto sugli
 * stessi dati. Resta acceso il **solo ordinamento**: ricerca, menu delle
 * colonne e piè di pagina spenti, altezza naturale. La soglia che ne è uscita
 * vale oltre questo caso: serve una qualunque opzione — ordina, cerca,
 * nascondi, pagina, menu di riga — e allora si monta `DataTable` spegnendo le
 * altre; non ne serve nessuna, e allora la primitiva. Non si aggiunge **mai**
 * un'opzione a mano a una tabella semplice: rifare l'intestazione ordinabile
 * vorrebbe dire riscrivere `IntestazioneColonna`, che è la duplicazione che la
 * regola 4bis esiste per impedire.
 *
 * **L'ordine delle colonne è chi / cosa / quando**: il soggetto per primo,
 * l'azione al centro — è la colonna che si allunga, e quindi l'unica senza
 * `larghezza` — e la data in coda, stretta. Senza larghezze dichiarate la
 * data si prende un terzo della tabella per mostrare undici caratteri.
 */
function TabellaAttivita({
  attivita,
  messaggioVuote,
}: {
  attivita: AttivitaRecente[]
  messaggioVuote: string
}) {
  const colonne = React.useMemo(
    () =>
      colAttivita.columns([
        colAttivita.accessor("utente", {
          header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Utente" />,
          meta: { titolo: "Utente", larghezza: "w-44" },
          sortFn: "text",
        }),
        colAttivita.accessor("descrizione", {
          header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Attività" />,
          // Nessuna `larghezza`: è la colonna elastica, quella che si prende
          // ciò che avanza (v. il rilievo sulla colonna «azioni» di M3bis.11b).
          meta: { titolo: "Attività" },
          sortFn: "text",
          cell: ({ row }) => (
            <div className="flex flex-wrap items-center gap-2">
              {row.original.descrizione}
              {row.original.distintivo}
            </div>
          ),
        }),
        colAttivita.accessor("quando", {
          header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Quando" />,
          meta: { titolo: "Quando", larghezza: "w-32" },
          sortFn: "datetime",
          cell: ({ getValue }) => (
            <span className="text-muted-foreground">
              {getValue<Date>().toLocaleString("it-IT", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ),
        }),
      ]),
    []
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attività recenti</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          colonne={colonne}
          dati={attivita}
          idRiga={(a) => a.id}
          cerca={false}
          colonneNascondibili={false}
          piePagina={false}
          altezza="naturale"
          perPagina="infinito"
          nomeRighe={{ singolare: "attività", plurale: "attività" }}
          vuoto={{ titolo: messaggioVuote }}
        />
      </CardContent>
    </Card>
  )
}

function AreaAvvisi({
  avvisi,
  onChiudiAvviso,
}: {
  avvisi: AvvisoDashboard[]
  onChiudiAvviso?: (id: string) => void
}) {
  if (avvisi.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      {avvisi.map((avviso) => {
        const IconaTono = ICONA_TONO[avviso.tono]
        return (
          <Alert key={avviso.id} className={TONO_ALERT[avviso.tono]}>
            {avviso.icona ?? <IconaTono />}
            <AlertTitle>{avviso.titolo}</AlertTitle>
            {avviso.descrizione ? <AlertDescription>{avviso.descrizione}</AlertDescription> : null}
            {avviso.azione || (avviso.chiudibile && onChiudiAvviso) ? (
              <AlertAction className="flex items-center gap-1">
                {avviso.azione}
                {avviso.chiudibile && onChiudiAvviso ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    // `ghost` da solo farebbe una macchia grigia dentro il
                    // riquadro tinto e annerirebbe l'icona: v. `TONO_CHIUSURA`.
                    className={TONO_CHIUSURA[avviso.tono]}
                    aria-label="Chiudi avviso"
                    onClick={() => onChiudiAvviso(avviso.id)}
                  >
                    <XIcon />
                  </Button>
                ) : null}
              </AlertAction>
            ) : null}
          </Alert>
        )
      })}
    </div>
  )
}

export function PaginaDashboard({
  percorso,
  azioni,
  indicatori,
  grafici,
  attivita,
  messaggioAttivitaVuote = "Nessuna attività recente.",
  avvisi = [],
  onChiudiAvviso,
  stato = "pronto",
  messaggioErrore = "Non è stato possibile caricare la dashboard. Riprova.",
  onRiprovaErrore,
  className,
}: PaginaDashboardProps) {
  return (
    <div data-slot="pagina-dashboard" className={cn("@container/dashboard flex flex-col gap-4", className)}>
      <PageHeader percorso={percorso} azioni={azioni} />

      {stato === "caricamento" ? (
        <div className="flex flex-col gap-4">
          {/*
            La stessa griglia del contenuto vero, non le stesse classi
            riscritte: due sorgenti della stessa disposizione divergono in
            silenzio, e lo scheletro disegnerebbe una fila diversa da quella
            che arriva un istante dopo.
          */}
          <GrigliaIndicatori>
            {Array.from({ length: 4 }).map((_, i) => (
              <PageSkeleton key={i} variante="scheda" righe={1} />
            ))}
          </GrigliaIndicatori>
          <div className="grid grid-cols-1 gap-4 @3xl/dashboard:grid-cols-2">
            <PageSkeleton variante="scheda" righe={4} />
            <PageSkeleton variante="scheda" righe={4} />
          </div>
          <PageSkeleton variante="tabella" righe={5} />
        </div>
      ) : stato === "errore" ? (
        <ErrorState messaggio={messaggioErrore} onRiprova={onRiprovaErrore} />
      ) : (
        <>
          <AreaAvvisi avvisi={avvisi} onChiudiAvviso={onChiudiAvviso} />
          <Indicatori indicatori={indicatori} />
          <DueGrafici grafici={grafici} />
          <TabellaAttivita attivita={attivita} messaggioVuote={messaggioAttivitaVuote} />
        </>
      )}
    </div>
  )
}
