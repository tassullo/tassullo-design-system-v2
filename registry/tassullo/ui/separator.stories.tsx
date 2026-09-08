import type { Meta, StoryObj } from '@storybook/react-vite'

import { Separator } from '@/registry/tassullo/ui/separator'

/**
 * Un filo sul token `--border`, orizzontale o verticale. Non è stato
 * ri-stilato: il default shadcn usa già il token giusto e lo spessore giusto,
 * ed è il primo gradino della scala del CLAUDE.md — quello che si prende
 * quando basta.
 *
 * Base UI gli dà `role="separator"` da sé, quindi in verticale dentro una
 * barra di strumenti è annunciato correttamente.
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
      <p className="text-md text-muted-foreground">Revisione 4 — 8 settembre 2026</p>
    </div>
  ),
}

export const Verticale: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-3 text-md">
      <span>Anagrafe</span>
      <Separator orientation="vertical" />
      <span>Prodotti</span>
      <Separator orientation="vertical" />
      <span className="text-muted-foreground">Malta R4</span>
    </div>
  ),
}
