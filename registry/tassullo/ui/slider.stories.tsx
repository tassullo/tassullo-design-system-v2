import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/registry/tassullo/ui/label'
import { Slider } from '@/registry/tassullo/ui/slider'

/**
 * Un cursore per scegliere un valore, o un intervallo con due maniglie, su
 * una scala continua.
 *
 * **Quando sì, quando no.** Serve quando conta la posizione sulla scala più
 * del numero esatto: un intervallo di tolleranza, una soglia. Se il valore
 * va scritto preciso — una resa, uno spessore — si usa un campo numerico, o
 * il cursore affiancato dal campo. Per poche scelte distinte si usano
 * `radio-group` o `toggle-group`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/slider
 * ```
 *
 * **Opzioni.** `defaultValue` o `value` sono sempre un array: una voce per
 * maniglia, due per un intervallo. `min`, `max`, `step` per la scala;
 * `largeStep` per il salto con `PagSu` e `PagGiù`; `disabled`.
 *
 * **Regole d'uso.**
 *
 * - Il nome si dà con `aria-labelledby`, puntato sull'`id` della `Label`, mai
 *   con `htmlFor`: il fuoco sta su un campo nascosto dentro ogni maniglia, e
 *   `htmlFor` non lo raggiunge. Con `aria-labelledby` il nome arriva a tutte
 *   le maniglie.
 * - Il valore si scrive accanto al cursore, in `tabular-nums`: un cursore
 *   senza numero si può muovere ma non leggere.
 * - `step` si dichiara quando il valore ha un passo naturale; i decimali si
 *   scrivono con la virgola.
 * - Da disabilitato si spegne il cursore, non l'etichetta, che resta
 *   leggibile e dice che cosa è spento.
 *
 * **Tastiera e accessibilità.** `Tab` porta sulla maniglia, e con due
 * maniglie passa dall'una all'altra; le frecce spostano di un passo, `PagSu`
 * e `PagGiù` (o `Maiusc` con le frecce) di un salto, `Home` e `Fine` agli
 * estremi. Il lettore di schermo annuncia il nome, il valore e, con due
 * maniglie, se è l'inizio o la fine dell'intervallo.
 */
const meta = {
  title: 'Primitive/Slider',
  component: Slider,
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Una maniglia sola, con il nome dalla `Label` via `aria-labelledby`.
 */
export const Predefinito: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Label id="sl-uno-lab">Umidità residua ammessa</Label>
      <Slider aria-labelledby="sl-uno-lab" defaultValue={[40]} />
    </div>
  ),
}

/**
 * Due intervalli, due maniglie ciascuno, con i valori scritti accanto in cifre
 * tabellari per confrontarli.
 */
export const IntervalloDiConformita: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label id="sl-ott-lab">Range ottimale (°C)</Label>
          <span className="text-sm tabular-nums text-muted-foreground">15 – 25</span>
        </div>
        <Slider aria-labelledby="sl-ott-lab" defaultValue={[15, 25]} min={0} max={40} />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label id="sl-conf-lab">Range di conformità (°C)</Label>
          <span className="text-sm tabular-nums text-muted-foreground">5 – 35</span>
        </div>
        <Slider aria-labelledby="sl-conf-lab" defaultValue={[5, 35]} min={0} max={40} />
      </div>
    </div>
  ),
}

/**
 * Un valore decimale con `step={0.5}`, scritto accanto con la virgola.
 */
export const ConPasso: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <Label id="sl-passo-lab">Resa (kg/m²)</Label>
        <span className="text-sm tabular-nums text-muted-foreground">12,5</span>
      </div>
      <Slider aria-labelledby="sl-passo-lab" defaultValue={[12.5]} min={0} max={25} step={0.5} />
    </div>
  ),
}

/**
 * Il cursore spento, l'etichetta leggibile.
 */
export const Disabilitato: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Label id="sl-dis-lab">Non modificabile in questo stato</Label>
      <Slider aria-labelledby="sl-dis-lab" defaultValue={[30]} disabled />
    </div>
  ),
}
