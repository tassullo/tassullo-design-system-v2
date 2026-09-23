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
 * La fila di indicatori di un cruscotto: per ognuno l'etichetta, il valore, e
 * sotto la tendenza o una riga di spiegazione.
 *
 * **Quando sì, quando no.** Si usa per i quattro o cinque numeri da leggere a
 * colpo d'occhio in cima a un cruscotto o a una scheda. Un andamento nel tempo
 * è un grafico (`chart`); tanti valori da confrontare in colonna sono una
 * tabella (`table`, `tassullo-data-table`); uno stato di una cosa è un
 * `badge`. Un cruscotto intero è `tassullo-pagina-dashboard`, che monta già
 * questa fila.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-indicatori
 * ```
 *
 * ```tsx
 * <Indicatori
 *   indicatori={[
 *     { etichetta: 'Prodotti attivi', valore: intero(1284), tendenza: { direzione: 'su', valore: '+4,2%' } },
 *     { etichetta: 'Schede in revisione', valore: intero(37), descrizione: 'da chiudere entro venerdì' },
 *   ]}
 * />
 * ```
 *
 * **Le prop.** `indicatori` è l'elenco; ogni indicatore ha `etichetta`,
 * `valore`, e a scelta `descrizione` e `tendenza`, con `direzione` (`"su"`,
 * `"giù"`, `"stabile"`) e `valore`. `GrigliaIndicatori` è la sola griglia,
 * per mettere in fila riquadri propri o gli scheletri del caricamento.
 *
 * **Regole d'uso.**
 *
 * - Il valore arriva già formattato, con le funzioni dell'item `numeri`:
 *   `intero()`, `decimale()`, `valuta()` scrivono sempre il separatore delle
 *   migliaia. Le cifre sono tabellari. Anche il valore della tendenza lo
 *   scrive chi chiama — segno, decimali, unità — e non deve per forza essere
 *   un numero.
 * - La freccia della tendenza non si colora mai: un aumento non è sempre una
 *   buona notizia, e il blocco non sa quale sia. Il giudizio, se serve, sta
 *   nell'etichetta o nella descrizione.
 * - La fila guarda il proprio contenitore, non lo schermo: una colonna sotto i
 *   384px, due fino a 896px, quattro da lì in su.
 * - Un valore lungo in una colonna stretta viene tagliato dal riquadro: sulle
 *   due colonne strette un importo per esteso non ci sta, e si scrive in
 *   forma corta con `formattatore()` dell'item `numeri`.
 * - Il riquadro resta della taglia normale: la taglia piccola della `Card`
 *   rimpicciolisce il numero fino alla misura della sua etichetta.
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
 * Quattro indicatori su una riga, in un contenitore più largo di 896px.
 */
export const Quattro: Story = {
  args: { indicatori: QUATTRO },
}

/**
 * Solo etichetta e valore: senza tendenza né descrizione il riquadro non ha la
 * riga in basso.
 */
export const SenzaTendenza: Story = {
  args: {
    indicatori: QUATTRO.map(({ etichetta, valore }) => ({ etichetta, valore })),
  },
}

/**
 * Le tre direzioni una accanto all'altra, tutte dello stesso colore. Il valore
 * della tendenza può essere una parola, come «invariate».
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
 * Due contenitori stretti: sotto i 384px un indicatore per riga, e l'importo
 * per esteso ci sta; a due colonne gli importi vanno in forma corta.
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

/**
 * Un contenitore da 672px: due colonne, anche su uno schermo largo.
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
