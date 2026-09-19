import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  DownloadIcon,
  FileTextIcon,
  ImageIcon,
  MoreHorizontalIcon,
  ShieldCheckIcon,
} from 'lucide-react'

import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
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
 * Le tre taglie. `xs` è quella che sta dentro una tendina — shadcn le dà
 * apposta `in-data-[slot=dropdown-menu-content]:p-0`.
 */
export const Taglie: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      {(['default', 'sm', 'xs'] as const).map((taglia) => (
        <Item key={taglia} variant="outline" size={taglia}>
          <ItemMedia variant="icon">
            <FileTextIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>size="{taglia}"</ItemTitle>
            <ItemDescription>Relazione di calcolo</ItemDescription>
          </ItemContent>
        </Item>
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
