import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/registry/tassullo/ui/label'
import { Switch } from '@/registry/tassullo/ui/switch'

/**
 * **L'interruttore era l'unico componente del set con misure in pixel crudi**,
 * e quindi l'unico che la densità touch non scalava: `h-[18.4px] w-[32px]` e
 * `h-[14px] w-[24px]`. È la stessa forma dell'eccezione della sidebar accertata
 * in M1.4 — un valore che non deriva da `--spacing` resta identico mentre tutto
 * quello che gli sta intorno cresce. Ri-stilato in unità del tema:
 *
 * | | prima | ora | normale | touch |
 * |---|---|---|---|---|
 * | `default` | `h-[18.4px] w-[32px]` | `h-4.5 w-8` | 18 × 32 px | **27 × 48 px** |
 * | `sm` | `h-[14px] w-[24px]` | `h-3.5 w-6` | 14 × 24 px | 21 × 36 px |
 *
 * I 18px al posto di 18,4 non sono un arrotondamento comodo: sono **esatti** —
 * il pomello è `size-4` (16px) più i due bordi da 1px. Il quarto di pixel
 * mancante era il refuso, non la correzione.
 *
 * **L'unico valore arbitrario che resta è voluto**: `translate-x-[calc(100%-2px)]`.
 * Quei 2px sono i due bordi da 1px, e i bordi non scalano **mai** con la densità
 * (M1.4) — quindi la formula è giusta in entrambe, e sostituirla con un token la
 * romperebbe. È il secondo avviso che il gate tiene acceso di proposito, dopo il
 * `color-mix` dell'hover di `secondary`.
 *
 * **Interruttore o casella?** L'interruttore agisce **subito** e non ha un
 * «Salva» dopo; la casella è una risposta dentro un modulo, e vale quando il
 * modulo si invia. Se accanto c'è un bottone di conferma, quello giusto è il
 * checkbox.
 */
const meta = {
  title: 'Primitive/Switch',
  component: Switch,
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="s-solo" />
      <Label htmlFor="s-solo">Visibile nel catalogo pubblico</Label>
    </div>
  ),
}

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
 * Commuta la **Densità** in barra e guarda questa story: prima del ri-stile
 * l'interruttore restava fermo mentre etichetta e riga crescevano intorno.
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
