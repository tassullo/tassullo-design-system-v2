import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/registry/tassullo/ui/button'
import { Spinner } from '@/registry/tassullo/ui/spinner'

/**
 * Il caricamento **inline**: dentro un bottone, accanto a un'etichetta, in una
 * cella. È il terzo dei modi di dire "sto lavorando" previsti da INTERFACCE.md §1,
 * e il criterio per scegliere fra i tre è quanto si sa di ciò che sta arrivando:
 *
 * · si sa la forma e non i dati → `Skeleton`, che la anticipa;
 * · non si sa quanto manca ma il posto è piccolo → `Spinner`;
 * · si sa la percentuale → `progress`, che arriva in M2.4.
 *
 * Non ri-stilato: `size-4 animate-spin` segue già la densità, perché `size-*`
 * deriva da `--spacing`. In touch la rotella cresce insieme al bottone che la
 * contiene, senza che nessuno la patchi.
 *
 * Porta `role="status"` e un'etichetta accessibile propri: uno screen reader
 * annuncia il caricamento anche quando sullo schermo c'è solo la rotella.
 * L'etichetta di serie è in inglese perché è il file di shadcn e non si tocca
 * fuori dalle stringhe di classi — nelle app italiane si passa `aria-label`.
 */
const meta = {
  title: 'Primitive/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => <Spinner aria-label="Caricamento" />,
}

/** Le taglie non sono varianti: sono `size-*`, cioè la scala della densità. */
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

/** Il caso vero: il bottone che sta salvando, disabilitato mentre lo fa. */
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

/** Accanto a un testo, quando il caricamento riguarda una zona e non un'azione. */
export const ConEtichetta: Story = {
  render: () => (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner aria-label="" />
      Sto leggendo le schede tecniche…
    </p>
  ),
}
