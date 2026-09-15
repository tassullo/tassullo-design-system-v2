import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { PaginaLogin } from '@/registry/tassullo/pages/pagina-login'

/**
 * La schermata d'accesso, sul modello di `Login.tsx` di Anagrafe (letto in
 * sola lettura): logo, nome dell'app, un bottone «Accedi con Microsoft».
 *
 * ```tsx
 * <PaginaLogin
 *   applicazione="Anagrafe"
 *   descrizione="Anagrafica tecnica e documentale di prodotto"
 *   stato={statoAccesso}
 *   onAccedi={() => instance.loginRedirect(loginRequest)}
 * />
 * ```
 *
 * `onAccedi` è la sola cucitura verso MSAL/Entra ID: il blocco non importa
 * `@azure/msal-react`, l'app ci aggancia il proprio provider.
 */
const meta = {
  title: 'Pagine/Login',
  component: PaginaLogin,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PaginaLogin>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  args: {
    applicazione: 'Anagrafe',
    descrizione: 'Anagrafica tecnica e documentale di prodotto',
    onAccedi: () => {},
  },
}

/** Il redirect è partito: bottone disabilitato, indicatore al posto dell'icona. */
export const InCorso: Story = {
  args: {
    ...Predefinito.args,
    stato: 'in-corso',
  },
}

/** Il provider ha rifiutato, o il redirect è tornato senza sessione. */
export const Errore: Story = {
  args: {
    ...Predefinito.args,
    stato: 'errore',
    messaggioErrore: 'Microsoft ha rifiutato l’accesso. Riprova, o contatta l’amministratore.',
  },
}

/** L'app registration Entra ID non è ancora pronta — come `isAuthConfigured` in Anagrafe. */
export const NonConfigurato: Story = {
  args: {
    ...Predefinito.args,
    configurato: false,
  },
}

/** Interattiva: il clic avvia l'accesso, due secondi dopo l'errore. */
export const Interattiva: Story = {
  args: { ...Predefinito.args },
  render: (args) => {
    function Demo() {
      const [stato, setStato] = useState<'inattivo' | 'in-corso' | 'errore'>('inattivo')
      return (
        <PaginaLogin
          {...args}
          stato={stato}
          onAccedi={() => {
            setStato('in-corso')
            setTimeout(() => setStato('errore'), 2000)
          }}
        />
      )
    }
    return <Demo />
  },
}
