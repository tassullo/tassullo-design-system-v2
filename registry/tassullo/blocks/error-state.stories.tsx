import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlugZapIcon } from 'lucide-react'

import { ErrorState } from '@/registry/tassullo/blocks/error-state'

/**
 * L'«errore» dello standard unico di M3.5: mai uno stack trace, mai un
 * codice HTTP nudo in UI — un messaggio già tradotto per chi legge, e un 403
 * che diventa sempre «Non hai i permessi per questa azione» (`INTERFACCE.md`
 * §1.1 di Anagrafe). La traduzione resta dell'app; questo blocco dà solo la
 * forma.
 *
 * ```tsx
 * <ErrorState
 *   messaggio="Il servizio schede non risponde. Riprova fra qualche minuto."
 *   onRiprova={() => ricarica()}
 * />
 * ```
 *
 * È la stessa primitiva del vuoto (`empty`), tinta di `destructive-subtle` —
 * non `alert`: un errore che sostituisce un'intera sezione è uno stato della
 * pagina, non una riga accanto al contenuto.
 */
const meta = {
  title: 'Blocchi/Stato di errore',
  component: ErrorState,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ErrorState>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  args: {
    messaggio: 'Il servizio schede non risponde. Riprova fra qualche minuto.',
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorState {...args} />
    </div>
  ),
}

/** Con «Riprova»: per gli errori transitori, non per un 403. */
export const ConRiprova: Story = {
  args: {
    messaggio: 'Il servizio schede non risponde. Riprova fra qualche minuto.',
    onRiprova: () => {},
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorState {...args} />
    </div>
  ),
}

/**
 * Un 403 tradotto: mai il messaggio grezzo del backend, che parla di
 * permessi interni — sempre questa frase, letterale.
 */
export const SenzaPermessi: Story = {
  args: {
    icona: <PlugZapIcon />,
    titolo: 'Accesso negato',
    messaggio: 'Non hai i permessi per questa azione.',
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorState {...args} />
    </div>
  ),
}
