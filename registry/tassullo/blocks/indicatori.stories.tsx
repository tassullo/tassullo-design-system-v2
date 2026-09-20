import type { Meta, StoryObj } from '@storybook/react-vite'

import { Indicatori, type Indicatore } from '@/registry/tassullo/blocks/indicatori'

/**
 * La fila di indicatori — etichetta, valore, tendenza — nella forma che vale
 * in ogni app Tassullo. È lo **scorporo** di M4ter.7: fino a ieri era una
 * funzione non esportata dentro `tassullo-pagina-dashboard`, e tre app la
 * riscrivevano identica (Anagrafe AdminBC, Studio Admin, RadarOpere) perché
 * non c'era modo di installarla senza la dashboard intera.
 *
 * ```tsx
 * <Indicatori
 *   indicatori={[
 *     { etichetta: 'Prodotti attivi', valore: '1.284', tendenza: { direzione: 'su', valore: '+4,2%' } },
 *   ]}
 * />
 * ```
 *
 * ── La soglia è del blocco, ed è questa la scena che lo prova ────────────
 *
 * Un blocco che nasce per essere installato **fuori** dalla dashboard non può
 * nominare un contenitore che la dashboard dichiara. La riga nasceva con
 * `@4xl/dashboard:grid-cols-4`: spedita così, in una pagina qualunque, la
 * query non avrebbe mai trovato il contenitore — **due colonne per sempre**,
 * nessun errore, nessun avviso, `test:a11y` verde. Il blocco dichiara quindi
 * il proprio `@container/indicatori`, e `Quattro` qui sotto è la scena che lo
 * misura: fuori dalla dashboard, a finestra 1440, `grid-template-columns` dà
 * `340px 340px 340px 340px`. Con la classe vecchia, la stessa fila spostata
 * fuori dal contenitore della dashboard dava `628px 628px`.
 *
 * Contenitore e griglia sono **due nodi**: una container query si applica ai
 * discendenti del contenitore, mai all'elemento che lo dichiara.
 *
 * ── Il numero e la `Card` ────────────────────────────────────────────────
 *
 * La `Card` resta di taglia **normale**. `size="sm"` porterebbe
 * `group-data-[size=sm]/card:text-sm`, che vince su `text-2xl` e rende il
 * numero alla stessa misura della sua etichetta — 13px invece di 27, misurati
 * in Chromium. È il difetto muto di M4.4, e si verifica misurando.
 *
 * ── La freccia non si colora mai ─────────────────────────────────────────
 *
 * `direzione` sceglie la freccia, mai un colore. Un aumento non è un successo
 * e un calo non è un errore: «schede aperte» che sale è un problema, «pratiche
 * chiuse» che sale è una buona notizia — e il blocco non sa quale dei due sta
 * mostrando. Stessa regola già misurata su `Primitive/Chart`, story
 * `Scostamenti`.
 */
const meta = {
  title: 'Blocchi/Indicatori',
  component: Indicatori,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Indicatori>

export default meta
type Story = StoryObj<typeof meta>

const QUATTRO: Indicatore[] = [
  {
    etichetta: 'Prodotti attivi',
    valore: '1.284',
    tendenza: { direzione: 'su', valore: '+4,2%' },
    descrizione: 'rispetto al trimestre scorso',
  },
  {
    etichetta: 'Schede in revisione',
    valore: '37',
    tendenza: { direzione: 'giù', valore: '−12' },
    descrizione: 'chiuse questa settimana',
  },
  {
    etichetta: 'Norme in scadenza',
    valore: '6',
    tendenza: { direzione: 'stabile', valore: 'invariate' },
  },
  {
    etichetta: 'Sistemi certificati',
    valore: '412',
    tendenza: { direzione: 'su', valore: '+9' },
  },
]

/**
 * La forma piena, **fuori dalla dashboard**: quattro riquadri su una riga
 * sopra gli 896px del proprio contenitore. È la scena che distingue uno
 * scorporo riuscito da uno che rende due colonne per sempre — e il modo di
 * guardarla è contare le colonne nel DOM, non a occhio.
 */
export const Quattro: Story = {
  args: { indicatori: QUATTRO },
}

/**
 * Solo etichetta e valore: senza `tendenza` né `descrizione` il riquadro non
 * rende affatto la riga in basso — un piede vuoto sotto un numero si legge
 * come un dato che manca.
 */
export const SenzaTendenza: Story = {
  args: {
    indicatori: QUATTRO.map(({ etichetta, valore }) => ({ etichetta, valore })),
  },
}

/**
 * Le tre direzioni una accanto all'altra. Nessuna delle tre è verde o rossa,
 * ed è deliberato: il giudizio su cosa sia una buona notizia appartiene
 * all'indicatore, non alla freccia.
 *
 * `valore` della tendenza è **già formattato dal chiamante** — segno,
 * separatori, unità: sa tutto questo solo chi conosce il dominio. Qui
 * «invariate» dimostra che non deve nemmeno essere un numero.
 */
export const Tendenze: Story = {
  args: {
    indicatori: [
      { etichetta: 'Pratiche chiuse', valore: '218', tendenza: { direzione: 'su', valore: '+14%' } },
      { etichetta: 'Schede aperte', valore: '52', tendenza: { direzione: 'giù', valore: '−7' } },
      { etichetta: 'Fornitori qualificati', valore: '96', tendenza: { direzione: 'stabile', valore: 'invariati' } },
    ],
  },
}

/**
 * La stessa fila dentro un contenitore da 672px — un pannello laterale, una
 * colonna di dettaglio, una dashboard con la barra di navigazione aperta.
 *
 * **Due colonne, e la finestra non è cambiata di un pixel.** È la prova che
 * la soglia guarda il contenitore e non lo schermo: con una media query
 * (`xl:grid-cols-4`) qui resterebbero quattro riquadri da 156px, perché la
 * finestra è larga uguale alla scena sopra.
 */
export const InUnPannelloStretto: Story = {
  args: { indicatori: QUATTRO },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">Contenitore largo 672px (max-w-2xl).</p>
      <div className="max-w-2xl">
        <Indicatori {...args} />
      </div>
    </div>
  ),
}
