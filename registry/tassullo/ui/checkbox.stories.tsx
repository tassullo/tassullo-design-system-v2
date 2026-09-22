import type { Meta, StoryObj } from '@storybook/react-vite'

import { Checkbox } from '@/registry/tassullo/ui/checkbox'
import { Label } from '@/registry/tassullo/ui/label'

/**
 * Una casella da spuntare: un sì o un no su una voce, indipendente dalle
 * altre.
 *
 * **Quando sì, quando no.** Per scelte che si possono combinare, o per un
 * consenso da dare. Se si sceglie una sola voce fra alcune, è `radio-group`;
 * se l'effetto è immediato, come accendere un'impostazione, è `switch`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/checkbox
 * ```
 *
 * **Stati.** `checked` o `defaultChecked`; `indeterminate` per la selezione
 * parziale; `disabled`. Lo stato indeterminato non si sceglie: lo mostra una
 * casella «tutti» quando sotto la selezione è parziale, come nella testata di
 * una tabella.
 *
 * **Regole d'uso.** La casella ha sempre un'etichetta associata — in un
 * modulo, `FieldLabel` di `field`, che fa anche da bersaglio. L'area
 * cliccabile è più larga del disegno, così la casella resta facile da colpire
 * senza diventare grande.
 *
 * **Tastiera.** Si raggiunge con `Tab` e si spunta con `Spazio`.
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
 * La casella «tutti» in stato indeterminato: sotto, la selezione è parziale.
 * Serve alla testata di una tabella e alla selezione multipla di righe.
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
