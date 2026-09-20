import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { BoxIcon, DownloadIcon, LayoutDashboardIcon } from 'lucide-react'

import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import {
  type AttivitaRecente,
  type AvvisoDashboard,
  type Indicatore,
  PaginaDashboard,
} from '@/registry/tassullo/pages/pagina-dashboard'
import { intero } from '@/registry/tassullo/lib/numeri'
import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/registry/tassullo/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/registry/tassullo/ui/chart'

/**
 * **M4.4 — quarta pagina modello.** Nessuna app Tassullo ha ancora una
 * dashboard fatta bene — a differenza delle altre tre pagine modello non
 * c'è un file di Anagrafe da cui ricavarla — e la `ROADMAP.md` prevede una
 * tab Metriche e un quadro sinottico di prodotto: il caso qui è quello,
 * dominio Anagrafe (prodotti, famiglie, norme).
 *
 * `PaginaDashboard` compone ciò che il registry ha già — `page-header`,
 * `page-skeleton`, `error-state`, `card`, `table`, `alert`, `toni` — e i
 * grafici veri restano quelli di `Primitive/Chart` (Recharts): il blocco
 * non li incapsula, riceve **due nodi già completi** (`grafici`), perché un
 * grafico non ha una forma sola — barre, torta, area, ciascuno con la sua
 * `Card`/`ChartContainer`/`config` — e fissarne una sola dentro il blocco
 * vorrebbe dire perderne il resto.
 *
 * ## L'ordine in pagina non è l'ordine del piano
 *
 * `PIANO.md` §M4.4 elenca «indicatori, due grafici, tabella, avvisi» — è
 * l'ordine in cui le capacità si sono pensate, non quello in cui un utente
 * le legge. In pagina gli **avvisi stanno in cima**: sono l'unica sezione
 * che chiede attenzione prima del resto — «la sincronizzazione con SAP è
 * ferma da tre ore» non deve aspettare lo scorrimento sotto due grafici.
 *
 * ## Le frecce di tendenza non si colorano mai
 *
 * Stessa regola misurata su `Primitive/Chart`, story `Scostamenti`: un
 * aumento non è un successo e un calo non è un errore — «Schede aperte» che
 * sale è un problema, «Norme in revisione» che sale può essere una buona
 * notizia, e il blocco non lo sa. Le frecce restano `text-muted-foreground`
 * in ogni indicatore qui sotto, comprese quelle che salgono.
 *
 * ## Gli avvisi si chiudono davvero
 *
 * `chiudibile` più `onChiudiAvviso` — qui `AvvisiVivi`, sotto, che toglie
 * l'avviso da un `useState` locale. Nell'app vera `onChiudiAvviso` è anche
 * il posto in cui segnare l'avviso come letto sul server: il blocco non
 * tiene stato proprio, l'app decide cosa succede quando si chiude.
 */
const meta = {
  title: 'Pagine/Dashboard',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SEZIONI: SezioneNav[] = [
  {
    voci: [
      { titolo: 'Dashboard', icona: LayoutDashboardIcon, attiva: true, href: '#' },
      { titolo: 'Prodotti', icona: BoxIcon, href: '#' },
    ],
  },
]

const UTENTE = {
  nome: 'Francesco',
  cognome: 'Sartori',
  email: 'fsartori@covicostruzioni.it',
  ruolo: 'Admin',
}

/* ────────────────────────────────────────────────────────────────────────
 * I dati finti — dominio Anagrafe: prodotti, famiglie, norme.
 * ──────────────────────────────────────────────────────────────────────── */

const INDICATORI: Indicatore[] = [
  {
    etichetta: 'Prodotti attivi',
    valore: '1.284',
    tendenza: { direzione: 'su', valore: '+4,2%' },
    descrizione: 'sul mese scorso',
  },
  {
    etichetta: 'Schede aperte',
    valore: '42',
    tendenza: { direzione: 'giù', valore: '-12' },
    descrizione: 'sul mese scorso',
  },
  {
    etichetta: 'Norme in revisione',
    valore: '7',
    tendenza: { direzione: 'stabile', valore: '=' },
    descrizione: 'come il mese scorso',
  },
  {
    etichetta: 'Famiglie in catalogo',
    valore: '58',
  },
]

const FAMIGLIE = ['calcestruzzi', 'prefabbricati', 'inerti', 'malte', 'additivi'] as const

const config = {
  calcestruzzi: { label: 'Calcestruzzi', color: 'var(--chart-1)' },
  prefabbricati: { label: 'Prefabbricati', color: 'var(--chart-2)' },
  inerti: { label: 'Inerti', color: 'var(--chart-3)' },
  malte: { label: 'Malte', color: 'var(--chart-4)' },
  additivi: { label: 'Additivi', color: 'var(--chart-5)' },
} satisfies ChartConfig

const SCHEDE_PER_MESE = [
  { mese: 'apr', schede: 42 },
  { mese: 'mag', schede: 48 },
  { mese: 'giu', schede: 55 },
  { mese: 'lug', schede: 61 },
  { mese: 'ago', schede: 39 },
  { mese: 'set', schede: 57 },
]

const IN_CATALOGO = FAMIGLIE.map((famiglia, i) => ({
  famiglia,
  schede: [214, 138, 96, 61, 34][i]!,
  fill: `var(--color-${famiglia})`,
}))

/**
 * Il primo dei due grafici richiesti dal piano: schede aperte per mese, una
 * sola serie — la stessa forma di `Primitive/Chart`, story `Barre`, con un
 * `dataKey` solo. Il blocco riceve la `Card` già completa: non annida una
 * card dentro un'altra.
 */
function GraficoSchedeAperte() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schede aperte per mese</CardTitle>
        <CardDescription>Aprile – settembre 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <BarChart accessibilityLayer data={SCHEDE_PER_MESE} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="mese" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
            <Bar dataKey="schede" fill="var(--color-calcestruzzi)" radius={4}>
              {/* Il valore scritto sulla barra: su sei mesi si legge il numero
                  senza stimarlo a occhio sull'asse. Stessa forma di
                  `Primitive/Chart`, story `Barre` — `position="top"` e
                  `fill-foreground`, mai un colore fuori dai token. */}
              <LabelList position="top" offset={12} className="fill-foreground text-xs" />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const TOTALE_IN_CATALOGO = IN_CATALOGO.reduce((somma, r) => somma + r.schede, 0)

/** L'altezza che diamo alla legenda: dichiarata, non subita — v. `TotaleAlCentro`. */
const ALTEZZA_LEGENDA = 32

/** Lo stacco fra le due righe del totale. */
const RIGA_TOTALE = 22

/**
 * Di quanto alzare il blocco perché il baricentro cada sul centro dell'anello.
 * **Non è metà stacco**: la riga grande è alta il doppio della piccola e tira
 * il baricentro verso di sé. Misura presa in `Primitive/Chart`.
 */
const SCARTO_BLOCCO = 5

/**
 * Il totale nel buco della ciambella. È la composizione già misurata in
 * `Primitive/Chart` (story `Ciambella`), **riscritta qui** e non importata da
 * lì: quello è un file di story, non un modulo condiviso.
 *
 * Due correzioni verticali, nessuna delle due a occhio: il blocco è di due
 * righe e il suo baricentro non cade su `cy` (`SCARTO_BLOCCO`); e con la
 * legenda accesa Recharts riduce l'`outerRadius` che passa al `Label` ma
 * **lascia `cy` dov'era**, mentre l'anello vero sale — di qui la metà di
 * `ALTEZZA_LEGENDA`.
 */
function TotaleAlCentro({ viewBox, totale }: { viewBox?: unknown; totale: number }) {
  const vb = viewBox as { cx?: number; cy?: number } | undefined
  if (!vb || vb.cx === undefined || vb.cy === undefined) return null
  const cy = vb.cy - SCARTO_BLOCCO - ALTEZZA_LEGENDA / 2
  return (
    <text x={vb.cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-foreground">
      <tspan x={vb.cx} y={cy} className="fill-foreground text-2xl font-semibold tabular-nums">
        {intero(totale)}
      </tspan>
      <tspan x={vb.cx} y={cy + RIGA_TOTALE} className="fill-muted-foreground text-sm">
        schede
      </tspan>
    </text>
  )
}

/**
 * Il secondo grafico: ripartizione delle schede per famiglia, la stessa
 * ciambella di `Primitive/Chart` **col totale al centro** — il buco dell'anello
 * è spazio già speso, e scriverci dentro il totale dà al quadro sinottico il
 * numero che la ripartizione da sola non dice. Legenda e tooltip portano il
 * nome tradotto, mai la chiave.
 */
function GraficoRipartizione() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schede in catalogo per famiglia</CardTitle>
        <CardDescription>Ripartizione corrente</CardDescription>
      </CardHeader>
      <CardContent>
        {/*
            `h-64`, **la stessa del grafico a barre**, ed è la ragione per cui
            i due riquadri restano alti uguali: la griglia li stira alla stessa
            altezza, quindi se questo cresce l'altro si ritrova una fascia
            bianca sotto le etichette che non usa nessuno — provato con `h-72`,
            e la fascia si vede.

            Il prezzo è che i 60px riservati alla legenda li paga la torta: 177
            invece di 207px di diametro. È il modo meno peggio: a finestra larga
            resta un po' d'aria fra ciambella e legenda, a finestra stretta
            quell'aria è la seconda riga.
          */}
          <ChartContainer config={config} className="mx-auto h-64 w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="famiglia" hideLabel />} />
            {/*
              `height` va **dichiarato**, e va dichiarato per il caso peggiore.
              Due misure, prese in quest'ordine e tutt'e due sbagliate prima di
              arrivare qui:

              - `height={32}` riservava **una riga sola**: in una card stretta
                la legenda a cinque voci va a capo e la seconda riga finisce
                sotto il bordo della `Card`, che ha `overflow-hidden` — quindi
                sparisce invece di sbordare. «Additivi» tagliato a metà.
              - **senza** `height`, Recharts riserva l'altezza vera (misurata:
                wrapper `top: 191px`, `height: 60px` dentro 256 di grafico) ma
                **non rimpicciolisce la torta**: il `Pie` si dispone prima,
                sull'altezza piena, e la legenda gli finisce sopra. Il riquadro
                è giusto, il disegno no.

              60px sono due righe da 30, e sono riservati **sempre**: `height`
              è una prop JS di Recharts, non una classe, quindi non c'è una
              container query che possa deciderlo per larghezza. A finestra
              larga la legenda ne usa 28 e i 32 che avanzano diventano aria fra
              la ciambella e la legenda.

              Il limite da conoscere: a **tre** righe — etichette più lunghe, o
              una card ancora più stretta — si torna a sovrapporre, e allora il
              numero va rialzato. È un numero scritto a mano perché `height` è
              una prop JS di Recharts: non c'è una container query che possa
              deciderlo.
            */}
            <ChartLegend
              itemSorter={null}
              height={60}
              content={<ChartLegendContent nameKey="famiglia" />}
            />
            <Pie data={IN_CATALOGO} dataKey="schede" nameKey="famiglia" outerRadius="95%" innerRadius="58%">
              {IN_CATALOGO.map((r) => (
                <Cell key={r.famiglia} fill={r.fill} />
              ))}
              <Label content={<TotaleAlCentro totale={TOTALE_IN_CATALOGO} />} />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const ATTIVITA: AttivitaRecente[] = [
  {
    id: '1',
    descrizione: 'Ha aggiornato la scheda UNI EN 1090',
    utente: 'Francesco Sartori',
    quando: new Date('2026-09-18T09:14:00'),
    distintivo: <Badge className={TONO.info}>Norma</Badge>,
  },
  {
    id: '2',
    descrizione: 'Ha pubblicato "Malta cementizia MC-40"',
    utente: 'Roberto Zanetti',
    quando: new Date('2026-09-18T08:02:00'),
    distintivo: <Badge className={TONO.success}>Prodotto</Badge>,
  },
  {
    id: '3',
    descrizione: 'Ha eliminato la scheda "Additivo AD-12 (superato)"',
    utente: 'Francesco Sartori',
    quando: new Date('2026-09-17T17:41:00'),
    distintivo: <Badge className={TONO.destructive}>Prodotto</Badge>,
  },
  {
    id: '4',
    descrizione: 'Ha aperto la revisione 5 di UNI EN 1090',
    utente: 'Roberto Zanetti',
    quando: new Date('2026-09-14T11:20:00'),
    distintivo: <Badge className={TONO.warning}>Norma</Badge>,
  },
]

const AVVISI_INIZIALI: AvvisoDashboard[] = [
  {
    id: 'sap',
    tono: 'warning',
    titolo: 'Sincronizzazione con SAP ferma da 3 ore',
    descrizione: 'Gli ultimi prodotti importati potrebbero non comparire ancora in anagrafica.',
    chiudibile: true,
  },
  {
    id: 'manutenzione',
    tono: 'info',
    titolo: 'Manutenzione programmata sabato 21 settembre, 22:00–24:00',
    chiudibile: true,
  },
]

/**
 * L'area avvisi che si chiude davvero: `onChiudiAvviso` toglie la voce da
 * uno stato locale — nell'app vera è anche il posto in cui segnare l'avviso
 * come letto sul server, che il blocco non può sapere da sé.
 */
function Dashboard({
  stato,
  faccia,
}: {
  stato?: 'pronto' | 'caricamento' | 'errore'
  faccia?: 'auto' | 'larga' | 'stretta'
}) {
  const [avvisi, setAvvisi] = useState(AVVISI_INIZIALI)
  return (
    <PaginaDashboard
      percorso={[{ titolo: 'Dashboard' }]}
      azioni={[{ titolo: 'Esporta report', icona: DownloadIcon, ruolo: 'secondaria' }]}
      indicatori={INDICATORI}
      grafici={[<GraficoSchedeAperte key="schede" />, <GraficoRipartizione key="ripartizione" />]}
      attivita={ATTIVITA}
      avvisi={avvisi}
      onChiudiAvviso={(id) => setAvvisi((v) => v.filter((a) => a.id !== id))}
      stato={stato}
      faccia={faccia}
    />
  )
}

function Guscio({
  stato,
  faccia,
}: {
  stato?: 'pronto' | 'caricamento' | 'errore'
  faccia?: 'auto' | 'larga' | 'stretta'
}) {
  return (
    <AppShell applicazione="Anagrafe" collassa="icona" utente={UTENTE} sezioni={SEZIONI}>
      <Dashboard stato={stato} faccia={faccia} />
    </AppShell>
  )
}

/** Il caso comune: quattro indicatori, due grafici, quattro attività recenti, due avvisi chiudibili. */
export const ConDati: Story = {
  render: () => <Guscio />,
}

/** `stato="caricamento"`: uno scheletro per sezione, nella stessa disposizione del contenuto vero. */
export const Caricamento: Story = {
  render: () => <Guscio stato="caricamento" />,
}

/**
 * **La faccia stretta delle attività, resa in modo deterministico.**
 *
 * `faccia="stretta"` e non una finestra stretta: `useSoglia` è una media
 * query sulla **finestra**, e la larghezza della finestra non si commuta dal
 * canvas (`docs/DECISIONI.md` §46). Senza questa prop il gate renderebbe
 * sempre il ramo largo — a 1440 — e «0 violazioni» non direbbe niente sulla
 * forma che si vede sul telefono. È la stessa scelta di `Pagine/Lista a due
 * facce`, e per la stessa ragione.
 *
 * Il difetto che chiude, preso a video da Francesco il 2026-09-20: con
 * `table-fixed` le colonne «Utente» (`w-44`) e «Quando» (`w-32`) tengono la
 * loro larghezza e «Attività», che è l'elastica, **va a zero** — il testo si
 * taglia a metà parola e le due intestazioni si sovrappongono. È il difetto
 * numero 1 di M4ter.6, riapparso su un'altra tabella.
 *
 * Impilata, l'ordine si ribalta: in tabella è `chi / cosa / quando`, qui è
 * l'**attività** in cima e `utente · quando` come riga di contesto — quello
 * che si cerca scorrendo un elenco è cosa è successo.
 */
export const AttivitaStrette: Story = {
  name: 'Attività, faccia stretta',
  render: () => <Guscio faccia="stretta" />,
}

/** `stato="errore"`: la chiamata che carica la dashboard è fallita. */
export const Errore: Story = {
  render: () => <Guscio stato="errore" />,
}

/**
 * Nessuna attività e nessun avviso: la tabella mostra il messaggio di
 * cortesia invece di un'intestazione vuota, e l'area avvisi non rende
 * niente — non un riquadro vuoto in mezzo alla pagina.
 */
export const SenzaAttivitaNeAvvisi: Story = {
  render: () => (
    <AppShell applicazione="Anagrafe" collassa="icona" utente={UTENTE} sezioni={SEZIONI}>
      <PaginaDashboard
        percorso={[{ titolo: 'Dashboard' }]}
        indicatori={INDICATORI}
        grafici={[<GraficoSchedeAperte key="schede" />, <GraficoRipartizione key="ripartizione" />]}
        attivita={[]}
        avvisi={[]}
      />
    </AppShell>
  ),
}
