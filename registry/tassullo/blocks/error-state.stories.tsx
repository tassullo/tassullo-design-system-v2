import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlugZapIcon } from 'lucide-react'

import { ErrorState } from '@/registry/tassullo/blocks/error-state'

/**
 * Lo stato di errore: quando i dati di una sezione non arrivano, un messaggio
 * per chi legge al posto del contenuto, e quando serve il bottone per
 * riprovare.
 *
 * **Quando sì, quando no.** È uno dei tre stati di una sezione, con
 * `tassullo-page-skeleton` mentre i dati arrivano e `tassullo-empty-state`
 * quando arrivano vuoti. Si usa quando un errore prende il posto di
 * un'intera sezione. Un avviso accanto al contenuto, che resta leggibile, è
 * un `alert`; un errore su un campo sta nel campo (`tassullo-form-field`).
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-error-state
 * ```
 *
 * ```tsx
 * <ErrorState
 *   messaggio="Il servizio schede non risponde. Riprova fra qualche minuto."
 *   onRiprova={() => ricarica()}
 * />
 * ```
 *
 * **Le prop.** `messaggio`, già tradotto per chi legge; `titolo` e `icona`,
 * che hanno un valore di serie; `onRiprova` ed `etichettaRiprova`, per il
 * bottone.
 *
 * **Regole d'uso.**
 *
 * - Mai uno stack trace, mai un codice HTTP nudo, mai la risposta grezza del
 *   server: il messaggio lo scrive l'app, che sa cosa è successo.
 * - Un errore di permessi (403) si scrive sempre «Non hai i permessi per
 *   questa azione».
 * - «Riprova» solo per gli errori passeggeri: per un errore di permessi
 *   riprovare non cambia niente.
 */
const meta = {
  title: 'Blocchi/Stato di errore',
  component: ErrorState,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ErrorState>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Il messaggio, senza bottone.
 */
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

/**
 * Con «Riprova», per un errore passeggero.
 */
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
 * Un errore di permessi, con la sua frase fissa e senza «Riprova».
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
