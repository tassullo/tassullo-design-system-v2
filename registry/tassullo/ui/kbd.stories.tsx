import type { Meta, StoryObj } from '@storybook/react-vite'

import { Kbd, KbdGroup } from '@/registry/tassullo/ui/kbd'

/**
 * Il tasto della tastiera, scritto in un `<kbd>` vero. Non ri-stilato:
 * `bg-muted` / `text-muted-foreground` e `rounded-sm` sono già i token giusti.
 *
 * **Nota che vale per tutta la FASE 2**: `Kbd` usa `font-sans`, non `font-mono`,
 * ed è deliberato anche a monte. Il monospazio nel design system Tassullo è
 * riservato ai **codici di sistema** — dove si vuole che stonino — mentre i
 * numeri da incolonnare vogliono `tabular-nums` e non un altro carattere
 * (la misura sta in `Tema/Cifre`). Un tasto non è né l'uno né gli altri: è
 * un'etichetta, e si legge nel carattere dell'interfaccia.
 */
const meta = {
  title: 'Primitive/Kbd',
  component: Kbd,
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => <Kbd>⌘</Kbd>,
}

/** Una scorciatoia è un gruppo: i tasti restano `<kbd>` distinti. */
export const Scorciatoia: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-md">
      <p className="flex items-center gap-2">
        Cerca <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
      </p>
      <p className="flex items-center gap-2">
        Salva <KbdGroup><Kbd>⌘</Kbd><Kbd>S</Kbd></KbdGroup>
      </p>
      <p className="flex items-center gap-2">
        Chiudi <KbdGroup><Kbd>Esc</Kbd></KbdGroup>
      </p>
    </div>
  ),
}

/** I tasti di navigazione, quelli che l'accettazione «da tastiera» tira in ballo. */
export const Navigazione: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>Tab</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>↑</Kbd>
      <Kbd>↓</Kbd>
      <Kbd>↵</Kbd>
      <Kbd>Esc</Kbd>
    </KbdGroup>
  ),
}
