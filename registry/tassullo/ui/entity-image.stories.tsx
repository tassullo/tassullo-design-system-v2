import type { Meta, StoryObj } from '@storybook/react-vite'
import { Layers } from 'lucide-react'

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
 * Rende la foto di un'entità — un sistema, un prodotto, una macchina, un
 * impianto — ritagliata a un rapporto dichiarato, e un **segnaposto** quando la
 * foto non c'è. Nelle app dello studio la foto manca spesso: il segnaposto è
 * parte del componente, non un caso limite lasciato al punto di chiamata.
 *
 * ### Cosa è stato provato prima di scriverlo
 *
 * | strada | perché non basta |
 * |---|---|
 * | un componente immagine di shadcn | non esiste |
 * | `aspect-ratio` da sola | dà il rapporto, non il ritaglio né il segnaposto |
 * | `avatar` sovrascritto dal punto di chiamata | **cinque classi da annullare in ogni pagina**: `size-8` e `rounded-full` sulla radice, l'`after:rounded-full` del bordo, `aspect-square rounded-full` sull'immagine, `rounded-full` sul ripiego |
 * | una variante dentro `avatar.tsx` | **vietata dalla regola 4bis**, e il gate lo dimostra: aggiungere un valore all'union di `size` esce 1 con «diverge dall'originale FUORI dalle stringhe di classi» |
 * | `ItemMedia variant="image"` | 40/32/24px **quadrati e fissi**: è la miniatura in riga, non la foto di una scheda, e la larghezza non si sceglie |
 *
 * Il **meccanismo** però non è nuovo: `AvatarImage`/`AvatarFallback` di Base UI
 * *è già* il ramo condizionale, compreso il caso che conta in produzione — la
 * `src` che c'è e non arriva. Qui ci sta dentro un riquadro non tondo, e le
 * cinque classi si annullano **una volta sola**.
 *
 * ### I tre rapporti, e perché sono tre
 *
 * `4:3` di default, `16:9` e **`1:1`**. L'insieme è chiuso apposta: sono le
 * **16 soglie `minmax` distinte** (104→320px) delle 33 griglie di Studio e
 * Officina che si vogliono impedire, e un insieme che cresce a ogni richiesta
 * non è un insieme chiuso. Ogni valore va quindi giustificato con **un
 * consumatore e una misura**.
 *
 * `1:1` è entrato il 2026-09-19, su rilievo di Francesco, e di consumatori ne
 * ha due: **tutta la libreria di immagini di Tassullo è quadrata** — i render
 * di stratigrafia dei sistemi sono 1080×1080, le foto pacco dei prodotti
 * 1800×1800. Su una sorgente quadrata `object-cover` a `4:3` toglie il **25%**
 * dell'altezza e a `16:9` il **43,75%**, e sul sacco di INTOCALX — che è un
 * soggetto **verticale** dentro un quadrato — non è fondo bianco che se ne va:
 * a `4:3` si perde la base del pacco, a `16:9` anche il nome. La scena
 * `Rapporti` lo mette in fila.
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
 * È il numero che sostituisce le 16 soglie di oggi. Preso in Chromium vero
 * sulla scena `In griglia di card`, sulle larghezze d'area contenuto misurate
 * sul guscio (`Blocchi/App shell`: colonna 256px, quindi 343 / 960 / 1120px
 * utili):
 *
 * | soglia | telefono 375 | portatile 1280 | scrivania 1440 |
 * |---|---|---|---|
 * | 208px | 1 col · 343 | 4 col · **228** | 5 col · **211** |
 * | 240px | 1 col · 343 | 3 col · 309 | 4 col · 268 |
 * | **256px** | **1 col · 343** | **3 col · 309** | **4 col · 268** |
 * | 288px | 1 col · 343 | 3 col · 309 | 3 col · 363 |
 * | 320px | 1 col · 343 | **2 col** · 472 | 3 col · 363 |
 *
 * **208 cade**: 211px di foto è il fondo delle 16 soglie di oggi, ed è la
 * misura che fa leggere un catalogo come una pagina di francobolli. **320
 * cade** all'altro estremo: sul portatile — lo schermo più diffuso — scende a
 * due colonne, cioè spende in grandezza lo spazio che servirebbe a vedere più
 * schede insieme. Fra 256 e 288 la differenza **non esiste dove conta**: a 1280
 * danno la stessa identica griglia. Si separano solo a 1440, dove 256 dà una
 * scheda in più per riga. Vince 256.
 *
 * È una **larghezza**, quindi non si muove col rapporto: la tabella vale
 * identica in `4:3` e in `1:1`, a cambiare è solo l'altezza della cella.
 *
 * E due cose che il numero non dice. È `--container-3xs`, cioè un token della
 * scala **contenitori** e non di `--spacing`: **non scala con la densità**, e
 * deve restare così — una soglia legata a `--spacing` farebbe 384px in touch,
 * cioè più larga dei 343 di un telefono, e la griglia **sborderebbe** invece
 * di ripiegare a una colonna.
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

/**
 * Immagini vere di Tassullo, prese dal sito su indicazione di Francesco
 * (2026-09-19): i `sistema-*` dalla sezione **Sistemi**, i `prodotto-*` dalla
 * linea **Wall**, `cantiere` è la fotografia di testata dei Sistemi.
 *
 * Sono **locali** di proposito, e non è pignoleria: con indirizzi remoti, in
 * una CI senza rete l'immagine non arriva, `AvatarFallback` ripiega, e le scene
 * «con foto» misurerebbero il **segnaposto**. Provenienza e confini in
 * `public/esempi/LEGGIMI.md`.
 */
const FOTO = {
  cappotto: '/esempi/sistema-cappotto.jpg',
  seta: '/esempi/sistema-effetto-seta.jpg',
  ripristino: '/esempi/sistema-ripristino-storico.jpg',
  crm: '/esempi/sistema-crm.jpg',
  risanamento: '/esempi/sistema-risanamento.jpg',
  radiante: '/esempi/sistema-radiante.jpg',
  intocalx: '/esempi/prodotto-intocalx.jpg',
  opus: '/esempi/prodotto-opus.jpg',
  t300: '/esempi/prodotto-t300.jpg',
  cantiere: '/esempi/cantiere.jpg',
}

/**
 * Il default: `4:3`, la foto ritagliata con `object-cover`. Qui la sorgente è
 * una fotografia larga (1920×931), che è il caso in cui `4:3` è il rapporto
 * giusto — si toglie ai lati, e ai lati non c'è il soggetto.
 */
export const Predefinita: Story = {
  args: { src: FOTO.cantiere, alt: 'Ponteggio su una facciata in restauro' },
  render: (args) => (
    <div className="w-3xs">
      <EntityImage {...args} />
    </div>
  ),
}

/**
 * **Senza foto.** Il segnaposto dice *foto mancante* — non *errore*:
 * `bg-muted` e `text-muted-foreground`, nessun rosso e nessun bordo d'allarme.
 * La seconda scatola mostra l'icona di dominio passata da chi chiama, qui
 * `Layers`, che per un sistema Tassullo è la stratigrafia.
 */
export const SenzaFoto: Story = {
  args: { alt: 'Sistema Antiribaltamento' },
  render: (args) => (
    <div className="flex w-xl gap-4">
      <div className="w-3xs">
        <EntityImage {...args} />
      </div>
      <div className="w-3xs">
        <EntityImage
          alt="Sistema Coccio"
          icon={<Layers className="size-8" aria-hidden="true" />}
        />
      </div>
    </div>
  ),
}

/**
 * **I tre rapporti sulla stessa sorgente**, e la sorgente è quella vera: la
 * foto pacco di INTOCALX, **1800×1800**, con un soggetto verticale al centro.
 *
 * Si vede che a cambiare è il **ritaglio**, non la scala — e che su una
 * sorgente quadrata il ritaglio non toglie fondo bianco, toglie prodotto:
 * `4:3` porta via il **25%** dell'altezza e con esso la base del sacco, `16:9`
 * il **43,75%** e con esso anche il nome. È il motivo per cui `1:1` esiste
 * (v. il blocco in testa), e anche il motivo per cui l'insieme resta a tre.
 */
export const Rapporti: Story = {
  args: { src: FOTO.intocalx, alt: 'Sacco da 25 kg di INTOCALX' },
  render: (args) => (
    <div className="flex w-2xl items-start gap-4">
      {(['4:3', '16:9', '1:1'] as const).map((r) => (
        <div key={r} className="w-3xs">
          <EntityImage {...args} ratio={r} />
          <p className="mt-2 text-sm text-muted-foreground">{r}</p>
        </div>
      ))}
    </div>
  ),
}

const CATALOGO = [
  { foto: FOTO.cappotto, nome: 'Cappotto', categoria: 'Edilizia civile' },
  { foto: FOTO.seta, nome: 'Effetto seta', categoria: 'Finiture di pregio' },
  { foto: FOTO.ripristino, nome: 'Ripristino storico', categoria: 'Restauro' },
  { foto: FOTO.crm, nome: 'CRM', categoria: 'Rinforzi strutturali' },
  { foto: FOTO.risanamento, nome: 'Risanamento', categoria: 'Risanamento e impermeabilizzazioni' },
  { foto: FOTO.radiante, nome: 'Radiante', categoria: 'Sottofondi e posa rivestimenti' },
  { foto: undefined, nome: 'Antiribaltamento', categoria: 'Rinforzi strutturali' },
  { foto: undefined, nome: 'Coccio', categoria: 'Sottofondi e posa rivestimenti' },
]

/**
 * **La griglia di catalogo**, che è la domanda della larghezza vista
 * dall'altro lato. La soglia è `--container-3xs` (256px) e **non scala con la
 * densità**: una soglia legata a `--spacing` farebbe 384px in touch e a 375px
 * di schermo sborderebbe invece di ripiegare a una colonna.
 *
 * Rapporto **`1:1`**, perché le sorgenti sono quadrate: sono i sei render di
 * stratigrafia del sito, uno per categoria di sistema, più due schede senza
 * foto. La tabella delle larghezze in testa vale identica — 256px è una
 * larghezza, e il rapporto muove solo l'altezza.
 *
 * La foto è in testa alla card, quindi `rounded-b-none` e `pt-0` sulla card:
 * `card` toglie il padding di testa da sé solo per un `<img>` figlio diretto,
 * e qui il figlio è un `div`.
 */
export const InGrigliaDiCard: Story = {
  args: { alt: '' },
  // `layout: 'padded'` e non il `centered` del preview: il canvas centrato
  // stringe il contenuto al suo contenuto, e una griglia `auto-fill` dentro un
  // contenitore che si stringe misura **sé stessa** invece della pagina — a
  // 1440 rendeva 2 colonne invece di 4, cioè proprio il numero che questa
  // scena esiste per far vedere.
  parameters: { layout: 'padded' },
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
            alt={m.foto ? `Stratigrafia del sistema ${m.nome}` : ''}
            ratio="1:1"
            className="rounded-b-none ring-0"
            icon={<Layers className="size-8" aria-hidden="true" />}
          />
          <CardHeader className="pt-4">
            <CardTitle>{m.nome}</CardTitle>
            <CardDescription>{m.categoria}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  ),
}

const PRODOTTI = [
  { foto: FOTO.intocalx, nome: 'INTOCALX', riga: 'Intonaco di fondo · 25 kg' },
  { foto: FOTO.opus, nome: 'OPUS', riga: 'Finitura a calce · 25 kg' },
  { foto: FOTO.t300, nome: 'T 300', riga: 'Rasante · 25 kg' },
  { foto: undefined, nome: 'RETE 160', riga: 'Rete in fibra di vetro · rotolo' },
]

/**
 * **La miniatura in riga**, cioè il caso che `ItemMedia variant="image"`
 * copriva male: lì il riquadro è **fisso** a 40/32/24px e sempre quadrato, e
 * la larghezza non si sceglie. Qui la larghezza la dà chi compone (`w-16` su
 * `ItemMedia`) e il rapporto si dichiara — `1:1`, perché le foto pacco sono
 * quadrate.
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
      {PRODOTTI.map((p) => (
        <Item key={p.nome} role="listitem" variant="outline">
          <ItemMedia className="w-16">
            <EntityImage
              src={p.foto}
              alt=""
              ratio="1:1"
              icon={<Layers className="size-4" aria-hidden="true" />}
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{p.nome}</ItemTitle>
            <ItemDescription>{p.riga}</ItemDescription>
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
        <EntityImage src={FOTO.cappotto} alt="Stratigrafia del sistema Cappotto" ratio="1:1" />
      </div>
      <div className="w-3xs">
        <EntityImage alt="Sistema Antiribaltamento" ratio="1:1" />
      </div>
    </div>
  ),
}
