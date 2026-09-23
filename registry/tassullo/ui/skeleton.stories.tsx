import type { Meta, StoryObj } from '@storybook/react-vite'

import { Skeleton } from '@/registry/tassullo/ui/skeleton'

/**
 * Una sagoma che pulsa al posto di un contenuto che sta arrivando, e ne
 * anticipa la forma.
 *
 * **Quando sì, quando no.** Si usa quando si sa già che forma avrà il
 * contenuto: una riga di tabella, una scheda, un menu. Per un'attesa senza
 * forma — un bottone che sta salvando — si usa `spinner`; per un'operazione
 * lunga con un avanzamento da mostrare, `progress`. Lo scheletro di una
 * pagina intera è il blocco `page-skeleton`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/skeleton
 * ```
 *
 * **Regole d'uso.** Lo scheletro ha la forma e la misura di ciò che
 * sostituisce: le stesse altezze di riga, le stesse larghezze di colonna, gli
 * stessi tondi. Se non le ha, all'arrivo dei dati la pagina salta. La misura
 * si dà con `className` (`h-4 w-48`, `size-8 rounded-full`).
 *
 * **Tastiera e accessibilità.** È un riquadro vuoto: non riceve il fuoco e il
 * lettore di schermo non ha niente da annunciare.
 */
const meta = {
  title: 'Primitive/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
}

/**
 * Tre righe di tabella in caricamento: le larghezze imitano le colonne vere.
 */
export const RigaDiTabella: Story = {
  render: () => (
    <div className="flex w-140 flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  ),
}

/**
 * Una scheda in caricamento: titolo, due righe di testo, un'azione.
 */
export const Scheda: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="mt-2 h-8 w-28" />
    </div>
  ),
}
