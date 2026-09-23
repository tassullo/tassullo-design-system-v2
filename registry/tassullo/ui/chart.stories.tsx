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
 * I grafici: barre, linee, aree, torte e ciambelle disegnate con Recharts, con
 * i colori, la legenda e il tooltip del tema.
 *
 * **Quando sì, quando no.** Per un andamento nel tempo, un confronto fra
 * famiglie, una ripartizione. Un numero solo, con la sua variazione, sta
 * meglio nel blocco `Indicatori`; valori esatti da leggere uno per uno stanno
 * meglio in una tabella.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/chart
 * ```
 *
 * **Parti.** `ChartContainer` riceve un `config` in cui ogni serie ha la sua
 * etichetta in italiano e il suo colore; dentro si mette il grafico di
 * Recharts. `ChartTooltip` con `ChartTooltipContent` e `ChartLegend` con
 * `ChartLegendContent` danno tooltip e legenda. La ciambella non è un
 * componente a sé: è un `Pie` con `innerRadius`.
 *
 * **Regole d'uso.**
 *
 * - Le serie prendono i colori `--chart-1` … `--chart-10`, nell'ordine: è la
 *   tavolozza categorica del tema, descritta in `Tema/Tavolozza categorica`.
 *   Sono tinte per distinguere *categorie*, non stati: i colori di successo ed
 *   errore non si usano per le serie.
 * - Il colore non è mai l'unico mezzo. Le barre hanno la legenda e il valore
 *   nel tooltip, le linee un tratteggio diverso per ciascuna, torta e
 *   ciambella il nome della fetta scritto accanto. La tavolozza non si legge
 *   in bianco e nero, e le prime due tinte — l'arancio e il verde del brand —
 *   stanno sotto il contrasto che un grafico chiede quando il colore è da
 *   solo.
 * - Le aree si riempiono piene e si impilano. Aree traslucide sovrapposte
 *   mescolano il colore con il fondo e le serie si confondono: per serie che
 *   si sovrappongono si usano le linee. La sfumatura si usa con una o due
 *   serie.
 * - Il contenitore ha un'altezza dichiarata, come `h-72`: le proporzioni del
 *   video danno un grafico troppo alto dentro una card larga.
 * - I valori nel tooltip si scrivono con le funzioni dell'item `numeri`,
 *   passate come `formatter` a `ChartTooltipContent`: di suo il componente
 *   lascia la forma del numero al browser. Il `formatter` sostituisce l'intera
 *   riga, quindi riscrive anche nome e pastiglia del colore.
 * - I numeri in un grafico — tooltip, totali, etichette — sono in
 *   `tabular-nums`.
 *
 * **Controlli.** Ogni scena ha i suoi interruttori nel pannello `Controls`:
 * servono a provare le regole — spegnere la legenda su cinque linee, e
 * guardare cosa resta da capire.
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
 * Barre a più serie: la legenda le nomina e il tooltip dà il valore esatto.
 *
 * - **impilato**: affiancate si confrontano le serie, impilate si legge il
 *   totale.
 * - **totale**: con la pila accesa, il numero in cima alla colonna, perché il
 *   totale si legga e non si stimi sull'asse.
 * - **orizzontali**: per categorie con nomi lunghi, che in verticale si
 *   taglierebbero. In Recharts si chiama `layout="vertical"`.
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
              // (su «120» usciva di 3px). 36 tiene anche in densità touch,
              // dove `text-xs` fa 13px.
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
 * Una serie sola che va sopra e sotto lo zero: si legge di quanto è cresciuto
 * o calato. Il segno lo dice la posizione rispetto alla linea dello zero, che
 * si disegna; il colore diverso è un rinforzo, e con `coloreUnico` il grafico
 * si legge lo stesso.
 *
 * I due colori sono le prime due tinte della tavolozza, non verde e rosso: un
 * calo non è un errore. Gli angoli si arrotondano dalla parte opposta allo
 * zero, e il valore sta sopra la barra se sale, sotto se scende.
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
 * Fino a cinque linee, ciascuna con il suo tratteggio: continua, lunga, corta,
 * punto-linea, punteggiata. Spegnendo `tratteggi` si vede quanto il colore da
 * solo regga meno. Di base la linea è spezzata; `curva` la ammorbidisce, ma su
 * dati radi suggerisce un andamento che nessuno ha misurato.
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
 * Aree piene e impilate, la forma da usare. Spegnendo `impilato` tornano
 * sovrapposte e traslucide, ed è il caso da non copiare: le serie si
 * confondono. `sfumatura` riempie a gradiente, e si usa con una o due serie.
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
 * Il nome di ogni fetta è scritto fuori, in fondo a una lineetta: non serve
 * fare la spola fra il colore e la legenda. Le etichette leggono i nomi dal
 * `config`.
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
 * La stessa torta con `innerRadius`. Al centro sta il totale, in cifre
 * tabellari.
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
