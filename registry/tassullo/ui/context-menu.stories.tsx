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
 * **Un ri-stile, lo stesso difetto del `dropdown-menu`**: il testo di
 * `variant="destructive"` era `text-destructive` — il rosso da fondo usato
 * come colore di testo — ed è diventato `text-destructive-subtle-foreground`,
 * nelle tre occorrenze. Stessa trappola, stesso rimedio, terza e quarta volta
 * che ricompare nel preset.
 *
 * **`ContextMenuLabel` va dentro un `ContextMenuGroup`, o il menu si schianta
 * all'apertura.** È lo stesso requisito del menu a tendina — sotto è la stessa
 * `Menu.GroupLabel` di Base UI — e vale la pena ripeterlo qui perché il
 * fallimento non è una resa storta: è un errore lanciato, che porta via la
 * pagina. Misurato in M2.3, vedi la nota del `dropdown-menu`.
 *
 * **Il costo d'ingresso: il tasto destro non è una via d'accesso.** Chi
 * naviga da tastiera non lo può premere, chi usa il tocco non ce l'ha, e chi
 * non sa che c'è non lo prova. Quindi la regola è: **ogni azione che sta qui
 * dentro deve stare anche altrove** — in un `dropdown-menu` di riga, in una
 * barra di azioni. Il menu contestuale è una scorciatoia per chi già sa, mai
 * l'unico modo per fare una cosa. In `data-table` (M3.3) accompagna il menu
 * «⋯» di riga, non lo sostituisce.
 *
 * Aperto, però, si comporta come gli altri menu: frecce, lettere, `→`/`←` per
 * i sottomenu, `Esc` per chiudere. È la stessa macchina di Base UI.
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

/** Il bersaglio del tasto destro va detto, o nessuno lo trova. */
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
 * Su una riga di tabella, che è il caso previsto dal piano. Da notare: la
 * riga ha **anche** il suo menu «⋯», e le stesse voci ci stanno dentro. Il
 * tasto destro qui non aggiunge poteri, toglie un clic.
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

/** Spunte e gruppo radio, come nel menu a tendina. */
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
