import type { Meta, StoryObj } from '@storybook/react-vite'

import { Separator } from '@/registry/tassullo/ui/separator'

/**
 * Un filo che separa due gruppi di contenuto, in orizzontale fra blocchi o in
 * verticale fra voci di una riga.
 *
 * **Quando sì, quando no.** Separa gruppi che hanno già un senso loro; non
 * serve fra ogni riga di un elenco né intorno a una `card`, che ha il suo
 * bordo. Dentro un menu si usano i separatori del menu stesso
 * (`DropdownMenuSeparator`, `SelectSeparator`).
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/separator
 * ```
 *
 * **Opzioni.** `orientation`: `horizontal` (di base) o `vertical`.
 *
 * **Regole d'uso.** In verticale il filo si allunga su tutta l'altezza della
 * riga. Per averlo più corto, centrato in una riga più alta, si scrive
 * `className="data-vertical:h-4 data-vertical:self-auto"`: un `h-4` da solo
 * accorcia il filo ma lo lascia incollato in cima.
 *
 * **Tastiera e accessibilità.** Non riceve il fuoco. Si annuncia come
 * separatore, con il suo orientamento.
 */
const meta = {
  title: 'Primitive/Separator',
  component: Separator,
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Orizzontale: Story = {
  render: () => (
    <div className="w-80">
      <p className="text-base">Scheda tecnica</p>
      <Separator className="my-3" />
      <p className="text-sm text-muted-foreground">Revisione 4 — 8 settembre 2026</p>
    </div>
  ),
}

/**
 * Tre voci di una riga separate da fili verticali, che ne occupano tutta
 * l'altezza.
 */
export const Verticale: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-3 text-sm">
      <span>Anagrafe</span>
      <Separator orientation="vertical" />
      <span>Prodotti</span>
      <Separator orientation="vertical" />
      <span className="text-muted-foreground">Malta R4</span>
    </div>
  ),
}
