import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  Rectangle,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'

import { intero } from '@/registry/tassullo/lib/numeri'
import { valoreIt } from '@/prove/numeri-tooltip'
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

// ── I dati, e perché sono questi ──────────────────────────────────────────
// La ROADMAP di Anagrafe prevede una tab Metriche e un quadro sinottico di
// prodotto: le serie sono le famiglie di prodotto, il tempo è in mesi.

// **Dieci famiglie e non cinque, dal 2026-09-21.** La tavolozza è passata a
// dieci tinte (`--chart-1..10`, `docs/DECISIONI.md` §49) e una scena che ne
// mostra cinque non la prova: il controllo `serie` arriva a dieci apposta, ed
// è tirandolo fino in fondo che si vede se le tinte reggono davvero — il
// numero lo dà `check:contrast`, l'occhio lo dà qui.
const FAMIGLIE = [
  'calcestruzzi',
  'prefabbricati',
  'inerti',
  'malte',
  'additivi',
  'premiscelati',
  'isolanti',
  'impermeabilizzanti',
  'fissaggi',
  'finiture',
] as const

const config = {
  calcestruzzi: { label: 'Calcestruzzi', color: 'var(--chart-1)' },
  prefabbricati: { label: 'Prefabbricati', color: 'var(--chart-2)' },
  inerti: { label: 'Inerti', color: 'var(--chart-3)' },
  malte: { label: 'Malte', color: 'var(--chart-4)' },
  additivi: { label: 'Additivi', color: 'var(--chart-5)' },
  premiscelati: { label: 'Premiscelati', color: 'var(--chart-6)' },
  isolanti: { label: 'Isolanti', color: 'var(--chart-7)' },
  impermeabilizzanti: { label: 'Impermeabilizzanti', color: 'var(--chart-8)' },
  fissaggi: { label: 'Fissaggi', color: 'var(--chart-9)' },
  finiture: { label: 'Finiture', color: 'var(--chart-10)' },
  // La serie degli scostamenti: sta qui perché il `config` è **l'unico posto**
  // dove i nomi in italiano stanno scritti, e senza la sua voce la legenda di
  // `Scostamenti` renderebbe una pastiglia senza testo.
  delta: { label: 'Scostamento sul mese prima', color: 'var(--chart-1)' },
} satisfies ChartConfig

const perMese = [
  { mese: 'apr', calcestruzzi: 42, prefabbricati: 28, inerti: 19, malte: 12, additivi: 7, premiscelati: 24, isolanti: 16, impermeabilizzanti: 11, fissaggi: 8, finiture: 5 },
  { mese: 'mag', calcestruzzi: 48, prefabbricati: 31, inerti: 17, malte: 15, additivi: 9, premiscelati: 27, isolanti: 13, impermeabilizzanti: 14, fissaggi: 6, finiture: 8 },
  { mese: 'giu', calcestruzzi: 55, prefabbricati: 26, inerti: 22, malte: 14, additivi: 8, premiscelati: 21, isolanti: 18, impermeabilizzanti: 9, fissaggi: 11, finiture: 4 },
  { mese: 'lug', calcestruzzi: 61, prefabbricati: 34, inerti: 25, malte: 18, additivi: 11, premiscelati: 30, isolanti: 20, impermeabilizzanti: 15, fissaggi: 9, finiture: 7 },
  { mese: 'ago', calcestruzzi: 39, prefabbricati: 21, inerti: 14, malte: 9, additivi: 6, premiscelati: 17, isolanti: 11, impermeabilizzanti: 7, fissaggi: 5, finiture: 3 },
  { mese: 'set', calcestruzzi: 57, prefabbricati: 37, inerti: 24, malte: 16, additivi: 12, premiscelati: 26, isolanti: 19, impermeabilizzanti: 13, fissaggi: 10, finiture: 6 },
]

const inCatalogo = FAMIGLIE.map((famiglia, i) => ({
  famiglia,
  schede: [2140, 1380, 960, 610, 340, 880, 520, 410, 260, 150][i]!,
  fill: `var(--color-${famiglia})`,
}))

/** Lo scostamento sul mese prima: l'unico caso in cui i valori vanno sotto zero. */
const scostamenti = perMese.map((r, i, tutti) => ({
  mese: r.mese,
  delta: i === 0 ? 0 : r.calcestruzzi - tutti[i - 1]!.calcestruzzi,
})).slice(1)

/**
 * Recharts ordina **legenda e tooltip in ordine alfabetico di etichetta**:
 * `Legend` ha `itemSorter: "value"` come predefinito e `Tooltip` ha
 * `itemSorter: "name"`. Il risultato è una legenda che non segue le serie —
 * nel grafico a linee le curve stanno in ordine di grandezza e la legenda
 * diceva «Additivi, Calcestruzzi, Inerti, Malte, Prefabbricati», cioè un
 * ordine che nel disegno non esiste. Si spegne in composizione: `null` per la
 * legenda, e per il tooltip un comparatore costante, che lascia l'ordine di
 * dichiarazione perché l'ordinamento di Recharts è stabile.
 */
const ORDINE_DICHIARATO = () => 0

/**
 * I dieci tratteggi: la distinzione che sopravvive al bianco e nero — e che
 * **da M4ter.11 conta di più**, perché la tavolozza categorica a dieci tinte
 * in grigio si appiattisce (ΔE 0,4). Su un grafico a linee il tratteggio è
 * ciò che resta quando il colore non c'è.
 */
const TRATTEGGI = [
  '0',
  '8 4',
  '2 4',
  '12 4 2 4',
  '1 5',
  '6 2 2 2',
  '10 3',
  '3 3 8 3',
  '14 4',
  '2 2 6 2 2 6',
] as const

/** Il `label` di Recharts scrive la chiave: qui si traduce leggendo il config. */
const etichettaFetta = ({ name }: { name?: string | number }) =>
  String(config[name as keyof typeof config]?.label ?? name ?? '')

const totaleDi = (righe: typeof inCatalogo) => righe.reduce((somma, r) => somma + r.schede, 0)

/**
 * L'altezza che diamo alla legenda della torta. È dichiarata, non subita: serve
 * a `TotaleAlCentro` per sapere di quanto l'anello si è spostato in su.
 */
const ALTEZZA_LEGENDA = 32

/** Lo stacco fra le due righe del totale. */
const RIGA_TOTALE = 22

/**
 * Di quanto alzare il blocco perché il suo baricentro cada sul centro
 * dell'anello. **Non è metà stacco**: la riga grande è alta il doppio della
 * piccola e tira il baricentro verso di sé. Misurato sul rettangolo reso —
 * senza correzione il blocco cade **5.1px** sotto il centro dell'anello, con
 * metà stacco (11px) ne cade 5.9 sopra.
 */
const SCARTO_BLOCCO = 5

/**
 * Il totale nel buco della ciambella: due righe, cifre tabellari.
 *
 * ## Due correzioni verticali, e nessuna delle due è un aggiustamento a occhio
 *
 * 1. **Il blocco è di due righe.** Scritto a `cy` la prima riga e a `cy + 22`
 *    la seconda, il baricentro cade **5.1px** sotto il centro dell'anello —
 *    misurato sul rettangolo reso, non metà stacco: la riga grande è alta il
 *    doppio della piccola e tira il baricentro verso di sé.
 * 2. **Con la legenda, `viewBox.cy` non è il centro dell'anello.** Misurato:
 *    accendendo la legenda Recharts riduce l'`outerRadius` che passa al
 *    `Label` (124 → 113.3) ma **lascia `cy` a 160**, mentre l'anello vero sale
 *    di 13.3px. Non è un caso limite: lo stesso `viewBox` riporta
 *    `innerRadius: 0` su una ciambella, cioè è il viewBox polare del grafico e
 *    non quello della torta. Provato anche con i raggi in pixel invece che in
 *    percentuale: identico, quindi non è la forma del valore.
 *
 *    Il rimedio non indovina niente: la legenda ha un'altezza che **dichiariamo
 *    noi** (`ALTEZZA_LEGENDA`), l'area di disegno si accorcia di quella, quindi
 *    il centro sale di metà. Se un giorno la legenda cambia altezza, cambia una
 *    costante sola e le due cose restano d'accordo.
 */
function TotaleAlCentro({
  viewBox,
  totale,
  conLegenda,
}: {
  viewBox?: unknown
  totale: number
  conLegenda: boolean
}) {
  const vb = viewBox as { cx?: number; cy?: number } | undefined
  if (!vb || vb.cx === undefined || vb.cy === undefined) return null
  const cy = vb.cy - SCARTO_BLOCCO - (conLegenda ? ALTEZZA_LEGENDA / 2 : 0)
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
 * Gli argomenti dei grafici. Non sono tutti buoni per tutti: ogni story
 * dichiara i suoi con `solo(...)` e nasconde gli altri, perché un controllo che
 * non fa niente è peggio di un controllo che manca.
 */
type ArgsGrafico = {
  /** Quante famiglie disegnare, da 1 a 5. */
  serie: number
  /**
   * Quale palette: le cinque tinte categoriche, la rampa monocroma del brand,
   * o le categoriche viste **senza colore** — che è la prova di leggibilità.
   */
  legenda: boolean
  griglia: boolean
  /** Il valore (barre, linee, aree) o il nome della fetta (torta) sul dato. */
  etichette: boolean
  /** I punti sulle linee: la distinzione che resta quando le linee si toccano. */
  pallini: boolean
  /** Un tratteggio diverso per serie: la distinzione che sopravvive al grigio. */
  tratteggi: boolean
  /** Curva morbida (`natural`) invece della spezzata (`linear`). */
  curva: boolean
  /** L'asse delle categorie (in orizzontale: quello dei valori). */
  asseX: boolean
  /** L'asse dei valori (in orizzontale: quello delle categorie). */
  asseY: boolean
  /** Serie impilate invece che affiancate (barre) o sovrapposte (aree). */
  impilato: boolean
  /** Il totale della pila, scritto in cima (solo a barre impilate). */
  totale: boolean
  /** Riempimento a sfumatura invece che pieno (aree). */
  sfumatura: boolean
  /** Angoli tondi dalla parte opposta allo zero (scostamenti). */
  arrotondate: boolean
  /** Un colore solo per entrambi i segni, invece di due (scostamenti). */
  coloreUnico: boolean
  /** Barre orizzontali: le etichette lunghe ci stanno, i mesi no. */
  orizzontali: boolean
}

const ARGOMENTI = [
  'serie',
  'colori',
  'legenda',
  'griglia',
  'etichette',
  'pallini',
  'tratteggi',
  'curva',
  'asseX',
  'asseY',
  'impilato',
  'totale',
  'sfumatura',
  'arrotondate',
  'coloreUnico',
  'orizzontali',
] as const

/** Lascia visibili solo gli argomenti che questa story usa davvero. */
const solo = (...usati: Array<(typeof ARGOMENTI)[number]>) =>
  Object.fromEntries(
    ARGOMENTI.filter((a) => !usati.includes(a)).map((a) => [
      a,
      { control: false, table: { disable: true } },
    ]),
  )

/**
 * Il wrapper ufficiale shadcn attorno a **Recharts**. Non disegna niente da
 * sé: dà a Recharts i token del tema, una legenda e un tooltip che somigliano
 * al resto dell'interfaccia, e un `config` in cui ogni serie ha un'etichetta
 * **in italiano** e un colore.
 *
 * ## Dieci tinte categoriche, e nessuna scala
 *
 * `--chart-1..10` è una tavolozza **categorica**: dieci tinte scelte perché
 * restino distinguibili **fra loro**, misurate a coppie sotto visione piena e
 * sotto i tre deficit di percezione del colore. La coppia più vicina sta a
 * **ΔE 11,0** in chiaro e **8,5** in scuro, contro una soglia di 5 —
 * `npm run check:contrast` non lascia passare una tavolozza che scenda sotto.
 *
 * **Fino al 2026-09-21 erano cinque, ed erano un'altra cosa**: cinque *pioli
 * di una scala di chiarezza*, il cui passo — 1,4935, quello che l'arancio del
 * brand e il verde istituzionale hanno già fra loro — garantiva che restassero
 * distinguibili **anche in bianco e nero**. Quella garanzia non si estende a
 * dieci, ed è aritmetica: dieci pioli a quel passo vorrebbero `1,4935⁹ ≈ 37:1`
 * contro i **21:1** che l'intera gamma sRGB permette. Sopra gli otto non c'è
 * spazio fra il bianco e il nero.
 *
 * Il cambio è stato fatto perché cinque non bastavano: un grafico a sei serie,
 * o un calendario a sei tipi di intervento, doveva riusare un colore. Il
 * prezzo, dichiarato: **la tavolozza categorica non si legge in bianco e
 * nero**, e non c'è più una famiglia che ci riesca: la rampa monocroma
 * `--chart-mono-1..5` è stata tolta insieme alla garanzia (2026-09-21). Il
 * ragionamento completo, con le tavolozze pubblicate provate e scartate, è in
 * `docs/DECISIONI.md` §49.
 *
 * **Il controllo `colori` non c'è più** (2026-09-21): offriva «categorici /
 * arancio / grigio», cioè la tavolozza, la rampa monocroma del brand e il
 * filtro in scala di grigi. Le ultime due erano l'apparato della *vecchia*
 * garanzia — la scala a cinque pioli leggibile in B/N — e con la tavolozza a
 * dieci quella garanzia non c'è più: un interruttore che mostra una proprietà
 * che il tema non promette più è peggio che assente. Le story mostrano la
 * tavolozza, e basta.
 *
 * ## Il colore non è mai l'unica distinzione
 *
 * È la regola che il piano scrive esplicitamente, e vale a maggior ragione
 * qui. Otto tinte su dieci stanno sopra i **3:1** che la WCAG 1.4.11 chiede a
 * un oggetto grafico *quando il colore è l'unico mezzo*; le due che non ci
 * arrivano sono `--chart-1` e `--chart-2`, cioè **l'arancio e il verde del
 * brand** — 1,91:1 e 2,85:1 sulla card chiara — e sono esentate per decisione,
 * perché cambiarle vorrebbe dire cambiare il marchio.
 *
 * Il colore non deve mai essere l'unico mezzo. Le story qui sotto lo mostrano
 * in modi diversi: le barre hanno la **legenda** e il valore nel tooltip, le
 * linee hanno un **tratteggio diverso per ciascuna**, le aree si **impilano**
 * invece di sovrapporsi, torta e ciambella hanno il **nome della fetta scritto
 * accanto**. Nessuna resta muta in bianco e nero.
 *
 * Ogni story porta i propri **controlli**, nel pannello `Controls`: servono a
 * provare la regola invece di leggerla — si spegne la legenda su cinque linee e
 * si guarda cosa resta da capire.
 *
 * ## Un'altezza dichiarata, non ereditata
 *
 * I contenitori cartesiani sono a `h-72` invece che all'`aspect-video` del
 * preset. Non è un gusto: su una card larga 672px l'aspetto video dà un grafico
 * **alto 378px**, e con l'intestazione la card supera l'area visibile del
 * canvas di Storybook — la legenda finisce sotto la piega e sembra non essere
 * stata disegnata. Misurato: c'è, sta a 26px dal fondo della card, e la card
 * finiva a 674px in un viewport da 900. Con `h-72` la card finisce a 638.
 *
 * La seconda metà del rimedio è il `layout: 'padded'` del meta, contro il
 * `centered` globale: **centrata**, una card alta viene spinta in mezzo al
 * viewport e la sua metà inferiore esce dall'area visibile del canvas;
 * allineata in alto, ci sta per intero. Le due cose insieme sono il motivo per
 * cui «la legenda non si accende» pur essendo disegnata — segnalato tre volte,
 * su linee, aree e barre, ed era sempre lo stesso.
 *
 * ## Un ri-stile solo
 *
 * `ChartTooltipContent`: `bg-background` → `bg-popover`. Il tooltip **fluttua**
 * sopra il grafico, e il grafico sta quasi sempre dentro una card: col colore
 * di pagina sarebbe più scuro della card su cui galleggia, cioè un buco invece
 * di un oggetto sollevato. Tutti gli altri popup del set stanno su
 * `bg-popover`. Struttura, props ed export sono il preset intatto.
 */
const meta = {
  title: 'Primitive/Chart',
  // `layout: 'padded'` invece del `centered` globale: una card di grafico è
  // alta, e centrata in un viewport da 900px finisce metà sotto la piega del
  // canvas — è così che «la legenda non si accende» pur essendo disegnata.
  // Allineata in alto, la card ci sta per intero.
  parameters: { layout: 'padded' },
  // Niente `component`: la tabella delle props di `ChartContainer` sarebbe
  // l'elenco degli attributi di un `div`, cioè rumore. Gli argomenti che
  // contano sono quelli dei grafici, e li dichiara il meta.
  args: {
    serie: 3,
    legenda: true,
    griglia: true,
    etichette: false,
    pallini: false,
    tratteggi: true,
    curva: false,
    asseX: true,
    asseY: true,
    impilato: false,
    totale: false,
    sfumatura: false,
    arrotondate: true,
    coloreUnico: false,
    orizzontali: false,
  },
  argTypes: {
    serie: { control: { type: 'range', min: 1, max: 10, step: 1 } },
    legenda: { control: 'boolean' },
    griglia: { control: 'boolean' },
    etichette: { control: 'boolean' },
    pallini: { control: 'boolean' },
    tratteggi: { control: 'boolean' },
    curva: { control: 'boolean' },
    asseX: { control: 'boolean' },
    asseY: { control: 'boolean' },
    impilato: { control: 'boolean' },
    totale: { control: 'boolean' },
    sfumatura: { control: 'boolean' },
    arrotondate: { control: 'boolean' },
    coloreUnico: { control: 'boolean' },
    orizzontali: { control: 'boolean' },
  },
} satisfies Meta<ArgsGrafico>

export default meta
type Story = StoryObj<ArgsGrafico>

/** Le fette della torta, col colore della palette scelta. */
const fetteColorate = (args: ArgsGrafico) =>
  inCatalogo
    .slice(0, args.serie)
    .map((r) => ({ ...r, fill: `var(--color-${r.famiglia})` }))

/**
 * Il raggio di una barra dentro una pila. **Solo le due estremità della pila si
 * arrotondano**: una barra di mezzo con gli angoli tondi lascia un intaglio fra
 * una serie e l'altra, e la pila non si legge più come una colonna sola. È la
 * forma dell'esempio shadcn `chart-bar-stacked`, generalizzata a n serie e alle
 * due orientazioni — l'ordine degli angoli di Recharts è
 * `[alto-sx, alto-dx, basso-dx, basso-sx]`.
 */
/**
 * Il totale di una pila. Non è una prop di Recharts né un esempio shadcn — che
 * per le barre impilate si ferma alle etichette di segmento — ma non serve
 * niente di nuovo: si appende un secondo `LabelList` **all'ultima** serie, cioè
 * quella in cima alla pila, e gli si dà un `valueAccessor` che somma la riga
 * invece di leggerne un campo. Composizione, non un componente.
 */
function totaleDellaPila(voce: unknown, famiglie: readonly string[]): number {
  const riga = (voce as { payload?: Record<string, unknown> }).payload ?? {}
  return famiglie.reduce((somma, f) => somma + (Number(riga[f]) || 0), 0)
}

type Raggio = number | [number, number, number, number]

function raggioBarra(i: number, n: number, impilato: boolean, orizzontali: boolean): Raggio {
  if (!impilato || n === 1) return 4
  const primo = i === 0
  const ultimo = i === n - 1
  if (orizzontali) {
    if (primo) return [4, 0, 0, 4]
    return ultimo ? [0, 4, 4, 0] : 0
  }
  // In verticale la prima serie sta in basso e l'ultima in cima.
  if (primo) return [0, 0, 4, 4]
  return ultimo ? [4, 4, 0, 0] : 0
}

/** Il tipo di curva di Recharts: morbida o spezzata. */
const tipoCurva = (curva: boolean) => (curva ? ('natural' as const) : ('linear' as const))

/**
 * L'etichetta sul dato sta a `offset={12}`, non ai 5 di default: è la stessa
 * misura degli esempi shadcn, ed è quella che tiene il numero staccato dalla
 * linea invece che appoggiato sopra.
 */
const EtichettaSulDato = () => (
  <LabelList position="top" offset={12} className="fill-foreground text-xs" />
)

/**
 * **Barre.** La legenda nomina le serie e il tooltip dà il valore esatto in
 * cifre tabellari: nessuna delle due informazioni passa dal colore.
 *
 * Due interruttori che cambiano il grafico, non il vestito:
 *
 * - **impilato** — affiancate si confrontano le serie fra loro, impilate si
 *   legge il **totale** e si perde il confronto. È una scelta su cosa si vuol
 *   far vedere, non una scelta estetica.
 * - **totale** — solo a pila accesa: il numero in cima alla colonna. Impilando
 *   si guadagna il totale e si perde il confronto fra le serie, quindi tanto
 *   vale **scriverlo**, il totale, invece di lasciarlo stimare a occhio
 *   sull'asse. shadcn non ha un esempio per questo — le sue barre impilate si
 *   fermano alle etichette di segmento — ma non serve niente di nuovo: un
 *   secondo `LabelList` appeso all'**ultima** serie, quella in cima, con un
 *   `valueAccessor` che somma la riga.
 * - **orizzontali** — `layout="vertical"` in Recharts, che è il nome al
 *   contrario e va saputo. Servono quando le categorie hanno **nomi lunghi**:
 *   in verticale «Prefabbricati» sotto l'asse o si taglia o si inclina. Sui
 *   mesi non servono, ed è il motivo per cui il default resta verticale.
 */
export const Barre: Story = {
  argTypes: solo(
    'serie',
    'colori',
    'legenda',
    'griglia',
    'asseX',
    'asseY',
    'etichette',
    'impilato',
    'totale',
    'orizzontali',
  ),
  render: (args) => {
    const famiglie = FAMIGLIE.slice(0, args.serie)
    return (
      <Card className="w-2xl">
        <CardHeader>
          <CardTitle>Schede aperte per mese</CardTitle>
          <CardDescription>Aprile – settembre 2026</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className={`aspect-auto h-72 w-full `}>
            <BarChart
              accessibilityLayer
              data={perMese}
              layout={args.orizzontali ? 'vertical' : 'horizontal'}
              // Le etichette si scrivono FUORI dall'area di disegno, quindi il
              // margine da quel lato dev'essere alto quanto `offset` più il corpo
              // del testo — e il corpo cresce con la densità, che è la parte che
              // sfugge. In orizzontale il numero va a destra della barra: senza
              // margine la cifra più lunga è tagliata dal bordo della card
              // (misurato: «118» reso «11»). In verticale va SOPRA, e la barra
              // più alta arriva al tetto dell'asse: con `top: 20` contro
              // `offset: 12` + 12px di testo il totale della pila usciva di 4px
              // (misurato su «120», e usciva di 3px anche prima di M1.6 — il
              // difetto è più vecchio della scala nuova). 36 tiene anche in
              // densità touch, dove `text-xs` fa 13px.
              margin={{
                top: !args.orizzontali && ((args.etichette && !args.impilato) || (args.impilato && args.totale)) ? 36 : 20,
                right: args.orizzontali && (args.etichette || args.totale) ? 56 : 20,
              }}
            >
              {args.griglia && <CartesianGrid vertical={args.orizzontali} horizontal={!args.orizzontali} />}
              {args.orizzontali ? (
                <>
                  <XAxis type="number" tickLine={false} axisLine={false} hide={!args.asseX} />
                  <YAxis
                    type="category"
                    dataKey="mese"
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    hide={!args.asseY}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="mese"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    hide={!args.asseX}
                  />
                  <YAxis tickLine={false} axisLine={false} width={32} hide={!args.asseY} />
                </>
              )}
              <ChartTooltip itemSorter={ORDINE_DICHIARATO} content={<ChartTooltipContent formatter={valoreIt(config)} />} />
              {args.legenda && <ChartLegend itemSorter={null} content={<ChartLegendContent />} />}
              {famiglie.map((famiglia, i) => (
                <Bar
                  key={famiglia}
                  dataKey={famiglia}
                  fill={`var(--color-${famiglia})`}
                  radius={raggioBarra(i, famiglie.length, args.impilato, args.orizzontali)}
                  stackId={args.impilato ? 'una' : undefined}
                >
                  {args.etichette && (
                    <LabelList
                      position={args.impilato ? 'center' : args.orizzontali ? 'right' : 'top'}
                      offset={args.impilato ? 0 : 12}
                      className="fill-foreground text-xs"
                    />
                  )}
                  {args.impilato && args.totale && i === famiglie.length - 1 && (
                    <LabelList
                      position={args.orizzontali ? 'right' : 'top'}
                      offset={12}
                      className="fill-foreground text-xs font-medium tabular-nums"
                      valueAccessor={(voce) => totaleDellaPila(voce, famiglie)}
                    />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  },
}

/**
 * **Scostamenti: le barre che vanno sotto zero.** È l'esempio shadcn
 * `chart-bar-negative`, sui nostri token — e sta in una story sua perché non è
 * una variante delle barre categoriche: è **una serie sola**, e la cosa che si
 * legge non è «quale famiglia» ma «di quanto è cresciuto o calato».
 *
 * ## Il segno lo dice la posizione, non il colore
 *
 * Una barra sotto la linea dello zero è già negativa senza bisogno di essere
 * di un altro colore, ed è la ragione per cui la **linea dello zero si
 * disegna** (`ReferenceLine`, che prende il colore dai token perché il
 * componente intercetta il `#ccc` che Recharts le cuce addosso). Il colore
 * diverso è un rinforzo, non l'informazione: spegnendo `colori` su `grigio` il
 * grafico si legge lo stesso.
 *
 * ## E i due colori non sono verde e rosso
 *
 * La tentazione è `--success` e `--destructive`, ed è **sbagliata**: un
 * calo di schede aperte non è un errore, e un aumento non è un successo. Gli
 * stati semantici vanno tenuti per ciò che è davvero un esito, altrimenti
 * perdono senso proprio quando serve — è la stessa ragione per cui `progress`
 * non diventa rosso (M2.4). Si usano quindi i primi due pioli della scala,
 * come fa shadcn, che fra loro hanno il passo in grigio e quindi restano
 * distinguibili anche in bianco e nero.
 *
 * ## Due dettagli che il segno cambia
 *
 * **Gli angoli si arrotondano dalla parte opposta allo zero** — in cima se la
 * barra sale, in fondo se scende. Arrotondarli tutti e quattro, come fa il
 * `radius={4}` normale, stacca la barra dalla linea dello zero: sembra
 * appoggiata lì invece che attaccata. L'interruttore `arrotondate` li toglie
 * del tutto, che è la forma più sobria delle due.
 *
 * **L'etichetta si disegna dentro la forma della barra**, non con una
 * `LabelList`. Misurato: su una barra negativa `top`, `bottom` e
 * `insideBottom` finiscono tutte e tre **sopra** la barra, sulla linea dello
 * zero — e nemmeno il `content` della `LabelList` riceve il rettangolo giusto
 * quando la barra ha una `shape` sua. Dentro la `shape`, invece, `x`, `y`,
 * `width`, `height` e `value` ci sono tutti. **Con un'avvertenza misurata**:
 * su una barra negativa Recharts passa `y` al **fondo** e `height`
 * **negativa**, quindi `y + height` è il bordo alto e non quello basso.
 * Prendendo `min` e `max` dei due la formula vale per entrambi i segni, e non
 * c'è niente da indovinare: il numero va sopra se la barra sale, sotto se
 * scende.
 */
export const Scostamenti: Story = {
  argTypes: solo('legenda', 'griglia', 'asseX', 'asseY', 'etichette', 'arrotondate', 'coloreUnico'),
  args: { etichette: true },
  render: (args) => (
    <Card className="w-2xl">
      <CardHeader>
        <CardTitle>Scostamento sul mese prima</CardTitle>
        <CardDescription>Schede aperte, famiglia Calcestruzzi</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          className={`aspect-auto h-72 w-full `}
        >
          <BarChart accessibilityLayer data={scostamenti} margin={{ top: 24, bottom: 24 }}>
            {args.griglia && <CartesianGrid vertical={false} />}
            <XAxis dataKey="mese" tickLine={false} axisLine={false} tickMargin={8} hide={!args.asseX} />
            <YAxis tickLine={false} axisLine={false} width={36} hide={!args.asseY} />
            <ReferenceLine y={0} />
            <ChartTooltip content={<ChartTooltipContent hideLabel hideIndicator formatter={valoreIt(config, { senzaPastiglia: true })} />} />
            {args.legenda && <ChartLegend itemSorter={null} content={<ChartLegendContent />} />}
            <Bar
              dataKey="delta"
              // Il `fill` non lo usa nessuna barra — le dipinge la `shape` una
              // per una — ma è **da qui** che la legenda prende il colore della
              // pastiglia: senza, mostra il nome e un quadratino vuoto.
              fill={`var(--color-${FAMIGLIE[0]!})`}
              shape={(forma: unknown) => {
                const f = forma as { x: number; y: number; width: number; height: number; value?: unknown }
                const su = Number(f.value) >= 0
                const quale = su || args.coloreUnico ? 0 : 1
                return (
                  <g>
                    <Rectangle
                      {...(forma as object)}
                      fill={`var(--color-${FAMIGLIE[quale]!})`}
                      // L'angolo da arrotondare è **sempre** la coppia «alta» dell'array:
                      // su una barra negativa Recharts dà `y` al fondo e `height`
                      // negativa, e `Rectangle` normalizza il rettangolo prima di
                      // applicare i raggi — quindi `[4,4,0,0]` cade sull'estremo
                      // libero in tutti e due i casi. Misurato: con `[0,0,4,4]` sui
                      // negativi si arrotondava la linea dello zero.
                      radius={args.arrotondate ? [4, 4, 0, 0] : 0}
                    />
                    {args.etichette && (
                      <text
                        x={f.x + f.width / 2}
                        y={su ? Math.min(f.y, f.y + f.height) - 8 : Math.max(f.y, f.y + f.height) + 18}
                        textAnchor="middle"
                        className="fill-foreground text-xs tabular-nums"
                      >
                        {Number(f.value) > 0 ? `+${f.value}` : String(f.value)}
                      </text>
                    )}
                  </g>
                )
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/**
 * **Linee, fino a cinque.** È il caso in cui il colore da solo regge meno,
 * perché una linea è un tratto sottile e non un'area: per questo ognuna ha un
 * **tratteggio diverso** — continua, lunga, corta, punto-linea, punteggiata. In
 * bianco e nero le cinque restano cinque, e si può verificarlo spegnendo
 * `tratteggi` con `colori` su `grigio`.
 *
 * `curva` passa da `linear` a `natural`. Non è un gusto: una spezzata dice «ho
 * misurato qui, qui e qui», una curva morbida suggerisce che fra due punti ci
 * sia un andamento che nessuno ha misurato. Su dati mensili radi la spezzata è
 * più onesta, ed è il default.
 */
export const Linee: Story = {
  argTypes: solo('serie', 'legenda', 'griglia', 'asseX', 'asseY', 'etichette', 'pallini', 'tratteggi', 'curva'),
  args: { serie: 5 },
  render: (args) => (
    <Card className="w-2xl">
      <CardHeader>
        <CardTitle>Andamento per famiglia</CardTitle>
        <CardDescription>Colore, chiarezza e tratteggio, tutti e tre insieme</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={`aspect-auto h-72 w-full `}>
          <LineChart accessibilityLayer data={perMese} margin={{ top: 20, left: 4, right: 12 }}>
            {args.griglia && <CartesianGrid vertical={false} />}
            <XAxis
              dataKey="mese"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              hide={!args.asseX}
            />
            <YAxis tickLine={false} axisLine={false} width={32} hide={!args.asseY} />
            <ChartTooltip itemSorter={ORDINE_DICHIARATO} content={<ChartTooltipContent formatter={valoreIt(config)} />} />
            {args.legenda && <ChartLegend itemSorter={null} content={<ChartLegendContent />} />}
            {FAMIGLIE.slice(0, args.serie).map((famiglia, i) => (
              <Line
                key={famiglia}
                dataKey={famiglia}
                type={tipoCurva(args.curva)}
                stroke={`var(--color-${famiglia})`}
                strokeWidth={2}
                strokeDasharray={args.tratteggi ? TRATTEGGI[i] : '0'}
                dot={args.pallini && { fill: `var(--color-${famiglia})` }}
              >
                {args.etichette && <EtichettaSulDato />}
              </Line>
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/**
 * **Aree, e qui c'è una regola Tassullo che il preset shadcn non ha.**
 *
 * Gli esempi shadcn riempiono le aree a `fillOpacity={0.4}`, perché sovrapposte
 * l'una all'altra devono lasciarsi attraversare. Su di noi quel valore
 * **rompe il requisito**: l'opacità mescola il colore della serie col colore
 * della card, e la mescolanza schiaccia tutta la scala verso il fondo. Misurato
 * sui colori composti dal motore di resa, con cinque aree:
 *
 * | | passi in grigio |
 * |---|---|
 * | piene (`fillOpacity 1`) | 1.493 · 1.496 · 1.486 · 1.483 |
 * | traslucide (`0.4`), chiaro | **1.166 · 1.146 · 1.061 · 1.118** |
 * | traslucide (`0.4`), scuro | **1.285 · 1.238 · 1.199 · 1.171** |
 *
 * Sotto 1.45 la scala non tiene più, e a 1.06 due serie adiacenti sono lo
 * stesso grigio. È la quarta volta che l'opacità cambia un colore in
 * composizione senza che nessun token la dichiari — dopo il testo d'errore
 * (M2.2), l'etichetta della sidebar (M2.5) e il giorno disabilitato (M2.7) — e
 * `check:contrast` non può vederla, perché verifica i token, non le
 * composizioni.
 *
 * Quindi: **le aree Tassullo si riempiono piene, e si impilano.** Impilate non
 * si sovrappongono, quindi non c'è niente da attraversare e l'opacità non
 * serve; la scala resta intera e il grafico si legge anche in bianco e nero.
 * Se servono serie che si sovrappongono, il grafico giusto è quello a
 * **linee** — non un'area trasparente.
 *
 * L'interruttore `impilato` è lì apposta per farlo vedere: spegnendolo le aree
 * tornano sovrapposte e traslucide come negli esempi shadcn, ed è il caso da
 * non copiare.
 *
 * ## `sfumatura`, e quando è lecita
 *
 * È il riempimento a gradiente dell'esempio shadcn `chart-area-gradient`: dal
 * colore della serie all'80% in cima al 10% in fondo. **Ha lo stesso difetto
 * della traslucidità, e in forma più radicale** — dentro una sola area il
 * colore cambia dall'alto in basso, quindi il piolo della scala non esiste più
 * come valore unico e due serie non hanno più un passo fra loro.
 *
 * Perciò non è un'alternativa al riempimento pieno, è un'altra cosa: si usa su
 * **una o due serie**, dove la distinzione non deve reggerla il colore perché
 * non c'è niente da distinguere. Su cinque non si usa, e il controllo serve a
 * vederlo. Il gradiente è definito in composizione — un `<linearGradient>` per
 * serie dentro `<defs>` — perché è una scelta del grafico, non del componente.
 */
export const Aree: Story = {
  argTypes: solo('serie', 'legenda', 'griglia', 'asseX', 'asseY', 'etichette', 'impilato', 'sfumatura', 'curva'),
  args: { impilato: true },
  render: (args) => (
    <Card className="w-2xl">
      <CardHeader>
        <CardTitle>Schede aperte per mese</CardTitle>
        <CardDescription>
          {args.sfumatura
            ? 'A sfumatura: bella su una o due serie, illeggibile su cinque'
            : args.impilato
              ? 'Impilate: si legge il totale, e la scala resta intera'
              : 'Sovrapposte e traslucide: il caso da non copiare'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={`aspect-auto h-72 w-full `}>
          <AreaChart accessibilityLayer data={perMese} margin={{ top: 20, left: 4, right: 12 }}>
            {args.griglia && <CartesianGrid vertical={false} />}
            <XAxis
              dataKey="mese"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              hide={!args.asseX}
            />
            <YAxis tickLine={false} axisLine={false} width={32} hide={!args.asseY} />
            <ChartTooltip itemSorter={ORDINE_DICHIARATO} content={<ChartTooltipContent formatter={valoreIt(config)} />} />
            {args.legenda && <ChartLegend itemSorter={null} content={<ChartLegendContent />} />}
            {args.sfumatura && (
              <defs>
                {FAMIGLIE.slice(0, args.serie).map((famiglia) => (
                  <linearGradient key={famiglia} id={`sfumatura-${famiglia}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${famiglia})`} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={`var(--color-${famiglia})`} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
            )}
            {FAMIGLIE.slice(0, args.serie).map((famiglia) => (
              <Area
                key={famiglia}
                dataKey={famiglia}
                type={tipoCurva(args.curva)}
                stackId={args.impilato ? 'una' : undefined}
                stroke={`var(--color-${famiglia})`}
                fill={args.sfumatura ? `url(#sfumatura-${famiglia})` : `var(--color-${famiglia})`}
                fillOpacity={args.sfumatura ? 1 : args.impilato ? 1 : 0.4}
              >
                {args.etichette && <EtichettaSulDato />}
              </Area>
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/**
 * **Torta.** Le fette hanno il nome scritto **fuori, in fondo a una lineetta**:
 * su una torta la legenda a lato costringe a fare la spola fra il colore e il
 * suo nome, e con cinque fette la spola diventa il lavoro principale.
 * L'etichetta attaccata al dato toglie il problema alla radice — e con essa il
 * colore diventa decorazione, che è il posto giusto per il colore.
 *
 * È il `label` di Recharts, cioè la stessa strada dell'esempio shadcn
 * `chart-pie-label`, con la lineetta di richiamo che tiene il testo staccato
 * dalla fetta. La prima stesura usava `LabelList` con `position="outside"`, che
 * incolla il testo al bordo: cambiato dopo la segnalazione di Francesco. Il
 * `label` scrive il valore di `nameKey` così com'è — cioè la chiave, non
 * l'etichetta — quindi la funzione lo traduce leggendo il `config`, che resta
 * il posto unico dove i nomi in italiano stanno scritti.
 *
 * Il colore del testo viene dal ri-stile che shadcn stesso indica,
 * `[&_.recharts-pie-label-text]:fill-foreground`: le etichette della torta sono
 * l'unico testo del set che Recharts non lascia ereditare.
 */
export const Torta: Story = {
  argTypes: solo('serie', 'legenda', 'etichette'),
  args: { serie: 5, etichette: true, legenda: false },
  render: (args) => (
    <Card className="w-lg">
      <CardHeader>
        <CardTitle>Schede in catalogo</CardTitle>
        <CardDescription>Ripartizione per famiglia</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          className={`mx-auto h-80 w-full [&_.recharts-pie-label-text]:fill-foreground `}
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="famiglia" hideLabel formatter={valoreIt(config, { chiaveNome: 'famiglia' })} />} />
            {args.legenda && (
              <ChartLegend
                itemSorter={null}
                height={ALTEZZA_LEGENDA}
                content={<ChartLegendContent nameKey="famiglia" />}
              />
            )}
            <Pie
              data={fetteColorate(args)}
              dataKey="schede"
              nameKey="famiglia"
              outerRadius="62%"
              label={args.etichette ? etichettaFetta : undefined}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/**
 * **Ciambella.** Non è un altro tipo di grafico e non è un altro componente: è
 * la stessa torta con `innerRadius`. Vale la pena saperlo prima di cercare un
 * `donut` che non esiste — nel registry shadcn le due forme sono lo stesso
 * `Pie`, e la differenza è una prop.
 *
 * Il buco al centro serve a qualcosa, però: è il posto dove sta il **totale**,
 * che su una ripartizione è il numero che manca sempre. Le cifre sono
 * tabellari, come tutti i numeri del design system.
 */
export const Ciambella: Story = {
  argTypes: solo('serie', 'legenda', 'etichette'),
  args: { serie: 5, etichette: true, legenda: false },
  render: (args) => {
    const fette = fetteColorate(args)
    return (
      <Card className="w-lg">
        <CardHeader>
          <CardTitle>Schede in catalogo</CardTitle>
          <CardDescription>Ripartizione per famiglia, col totale al centro</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={config}
            className={`mx-auto h-80 w-full [&_.recharts-pie-label-text]:fill-foreground `}
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="famiglia" hideLabel formatter={valoreIt(config, { chiaveNome: 'famiglia' })} />} />
              {args.legenda && (
                <ChartLegend
                itemSorter={null}
                height={ALTEZZA_LEGENDA}
                content={<ChartLegendContent nameKey="famiglia" />}
              />
              )}
              <Pie
                data={fette}
                dataKey="schede"
                nameKey="famiglia"
                outerRadius="62%"
                innerRadius="38%"
                label={args.etichette ? etichettaFetta : undefined}
              >
                <Label content={<TotaleAlCentro totale={totaleDi(fette)} conLegenda={args.legenda} />} />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  },
}
