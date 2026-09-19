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
 * **La riga di un elenco che non è una tabella.** Sta esattamente nel buco fra
 * i due componenti che già avevamo: `tassullo-data-table`, che è la lista che
 * si cerca, si ordina e si pagina, e `card`, che è un contenitore e non una
 * riga. In mezzo c'è tutto il resto — allegati, impostazioni, elenchi
 * selezionabili — e fino a M4.7 ogni app se lo riscriveva da sé.
 *
 * ## Perché è entrata (M4.7, misurata)
 *
 * Contando nei CSS delle tre app i selettori il cui nome dice riga/voce:
 * **~120 in Officina, ~22 in Studio, ~19 in Anagrafe**. È il secondo pattern
 * più ripetuto dopo la tabella. Quattro casi di Anagrafe si mappano uno a uno
 * su questa anatomia: `sed-riga` di `SistemaEditor` (codice + badge +
 * bottone), `nrm-elenco-voce` di `Norme` (elenco selezionabile),
 * `adm-accordion-voce` di `Admin` (impostazione con interruttore),
 * `abc-modifica-riga` di `AdminBC`.
 *
 * ## Come è fatta
 *
 * `Item` è il contenitore; dentro ci vanno, in quest'ordine, `ItemMedia`
 * (icona o immagine), `ItemContent` (con `ItemTitle` e `ItemDescription`) e
 * `ItemActions`. `ItemGroup` raccoglie più righe e dichiara `role="list"`;
 * `ItemSeparator` mette il filo fra una e l'altra.
 *
 * Tre varianti — `default` senza bordo, `outline` col bordo, `muted` col fondo
 * tenue — e tre taglie, `default`, `sm`, `xs`.
 *
 * ## Il ri-stile: uno solo, ed è sempre la stessa trappola
 *
 * `ItemDescription` dava ai link `hover:text-primary`, cioè l'arancio del
 * brand come **testo**, che in modalità chiara fa 1.79:1. Ora è
 * `text-accent-ink`, il token che esiste per questo ed è corretto in entrambe
 * le modalità. È la **settima** volta che il preset shadcn ripete
 * `text-primary` come colore di testo: in un componente nuovo conviene
 * cercarla per prima cosa.
 *
 * ## Le due trappole di `ItemGroup`, misurate in M4.7
 *
 * `ItemGroup` dichiara `role="list"`, e una lista ARIA ammette **solo**
 * `listitem` come figli. Da qui due difetti che non si vedono guardando la
 * pagina, e che il gate ha preso al primo giro (8 violazioni su 4 passate):
 *
 * 1. **`Item` non si dichiara `listitem` da sé.** shadcn lascia la scelta a
 *    chi compone — un `Item` può stare benissimo fuori da una lista — quindi
 *    dentro un `ItemGroup` il ruolo lo si passa: `<Item role="listitem">`.
 * 2. **Il filo di `ItemSeparator` è un figlio non ammesso.** Dentro una lista
 *    è decorazione, non contenuto, e va nascosto all'albero di accessibilità
 *    con `aria-hidden`. Provato prima `role="none"`, che **non basta**: Base
 *    UI mette `aria-orientation` sul separatore, e quell'attributo su
 *    `role="none"` è a sua volta una violazione (`aria-allowed-attr`) — il
 *    conto è passato da 2 a 1, non a 0. Con `aria-hidden` va a **0**.
 *
 * ## Quando **non** usarla
 *
 * Se la lista ha bisogno di ordinamento, ricerca, colonne o paginazione, non è
 * un elenco: è una tabella, e si monta `tassullo-data-table` spegnendo ciò che
 * non serve. È la soglia fissata il 2026-09-18 sulla dashboard.
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

/** La forma nuda: media, contenuto, azioni. */
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
 * Le tre varianti a confronto. `default` non ha bordo — serve dentro un
 * riquadro che il bordo ce l'ha già; `outline` è la riga autonoma; `muted`
 * stacca sul fondo senza disegnare una linea.
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
 * **Le tre taglie, e un ri-stile che corregge shadcn.**
 *
 * Nell'originale `sm` ha le **stesse identiche classi** di `default` —
 * verificato riga per riga contro `registry/.upstream/item.tsx` e **misurato
 * sulla pagina di documentazione di shadcn**, dove le due righe della sezione
 * "Size" rendono entrambe 66.3px — mentre il testo accanto promette «a compact
 * size for dense layouts». Codice e documentazione dicono cose diverse: è un
 * difetto loro, non una sottigliezza.
 *
 * Qui `sm` fa quello che la loro documentazione dichiara: stessa larghezza di
 * `default`, meno respiro sopra e sotto (`py-2.5` → `py-2`). Sulla scala del
 * tema non esiste un gradino fra 10px e 8px, quindi la densità si prende sul
 * verticale e l'orizzontale resta `px-3` — che è poi ciò che distingue `sm` da
 * `xs`, il quale stringe anche ai lati (`px-2.5`).
 *
 * Le righe stanno dentro un `ItemGroup` e portano una miniatura, perché `sm`
 * tocca anche **lo spazio fra una riga e l'altra** (`gap-4` → `gap-2.5`) e
 * **la dimensione della miniatura** (`size-10` → `size-8`): con righe sciolte
 * e un'icona al posto dell'immagine non si vedrebbe nessuna delle due cose.
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
 * **Il caso di Anagrafe**: `adm-accordion-voce` di `Admin.tsx` — un'impostazione
 * con titolo, spiegazione e interruttore. Oggi sono sei regole CSS scritte a
 * mano; qui è composizione.
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
 * **L'elenco di allegati**, che è il caso reale per cui M4.7 è stata aperta:
 * il tab «documenti» di `Pagine/Scheda` monta esattamente questo. `ItemGroup`
 * dichiara `role="list"`, quindi l'elenco si annuncia come tale senza scrivere
 * un `<ul>` a mano.
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
 * **Un gruppo vero**, sul modello della scena «Group» di shadcn: righe
 * omogenee separate dal filo, dentro un solo `ItemGroup` che dichiara
 * `role="list"`. Il caso è quello di Anagrafe — le persone che hanno accesso a
 * una commessa — ma la forma è la stessa per qualunque elenco di entità con
 * un volto, un nome e un'azione.
 *
 * `ItemMedia` qui **non ha `variant`**: dentro ci va il nostro `Avatar`, che
 * porta già la propria forma. La documentazione di shadcn parla di un
 * `variant="avatar"`, ma nel preset `base-nova` che usiamo **non esiste** — le
 * varianti sono `default`, `icon`, `image` — ed è una delle differenze fra la
 * loro pagina e il codice che si installa davvero.
 */
export const Gruppo: Story = {
  render: () => (
    <ItemGroup className="max-w-lg">
      {[
        { nome: 'Francesco Sartori', ruolo: 'Amministratore', iniziali: 'FS' },
        { nome: 'Roberto Zanetti', ruolo: 'Editor', iniziali: 'RZ' },
        { nome: 'Michela Bort', ruolo: 'Lettore', iniziali: 'MB' },
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
 * **Con miniatura** (`ItemMedia variant="image"`): il caso dei prodotti a
 * catalogo, dove la foto è ciò che si riconosce prima del nome. La miniatura
 * si rimpicciolisce da sé con la taglia della riga — 40px in `default`, 32 in
 * `sm`, 24 in `xs` — e questo lo fa già shadcn, non l'abbiamo aggiunto noi.
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
 * **Intestazione e piè di riga** (`ItemHeader`, `ItemFooter`): occupano tutta
 * la larghezza sopra e sotto il contenuto, e servono quando una riga porta
 * anche un contesto — la commessa a cui appartiene, o il conto di ciò che
 * contiene.
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
 * **La riga come collegamento**, con la prop `render` di Base UI: l'intera riga
 * diventa un `<a>`, e sorvolo e fuoco si applicano all'ancora invece che a un
 * bottone dentro. È la forma da usare per un elenco che **naviga** — un
 * indice di sezioni, una lista di schede — al posto di una riga con dentro un
 * bottone «Apri».
 *
 * `render` è la via di Base UI a ciò che in Radix è `asChild`: si passa
 * l'elemento già scritto (`<a href="…">`), e il componente ci fonde le proprie
 * props invece di avvolgerlo in un nodo in più.
 *
 * **Qui non si usa `ItemGroup`, ed è una conseguenza misurata.** `ItemGroup`
 * dichiara `role="list"`, che vuole figli `listitem`; ma quando la riga **è**
 * l'ancora, scriverle sopra `role="listitem"` le toglie il ruolo di
 * collegamento — e axe lo dice: `aria-allowed-role`, 1 violazione. La forma
 * corretta è quella del markup di sempre: una `<ul>` con le sue `<li>`, e
 * l'ancora dentro. Si perde la spaziatura che `ItemGroup` porta da sé, e si
 * riscrive con un `gap`.
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
