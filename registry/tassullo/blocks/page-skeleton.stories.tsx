import type { Meta, StoryObj } from '@storybook/react-vite'

import { PageSkeleton } from '@/registry/tassullo/blocks/page-skeleton'

/**
 * Lo stato di caricamento: la sagoma del contenuto in arrivo, al posto di una
 * pagina bianca o di uno spinner da solo.
 *
 * **Quando sì, quando no.** È uno dei tre stati di una sezione, con
 * `tassullo-empty-state` quando i dati arrivano vuoti e
 * `tassullo-error-state` quando non arrivano. Si usa mentre si aspetta il
 * contenuto di una pagina o di una sezione intera. Per un pezzo piccolo —
 * un valore, una riga — basta la primitiva `skeleton`; per un'attesa dentro un
 * bottone, `spinner`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-page-skeleton
 * ```
 *
 * ```tsx
 * <PageSkeleton variante="tabella" righe={8} />
 * ```
 *
 * **Le prop.** `variante`: `"tabella"`, il predefinito, `"scheda"` o
 * `"elenco"`, la forma del contenuto atteso; `righe`, quante righe finte.
 *
 * **Regole d'uso.** La sagoma ha l'altezza del contenuto che arriverà, così
 * la pagina non salta quando arriva: si sceglie la variante che gli somiglia
 * e un numero di righe vicino a quello vero.
 */
const meta = {
  title: 'Blocchi/Skeleton di pagina',
  component: PageSkeleton,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PageSkeleton>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Un elenco che carica: la forma più frequente.
 */
export const Tabella: Story = {
  args: { variante: 'tabella', righe: 6 },
}

/**
 * Una scheda prima che arrivino i dati.
 */
export const Scheda: Story = {
  args: { variante: 'scheda', righe: 4 },
  render: (args) => (
    <div className="max-w-md">
      <PageSkeleton {...args} />
    </div>
  ),
}

/**
 * Un elenco con un'immagine o un'icona a sinistra: un elenco di persone, di
 * allegati.
 */
export const Elenco: Story = {
  args: { variante: 'elenco', righe: 5 },
  render: (args) => (
    <div className="max-w-sm">
      <PageSkeleton {...args} />
    </div>
  ),
}
