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
      <p className="text-sm text-muted-foreground">Revisione 4 — 8 settembre 2026</p>
    </div>
  ),
}

/**
 * **Il separatore verticale porta `data-vertical:self-stretch`, e in una riga
 * più alta di lui questo lo incolla in cima.** `self-stretch` vince
 * sull'`items-center` del contenitore: se poi gli si dà un'altezza — il caso
 * tipico è `h-4` in una testata da 48px — il filo resta alto 16px ma
 * appoggiato al bordo superiore, e si legge come una barretta grigia
 * dimenticata lì. Misurato in una testata da 48: **1×16px a y=0**.
 *
 * Non è un difetto da ri-stilare: `self-stretch` è quello che si vuole nel
 * caso normale, cioè un separatore che prende tutta l'altezza della riga. Chi
 * lo vuole più corto deve restituire l'allineamento al contenitore, ed è la
 * forma che shadcn stesso usa nei suoi blocchi:
 * `className="data-vertical:h-4 data-vertical:self-auto"`. **Il `data-vertical:`
 * non è pignoleria**: un `h-4` semplice perde contro `data-vertical:self-stretch`
 * sull'allineamento, e cambia solo l'altezza.
 *
 * Qui sotto il caso normale — la riga è `h-6` e il separatore la riempie —
 * quindi il difetto non si vede: si presenta appena la riga cresce.
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
