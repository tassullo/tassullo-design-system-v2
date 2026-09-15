import type { Meta, StoryObj } from '@storybook/react-vite'

import { PageSkeleton } from '@/registry/tassullo/blocks/page-skeleton'

/**
 * Il «caricamento» dello standard unico di M3.5: skeleton al posto del
 * contenuto, mai una pagina bianca e mai uno spinner isolato senza contesto
 * (`INTERFACCE.md` §1.1 di Anagrafe). L'altezza è coerente col contenuto
 * atteso — da cui le tre `variante`, non un rettangolo unico.
 *
 * ```tsx
 * <PageSkeleton variante="tabella" righe={8} />
 * ```
 */
const meta = {
  title: 'Blocchi/Skeleton di pagina',
  component: PageSkeleton,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PageSkeleton>

export default meta
type Story = StoryObj<typeof meta>

/** Il caso più frequente: una lista di Prodotti, Famiglie, Norme mentre carica. */
export const Tabella: Story = {
  args: { variante: 'tabella', righe: 6 },
}

/** Una scheda prodotto, prima che i dati arrivino. */
export const Scheda: Story = {
  args: { variante: 'scheda', righe: 4 },
  render: (args) => (
    <div className="max-w-md">
      <PageSkeleton {...args} />
    </div>
  ),
}

/** Un elenco con avatar/icona a sinistra — un menu utenti, una lista allegati. */
export const Elenco: Story = {
  args: { variante: 'elenco', righe: 5 },
  render: (args) => (
    <div className="max-w-sm">
      <PageSkeleton {...args} />
    </div>
  ),
}
