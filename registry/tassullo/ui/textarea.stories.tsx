import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/registry/tassullo/ui/label'
import { Textarea } from '@/registry/tassullo/ui/textarea'

/**
 * Un campo di testo su più righe, che cresce mentre si scrive.
 *
 * **Quando sì, quando no.** Per una nota, una descrizione breve, un testo
 * senza formattazione. Se il testo ha bisogno di grassetti, elenchi o
 * collegamenti, si usa il blocco `tassullo-rich-text-editor`. Per una riga
 * sola, `input`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/textarea
 * ```
 *
 * **Regole d'uso.**
 *
 * - Il campo si allunga da sé col contenuto, senza codice: parte da
 *   un'altezza minima (`min-h-16`) e non scende sotto. `rows` non fissa
 *   l'altezza.
 * - Per fermare la crescita si mette un tetto con `max-h-*` e
 *   `overflow-auto`: oltre, il campo scorre.
 * - Sul telefono il testo è a 16px, perché il browser non ingrandisca la
 *   pagina entrando nel campo; da `md` in su torna alla misura del corpo.
 * - In un modulo sta dentro un `Field`, con la sua `Label`. Lo stato non
 *   valido si scrive con `aria-invalid`, quello spento con `disabled`.
 *
 * **Tastiera e accessibilità.** È una `<textarea>` nativa: `Invio` va a capo
 * e non invia il modulo, `Tab` esce dal campo.
 */
const meta = {
  title: 'Primitive/Textarea',
  component: Textarea,
  args: { placeholder: 'Descrizione del prodotto…' },
  render: (args) => <Textarea {...args} className="w-96" />,
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {}

/**
 * Si scrive dentro, e il campo si allunga da sé.
 */
export const CresceColContenuto: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-2">
      <Label htmlFor="ta-cresce">Note di posa</Label>
      <Textarea
        {...args}
        id="ta-cresce"
        defaultValue={'Applicare a temperatura compresa fra +5 e +35 °C.\nNon applicare su supporti gelati o in fase di disgelo.'}
      />
    </div>
  ),
}

/**
 * A riposo, non valido, disabilitato.
 */
export const Stati: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ta-riposo">A riposo</Label>
        <Textarea {...args} id="ta-riposo" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ta-invalido">Non valido (<code>aria-invalid</code>)</Label>
        <Textarea {...args} id="ta-invalido" aria-invalid defaultValue="Troppo corta." />
      </div>
      <div className="group flex flex-col gap-2" data-disabled="true">
        <Label htmlFor="ta-disabilitato">Disabilitato</Label>
        <Textarea {...args} id="ta-disabilitato" disabled defaultValue="Non modificabile" />
      </div>
    </div>
  ),
}

/**
 * Con `max-h-32` e `overflow-auto`: oltre il tetto il campo scorre invece di
 * crescere.
 */
export const ConUnTetto: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-2">
      <Label htmlFor="ta-tetto">Avvertenze</Label>
      <Textarea
        {...args}
        id="ta-tetto"
        className="max-h-32 overflow-auto"
        defaultValue={Array.from({ length: 8 }, (_, i) => `Riga ${i + 1} di avvertenza.`).join('\n')}
      />
    </div>
  ),
}
