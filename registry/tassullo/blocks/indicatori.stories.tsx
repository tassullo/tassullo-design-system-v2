import type { Meta, StoryObj } from '@storybook/react-vite'

import { Indicatori, type Indicatore } from '@/registry/tassullo/blocks/indicatori'
import { formattatore, intero, valuta } from '@/registry/tassullo/lib/numeri'

/**
 * **I valori si formattano, non si scrivono.** Un `'€ 12.847.503,40'` scritto
 * a mano è la riga in cui la convenzione Tassullo si perde (`docs/DECISIONI.md`
 * §47): il punto delle migliaia in italiano è **intermittente**, e a scriverlo
 * a mano si perde proprio quando serve.
 */
const FATTURATO = 12_847_503.4
const ORDINATO = 1_284_500
const TONNELLATE = 12_847_503

/**
 * La forma corta, per quando la carta è stretta: `notation: "compact"` sopra
 * la convenzione. È ciò che `formattatore` serve a fare — un caso che
 * `intero`/`decimale`/`valuta` non coprono, senza aggiungerne una quarta.
 */
const COMPATTO = formattatore({
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

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
/**
 * **Sotto i 384px di contenitore, uno per riga.** Non è la griglia che si
 * arrende: sotto quella larghezza la carta scende sotto i 200px e un valore
 * lungo **sborda dalla `Card`**, che ha `overflow-hidden` — quindi non sbava,
 * si taglia, e nessun gate lo vede.
 *
 * Misurato sui rettangoli di riga del testo, perché `scrollWidth` su un
 * titolo che va a capo non vede niente (il testo si impila invece di
 * sbordare, e la sonda ingenua dice che va tutto bene): a 375px di finestra,
 * a due colonne la carta è 164px e `€ 1.284.500,00` sborda; a una è 343px e
 * ci stanno tutti su una riga, valuta a otto cifre compresa.
 *
 * Il prezzo è l'altezza: la fila passa da 303 a 553px a 375px di finestra
 * (425 → 718 in touch). È il motivo per cui una colonna resta il pavimento
 * **solo** quaggiù, e non il comportamento normale.
 */
export const UnoPerRiga: Story = {
  args: {
    indicatori: [
      { etichetta: 'Fatturato a budget', valore: valuta(FATTURATO), tendenza: { direzione: 'su', valore: '+6,1%' } },
      { etichetta: 'Ordinato', valore: valuta(ORDINATO), tendenza: { direzione: 'giù', valore: '−3,4%' } },
      { etichetta: 'Tonnellate spedite', valore: intero(TONNELLATE) },
      { etichetta: 'Commesse aperte', valore: intero(37) },
    ],
  },
  render: (args) => (
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs">
          Contenitore largo 320px — sotto i 384px la griglia va a una colonna, e
          la valuta per esteso ci sta.
        </p>
        <div className="w-80">
          <Indicatori {...args} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs">
          Contenitore largo 400px — due colonne, carta 192px. Per esteso,{' '}
          {valuta(FATTURATO)} sborda di 20px e la Card lo taglia: qui i due
          importi sono in forma corta, ed è tutto il rimedio che serve.
        </p>
        <div className="w-100">
          <Indicatori
            indicatori={[
              { etichetta: 'Fatturato a budget', valore: COMPATTO.format(FATTURATO), tendenza: { direzione: 'su', valore: '+6,1%' } },
              { etichetta: 'Ordinato', valore: COMPATTO.format(ORDINATO), tendenza: { direzione: 'giù', valore: '−3,4%' } },
              { etichetta: 'Tonnellate spedite', valore: intero(TONNELLATE) },
              { etichetta: 'Commesse aperte', valore: intero(37) },
            ]}
          />
        </div>
      </div>
    </div>
  ),
}

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
