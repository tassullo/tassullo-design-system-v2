/**
 * `tassullo-pagina-supporto-admin` — la vista dell'amministratore sul canale
 * di supporto (proposta #171, passo #171b).
 *
 * Ricavata da `frontend/src/pages/AdminSupporto.tsx` di Anagrafe al commit
 * `5222bec8`: gli avvisi sul collegamento con GitHub, la card del
 * collegamento e la tabella di tutte le richieste, con quelle che non sono
 * riuscite a partire e «Riprova invio» nella riga. Qui non legge i dati e non
 * conosce il router: riceve le richieste, il collegamento e i loro stati, e
 * un `collegamento` che rende il titolo come varco alla scheda.
 *
 * È una schermata tecnica: i nomi delle variabili d'ambiente in `<code>`,
 * l'errore dell'invio così come arriva dal server.
 *
 * Il collegamento e «Riprova invio» passano per un contesto e non per le
 * colonne: le colonne restano una costante fuori dal render, come chiede
 * `tassullo-data-table`.
 */
import { createContext, useContext, type ReactElement, type ReactNode } from "react"
import { useRender } from "@base-ui/react/use-render"
import { AlertCircleIcon, AlertTriangleIcon, RefreshCwIcon, SendIcon } from "lucide-react"

import { cn } from "cn"
import {
  creaColonne,
  DataTable,
  IntestazioneColonnaMenu,
  type IstanzaTabella,
} from "@/registry/tassullo/blocks/data-table"
import { FiltroResetTutti } from "@/registry/tassullo/blocks/data-table-filtro-reset"
import { FiltroSfaccettato } from "@/registry/tassullo/blocks/data-table-filtro-sfaccettato"
import { ErrorState } from "@/registry/tassullo/blocks/error-state"
import { PageHeader, type AzionePagina, type LivelloPercorso } from "@/registry/tassullo/blocks/page-header"
import { PageSkeleton } from "@/registry/tassullo/blocks/page-skeleton"
import { intero } from "@/registry/tassullo/lib/numeri"
import {
  formattaData,
  formattaDataOra,
  invioFallito,
  STATO_RICHIESTA,
  TIPO_RICHIESTA,
  VARIABILI_COLLEGAMENTO,
  type RichiestaAmministratore,
  type StatoCollegamento,
} from "@/registry/tassullo/lib/supporto"
import { TONO, TONO_ALERT } from "@/registry/tassullo/lib/toni"
import { Alert, AlertDescription, AlertTitle } from "@/registry/tassullo/ui/alert"
import { Badge } from "@/registry/tassullo/ui/badge"
import { Button, buttonVariants } from "@/registry/tassullo/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/tassullo/ui/card"
import { Spinner } from "@/registry/tassullo/ui/spinner"

type Stato = "pronto" | "caricamento" | "errore"

export type PaginaSupportoAdminProps = {
  /** Tutte le richieste, di tutti gli utenti, dalla più recente. */
  richieste: RichiestaAmministratore[]
  /** Lo stato dell'elenco. `pronto` di serie: solo lì `richieste` conta. */
  statoRichieste?: Stato
  /** Il messaggio d'errore dell'elenco, così come arriva dal server. */
  erroreRichieste?: ReactNode
  onRiprovaRichieste?: () => void
  /** Il collegamento con GitHub; assente finché non è letto. */
  collegamentoGitHub?: StatoCollegamento | null
  /** Lo stato della lettura del collegamento. `pronto` di serie. */
  statoCollegamento?: Stato
  /** Il messaggio d'errore del collegamento, così come arriva dal server. */
  erroreCollegamento?: ReactNode
  onRiprovaCollegamento?: () => void
  /** Rimanda a GitHub una richiesta che non è partita. */
  onRiprovaInvio: (richiesta: RichiestaAmministratore) => void
  /** Le richieste di cui un nuovo invio è in corso: il loro bottone è spento. */
  invioInCorso?: ReadonlyArray<RichiestaAmministratore["id"]>
  /** Rilegge collegamento ed elenco. Assente, la fascia non ha «Aggiorna». */
  onAggiorna?: () => void
  aggiornamentoInCorso?: boolean
  /**
   * L'elemento che rende il titolo come collegamento alla scheda: il `Link`
   * del router, `<Link to={`/supporto/${r.id}`} />`, o un `<a href>`. Il
   * blocco gli aggiunge il testo e le classi del collegamento.
   */
  collegamento: (richiesta: RichiestaAmministratore) => ReactElement
  /** Il percorso della fascia. Di serie «Amministrazione › Supporto». */
  percorso?: LivelloPercorso[]
  className?: string
}

type Contesto = {
  collegamento: (richiesta: RichiestaAmministratore) => ReactElement
  riprova: (richiesta: RichiestaAmministratore) => void
  inCorso: ReadonlyArray<RichiestaAmministratore["id"]>
}

const ContestoPagina = createContext<Contesto>({
  collegamento: () => <a />,
  riprova: () => {},
  inCorso: [],
})

const classiLink = cn(
  buttonVariants({ variant: "link", size: "sm" }),
  "block h-auto max-w-full truncate p-0 text-left font-medium",
)

function TitoloCollegato({ richiesta }: { richiesta: RichiestaAmministratore }) {
  const { collegamento } = useContext(ContestoPagina)
  return useRender({
    defaultTagName: "a",
    render: collegamento(richiesta),
    props: { className: classiLink, title: richiesta.titolo, children: richiesta.titolo },
  })
}

function BadgeStato({ richiesta }: { richiesta: RichiestaAmministratore }) {
  if (invioFallito(richiesta)) return <Badge className={TONO.destructive}>Invio fallito</Badge>
  const s = STATO_RICHIESTA[richiesta.stato]
  return <Badge className={TONO[s.tono]}>{s.testo}</Badge>
}

function Invio({ richiesta }: { richiesta: RichiestaAmministratore }) {
  const { riprova, inCorso } = useContext(ContestoPagina)
  const n = richiesta.invio_tentativi ?? 0
  if (richiesta.stato !== "ricevuta") {
    return (
      <span className="text-muted-foreground">
        {n > 1 ? `Riuscito al ${intero(n)}° tentativo` : "Riuscito"}
      </span>
    )
  }
  const occupata = inCorso.includes(richiesta.id)
  return (
    <span className="flex flex-col items-start gap-1 whitespace-normal">
      <span>
        {n === 0
          ? "Non ancora provato"
          : `${intero(n)} ${n === 1 ? "tentativo non riuscito" : "tentativi non riusciti"}`}
      </span>
      {richiesta.invio_ultimo_errore ? (
        <span className="line-clamp-2 text-muted-foreground wrap-anywhere" title={richiesta.invio_ultimo_errore}>
          {richiesta.invio_ultimo_errore}
        </span>
      ) : null}
      <Button variant="outline" size="sm" disabled={occupata} onClick={() => riprova(richiesta)}>
        {occupata ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
        Riprova invio
      </Button>
    </span>
  )
}

const OPZIONI_STATO = [
  ...Object.entries(STATO_RICHIESTA).map(([value, s]) => ({ value, label: s.testo })),
  { value: "invio_fallito", label: "Invio fallito" },
]
const OPZIONI_TIPO = Object.entries(TIPO_RICHIESTA).map(([value, t]) => ({ value, label: t.testo }))

// Il filtro «Stato» distingue l'invio fallito dalla richiesta appena ricevuta.
const statoDiFiltro = (r: RichiestaAmministratore) => (invioFallito(r) ? "invio_fallito" : r.stato)

const col = creaColonne<RichiestaAmministratore>()
const COLONNE = col.columns([
  col.accessor("titolo", {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Titolo" />,
    meta: { titolo: "Titolo", azioniProprie: true },
    sortFn: "text",
    // Senza `size`: è la colonna elastica. Il titolo sta su una riga e si
    // legge intero passandoci sopra o nella scheda.
    minSize: 240,
    cell: ({ row }) => <TitoloCollegato richiesta={row.original} />,
  }),
  col.accessor("tipo", {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Tipo" />,
    meta: { titolo: "Tipo", azioniProprie: true },
    sortFn: "text",
    filterFn: "arrHas",
    size: 120,
    minSize: 110,
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const t = TIPO_RICHIESTA[row.original.tipo]
      return (
        <Badge variant="secondary">
          <t.icona />
          {t.testo}
        </Badge>
      )
    },
  }),
  col.accessor("creato_il", {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Data" />,
    meta: { titolo: "Data", azioniProprie: true },
    sortFn: "datetime",
    size: 150,
    minSize: 130,
    enableGlobalFilter: false,
    cell: ({ getValue }) => <span className="tabular-nums">{formattaDataOra(getValue())}</span>,
  }),
  // Nome e cognome, mai l'email.
  col.accessor((r) => r.utente_nome ?? "", {
    id: "utente",
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Utente" />,
    meta: { titolo: "Utente", azioniProprie: true },
    sortFn: "text",
    size: 150,
    minSize: 120,
    cell: ({ getValue }) => <span className="block truncate">{getValue()}</span>,
  }),
  col.accessor(statoDiFiltro, {
    id: "stato",
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Stato" />,
    meta: { titolo: "Stato", azioniProprie: true },
    sortFn: "text",
    filterFn: "arrHas",
    size: 140,
    minSize: 120,
    enableGlobalFilter: false,
    cell: ({ row }) => <BadgeStato richiesta={row.original} />,
  }),
  // Il numero della issue è un riferimento esterno: si vede e si apre su GitHub.
  col.accessor((r) => r.github_numero ?? 0, {
    id: "issue",
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Issue" />,
    meta: { titolo: "Issue", azioniProprie: true },
    sortFn: "basic",
    size: 100,
    minSize: 100,
    enableGlobalFilter: false,
    cell: ({ row }) =>
      row.original.github_url && row.original.github_numero != null ? (
        <a
          href={row.original.github_url}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "link", size: "sm" }), "h-auto p-0")}
        >
          #{row.original.github_numero}
        </a>
      ) : (
        "—"
      ),
  }),
  col.accessor((r) => r.invio_tentativi ?? 0, {
    id: "invio",
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Invio a GitHub" />,
    meta: { titolo: "Invio a GitHub", azioniProprie: true },
    sortFn: "basic",
    size: 190,
    minSize: 170,
    enableGlobalFilter: false,
    cell: ({ row }) => <Invio richiesta={row.original} />,
  }),
])

function BarraFiltri({ tabella }: { tabella: IstanzaTabella<RichiestaAmministratore> }) {
  return (
    <>
      <FiltroSfaccettato tabella={tabella} accessore="stato" titolo="Stato" opzioni={OPZIONI_STATO} />
      <FiltroSfaccettato tabella={tabella} accessore="tipo" titolo="Tipo" opzioni={OPZIONI_TIPO} />
      <FiltroResetTutti tabella={tabella} />
    </>
  )
}

const Variabile = ({ children }: { children: ReactNode }) => <code className="font-mono">{children}</code>

function Avvisi({ stato }: { stato: StatoCollegamento }) {
  const { token, scadenza } = VARIABILI_COLLEGAMENTO
  if (!stato.configurato) {
    return (
      <Alert className={cn("shrink-0", TONO_ALERT.warning)}>
        <AlertTriangleIcon />
        <AlertTitle>Il collegamento con GitHub non è configurato in questo ambiente</AlertTitle>
        <AlertDescription>
          <p>
            Le richieste si salvano e restano «ricevute» finché non è impostato <Variabile>{token}</Variabile>; poi
            ripartono da sole o con «Riprova invio».
          </p>
        </AlertDescription>
      </Alert>
    )
  }
  if (stato.token.stato === "scaduta") {
    return (
      <Alert variant="destructive" className="shrink-0">
        <AlertCircleIcon />
        <AlertTitle>Il token di GitHub è scaduto</AlertTitle>
        <AlertDescription>
          <p>
            Dal {formattaData(stato.token.scadenza)} le richieste non partono più e restano «ricevute». Si rinnova il
            token su GitHub, si aggiornano <Variabile>{token}</Variabile> e <Variabile>{scadenza}</Variabile>, poi
            «Riprova invio».
          </p>
        </AlertDescription>
      </Alert>
    )
  }
  if (stato.token.stato === "in_scadenza") {
    const giorni = stato.token.giorni ?? 0
    return (
      <Alert className={cn("shrink-0", TONO_ALERT.warning)}>
        <AlertTriangleIcon />
        <AlertTitle>
          Il token di GitHub scade fra {intero(giorni)} {giorni === 1 ? "giorno" : "giorni"}
        </AlertTitle>
        <AlertDescription>
          <p>
            Scade il {formattaData(stato.token.scadenza)}. Rinnovato il token su GitHub, si aggiornano{" "}
            <Variabile>{token}</Variabile> e <Variabile>{scadenza}</Variabile>.
          </p>
        </AlertDescription>
      </Alert>
    )
  }
  return null
}

function CardCollegamento({
  stato,
  dati,
  errore,
  onRiprova,
}: {
  stato: Stato
  dati?: StatoCollegamento | null
  errore: ReactNode
  onRiprova?: () => void
}) {
  return (
    <Card className="shrink-0">
      <CardHeader>
        <CardTitle>Collegamento con GitHub</CardTitle>
        <CardDescription>Dove arrivano le richieste degli utenti: ognuna è una issue nel repository indicato.</CardDescription>
      </CardHeader>
      <CardContent className="@container">
        {stato === "caricamento" ? (
          <PageSkeleton variante="elenco" righe={3} />
        ) : stato === "errore" || !dati ? (
          <ErrorState titolo="Collegamento non leggibile" messaggio={errore} onRiprova={onRiprova} />
        ) : (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm @sm:grid-cols-termine">
            <dt className="text-muted-foreground">Repository</dt>
            <dd>{dati.repo}</dd>
            <dt className="text-muted-foreground">Collegamento</dt>
            <dd>{dati.configurato ? "Configurato" : "Non configurato"}</dd>
            <dt className="text-muted-foreground">Scadenza del token</dt>
            <dd>
              {dati.token.stato === "non_dichiarata" ? (
                <>
                  Non dichiarata: si imposta <Variabile>{VARIABILI_COLLEGAMENTO.scadenza}</Variabile> (AAAA-MM-GG)
                  {dati.token.nota ? `. ${dati.token.nota}` : "."}
                </>
              ) : (
                <span className="tabular-nums">{formattaData(dati.token.scadenza)}</span>
              )}
            </dd>
            <dt className="text-muted-foreground">Richieste non ancora inviate</dt>
            <dd className="tabular-nums">{intero(dati.non_inviate)}</dd>
            <dt className="text-muted-foreground">Ultima sincronizzazione</dt>
            <dd className="tabular-nums">{formattaDataOra(dati.ultima_sincronizzazione) || "Mai"}</dd>
          </dl>
        )}
      </CardContent>
    </Card>
  )
}

export function PaginaSupportoAdmin({
  richieste,
  statoRichieste = "pronto",
  erroreRichieste = "Le richieste non si caricano.",
  onRiprovaRichieste,
  collegamentoGitHub,
  statoCollegamento = "pronto",
  erroreCollegamento = "Il collegamento con GitHub non si legge.",
  onRiprovaCollegamento,
  onRiprovaInvio,
  invioInCorso = [],
  onAggiorna,
  aggiornamentoInCorso = false,
  collegamento,
  percorso = [{ titolo: "Amministrazione" }, { titolo: "Supporto" }],
  className,
}: PaginaSupportoAdminProps) {
  const azioni: AzionePagina[] = onAggiorna
    ? [
        {
          titolo: "Aggiorna",
          icona: RefreshCwIcon,
          ruolo: "secondaria",
          onClick: onAggiorna,
          disabilitata: aggiornamentoInCorso,
        },
      ]
    : []

  return (
    <ContestoPagina.Provider value={{ collegamento, riprova: onRiprovaInvio, inCorso: invioInCorso }}>
      {/* Avvisi e card in cima, la tabella sotto che riempie il resto. Dove il resto
          non basta, come sul telefono, la tabella tiene un'altezza minima e scorre la
          pagina; `px-px` lascia ai lati lo spazio per l'anello delle card. */}
      <div
        data-slot="pagina-supporto-admin"
        className={cn("-mx-px flex h-full min-h-0 flex-col gap-4 overflow-y-auto px-px", className)}
      >
        <PageHeader percorso={percorso} azioni={azioni} />
        {statoCollegamento === "pronto" && collegamentoGitHub ? <Avvisi stato={collegamentoGitHub} /> : null}
        <CardCollegamento
          stato={statoCollegamento}
          dati={collegamentoGitHub}
          errore={erroreCollegamento}
          onRiprova={onRiprovaCollegamento}
        />
        {statoRichieste === "caricamento" ? (
          <PageSkeleton variante="tabella" className="min-h-128 flex-1" />
        ) : statoRichieste === "errore" ? (
          <ErrorState messaggio={erroreRichieste} onRiprova={onRiprovaRichieste} className="flex-1" />
        ) : (
          <DataTable
            colonne={COLONNE}
            dati={richieste}
            cerca="Cerca nel titolo o nell'utente…"
            nomeRighe={{ singolare: "richiesta", plurale: "richieste" }}
            perPagina="infinito"
            altezza="ferma"
            idRiga={(r) => String(r.id)}
            ridimensionabile
            colonneBloccabili
            barra={(_, tabella) => <BarraFiltri tabella={tabella} />}
            vuoto={{ titolo: "Nessuna richiesta", descrizione: "Quando un utente apre una richiesta compare qui." }}
            className="min-h-128 flex-1"
          />
        )}
      </div>
    </ContestoPagina.Provider>
  )
}
