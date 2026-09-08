import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/registry/tassullo/ui/label'
import { Slider } from '@/registry/tassullo/ui/slider'

/**
 * **Due ri-stili, e il primo è una regola violata dal preset.**
 *
 * · `bg-white` sul pomello: un colore **fuori dal tema**, che la regola 3 del
 *   CLAUDE.md vieta. In chiaro non si notava; in scuro è un pomello bianco su
 *   antracite, l'unico bianco pieno di tutta l'interfaccia. Ora è
 *   `bg-background`, che è bianco in chiaro e antracite in scuro — cioè fa
 *   quello che il preset voleva dire, in entrambe le modalità.
 * · il pomello passa da `size-3` a `size-4`. Con `after:-inset-2` attorno, il
 *   bersaglio del dito va da **42px a 48px in touch** — sopra i 44 che M2.9
 *   chiederà, e non sotto per due pixel.
 *
 * Serve ai **range di conformità dell'FPC** (`range_ottimale`,
 * `range_conformita`), che è il motivo per cui sta in questa fase: due maniglie,
 * non una.
 *
 * **L'etichetta va agganciata con `aria-labelledby`, non con `htmlFor`.** È il
 * rilievo più utile emerso da questa fase, ed è invisibile a occhio: Base UI
 * non mette il fuoco sulla maniglia che si vede, ma su un **`<input type="range">`
 * nascosto che genera per ognuna**. L'`id` che si scrive sullo `<Slider>` finisce
 * sul `div` esterno, e un `<Label htmlFor>` che punta lì **non etichetta niente**:
 * il lettore di schermo annuncia «cursore, 5» senza dire di che cosa. Con
 * `aria-labelledby` la radice inoltra il nome a **tutte** le maniglie, e con due
 * maniglie l'annuncio diventa «Range di conformità, 5, inizio intervallo».
 *
 * È il tipo di difetto che axe non vede — l'`input` è nascosto — e che si trova
 * solo interrogando il DOM. Vale per ogni uso del cursore, anche a maniglia sola.
 *
 * **Da tastiera**: `Tab` porta sulla maniglia, **frecce** spostano di un passo,
 * `PagSu`/`PagGiù` di un salto, `Home`/`Fine` ai due estremi. Con due maniglie
 * si tabula da una all'altra.
 *
 * Il valore **non si legge dal cursore**: un cursore senza il numero accanto è
 * un controllo che si può muovere ma non compilare. Va sempre accompagnato da
 * un campo o da un'etichetta che dice dove si è.
 */
const meta = {
  title: 'Primitive/Slider',
  component: Slider,
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Label id="sl-uno-lab">Umidità residua ammessa</Label>
      <Slider aria-labelledby="sl-uno-lab" defaultValue={[40]} />
    </div>
  ),
}

/**
 * Il caso vero: un **intervallo**. Due maniglie sullo stesso cursore, e il
 * valore scritto accanto in `tabular-nums` perché le due cifre si confrontano.
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

/** Col passo dichiarato: `step` è quello che rende il cursore compilabile davvero. */
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
 * Disabilitato. **L'etichetta non si spegne, il cursore sì**: è il `Control`
 * che porta `data-disabled:opacity-50`, e basta. Spegnere anche l'etichetta la
 * porterebbe sotto soglia di contrasto — misurato, axe lo segnala — e in
 * cambio si perderebbe la sola cosa che dice *che cosa* è disabilitato.
 */
export const Disabilitato: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Label id="sl-dis-lab">Non modificabile in questo stato</Label>
      <Slider aria-labelledby="sl-dis-lab" defaultValue={[30]} disabled />
    </div>
  ),
}
