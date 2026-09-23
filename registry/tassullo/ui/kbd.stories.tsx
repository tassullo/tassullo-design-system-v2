import type { Meta, StoryObj } from '@storybook/react-vite'

import { Kbd, KbdGroup } from '@/registry/tassullo/ui/kbd'

/**
 * Un tasto della tastiera scritto nel testo: dice quale tasto premere, in una
 * scorciatoia o in un'istruzione.
 *
 * **Quando sì, quando no.** Si usa per i tasti, e solo per quelli. Un codice
 * di prodotto, un comando da terminale o un valore da copiare non sono tasti:
 * i codici si scrivono nel carattere del testo, i comandi in un blocco di
 * codice.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/kbd
 * ```
 *
 * **Parti.** `Kbd` è un tasto; `KbdGroup` tiene insieme i tasti di una
 * scorciatoia, che restano `<kbd>` distinti.
 *
 * **Regole d'uso.** Il tasto si scrive nel carattere dell'interfaccia, non in
 * monospazio: è un'etichetta. Dentro un `tooltip` il tasto cambia fondo da sé
 * e resta leggibile, senza classi da aggiungere. I tasti si scrivono come sono
 * stampati: `⌘`, `⇧`, `Esc`, `Tab`, le frecce.
 *
 * **Tastiera e accessibilità.** È testo in un elemento `<kbd>` nativo, che il
 * lettore di schermo annuncia come tale. Non riceve il fuoco e non si clicca.
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

/**
 * Una scorciatoia accanto all'azione che esegue: i tasti stanno in un
 * `KbdGroup`.
 */
export const Scorciatoia: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
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

/**
 * I tasti con cui si naviga un'interfaccia da tastiera, come si scrivono nelle
 * istruzioni.
 */
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
