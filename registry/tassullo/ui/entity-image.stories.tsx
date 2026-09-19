import type { Meta, StoryObj } from '@storybook/react-vite'
import { Factory } from 'lucide-react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/registry/tassullo/ui/card'
import { EntityImage } from '@/registry/tassullo/ui/entity-image'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/registry/tassullo/ui/item'

/**
 * **Il primo componente nostro** — la prima riga di
 * `registry/componenti-propri.json`, che fino a oggi era vuoto (D20, approvata
 * da Francesco il 2026-09-19).
 *
 * Rende la foto di un'entità — una macchina, un impianto, un articolo di
 * catalogo — ritagliata a `4:3` (il default) o a `16:9`, e un **segnaposto**
 * quando la foto non c'è. Nelle app dello studio la foto manca quasi sempre:
 * il segnaposto è la regola, non l'eccezione, e per questo non è un caso
 * limite lasciato al punto di chiamata.
 *
 * ### Cosa è stato provato prima di scriverlo
 *
 * | strada | perché non basta |
 * |---|---|
 * | un componente immagine di shadcn | non esiste |
 * | `aspect-ratio` da sola | dà il rapporto, non il ritaglio né il segnaposto |
 * | `avatar` sovrascritto dal punto di chiamata | **cinque classi da annullare in ogni pagina**: `size-8` e `rounded-full` sulla radice, l'`after:rounded-full` del bordo, `aspect-square rounded-full` sull'immagine, `rounded-full` sul ripiego |
 * | una variante dentro `avatar.tsx` | **vietata dalla regola 4bis**, e il gate lo dimostra: aggiungere un valore all'union di `size` esce 1 con «diverge dall'originale FUORI dalle stringhe di classi» |
 * | `ItemMedia variant="image"` | 40/32/24px quadrati, cioè la **miniatura in riga**, non la foto di una scheda |
 *
 * Il **meccanismo** però non è nuovo: `AvatarImage`/`AvatarFallback` di Base UI
 * *è già* il ramo condizionale, compreso il caso che conta in produzione — la
 * `src` che c'è e non arriva. Qui ci sta dentro un riquadro non tondo, e le
 * cinque classi si annullano **una volta sola**.
 *
 * ### Le tre cose da sapere prima di usarlo
 *
 * 1. **`alt` è obbligatorio, e il tipo è l'unico controllo che lo vede.**
 *    Misurato, non assunto: Base UI scrive `alt=""` su **ogni** `<img>` che
 *    renda senza alt (`internals/useRenderElement.js:183`). Una foto senza
 *    alternativa testuale non dà quindi nessun errore — diventa in silenzio una
 *    foto *decorativa*, e `test:a11y` resta a **zero violazioni**. Da cui due
 *    conseguenze: `alt` è obbligatorio nell'API, e da M4ter.3 la CI esegue
 *    anche `npm run build`, perché `build-storybook` passa da esbuild e i tipi
 *    non li guarda. Per una foto davvero decorativa si passa `alt=""`.
 * 2. **Il raggio sta sulla radice.** Dentro è tutto `rounded-none`, così per
 *    incastrare la foto in testa a una `card` basta
 *    `className="rounded-b-none"` e non restano angoli scoperti.
 * 3. **L'icona del segnaposto si passa**, ed è il punto: `MacchinaIcon` —
 *    stesso SVG, parola per parola — è scritta in **quattro file** di Officina.
 *    Quella duplicazione è la prova della lacuna, non il modello: il segnaposto
 *    è un'icona Lucide, e il dominio lo mette chi chiama.
 *
 * ### La larghezza della cella: **256px**, misurata
 *
 * È il numero che sostituisce le **16 soglie `minmax` distinte** (da 104 a
 * 320px) delle 33 griglie di Studio e Officina. Preso in Chromium vero sulla
 * scena `In griglia di card`, sulle larghezze d'area contenuto misurate sul
 * guscio (`Blocchi/App shell`: colonna 256px, quindi 343 / 960 / 1120px utili):
 *
 * | soglia | telefono 375 | portatile 1280 | scrivania 1440 |
 * |---|---|---|---|
 * | 208px | 1 col · 343×257 | 4 col · **228×171** | 5 col · **211×158** |
 * | 240px | 1 col · 343×257 | 3 col · 309×232 | 4 col · 268×201 |
 * | **256px** | **1 col · 343×257** | **3 col · 309×232** | **4 col · 268×201** |
 * | 288px | 1 col · 343×257 | 3 col · 309×232 | 3 col · 363×272 |
 * | 320px | 1 col · 343×257 | **2 col** · 472×354 | 3 col · 363×272 |
 *
 * Cosa decide, in ordine. **208 cade**: 211px di foto è il fondo delle 16
 * soglie di oggi, ed è la misura che fa leggere un catalogo di macchine come
 * una pagina di francobolli. **320 cade** all'altro estremo: sul portatile —
 * lo schermo più diffuso — scende a due colonne, cioè spende in grandezza lo
 * spazio che servirebbe a vedere più macchine insieme. Fra 256 e 288 la
 * differenza **non esiste dove conta**: sullo schermo del capannone (1280)
 * danno la stessa identica griglia, 3 colonne da 309px. Si separano solo sulla
 * scrivania a 1440, dove 256 dà una macchina in più per riga. Vince 256.
 *
 * E due cose che il numero non dice. È `--container-3xs`, cioè un token della
 * scala **contenitori** e non di `--spacing`: **non scala con la densità**, e
 * deve restare così — una soglia legata a `--spacing` farebbe 384px in touch,
 * cioè più larga dei 343 di un telefono, e la griglia **sborderebbe** invece
 * di ripiegare a una colonna. Ed è la stessa misura della colonna del guscio,
 * che non è una coincidenza da cercare ma una da tenersi.
 *
 * **Un difetto muto da conoscere**: Tailwind v4 emette in CSS **solo i token
 * che un'utility usa davvero**. `--container-2xs` non esiste nel foglio di
 * stile di questo repo, e `minmax(var(--container-2xs), 1fr)` non è un errore:
 * la riga cade, `repeat(auto-fill, …)` ricade su **una colonna a tutta
 * larghezza** (misurato: una foto da 1200×900 a 1440). È la ragione per cui le
 * altre scene qui sotto usano `w-3xs`: è quell'utility a far emettere il token
 * che la griglia legge con `var()`.
 */
const meta = {
  title: 'Primitive/EntityImage',
  component: EntityImage,
} satisfies Meta<typeof EntityImage>

export default meta
type Story = StoryObj<typeof meta>

const FOTO = {
  tornio: '/esempi/macchina-tornio.svg',
  pressa: '/esempi/macchina-pressa.svg',
  fresa: '/esempi/macchina-fresa.svg',
}

/** Il default: `4:3`, la foto ritagliata con `object-cover`. */
export const Predefinita: Story = {
  args: { src: FOTO.tornio, alt: 'Tornio parallelo Graziano SAG 180' },
  render: (args) => (
    <div className="w-3xs">
      <EntityImage {...args} />
    </div>
  ),
}

/**
 * **Senza foto**, che è il caso normale. Il segnaposto dice *foto mancante* —
 * non *errore*: `bg-muted` e `text-muted-foreground`, nessun rosso e nessun
 * bordo d'allarme. La seconda scatola mostra l'icona di dominio passata da
 * chi chiama.
 */
export const SenzaFoto: Story = {
  args: { alt: 'Pressa idraulica OMCN 156' },
  render: (args) => (
    <div className="flex w-xl gap-4">
      <div className="w-3xs">
        <EntityImage {...args} />
      </div>
      <div className="w-3xs">
        <EntityImage
          alt="Linea di imbottigliamento 2"
          icon={<Factory className="size-8" aria-hidden="true" />}
        />
      </div>
    </div>
  ),
}

/**
 * `16:9` accanto a `4:3`, **sulla stessa foto**: si vede che a cambiare è il
 * ritaglio, non la scala. Un rapporto è il valore di una prop, e l'insieme è
 * chiuso a due apposta — sono le **16 soglie `minmax` distinte** di Studio e
 * Officina che si vogliono impedire, non due righe di codice in più.
 */
export const SediciNoni: Story = {
  args: { src: FOTO.fresa, alt: 'Fresatrice CNC Haas VF-2', ratio: '16:9' },
  render: (args) => (
    <div className="flex w-xl items-start gap-4">
      <div className="w-3xs">
        <EntityImage {...args} ratio="4:3" />
      </div>
      <div className="w-3xs">
        <EntityImage {...args} />
      </div>
    </div>
  ),
}

const CATALOGO = [
  { foto: FOTO.tornio, nome: 'Tornio parallelo SAG 180', reparto: 'Reparto 1 · Tornitura' },
  { foto: FOTO.pressa, nome: 'Pressa idraulica OMCN 156', reparto: 'Reparto 2 · Deformazione' },
  { foto: FOTO.fresa, nome: 'Fresatrice CNC Haas VF-2', reparto: 'Reparto 1 · Asportazione' },
  { foto: undefined, nome: 'Trapano a colonna Serrmac', reparto: 'Reparto 3 · Officina' },
  { foto: undefined, nome: 'Compressore Atlas Copco GA11', reparto: 'Centrale aria' },
  { foto: FOTO.pressa, nome: 'Piegatrice Gasparini PBS', reparto: 'Reparto 2 · Deformazione' },
]

/**
 * **La griglia di catalogo**, che è la domanda della larghezza vista
 * dall'altro lato. La soglia è `--container-3xs` (256px) e **non scala con la
 * densità**: una soglia legata a `--spacing` farebbe 384px in touch e a 375px
 * di schermo sborderebbe invece di ripiegare a una colonna.
 *
 * La foto è in testa alla card, quindi `rounded-b-none` e `pt-0` sulla card:
 * `card` toglie il padding di testa da sé solo per un `<img>` figlio diretto,
 * e qui il figlio è un `div`.
 */
export const InGrigliaDiCard: Story = {
  args: { alt: '' },
  render: () => (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns:
          'repeat(auto-fill, minmax(var(--container-3xs), 1fr))',
      }}
    >
      {CATALOGO.map((m) => (
        <Card key={m.nome} className="gap-0 pt-0">
          <EntityImage
            src={m.foto}
            alt={m.foto ? `Foto di ${m.nome}` : ''}
            className="rounded-b-none ring-0"
            icon={<Factory className="size-8" aria-hidden="true" />}
          />
          <CardHeader className="pt-4">
            <CardTitle>{m.nome}</CardTitle>
            <CardDescription>{m.reparto}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  ),
}

/**
 * **La miniatura in riga**, cioè il caso che `ItemMedia variant="image"`
 * copriva male: lì il riquadro è quadrato (40/32/24px) e una foto di macchina
 * dentro un quadrato si taglia sui lati lunghi. Qui il rapporto resta `4:3` e
 * a cambiare è solo la larghezza — `w-16` su `ItemMedia`.
 *
 * L'icona del segnaposto va rimpicciolita dal punto di chiamata: il default è
 * `size-8`, tarato sulla foto di una scheda, e in un riquadro da 64px
 * riempirebbe tutto.
 *
 * Il `role="listitem"` su ogni riga non è decorazione: `ItemGroup` dichiara
 * `role="list"`, e una lista ARIA ammette **solo** `listitem`. È la trappola
 * scritta in testa a `Primitive/Item`, e il gate l'ha presa qui alla prima
 * passata — `aria-required-children`, una violazione su 339 story.
 */
export const MiniaturaInRiga: Story = {
  args: { alt: '' },
  render: () => (
    <ItemGroup className="w-lg">
      {CATALOGO.slice(0, 4).map((m) => (
        <Item key={m.nome} role="listitem" variant="outline">
          <ItemMedia className="w-16">
            <EntityImage
              src={m.foto}
              alt=""
              icon={<Factory className="size-4" aria-hidden="true" />}
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{m.nome}</ItemTitle>
            <ItemDescription>{m.reparto}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  ),
}

/**
 * **Densità touch.** Il riquadro non cambia — la larghezza la decide chi
 * compone, e la soglia della griglia è ferma apposta — ma l'icona del
 * segnaposto sì: `size-8` viene da `--spacing`, quindi passa da 32 a 48px. È
 * il comportamento voluto: il segnaposto è l'unica cosa **disegnata** dal
 * componente, e deve seguire la densità come tutto il resto.
 */
export const DensitaTouch: Story = {
  args: { alt: '' },
  globals: { density: 'touch' },
  render: () => (
    <div className="flex w-xl items-start gap-4">
      <div className="w-3xs">
        <EntityImage src={FOTO.tornio} alt="Tornio parallelo SAG 180" />
      </div>
      <div className="w-3xs">
        <EntityImage alt="Trapano a colonna Serrmac" />
      </div>
    </div>
  ),
}
