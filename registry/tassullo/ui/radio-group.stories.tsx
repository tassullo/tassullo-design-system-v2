import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/registry/tassullo/ui/label'
import { RadioGroup, RadioGroupItem } from '@/registry/tassullo/ui/radio-group'

/**
 * **Nessun ri-stile.** Stesso disegno del checkbox, tondo invece che quadrato,
 * e non è una scelta estetica: **la forma dice la regola**. Quadrato = ne puoi
 * scegliere quanti vuoi; tondo = ne scegli esattamente uno, e per cambiare devi
 * togliere il precedente. Un gruppo di radio con una sola voce è sempre un
 * errore di progetto, e un gruppo di radio da cui si vuole poter *deselezionare*
 * è un checkbox travestito.
 *
 * **Da tastiera il gruppo è un solo fermo di tabulazione**: `Tab` entra sulla
 * voce selezionata, le **frecce** cambiano scelta, `Tab` esce. Non si tabula
 * voce per voce, ed è giusto così — è il comportamento nativo dei radio, che
 * Base UI riproduce. Se un giorno tabulasse su ognuna, è rotto.
 */
const meta = {
  title: 'Primitive/RadioGroup',
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <RadioGroup defaultValue="interno" className="w-72">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="interno" id="r-interno" />
        <Label htmlFor="r-interno">Interno</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="esterno" id="r-esterno" />
        <Label htmlFor="r-esterno">Esterno</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="entrambi" id="r-entrambi" />
        <Label htmlFor="r-entrambi">Interno ed esterno</Label>
      </div>
    </RadioGroup>
  ),
}

/** Con una voce disabilitata: le frecce la saltano, non ci si può fermare sopra. */
export const ConVoceDisabilitata: Story = {
  render: () => (
    <RadioGroup defaultValue="ordinaria" className="w-72">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="ordinaria" id="r-ord" />
        <Label htmlFor="r-ord">Revisione ordinaria</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="straordinaria" id="r-str" />
        <Label htmlFor="r-str">Revisione straordinaria</Label>
      </div>
      <div className="group flex items-center gap-2" data-disabled="true">
        <RadioGroupItem value="revoca" id="r-rev" disabled />
        <Label htmlFor="r-rev">Revoca (serve il ruolo Qualità)</Label>
      </div>
    </RadioGroup>
  ),
}

/** Non valido: il bordo segue `aria-invalid`, come in tutte le altre primitive. */
export const NonValido: Story = {
  render: () => (
    <RadioGroup className="w-72" aria-invalid>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="si" id="r-si" aria-invalid />
        <Label htmlFor="r-si">Sì</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="no" id="r-no" aria-invalid />
        <Label htmlFor="r-no">No</Label>
      </div>
    </RadioGroup>
  ),
}
