import type { Meta, StoryObj } from '@storybook/react-vite'
import { BoldIcon, ItalicIcon, PinIcon, StarIcon, UnderlineIcon } from 'lucide-react'

import { Toggle } from '@/registry/tassullo/ui/toggle'

/**
 * Un bottone che resta premuto: ha due stati e li ricorda, come il grassetto
 * di una barra strumenti o «metti in evidenza».
 *
 * **Quando sì, quando no.** È un interruttore singolo dentro l'interfaccia.
 * Se le opzioni sono più d'una e vanno viste insieme, è un `toggle-group`.
 * Un'impostazione che ha effetto subito, con un'etichetta accanto, è uno
 * `switch`; una risposta dentro un modulo che si invia è una `checkbox`. Un
 * bottone che esegue un'azione e non resta premuto è `button`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/toggle
 * ```
 *
 * **Varianti e taglie.** `variant`: `default`, senza contorno, per una barra
 * strumenti; `outline`, col proprio bordo, da solo sopra una lista. `size`:
 * `sm`, `default`, `lg`. `pressed` o `defaultPressed`,
 * `onPressedChange`, `disabled`.
 *
 * **Regole d'uso.**
 *
 * - Un toggle di sola icona ha un `aria-label`: senza, è un bottone senza
 *   nome.
 * - Lo stato acceso ha lo stesso grigio del sorvolo: passando il puntatore su
 *   una fila di toggle spenti non si distinguono da quelli accesi. È il
 *   comportamento del componente, e non si ricolora a mano nell'app; una
 *   tinta per l'acceso, se servirà, si propone nel design system.
 *
 * **Tastiera e accessibilità.** `Tab` lo raggiunge, `Spazio` o `Invio` lo
 * commutano. Si annuncia come bottone premuto o non premuto.
 */
const meta = {
  title: 'Primitive/Toggle',
  component: Toggle,
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Un toggle con icona e testo.
 */
export const Predefinito: Story = {
  render: () => (
    <Toggle aria-label="Metti in evidenza">
      <StarIcon />
      In evidenza
    </Toggle>
  ),
}

/**
 * Le due varianti: `default` senza contorno, `outline` col bordo.
 */
export const Varianti: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle aria-label="Predefinito, spento">Predefinito</Toggle>
      <Toggle defaultPressed aria-label="Predefinito, acceso">
        Predefinito acceso
      </Toggle>
      <Toggle variant="outline" aria-label="Contornato, spento">
        Contornato
      </Toggle>
      <Toggle variant="outline" defaultPressed aria-label="Contornato, acceso">
        Contornato acceso
      </Toggle>
    </div>
  ),
}

/**
 * Le tre taglie. In densità normale sono alte 28, 32 e 36px; in touch 42, 48
 * e 54, testo compreso.
 */
export const Taglie: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle size="sm" variant="outline">
        Piccolo
      </Toggle>
      <Toggle size="default" variant="outline">
        Normale
      </Toggle>
      <Toggle size="lg" variant="outline">
        Grande
      </Toggle>
    </div>
  ),
}

/**
 * Tre toggle di sola icona in una barra strumenti, ciascuno col suo
 * `aria-label`.
 */
export const SoloIcona: Story = {
  render: () => (
    <div className="flex items-center gap-1 rounded-lg border border-border p-1">
      <Toggle aria-label="Grassetto">
        <BoldIcon />
      </Toggle>
      <Toggle aria-label="Corsivo">
        <ItalicIcon />
      </Toggle>
      <Toggle aria-label="Sottolineato">
        <UnderlineIcon />
      </Toggle>
    </div>
  ),
}

/**
 * Spento e acceso, entrambi disabilitati.
 */
export const Disabilitato: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle variant="outline" disabled>
        <PinIcon />
        Spento e disabilitato
      </Toggle>
      <Toggle variant="outline" defaultPressed disabled>
        <PinIcon />
        Acceso e disabilitato
      </Toggle>
    </div>
  ),
}

/**
 * Sopra: spento, spento col puntatore sopra, acceso — gli ultimi due sono
 * uguali. Sotto, per confronto, un acceso in arancio tenue non adottato,
 * che dal sorvolo si distingue.
 */
export const SpentoSorvolatoAcceso: Story = {
  name: 'Spento, sorvolato, acceso',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Toggle variant="outline">Spento</Toggle>
        <Toggle variant="outline" className="bg-muted text-foreground">
          Spento, sorvolato
        </Toggle>
        <Toggle variant="outline" defaultPressed>
          Acceso
        </Toggle>
      </div>
      <div className="flex items-center gap-4">
        <Toggle variant="outline">Spento</Toggle>
        <Toggle variant="outline" className="bg-muted text-foreground">
          Spento, sorvolato
        </Toggle>
        <Toggle
          variant="outline"
          defaultPressed
          className="aria-pressed:border-primary-border aria-pressed:bg-primary-subtle aria-pressed:text-accent-ink"
        >
          Acceso, arancio tenue
        </Toggle>
      </div>
    </div>
  ),
}
