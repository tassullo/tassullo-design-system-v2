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
 * La foto di una cosa — un sistema, un prodotto, una macchina, un impianto —
 * ritagliata a un rapporto fisso, con un segnaposto quando la foto non c'è.
 *
 * **Quando sì, quando no.** Per l'immagine di una scheda o di una card di
 * catalogo, e per la miniatura in una riga di elenco. Il segnaposto fa parte
 * del componente, perché la foto manca spesso. Per una persona si usa
 * `avatar`; per un riquadro a rapporto fisso con un contenuto qualsiasi,
 * `aspect-ratio`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/entity-image
 * ```
 *
 * **Opzioni.** `src` è la foto; senza, o se non arriva, compare il segnaposto.
 * `alt` è obbligatorio. `ratio`: `4:3` (di base), `16:9` o `1:1`, e non altri.
 * `icon` è l'icona del segnaposto, di solito un'icona Lucide del dominio —
 * `Layers` per un sistema, per esempio; senza, compare un'immagine mancante.
 *
 * **Regole d'uso.**
 *
 * - `alt` descrive la foto. Per una foto davvero decorativa si scrive
 *   `alt=""`, esplicito.
 * - Il rapporto segue la sorgente: le foto larghe prendono `4:3` o `16:9`, le
 *   immagini quadrate — i render dei sistemi, le foto pacco dei prodotti —
 *   prendono `1:1`, perché ritagliarle toglie prodotto, non fondo.
 * - Il raggio sta sulla radice: in testa a una `card` si aggiunge
 *   `className="rounded-b-none"`, e alla card `pt-0`.
 * - La larghezza la decide chi compone. In una griglia di catalogo la soglia
 *   delle colonne è `--container-3xs` (256px), con
 *   `grid-cols-[repeat(auto-fill,minmax(var(--container-3xs),1fr))]` o la
 *   forma equivalente: non segue la densità, di proposito, così su un telefono
 *   la griglia ripiega a una colonna invece di sbordare. Il token esiste nel
 *   foglio di stile solo se qualche utility lo usa, come `w-3xs`.
 * - Il componente non dipinge un fondo dietro la foto: le immagini scontornate
 *   si posano sulla superficie della card. Il grigio sta solo sul segnaposto.
 * - In una miniatura l'icona del segnaposto si rimpicciolisce dal punto di
 *   chiamata.
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
 * Sono **PNG scontornati, senza fondo** — rifatti da Francesco il 2026-09-19,
 * dopo che la prima versione su bianco aveva fatto emergere il problema: una
 * foto su fondo bianco dentro una card scura è un blocco chiaro. Il fondo
 * appartiene alla pagina, non all'immagine. `cantiere.jpg` resta una
 * fotografia con il suo sfondo, perché una fotografia non si scontorna.
 *
 * Sono **locali** di proposito, e non è pignoleria: con indirizzi remoti, in
 * una CI senza rete l'immagine non arriva, `AvatarFallback` ripiega, e le scene
 * «con foto» misurerebbero il **segnaposto**. Provenienza e confini in
 * `public/esempi/LEGGIMI.md`.
 */
const FOTO = {
  cappotto: 'esempi/sistema-cappotto.png',
  seta: 'esempi/sistema-effetto-seta.png',
  ripristino: 'esempi/sistema-ripristino-storico.png',
  crm: 'esempi/sistema-crm.png',
  risanamento: 'esempi/sistema-risanamento.png',
  radiante: 'esempi/sistema-radiante.png',
  intocalx: 'esempi/prodotto-intocalx.png',
  opus: 'esempi/prodotto-opus.png',
  t300: 'esempi/prodotto-t300.png',
  cantiere: 'esempi/cantiere.jpg',
}

/**
 * Il rapporto di base, `4:3`, su una foto larga: il ritaglio toglie ai lati,
 * dove non c'è il soggetto.
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
 * Senza foto: il segnaposto dice «foto mancante», non «errore» — fondo tenue,
 * nessun rosso. La seconda scatola porta l'icona passata da chi chiama,
 * `Layers`.
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
 * I tre rapporti sulla stessa foto quadrata di un prodotto: a cambiare è il
 * ritaglio, non la scala. A `4:3` si perde la base del sacco, a `16:9` anche
 * il nome; a `1:1` c'è tutto.
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
 * Una griglia di catalogo con soglia di colonna a 256px e rapporto `1:1`,
 * perché le sorgenti sono quadrate; due schede sono senza foto. La foto è in
 * testa alla card, con `rounded-b-none` sull'immagine e `pt-0` sulla card.
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
 * La miniatura in una riga di elenco: la larghezza la dà `w-16` su
 * `ItemMedia`, il rapporto è `1:1`, e l'icona del segnaposto è rimpicciolita
 * dal punto di chiamata. Ogni riga ha `role="listitem"`, perché `ItemGroup` è
 * una lista.
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
 * In densità touch il riquadro resta della larghezza scelta da chi compone;
 * cresce solo l'icona del segnaposto, come tutto ciò che il componente
 * disegna.
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
