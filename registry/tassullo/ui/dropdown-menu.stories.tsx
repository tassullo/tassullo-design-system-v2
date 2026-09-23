import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CopyIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react'

import { apriCol } from '@/prove/apri'
import { Button } from '@/registry/tassullo/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/registry/tassullo/ui/dropdown-menu'

/**
 * Il menu delle azioni su un elemento: si apre da un bottone, elenca cosa si
 * può fare, si chiude appena si sceglie.
 *
 * **Quando sì, quando no.** Per azioni — modificare, duplicare, eliminare — o
 * per impostazioni di vista con spunte e gruppi radio. Per scegliere un valore
 * da mettere in un campo di modulo si usa `select` o `combobox`, che mostrano
 * la scelta fatta. Lo stesso menu aperto col tasto destro è `context-menu`,
 * che non lo sostituisce mai: lo accompagna.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/dropdown-menu
 * ```
 *
 * **Parti e varianti.** `DropdownMenuItem` è una voce, con `variant`:
 * `default` o `destructive`. `DropdownMenuGroup` e `DropdownMenuLabel` fanno
 * un gruppo con la sua intestazione; `DropdownMenuCheckboxItem` è una spunta
 * (se ne possono accendere più d'una); `DropdownMenuRadioGroup` e
 * `DropdownMenuRadioItem` una scelta esclusiva; `DropdownMenuSub`,
 * `DropdownMenuSubTrigger` e `DropdownMenuSubContent` un sottomenu;
 * `DropdownMenuSeparator` e `DropdownMenuShortcut` il filo e la scorciatoia.
 *
 * **Regole d'uso.** `DropdownMenuLabel` va sempre dentro un
 * `DropdownMenuGroup` o un `DropdownMenuRadioGroup`: fuori da un gruppo il
 * menu dà errore all'apertura e non si apre. Un grilletto di sola icona, come
 * il «⋯» di una riga, ha un nome scritto per il lettore di schermo (`sr-only`
 * o `aria-label`). Le azioni distruttive usano `variant="destructive"`, non
 * una classe di colore.
 *
 * **Tastiera.** `Invio` o `↓` sul grilletto aprono il menu e portano il fuoco
 * sulla prima voce; `↑` e `↓` scorrono e ricominciano dall'inizio; una lettera
 * salta alla voce che comincia così, e più lettere di fila cercano una parola;
 * `→` entra in un sottomenu e `←` ne esce; `Esc` chiude e riporta il fuoco sul
 * grilletto. Le voci disabilitate prendono il fuoco ma non si attivano: così
 * chi non vede sa che l'azione esiste, anche se ora non è disponibile.
 */
const meta = {
  title: 'Primitive/Dropdown Menu',
  component: DropdownMenu,
  // Il menu si misura **aperto**: chiuso non c'è niente da guardare, e
  // l'imbracatura deve dichiarare quali popup apre (`@/prove/apri`).
  play: apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Azioni
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <PencilIcon />
          Modifica
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CopyIcon />
          Duplica
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DownloadIcon />
          Esporta in PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2Icon />
          Elimina
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/**
 * Il menu di una riga di tabella: il grilletto è di sola icona e porta un nome
 * scritto per il lettore di schermo. L'intestazione sta dentro un gruppo.
 */
export const MenuDiRiga: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <MoreHorizontalIcon />
        <span className="sr-only">Azioni sulla scheda T30</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tassullo T30</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Apri la scheda
            <DropdownMenuShortcut>↵</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Modifica
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            Pubblica (serve il ruolo Redattore)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Elimina
            <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/**
 * Sottomenu, spunte e gruppo radio. Le spunte si accendono anche più d'una;
 * nel gruppo radio una sola. L'intestazione «Ordinamento» sta dentro il
 * `DropdownMenuRadioGroup`, che fa da gruppo.
 */
export const ConSottomenuESpunte: Story = {
  render: function ConSottomenuESpunteRender() {
    const [colonne, setColonne] = React.useState({
      codice: true,
      famiglia: true,
      resa: false,
    })
    const [ordine, setOrdine] = React.useState('nome')

    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Vista
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Colonne visibili</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={colonne.codice}
              onCheckedChange={(v) => setColonne((c) => ({ ...c, codice: v }))}
            >
              Codice
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={colonne.famiglia}
              onCheckedChange={(v) => setColonne((c) => ({ ...c, famiglia: v }))}
            >
              Famiglia
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={colonne.resa}
              onCheckedChange={(v) => setColonne((c) => ({ ...c, resa: v }))}
            >
              Resa
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={ordine}
            onValueChange={(v) => setOrdine(v as string)}
          >
            <DropdownMenuLabel>Ordinamento</DropdownMenuLabel>
            <DropdownMenuRadioItem value="nome">Per nome</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="codice">
              Per codice
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="revisione">
              Per data di revisione
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Esporta</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>PDF</DropdownMenuItem>
              <DropdownMenuItem>Foglio di calcolo</DropdownMenuItem>
              <DropdownMenuItem>CSV</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}

/**
 * Il menu dell'utente in testata, con gruppi e scorciatoie.
 */
export const MenuUtente: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" />}>
        <UserIcon />
        Stefano Bertolini
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Impresa Esempio S.r.l.</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Profilo
            <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Impostazioni
            <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Esci</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
