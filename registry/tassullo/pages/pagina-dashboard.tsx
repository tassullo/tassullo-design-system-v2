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
 * ── Perché `indicatori` è una forma fissa e `grafici` no ─────────────────
 *
 * Un indicatore — etichetta, valore, tendenza — è la stessa forma ovunque:
 * fissarla vuol dire non riscriverla mai in nessuna app. Un grafico invece
 * non ha una forma sola: `Primitive/Chart` da solo mostra barre, linee,
 * aree, torta e ciambella, ciascuno con `Card`/`ChartContainer`/`config`
 * propri — nessun denominatore comune sotto cui incapsularli senza perdere
 * ciò che li rende diversi. `grafici` è quindi una **tupla di due nodi**,
 * stessa libertà di `documenti` in `tassullo-pagina-scheda` e di `barra` in
 * `tassullo-data-table`: il blocco fissa che siano **due**, non cosa siano.
 * Il chiamante porta già la propria `Card` con dentro `ChartContainer` — qui
 * non si annida una card dentro un'altra.
 *
 * ── Perché la tabella delle attività non è `tassullo-data-table` ─────────
 *
 * `DataTable` esiste per l'elenco che si cerca, si ordina, si pagina — il
 * caso di `tassullo-pagina-lista`. Un riquadro «Attività recenti» non fa
 * nessuna delle tre cose: è una lista corta, già ordinata dal più recente,
 * senza filtro. Portarci sopra `DataTable` vorrebbe dire installare colonne
 * TanStack per tre celle statiche — il gradino 1 della regola 4bis chiede
 * prima il default shadcn così com'è, ed è quello che risolve qui: la
 * primitiva `table`, dentro una `Card`, come la usa `Primitive/Table`.
 *
 * ── Perché l'icona di tendenza non si colora mai di verde o rosso ────────
 *
 * È la stessa regola misurata su `Primitive/Chart`, story `Scostamenti`:
 * un aumento non è un successo e un calo non è un errore — dipende
 * dall'indicatore («schede aperte» che sale è un problema, «pratiche
 * chiuse» che sale è una buona notizia), e questo blocco non lo sa. Colorare
 * la freccia userebbe `--success`/`--destructive` per un giudizio che non è
 * il suo da dare: resta sul neutro (`text-muted-foreground`), come le due
 * serie di `Scostamenti` restano i primi due pioli della scala categorica e
 * non verde/rosso.
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
import type { ComponentType, ReactNode } from "react"
import {
  CheckCircle2Icon,
  CircleAlertIcon,
  InfoIcon,
  MinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import { cn } from "cn"
import { ErrorState } from "@/registry/tassullo/blocks/error-state"
import { PageHeader, type AzionePagina, type LivelloPercorso } from "@/registry/tassullo/blocks/page-header"
import { PageSkeleton } from "@/registry/tassullo/blocks/page-skeleton"
import { TONO_ALERT } from "@/registry/tassullo/lib/toni"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/registry/tassullo/ui/alert"
import { Button } from "@/registry/tassullo/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/tassullo/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/tassullo/ui/table"

/** Un'icona Lucide, o qualunque componente che accetti una `className`. */
type Icona = ComponentType<{ className?: string }>

export type Indicatore = {
  etichetta: string
  /** Già formattato dal chiamante — separatori delle migliaia, unità di misura, valuta: sa tutto questo solo chi conosce il dominio. */
  valore: ReactNode
  /** Sotto il valore, quando non basta la sola tendenza. */
  descrizione?: ReactNode
  /**
   * `direzione` sceglie solo la freccia, mai un colore: un aumento non è un
   * successo e un calo non è un errore, dipende dall'indicatore.
   */
  tendenza?: { direzione: "su" | "giù" | "stabile"; valore: string }
}

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
  messaggioAttivitaVuote?: ReactNode
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

const ICONA_TENDENZA: Record<NonNullable<Indicatore["tendenza"]>["direzione"], Icona> = {
  su: TrendingUpIcon,
  giù: TrendingDownIcon,
  stabile: MinusIcon,
}

function RigaIndicatori({ indicatori }: { indicatori: Indicatore[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {indicatori.map((ind) => {
        const IconaTendenza = ind.tendenza ? ICONA_TENDENZA[ind.tendenza.direzione] : null
        return (
          // `size="sm"` qui sarebbe un difetto muto: `CardTitle` porta
          // `group-data-[size=sm]/card:text-sm`, che vince su `text-2xl` e
          // rende il numero dell'indicatore a 13px — la stessa misura della
          // sua etichetta. Misurato in Chromium: 13px con `sm`, 27px senza.
          <Card key={ind.etichetta}>
            <CardHeader>
              <CardDescription>{ind.etichetta}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{ind.valore}</CardTitle>
            </CardHeader>
            {ind.tendenza || ind.descrizione ? (
              <CardContent className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                {IconaTendenza ? <IconaTendenza className="size-4 shrink-0" /> : null}
                {ind.tendenza ? <span className="tabular-nums">{ind.tendenza.valore}</span> : null}
                {ind.descrizione}
              </CardContent>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}

function DueGrafici({ grafici }: { grafici: [ReactNode, ReactNode] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {grafici[0]}
      {grafici[1]}
    </div>
  )
}

function TabellaAttivita({
  attivita,
  messaggioVuote,
}: {
  attivita: AttivitaRecente[]
  messaggioVuote: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attività recenti</CardTitle>
      </CardHeader>
      <CardContent>
        {attivita.length === 0 ? (
          <p className="text-sm text-muted-foreground">{messaggioVuote}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attività</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead className="text-right">Quando</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attivita.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-wrap items-center gap-2">
                      {a.descrizione}
                      {a.distintivo}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.utente}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {a.quando.toLocaleString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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
    <div data-slot="pagina-dashboard" className={cn("flex flex-col gap-4", className)}>
      <PageHeader percorso={percorso} azioni={azioni} />

      {stato === "caricamento" ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <PageSkeleton key={i} variante="scheda" righe={1} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
          <RigaIndicatori indicatori={indicatori} />
          <DueGrafici grafici={grafici} />
          <TabellaAttivita attivita={attivita} messaggioVuote={messaggioAttivitaVuote} />
        </>
      )}
    </div>
  )
}
