import { Fragment } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ChevronRightIcon,
  DownloadIcon,
  FileTextIcon,
  HardHatIcon,
  ImageIcon,
  MoreHorizontalIcon,
  PackageIcon,
  ShieldCheckIcon,
} from 'lucide-react'

import { TONO } from '@/registry/tassullo/lib/toni'
import { Avatar, AvatarFallback } from '@/registry/tassullo/ui/avatar'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/registry/tassullo/ui/item'
import { Switch } from '@/registry/tassullo/ui/switch'

/**
 * La riga di un elenco che non è una tabella: un allegato, un'impostazione,
 * una persona, una voce da scegliere.
 *
 * **Quando sì, quando no.** Per elenchi brevi di cose omogenee, ciascuna con
 * un'icona o un'immagine, un titolo, una descrizione e le sue azioni. Se
 * l'elenco ha bisogno di ordinamento, ricerca, colonne o paginazione, non è un
 * elenco ma una tabella: si usa il blocco `Data Table`, spegnendo ciò che non
 * serve. Un contenitore che raccoglie informazioni diverse su una cosa sola è
 * una `card`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/item
 * ```
 *
 * **Parti.** `Item` è la riga; dentro, in quest'ordine, `ItemMedia` (icona o
 * immagine), `ItemContent` con `ItemTitle` e `ItemDescription`, e
 * `ItemActions`. `ItemHeader` e `ItemFooter` occupano tutta la larghezza sopra
 * e sotto il contenuto. `ItemGroup` raccoglie più righe in una lista;
 * `ItemSeparator` mette il filo fra una riga e l'altra.
 *
 * **Varianti e taglie.** `variant`: `default` (senza bordo, per stare dentro
 * un riquadro che il bordo ce l'ha), `outline` (la riga autonoma), `muted`
 * (fondo tenue). `size`: `default`, `sm`, `xs`. `ItemMedia` ha `variant`:
 * `default`, `icon`, `image`; la miniatura si rimpicciolisce con la taglia
 * della riga.
 *
 * **Regole d'uso.**
 *
 * - Dentro un `ItemGroup`, che è una lista, ogni `Item` porta
 *   `role="listitem"` e ogni `ItemSeparator` porta `aria-hidden`.
 * - Una riga che porta a un'altra pagina è un collegamento intero: `render`
 *   con `<a href="…">` sull'`Item`. In quel caso le righe non vanno in un
 *   `ItemGroup` ma in una `<ul>` con le sue `<li>`, perché il ruolo di lista
 *   toglierebbe alla riga quello di collegamento.
 * - Per una persona, in `ItemMedia` va un `Avatar`, senza `variant`.
 * - I link nella descrizione sono già nel colore giusto e non si ricolorano.
 */
const meta = {
  title: 'Primitive/Item',
  component: Item,
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Una miniatura finta. **Non è un'immagine vera di proposito**: il repo è
 * pubblico e non ci entrano binari (stessa regola dei font), e un `data:` con
 * un esadecimale dentro violerebbe la regola 3. Il riquadro prende la
 * dimensione da `ItemMedia variant="image"`, che è ciò che la scena deve
 * mostrare.
 */
function Miniatura() {
  return (
    <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
      <ImageIcon className="size-4" />
    </div>
  )
}

/**
 * La forma nuda: media, contenuto, azioni.
 */
export const Predefinito: Story = {
  render: () => (
    <Item variant="outline" className="max-w-md">
      <ItemMedia variant="icon">
        <FileTextIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>UNI_EN_1090-2_2018.pdf</ItemTitle>
        <ItemDescription>2,4 MB · caricato il 12/09/2026</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon" aria-label="Scarica UNI_EN_1090-2_2018.pdf">
          <DownloadIcon />
        </Button>
      </ItemActions>
    </Item>
  ),
}

/**
 * Le tre varianti a confronto: `default` senza bordo, `outline` col bordo,
 * `muted` col fondo tenue.
 */
export const Varianti: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      {(['default', 'outline', 'muted'] as const).map((variante) => (
        <Item key={variante} variant={variante}>
          <ItemMedia variant="icon">
            <ImageIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>variant="{variante}"</ItemTitle>
            <ItemDescription>Foto di cantiere, 1,1 MB</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
}

/**
 * Le tre taglie, in un `ItemGroup` con miniatura. `sm` stringe lo spazio sopra
 * e sotto, fra una riga e l'altra e la miniatura; `xs` stringe anche ai lati.
 */
export const Taglie: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      {(['default', 'sm', 'xs'] as const).map((taglia) => (
        <ItemGroup key={taglia}>
          {['Relazione di calcolo', 'Scheda tecnica'].map((titolo) => (
            <Item key={titolo} role="listitem" variant="outline" size={taglia}>
              <ItemMedia variant="image">
                <Miniatura />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  size="{taglia}" — {titolo}
                </ItemTitle>
                <ItemDescription>PDF, 1,2 MB</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      ))}
    </div>
  ),
}

/**
 * Un'impostazione: titolo, spiegazione e interruttore.
 */
export const Impostazione: Story = {
  render: () => (
    <ItemGroup className="max-w-lg">
      <Item role="listitem" variant="outline">
        <ItemMedia variant="icon">
          <ShieldCheckIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Pubblicazione automatica</ItemTitle>
          <ItemDescription>
            Le schede approvate vanno in catalogo senza un secondo passaggio.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Switch aria-label="Pubblicazione automatica" defaultChecked />
        </ItemActions>
      </Item>
      {/* Due attributi, e nessuno dei due è pignoleria — v. il commento di
          testa, «Le due trappole di ItemGroup». */}
      <ItemSeparator aria-hidden />
      <Item role="listitem" variant="outline">
        <ItemMedia variant="icon">
          <ShieldCheckIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Notifica ai tecnici</ItemTitle>
          <ItemDescription>Una mail a ogni revisione di norma.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Switch aria-label="Notifica ai tecnici" />
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
}

/**
 * Un elenco di allegati: `ItemGroup` lo annuncia come lista, senza scrivere un
 * `<ul>` a mano.
 */
export const ElencoAllegati: Story = {
  render: () => (
    <ItemGroup className="max-w-lg">
      {[
        { nome: 'UNI_EN_1090-2_2018.pdf', peso: '2,4 MB', tono: 'info' as const, tipo: 'Norma' },
        { nome: 'Rapporto_prova_2026-04.pdf', peso: '860 KB', tono: 'success' as const, tipo: 'Prova' },
      ].map((f) => (
        <Item key={f.nome} role="listitem" variant="outline">
          <ItemMedia variant="icon">
            <FileTextIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              {f.nome}
              <Badge className={TONO[f.tono]}>{f.tipo}</Badge>
            </ItemTitle>
            <ItemDescription>{f.peso}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="icon" aria-label={`Scarica ${f.nome}`}>
              <DownloadIcon />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`Altre azioni su ${f.nome}`}>
              <MoreHorizontalIcon />
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  ),
}

/**
 * Le persone che hanno accesso a una commessa: righe omogenee separate dal
 * filo, con un `Avatar` in `ItemMedia`.
 */
export const Gruppo: Story = {
  render: () => (
    <ItemGroup className="max-w-lg">
      {[
        { nome: 'Stefano Bertolini', ruolo: 'Amministratore', iniziali: 'SB' },
        { nome: 'Giorgio Pedrotti', ruolo: 'Editor', iniziali: 'GP' },
        { nome: 'Elisa Fontana', ruolo: 'Lettore', iniziali: 'EF' },
      ].map((p, i, tutti) => (
        <Fragment key={p.nome}>
          <Item role="listitem" variant="outline">
            <ItemMedia>
              <Avatar>
                <AvatarFallback>{p.iniziali}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{p.nome}</ItemTitle>
              <ItemDescription>{p.ruolo}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="ghost" size="icon" aria-label={`Altre azioni su ${p.nome}`}>
                <MoreHorizontalIcon />
              </Button>
            </ItemActions>
          </Item>
          {i < tutti.length - 1 ? <ItemSeparator aria-hidden /> : null}
        </Fragment>
      ))}
    </ItemGroup>
  ),
}

/**
 * Con miniatura (`ItemMedia variant="image"`): la foto si riconosce prima del
 * nome. È di 40px in `default`, 32 in `sm`, 24 in `xs`.
 */
export const ConMiniatura: Story = {
  render: () => (
    <ItemGroup className="max-w-lg">
      {[
        { nome: 'Termo Adesivi TA-200', famiglia: 'Massetti', tono: 'info' as const },
        { nome: 'Malta cementizia MC-40', famiglia: 'Malte', tono: 'success' as const },
      ].map((p) => (
        <Item key={p.nome} role="listitem" variant="outline">
          <ItemMedia variant="image">
            <Miniatura />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              {p.nome}
              <Badge className={TONO[p.tono]}>{p.famiglia}</Badge>
            </ItemTitle>
            <ItemDescription>Scheda tecnica aggiornata il 18/09/2026</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="icon" aria-label={`Apri ${p.nome}`}>
              <ChevronRightIcon />
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  ),
}

/**
 * Con intestazione e piè di riga (`ItemHeader`, `ItemFooter`), per una riga
 * che porta anche un contesto: la commessa a cui appartiene, o il conto di ciò
 * che contiene.
 */
export const ConIntestazione: Story = {
  render: () => (
    <Item variant="outline" className="max-w-lg">
      <ItemHeader>
        <span className="text-xs text-muted-foreground">Commessa 2026-114</span>
        <Badge className={TONO.warning}>In lavorazione</Badge>
      </ItemHeader>
      <ItemMedia variant="icon">
        <HardHatIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Ristrutturazione Palazzo Roccabruna</ItemTitle>
        <ItemDescription>Trento, via Santa Trinità — consegna prevista 12/2026</ItemDescription>
      </ItemContent>
      <ItemFooter>
        <span className="text-xs text-muted-foreground">14 sistemi, 212 voci di computo</span>
      </ItemFooter>
    </Item>
  ),
}

/**
 * Ogni riga è un collegamento intero, fatto con `render`: sorvolo e fuoco
 * stanno sull'ancora. Le righe sono in una `<ul>` con le sue `<li>`, non in un
 * `ItemGroup`.
 */
export const ComeCollegamento: Story = {
  render: () => (
    <ul className="flex max-w-lg flex-col gap-4">
      {[
        { titolo: 'Prodotti', descrizione: '1.284 schede a catalogo', icona: PackageIcon },
        { titolo: 'Norme', descrizione: '96 norme, 7 in revisione', icona: FileTextIcon },
      ].map((v) => (
        <li key={v.titolo}>
          <Item variant="outline" render={<a href="#" />}>
          <ItemMedia variant="icon">
            <v.icona />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{v.titolo}</ItemTitle>
            <ItemDescription>{v.descrizione}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </ItemActions>
        </Item>
        </li>
      ))}
    </ul>
  ),
}
