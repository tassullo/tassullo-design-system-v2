import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/registry/tassullo/ui/label'
import { Textarea } from '@/registry/tassullo/ui/textarea'

/**
 * **Nessun ri-stile.** Stessi token e stessi stati dell'`Input`, con una cosa
 * in più che vale la pena conoscere: `field-sizing-content`. Il campo **cresce
 * col testo** senza una riga di JavaScript — niente `onChange` che misura lo
 * `scrollHeight`, che è il modo in cui questa cosa si è sempre fatta a mano e
 * il motivo per cui non funzionava mai bene. `min-h-16` è il pavimento.
 *
 * Attenzione a `rows`: qui **non** fissa l'altezza, la suggerisce soltanto,
 * perché il dimensionamento sul contenuto vince. Per limitare davvero si usa
 * `max-h-*` più `overflow-auto`.
 *
 * Il testo lungo vero — la descrizione di una scheda tecnica, l'editor di
 * M3.8 — non è questo: è **D11**, aperta e con verdetto a M3.8.
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

/** Scrivi qui dentro: il campo si allunga da sé, e non torna più corto del pavimento. */
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

/** Con un tetto: `max-h-*` più `overflow-auto`, perché `rows` da solo non ferma la crescita. */
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
