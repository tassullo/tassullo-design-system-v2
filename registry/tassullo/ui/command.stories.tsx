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
 * Un elenco che si filtra scrivendo: si digita, le voci si riducono, si
 * sceglie con la tastiera.
 *
 * **Quando sì, quando no.** Da solo è la ricerca in un elenco lungo. Dentro un
 * `dialog`, con `CommandDialog`, è la palette dei comandi. Per scegliere un
 * valore da mettere in un campo di modulo si usa `combobox`, che ha già il
 * campo e le pillole; per poche voci fisse, `select`; per le azioni su un
 * elemento, `dropdown-menu`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/command
 * ```
 *
 * **Parti.** `CommandInput` è il campo di ricerca, `CommandList` l'elenco,
 * `CommandGroup` un gruppo con la sua intestazione, `CommandItem` una voce,
 * `CommandShortcut` la scorciatoia scritta a destra, `CommandEmpty` ciò che si
 * vede quando il filtro non trova niente.
 *
 * **Regole d'uso.** Fra un gruppo e l'altro non si mette `CommandSeparator`
 * dentro `CommandList`: un separatore non è un figlio ammesso di un elenco, e
 * l'intestazione del gruppo separa già i blocchi in un modo che anche un
 * lettore di schermo annuncia. `CommandEmpty` c'è sempre. La scorciatoia che
 * apre la palette la decide l'app, non il componente.
 *
 * **Tastiera e accessibilità.** Si scrive per filtrare, `↑` e `↓` scorrono,
 * `Invio` sceglie, `Esc` chiude la palette. Il fuoco resta sempre nel campo di
 * ricerca, così si continua a scrivere mentre si scorre. `CommandDialog` ha un
 * titolo nascosto alla vista che dà il nome alla finestra.
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
 * La palette comandi, aperta da `⌘K` o dal bottone. La scorciatoia è gestita
 * dalla scena, non dal componente.
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
 * Cinquecento voci: scrivendo «34» l'elenco si riduce senza scatti, e `↑`/`↓`
 * scorrono ciò che resta.
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

/**
 * L'elenco vuoto, con `CommandEmpty`: lo stato che si vede più spesso.
 */
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
