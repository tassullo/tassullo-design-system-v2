import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/registry/tassullo/ui/label'
import { Switch } from '@/registry/tassullo/ui/switch'

/**
 * Un interruttore per un'impostazione che ha effetto subito: acceso o spento,
 * senza un «Salva» dopo.
 *
 * **Quando sì, quando no.** Tre componenti si somigliano e fanno cose
 * diverse. Lo `switch` cambia un'impostazione nel momento in cui lo si tocca.
 * Se la scelta è una risposta dentro un modulo, che vale quando il modulo si
 * invia, è una `checkbox`: se accanto c'è un bottone di conferma, la casella
 * è quella giusta. Un bottone che resta premuto in una barra di strumenti —
 * grassetto, mostra le note — è `toggle`; una scelta fra più opzioni è
 * `toggle-group` o `radio-group`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/switch
 * ```
 *
 * **Taglie e opzioni.** `size`: `default` o `sm`. `checked` o
 * `defaultChecked`, `onCheckedChange`, `disabled`. Entrambe le taglie
 * crescono con la densità touch.
 *
 * **Regole d'uso.** Ogni interruttore ha la sua `Label`, collegata con
 * `htmlFor`, che dice che cosa si accende — «Visibile nel catalogo pubblico»,
 * non «Attivo». Da disabilitato, `disabled` sull'interruttore e
 * `data-disabled="true"` sul contenitore con la classe `group`, così si spegne
 * anche l'etichetta.
 *
 * **Tastiera e accessibilità.** `Tab` porta sull'interruttore, `Spazio` o
 * `Invio` lo commutano. Si annuncia come interruttore, acceso o spento, col
 * nome della sua etichetta.
 */
const meta = {
  title: 'Primitive/Switch',
  component: Switch,
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Un interruttore spento con la sua etichetta.
 */
export const Predefinito: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="s-solo" />
      <Label htmlFor="s-solo">Visibile nel catalogo pubblico</Label>
    </div>
  ),
}

/**
 * Le due taglie, `default` e `sm`, con le misure in densità normale e touch.
 */
export const Taglie: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch id="s-def" defaultChecked />
        <Label htmlFor="s-def">Default — 18 × 32 px, 27 × 48 in touch</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="s-sm" size="sm" defaultChecked />
        <Label htmlFor="s-sm">Small — 14 × 24 px, 21 × 36 in touch</Label>
      </div>
    </div>
  ),
}

/**
 * Spento, acceso, e i due disabilitati. Con la Densità in touch l'interruttore
 * cresce insieme all'etichetta.
 */
export const Stati: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch id="s-off" />
        <Label htmlFor="s-off">Spento</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="s-on" defaultChecked />
        <Label htmlFor="s-on">Acceso</Label>
      </div>
      <div className="group flex items-center gap-3" data-disabled="true">
        <Switch id="s-dis" disabled />
        <Label htmlFor="s-dis">Disabilitato</Label>
      </div>
      <div className="group flex items-center gap-3" data-disabled="true">
        <Switch id="s-dison" disabled defaultChecked />
        <Label htmlFor="s-dison">Disabilitato e acceso</Label>
      </div>
    </div>
  ),
}
