import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/registry/tassullo/ui/label'
import { RadioGroup, RadioGroupItem } from '@/registry/tassullo/ui/radio-group'

/**
 * Una scelta fra poche opzioni che si escludono: se ne sceglie una, e per
 * cambiarla se ne sceglie un'altra.
 *
 * **Quando sì, quando no.** La forma dice la regola: il cerchio vuol dire
 * «una sola», il quadrato di `checkbox` «quante se ne vuole». Se un'opzione
 * si deve poter anche togliere senza sceglierne un'altra, non è un radio ma
 * una `checkbox`. Con molte opzioni si usa `select`; per un filtro o una
 * scelta di visualizzazione che si clicca sopra la pagina, `toggle-group`. Un
 * gruppo con una voce sola è un errore: è una `checkbox`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/radio-group
 * ```
 *
 * **Parti e opzioni.** `RadioGroup` con `value` o `defaultValue`;
 * `RadioGroupItem` con il suo `value` e `disabled`. Ogni voce ha la sua
 * `Label` collegata con `htmlFor`.
 *
 * **Regole d'uso.** Una voce disabilitata porta `disabled` sulla voce e
 * `data-disabled="true"` sul contenitore con la classe `group`, così
 * l'etichetta si spegne insieme. Lo stato non valido si scrive con
 * `aria-invalid`, sul gruppo e sulle voci.
 *
 * **Tastiera e accessibilità.** Il gruppo è un solo fermo di tabulazione:
 * `Tab` entra sulla voce scelta, le frecce spostano la scelta, `Tab` esce. Le
 * voci disabilitate si saltano.
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

/**
 * Una voce disabilitata: le frecce la saltano, e la sua etichetta è spenta
 * insieme al cerchio.
 */
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

/**
 * Il gruppo non valido: il bordo di ogni voce segue `aria-invalid`.
 */
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
