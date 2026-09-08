import type { Meta, StoryObj } from '@storybook/react-vite'

import { Skeleton } from '@/registry/tassullo/ui/skeleton'

/**
 * Il rettangolo che pulsa mentre i dati arrivano. Non ri-stilato: `bg-muted`
 * e `rounded-md` sono già i token del tema.
 *
 * **Come si usa, e come no.** Uno scheletro deve avere la FORMA di ciò che
 * sta sostituendo, o al suo posto arriva un contenuto di dimensione diversa
 * e la pagina salta. Non è decorazione: è un'anteprima del layout.
 *
 * Lo scheletro di pagina intera è un blocco, non una primitiva: `page-skeleton`,
 * M3.5, insieme a `empty-state` e `error-state` — i tre stati che INTERFACCE.md §1
 * vuole uguali in tutte le app.
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

/** Una riga di tabella in caricamento: le larghezze imitano le colonne vere. */
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

/** Una scheda in caricamento: titolo, due righe di testo, un'azione. */
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
