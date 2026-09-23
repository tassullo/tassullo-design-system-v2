import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from '@/registry/tassullo/ui/input'
import { Label } from '@/registry/tassullo/ui/label'

/**
 * Il nome di un campo di modulo: dice cosa va scritto, e il clic su di esso
 * porta il fuoco nel campo.
 *
 * **Quando sì, quando no.** Da sola si usa di rado. La riga completa di un
 * modulo — etichetta, campo, descrizione, errore — è `field`, ed è quella da
 * usare; `Label` serve accanto a un controllo fuori da un `Field`, come una
 * casella o un interruttore.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/label
 * ```
 *
 * **Regole d'uso.** L'etichetta è collegata al campo con `htmlFor` uguale
 * all'`id` del campo. Quando il campo è disabilitato l'etichetta si spegne da
 * sé in due casi: se il campo la precede come fratello con la classe `peer`,
 * oppure se il contenitore che li raccoglie ha la classe `group` e
 * `data-disabled="true"`.
 *
 * **Tastiera e accessibilità.** È un `<label>` nativo: il lettore di schermo
 * annuncia il campo col suo nome, e il clic sull'etichetta vale come clic sul
 * campo.
 */
const meta = {
  title: 'Primitive/Label',
  component: Label,
  args: { children: 'Denominazione commerciale' },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {}

/**
 * Un clic sull'etichetta porta il fuoco nel campo. Se non ci arriva, manca
 * `htmlFor`.
 */
export const AssociataAlCampo: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-2">
      <Label {...args} htmlFor="denominazione" />
      <Input id="denominazione" placeholder="Tassullo Intonaco Deumidificante" />
    </div>
  ),
}

/**
 * Il contenitore è disabilitato e l'etichetta si spegne insieme al campo,
 * senza classi scritte nella pagina.
 */
export const Disabilitata: Story = {
  render: (args) => (
    <div className="group flex w-80 flex-col gap-2" data-disabled="true">
      <Label {...args} htmlFor="codice">Codice FileMaker</Label>
      <Input id="codice" disabled placeholder="Non modificabile" />
    </div>
  ),
}
