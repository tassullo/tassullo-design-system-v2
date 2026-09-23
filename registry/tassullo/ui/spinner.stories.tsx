import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/registry/tassullo/ui/button'
import { Spinner } from '@/registry/tassullo/ui/spinner'

/**
 * Una rotella che gira per dire «sto lavorando» in uno spazio piccolo: dentro
 * un bottone, accanto a un'etichetta, in una cella.
 *
 * **Quando sì, quando no.** Si sceglie secondo quanto si sa di ciò che sta
 * arrivando. Se se ne conosce la forma, `skeleton`, che la anticipa; se si
 * conosce la percentuale, `progress`; se non si sa quanto manca e il posto è
 * piccolo, lo spinner.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/spinner
 * ```
 *
 * **Taglie.** Non ci sono varianti: la misura si dà con `size-*` in
 * `className`, e segue la densità insieme al bottone che la contiene.
 *
 * **Regole d'uso.**
 *
 * - Da solo porta `aria-label="Caricamento"`: il nome di serie è in inglese.
 * - Dentro un bottone con testo porta `aria-label=""` e
 *   `data-icon="inline-start"`: il nome lo dà il testo del bottone. Il bottone
 *   è `disabled` finché l'operazione non finisce.
 * - Il bottone di sola icona porta il nome sul bottone.
 *
 * **Tastiera e accessibilità.** Non riceve il fuoco. Ha il ruolo `status`, così
 * il lettore di schermo annuncia il caricamento anche quando sullo schermo c'è
 * solo la rotella.
 */
const meta = {
  title: 'Primitive/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

/**
 * La rotella da sola, col nome in italiano.
 */
export const Predefinito: Story = {
  render: () => <Spinner aria-label="Caricamento" />,
}

/**
 * Quattro misure con `size-*`.
 */
export const Taglie: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="size-3" aria-label="Caricamento" />
      <Spinner className="size-4" aria-label="Caricamento" />
      <Spinner className="size-6" aria-label="Caricamento" />
      <Spinner className="size-8" aria-label="Caricamento" />
    </div>
  ),
}

/**
 * Tre bottoni che stanno lavorando, disabilitati finché non finiscono.
 */
export const DentroUnBottone: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>
        <Spinner data-icon="inline-start" aria-label="" />
        Salvataggio…
      </Button>
      <Button variant="outline" size="sm" disabled>
        <Spinner data-icon="inline-start" aria-label="" />
        Verifica…
      </Button>
      <Button variant="ghost" size="icon" disabled aria-label="Caricamento">
        <Spinner aria-label="" />
      </Button>
    </div>
  ),
}

/**
 * Accanto a un testo, quando il caricamento riguarda una zona e non un'azione.
 */
export const ConEtichetta: Story = {
  render: () => (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner aria-label="" />
      Sto leggendo le schede tecniche…
    </p>
  ),
}
