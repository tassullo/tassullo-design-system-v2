import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from '@/registry/tassullo/ui/input'
import { Label } from '@/registry/tassullo/ui/label'

/**
 * **Nessun ri-stile.** Il default shadcn passa così com'è: corpo `text-sm`,
 * peso medio, e i due agganci che contano — `peer-disabled` e
 * `group-data-[disabled]` — che spengono l'etichetta insieme al campo senza
 * che la pagina debba saperlo.
 *
 * L'etichetta non si usa quasi mai nuda: la riga etichetta + campo + errore è
 * `Field`, ed è lì che va guardata. Questa pagina serve solo a mostrare che
 * l'associazione `htmlFor`/`id` è quella nativa, e che quindi **il clic
 * sull'etichetta porta il fuoco nel campo** — è il modo in cui si verifica a
 * occhio che l'associazione esista davvero.
 */
const meta = {
  title: 'Primitive/Label',
  component: Label,
  args: { children: 'Denominazione commerciale' },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {}

/** Clicca l'etichetta: il fuoco entra nel campo. Se non entra, manca `htmlFor`. */
export const AssociataAlCampo: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-2">
      <Label {...args} htmlFor="denominazione" />
      <Input id="denominazione" placeholder="Tassullo Intonaco Deumidificante" />
    </div>
  ),
}

/**
 * L'etichetta si spegne da sé quando il gruppo è disabilitato: è
 * `group-data-[disabled=true]`, e nessuno deve ricordarsi di scriverlo sulla
 * pagina. È lo stesso aggancio che usa `Field`.
 */
export const Disabilitata: Story = {
  render: (args) => (
    <div className="group flex w-80 flex-col gap-2" data-disabled="true">
      <Label {...args} htmlFor="codice">Codice FileMaker</Label>
      <Input id="codice" disabled placeholder="Non modificabile" />
    </div>
  ),
}
