import { apriColDestro } from '@/prove/apri'
import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/registry/tassullo/ui/context-menu'

/**
 * Il menu che si apre col tasto destro su un elemento: le azioni su quella
 * cosa, a portata di chi già sa che ci sono.
 *
 * **Quando sì, quando no.** Solo come scorciatoia. Chi usa la tastiera o il
 * tocco il tasto destro non ce l'ha, e chi non sa che c'è non lo prova: ogni
 * azione che sta qui deve stare anche altrove, in un `dropdown-menu` (il menu
 * «⋯» di una riga) o in una barra di azioni.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/context-menu
 * ```
 *
 * **Parti e varianti.** Le stesse di `dropdown-menu`: voci, gruppi con
 * etichetta, spunte (`ContextMenuCheckboxItem`), gruppi radio, sottomenu,
 * separatori e scorciatoie. `variant="destructive"` su una voce la segna come
 * distruttiva.
 *
 * **Regole d'uso.** `ContextMenuLabel` va sempre dentro un `ContextMenuGroup`,
 * o il menu dà errore all'apertura. L'area che risponde al tasto destro va
 * indicata, o nessuno la trova.
 *
 * **Tastiera.** Aperto, si comporta come gli altri menu: `↑` e `↓` scorrono le
 * voci, una lettera salta alla voce che comincia così, `→` e `←` aprono e
 * chiudono i sottomenu, `Esc` chiude.
 */
const meta = {
  title: 'Primitive/Context Menu',
  component: ContextMenu,
  // Si misura **aperto**: chiuso il popup non esiste e axe non ha niente
  // da guardare. L'imbracatura dichiara qui quale popup apre (`@/prove/apri`).
  play: apriColDestro('[data-slot="context-menu-trigger"]', 'context-menu-content'),
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

/**
 * L'area che risponde al tasto destro, indicata a parole.
 */
export const Predefinito: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-40 w-80 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Tasto destro qui dentro
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem>
          Apri la scheda
          <ContextMenuShortcut>↵</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Duplica
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>Pubblica</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          Elimina
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

/**
 * Su una riga di tabella, che ha anche il suo menu «⋯» con le stesse voci: il
 * tasto destro non aggiunge azioni, toglie un clic.
 */
export const SuUnaRiga: Story = {
  render: () => (
    <div className="w-96 overflow-hidden rounded-lg border text-sm">
      {[
        ['T30', 'Intonaco deumidificante', '12,40'],
        ['T42', 'Intonaco termoisolante', '9,80'],
        ['C15', 'Finitura a calce', '2,25'],
      ].map(([codice, nome, resa]) => (
        <ContextMenu key={codice}>
          <ContextMenuTrigger className="flex items-center justify-between gap-4 border-b px-3 py-2 last:border-b-0 hover:bg-muted">
            <span className="font-medium tabular-nums">{codice}</span>
            <span className="flex-1 text-muted-foreground">{nome}</span>
            <span className="tabular-nums">{resa} kg/m²</span>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuGroup>
              <ContextMenuLabel>{codice}</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem>Apri la scheda</ContextMenuItem>
              <ContextMenuItem>Copia il codice</ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Esporta</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>PDF</ContextMenuItem>
                <ContextMenuItem>CSV</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Elimina</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  ),
}

/**
 * Spunte e gruppo radio, come nel menu a tendina.
 */
export const ConSpunteERadio: Story = {
  render: function ConSpunteERadioRender() {
    const [griglia, setGriglia] = React.useState(true)
    const [misure, setMisure] = React.useState(false)
    const [unita, setUnita] = React.useState('metrico')

    return (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-40 w-80 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          Tasto destro per le opzioni di vista
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuGroup>
            <ContextMenuLabel>Vista</ContextMenuLabel>
            <ContextMenuCheckboxItem checked={griglia} onCheckedChange={setGriglia}>
              Mostra la griglia
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem checked={misure} onCheckedChange={setMisure}>
              Mostra le misure
            </ContextMenuCheckboxItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value={unita} onValueChange={(v) => setUnita(v as string)}>
            <ContextMenuLabel>Unità</ContextMenuLabel>
            <ContextMenuRadioItem value="metrico">Metriche</ContextMenuRadioItem>
            <ContextMenuRadioItem value="imperiale">Imperiali</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}
