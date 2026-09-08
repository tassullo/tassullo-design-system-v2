import type { Meta, StoryObj } from '@storybook/react-vite'

import { Checkbox } from '@/registry/tassullo/ui/checkbox'
import { Label } from '@/registry/tassullo/ui/label'

/**
 * **Un ri-stile solo**: `rounded-[4px]` → `rounded-sm`. Stesso valore oggi
 * (4px), ma preso dal tema invece che scritto a mano — se il gradino `sm`
 * cambia, la casella lo segue. Era invisibile al gate fino a M2.2: l'originale
 * shadcn del checkbox è un **template a segnaposto d'icona**, e il controllo
 * usciva prima di arrivare alle stringhe di classi. Corretto lì.
 *
 * La casella è `size-4` — 16px in normale, **24px in touch** — ma il bersaglio
 * cliccabile è più largo del disegno: `after:-inset-x-3 after:-inset-y-2`
 * stende un pseudo-elemento tutt'intorno. È il motivo per cui una casella
 * piccola resta premibile col guanto in cantiere senza diventare un quadrato
 * enorme sullo schermo.
 *
 * **L'etichetta va sempre associata.** Una casella senza etichetta è un
 * quadratino che il lettore di schermo annuncia come «casella di controllo,
 * non selezionata» e basta. In un modulo si usa `FieldLabel` di `Field`, che
 * fa da bersaglio anche lui.
 */
const meta = {
  title: 'Primitive/Checkbox',
  component: Checkbox,
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="c-solo" />
      <Label htmlFor="c-solo">Prodotto attivo a catalogo</Label>
    </div>
  ),
}

export const Stati: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="c-off" />
        <Label htmlFor="c-off">Non selezionata</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c-on" defaultChecked />
        <Label htmlFor="c-on">Selezionata</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c-ind" indeterminate />
        <Label htmlFor="c-ind">Indeterminata (selezione parziale)</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c-inv" aria-invalid />
        <Label htmlFor="c-inv">Non valida</Label>
      </div>
      <div className="group flex items-center gap-2" data-disabled="true">
        <Checkbox id="c-dis" disabled />
        <Label htmlFor="c-dis">Disabilitata</Label>
      </div>
      <div className="group flex items-center gap-2" data-disabled="true">
        <Checkbox id="c-dison" disabled defaultChecked />
        <Label htmlFor="c-dison">Disabilitata e selezionata</Label>
      </div>
    </div>
  ),
}

/**
 * Lo stato **indeterminato** non è un terzo valore che l'utente sceglie: è
 * quello che mostra una casella «tutti» quando sotto la selezione è parziale.
 * Serve alla testata di una tabella (M2.4) e alla selezione multipla di righe.
 */
export const SelezioneParziale: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="c-tutte" indeterminate />
        <Label htmlFor="c-tutte" className="font-semibold">Tutte le norme</Label>
      </div>
      <div className="ml-6 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Checkbox id="c-n1" defaultChecked />
          <Label htmlFor="c-n1">EN 998-1</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="c-n2" />
          <Label htmlFor="c-n2">EN 998-2</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="c-n3" />
          <Label htmlFor="c-n3">EN 1504-3</Label>
        </div>
      </div>
    </div>
  ),
}
