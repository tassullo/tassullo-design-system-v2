import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CalendarIcon,
  FileTextIcon,
  PackageIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react'

import { Button } from '@/registry/tassullo/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/registry/tassullo/ui/command'
import { Kbd } from '@/registry/tassullo/ui/kbd'

/**
 * **Nessun ri-stile.** È l'unico overlay che non è Base UI: sotto c'è
 * **`cmdk`**, ed è shadcn a portarcelo — non una nostra scelta, e non
 * un'eccezione a D9, che riguarda le primitive che scegliamo noi.
 *
 * **Cos'è davvero: un elenco che si filtra scrivendo.** Non è un menu, non è
 * un `select`. Da solo serve a poco; conta perché è **metà di due cose che
 * vengono dopo**:
 *
 * - dentro un `popover`, è il **`combobox` di M2.6** — quello che sostituisce
 *   i `<select>` nudi con cui oggi in Anagrafe si scelgono famiglie e norme,
 *   che con centinaia di voci non reggono;
 * - dentro un `dialog` (`CommandDialog`), è la **palette comandi**.
 *
 * **Da tastiera funziona senza toccare il mouse**, ed è tutto il punto: si
 * scrive per filtrare, `↑`/`↓` scorrono, `Invio` sceglie, `Esc` chiude. Il
 * fuoco resta **sempre nel campo di ricerca** — la selezione si muove
 * nell'elenco con `aria-activedescendant`, non col fuoco. È il modo giusto e
 * l'unico che permette di continuare a scrivere mentre si scorre.
 *
 * **`CommandDialog` mette il titolo in `sr-only`**: la finestra ha il suo
 * nome accessibile anche se non si vede. È il caso previsto dalla nota del
 * `dialog`, non un'eccezione.
 *
 * ## `CommandSeparator` non va dentro `CommandList`
 *
 * `CommandList` è un `role="listbox"`, e un `role="separator"` **non è un
 * figlio ammesso**: axe dà `aria-required-children`, «Element has children
 * which are not allowed: [role=separator]». Misurato in M2.3, e la forma che
 * lo produce è quella degli esempi di shadcn — un `CommandSeparator` fra due
 * `CommandGroup`.
 *
 * Non è una riga da correggere ri-stilando: il ruolo lo mette `cmdk`, e la
 * struttura non si tocca (regola 4bis). La risposta è **non usarlo lì**:
 * l'intestazione di gruppo separa già i blocchi, e lo fa in un modo che chi
 * usa uno screen reader sente, mentre una riga grigia no. Queste story non ne
 * hanno nessuno, ed è una scelta, non una svista.
 */
const meta = {
  title: 'Primitive/Command',
  component: Command,
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

const PRODOTTI = [
  ['T30', 'Intonaco deumidificante'],
  ['T42', 'Intonaco termoisolante'],
  ['C15', 'Finitura a calce'],
  ['R80', 'Rinzaffo di aggrappo'],
  ['M20', 'Malta da muratura'],
]

export const Predefinito: Story = {
  render: () => (
    <Command className="w-80 rounded-lg border">
      <CommandInput placeholder="Cerca un prodotto…" />
      <CommandList>
        <CommandEmpty>Nessun prodotto trovato.</CommandEmpty>
        <CommandGroup heading="Intonaci">
          {PRODOTTI.slice(0, 2).map(([codice, nome]) => (
            <CommandItem key={codice} value={`${codice} ${nome}`}>
              <PackageIcon />
              <span className="tabular-nums">{codice}</span>
              <span className="text-muted-foreground">{nome}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Altri">
          {PRODOTTI.slice(2).map(([codice, nome]) => (
            <CommandItem key={codice} value={`${codice} ${nome}`}>
              <PackageIcon />
              <span className="tabular-nums">{codice}</span>
              <span className="text-muted-foreground">{nome}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

/**
 * La palette comandi, aperta da `⌘K` o dal bottone. Il gestore della
 * scorciatoia sta nella story e non nel componente: è l'app a decidere quale
 * tasto la apre.
 */
export const PaletteComandi: Story = {
  render: function PaletteComandiRender() {
    const [aperta, setAperta] = React.useState(false)

    React.useEffect(() => {
      function onKeyDown(e: KeyboardEvent) {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setAperta((a) => !a)
        }
      }
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }, [])

    return (
      <div className="flex flex-col items-center gap-3">
        <Button variant="outline" onClick={() => setAperta(true)}>
          Apri la palette
        </Button>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          oppure <Kbd>⌘</Kbd> <Kbd>K</Kbd>
        </p>
        <CommandDialog open={aperta} onOpenChange={setAperta}>
          <Command>
            <CommandInput placeholder="Scrivi un comando o cerca…" />
            <CommandList>
              <CommandEmpty>Nessun risultato.</CommandEmpty>
              <CommandGroup heading="Vai a">
                <CommandItem>
                  <PackageIcon />
                  Prodotti
                  <CommandShortcut>⌘1</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <FileTextIcon />
                  Schede tecniche
                  <CommandShortcut>⌘2</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <UsersIcon />
                  Utenti
                  <CommandShortcut>⌘3</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Azioni">
                <CommandItem>
                  <CalendarIcon />
                  Nuova revisione
                </CommandItem>
                <CommandItem>
                  <SettingsIcon />
                  Impostazioni
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    )
  },
}

/**
 * Cinquecento voci finte: è la prova che M2.6 chiederà al `combobox`, presa
 * qui perché il filtro è di `command` e non del popover che lo conterrà.
 * Si scrive «34» e l'elenco si riduce senza scatti; `↑`/`↓` scorrono ciò che
 * resta.
 */
export const CinquecentoVoci: Story = {
  render: () => (
    <Command className="w-80 rounded-lg border">
      <CommandInput placeholder="Cerca fra 500 lotti…" />
      <CommandList>
        <CommandEmpty>Nessun lotto trovato.</CommandEmpty>
        <CommandGroup heading="Lotti 2024">
          {Array.from({ length: 500 }, (_, i) => {
            const codice = `24-${String(i).padStart(4, '0')}`
            return (
              <CommandItem key={codice} value={codice}>
                <span className="tabular-nums">{codice}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

/** L'elenco vuoto: lo stato che si vede più spesso e che si cura meno. */
export const NessunRisultato: Story = {
  render: () => (
    <Command className="w-80 rounded-lg border">
      <CommandInput defaultValue="zirconio" />
      <CommandList>
        <CommandEmpty>
          Nessun prodotto corrisponde a «zirconio».
        </CommandEmpty>
        <CommandGroup heading="Prodotti">
          {PRODOTTI.map(([codice, nome]) => (
            <CommandItem key={codice} value={`${codice} ${nome}`}>
              <span className="tabular-nums">{codice}</span>
              <span className="text-muted-foreground">{nome}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}
