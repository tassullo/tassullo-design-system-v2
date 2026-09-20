import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { LogoMicrosoft } from '@/prove/logo-microsoft'
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
 *
 * **`modo` apre il guscio a tre vie** (D23): `"microsoft"` di default — cioè
 * Anagrafe e Officina immutate — `"credenziali"`, e `"entrambi"`, che è
 * Studio. In `"entrambi"` l'ordine sulla pagina dice il ruolo: credenziali,
 * separatore «oppure», SSO in fondo.
 */
const meta = {
  title: 'Pagine/Login',
  component: PaginaLogin,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PaginaLogin>

export default meta
type Story = StoryObj<typeof meta>

/** Le proprietà del guscio, uguali in tutte le scene. */
const guscio = {
  applicazione: 'Anagrafe',
  descrizione: 'Anagrafica tecnica e documentale di prodotto',
}

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

/**
 * Interattiva: il clic avvia l'accesso, due secondi dopo l'errore.
 *
 * Le props si passano **una per una** e non con uno spread di `args`: da
 * M4ter.4 la firma è un'unione discriminata su `modo`, e uno spread di
 * un'unione TypeScript non lo sa restringere (`TS2322`, misurato). È il
 * costo della firma che impedisce di dichiarare una via senza il suo
 * gestore, e si paga qui, in una story, non nelle app.
 */
export const Interattiva: Story = {
  args: { ...Predefinito.args },
  render: ({ applicazione, descrizione }) => {
    function Demo() {
      const [stato, setStato] = useState<'inattivo' | 'in-corso' | 'errore'>('inattivo')
      return (
        <PaginaLogin
          applicazione={applicazione}
          descrizione={descrizione}
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

/**
 * `modo="credenziali"` — solo email e password. Non ha consumatori oggi, ed
 * è fatto lo stesso: senza il caso puro, «entrambi» sembrerebbe un caso
 * speciale invece che la somma di due vie.
 *
 * Il «Mostra» sta **dentro** il campo (`InputGroup` + `InputGroupButton`), e
 * il form è **non controllato**: i valori li legge `FormData` all'invio,
 * quindi `Invio` dal campo password invia come su qualunque form.
 */
export const Credenziali: Story = {
  args: {
    ...guscio,
    modo: 'credenziali',
    onAccediConCredenziali: () => {},
    onPasswordDimenticata: () => {},
    onRegistrati: () => {},
  },
}

/**
 * `modo="entrambi"` — è Studio. **L'ordine sulla pagina dice il ruolo**:
 * credenziali prima col bottone primario, `FieldSeparator` con «oppure» al
 * centro, poi l'SSO in `outline` sotto l'etichetta del team.
 *
 * Il logo Microsoft arriva dall'app come nodo (`logoMicrosoft`).
 */
export const Entrambi: Story = {
  args: {
    applicazione: 'Studio',
    descrizione: 'Progettazione e computi per professionisti',
    modo: 'entrambi',
    logoMicrosoft: <LogoMicrosoft />,
    onAccedi: () => {},
    onAccediConCredenziali: () => {},
    onPasswordDimenticata: () => {},
    onRegistrati: () => {},
  },
}

/**
 * L'errore delle **credenziali**: sta sul form, accanto ai campi che l'hanno
 * prodotto, e quei campi sono `aria-invalid`. `Alert variant="destructive"`,
 * mai un testo tinto `text-destructive`.
 *
 * Qui il messaggio è **quello di default della via**, che è il punto: le
 * parole dei due errori devono distinguersi da sole. Passarne uno uguale al
 * titolo ripeteva la stessa frase due volte — visto a video, corretto.
 */
export const ErroreCredenziali: Story = {
  args: {
    ...Entrambi.args,
    stato: 'errore',
    statoDi: 'credenziali',
  },
}

/**
 * L'errore del **ritorno da Microsoft**: sta in cima alla card, sopra il
 * form, e non tocca i campi. In Studio è quello catturato in `main.tsx`.
 *
 * È la ragione di `statoDi`: indistinti, questo errore colorerebbe di rosso
 * il campo password di chi ha sbagliato tutt'altro.
 */
export const ErroreMicrosoft: Story = {
  args: {
    ...Entrambi.args,
    stato: 'errore',
    statoDi: 'microsoft',
    messaggioErrore:
      'Il rientro da Microsoft non è andato a buon fine. Riprova, o contatta l’amministratore.',
  },
}

/**
 * La via locale **spenta** — in Studio `accessoLocale` è `false` finché il
 * backend non ha il segreto. I campi restano disabilitati con l'avviso, non
 * spariscono: è lo stesso trattamento che `configurato={false}` dà da sempre
 * all'altra via, e una via che sparisce senza dirlo si legge come un guasto.
 */
export const CredenzialiSpente: Story = {
  args: {
    ...Entrambi.args,
    credenzialiAbilitate: false,
  },
}
