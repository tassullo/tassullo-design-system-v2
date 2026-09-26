import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { LogoMicrosoft } from '@/prove/logo-microsoft'
import { PaginaLogin } from '@/registry/tassullo/pages/pagina-login'

/**
 * La schermata d'accesso: il marchio, il nome dell'app e le vie per
 * entrare — con Microsoft, con email e password, o con tutte e due.
 *
 * **Quando sì, quando no.** È la prima schermata di ogni applicativo, fuori
 * dal guscio. Le schermate che le stanno intorno — registrazione, password
 * dimenticata, verifica dell'email — non sono sue scene: si compongono con
 * le primitive, come mostra `Pagine/Schermate d'accesso`.
 *
 * **È una pagina d'esempio**: mostra come si compongono i blocchi. Non si
 * installa e non si importa: se ne legge il codice con il comando che segue,
 * o chiedendolo all'MCP, e la si ricompone nell'app, nella cartella delle
 * pagine.
 *
 * ```bash
 * npx shadcn@latest view tassullo/tassullo-design-system-v2/tassullo-pagina-login
 * ```
 *
 * È composta con `card`, `field`, `input`, `input-group`, `alert`,
 * `spinner` e `button`, da installare nell'app per nome.
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
 * **Le vie, con `modo`.**
 *
 * - `"microsoft"`, il predefinito: un bottone «Accedi con Microsoft», e
 *   `onAccedi` avvia l'accesso. Il blocco non importa MSAL: l'app ci aggancia
 *   il suo provider.
 * - `"credenziali"`: email e password, e `onAccediConCredenziali` riceve
 *   `{ email, password }`.
 * - `"entrambi"`: le credenziali in cima col bottone primario, poi il
 *   separatore «oppure», poi Microsoft. Servono tutti e due i gestori.
 *
 * La firma è un'unione sul valore di `modo`: una via dichiarata senza il suo
 * gestore non compila.
 *
 * **Le altre prop.**
 *
 * - `stato`: `"inattivo"`, `"in-corso"` o `"errore"`, con `messaggioErrore`;
 *   `statoDi` dice a quale via si riferisce, se le vie sono due.
 * - `configurato={false}` spegne la via Microsoft con un avviso, quando la
 *   registrazione dell'app su Entra ID non è pronta;
 *   `credenzialiAbilitate={false}` fa lo stesso con email e password.
 * - `logoMicrosoft`: il marchio di Microsoft, passato dall'app. Senza, resta
 *   un'icona generica.
 * - `etichettaAccedi`, `intestazioneSso`, `onPasswordDimenticata`,
 *   `onRegistrati`: il testo del bottone, l'etichetta sopra l'accesso
 *   Microsoft in `"entrambi"`, e i due collegamenti, che compaiono solo se
 *   passati.
 *
 * **Regole d'uso.**
 *
 * - L'errore sta accanto alla via che l'ha prodotto: quello delle
 *   credenziali sul modulo, coi campi `aria-invalid`; quello di Microsoft
 *   accanto al suo bottone, senza toccare i campi.
 * - I messaggi d'errore arrivano già tradotti: mai un codice del provider.
 * - Una via spenta resta visibile, disabilitata e con l'avviso: una via che
 *   sparisce senza dirlo si legge come un guasto.
 *
 * **Tastiera e accessibilità.** Il modulo delle credenziali è un modulo
 * vero: `Invio` dal campo password lo invia. «Mostra» sta dentro il campo
 * password e dice il suo stato con `aria-pressed`.
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

/** La via predefinita, Microsoft: il marchio, il nome dell'app, un bottone. */
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
    messaggioErrore: 'Microsoft ha rifiutato l’accesso. Riprova o contatta l’amministratore.',
  },
}

/**
 * `configurato={false}`: la registrazione dell'app su Entra ID non è ancora
 * pronta. Il bottone resta disabilitato e l'avviso dice perché.
 */
export const NonConfigurato: Story = {
  args: {
    ...Predefinito.args,
    configurato: false,
  },
}

/**
 * Da provare: il clic avvia l'accesso, e due secondi dopo compare l'errore.
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
 * `modo="credenziali"`: solo email e password. «Mostra» sta dentro il campo
 * password; `Invio` dal campo invia il modulo.
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
 * `modo="entrambi"`: le credenziali in cima col bottone primario, il
 * separatore «oppure» al centro, e sotto l'accesso Microsoft in `outline`,
 * con l'etichetta di chi entra di lì. Il marchio Microsoft lo passa l'app
 * (`logoMicrosoft`).
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
 * L'errore delle credenziali: sta sul modulo, accanto ai campi che l'hanno
 * prodotto, e quei campi sono `aria-invalid`. È un `Alert` con
 * `variant="destructive"`, non un testo tinto di rosso. Il messaggio è
 * quello di default della via, che si distingue da solo dall'altro.
 */
export const ErroreCredenziali: Story = {
  args: {
    ...Entrambi.args,
    stato: 'errore',
    statoDi: 'credenziali',
  },
}

/**
 * L'errore del ritorno da Microsoft: sta accanto al bottone Microsoft, non
 * in cima, e non tocca i campi. La posizione dice quale via ha fallito
 * prima ancora delle parole. Le parole indicano un'azione che esiste: chi
 * legge è già tornato da Microsoft, e per riprovare c'è il bottone subito
 * sotto.
 */
export const ErroreMicrosoft: Story = {
  args: {
    ...Entrambi.args,
    stato: 'errore',
    statoDi: 'microsoft',
    messaggioErrore: 'Riprova o contatta l’amministratore.',
  },
}

/**
 * `credenzialiAbilitate={false}`: la via con email e password è spenta. I
 * campi restano, disabilitati e con l'avviso, come fa `configurato={false}`
 * per Microsoft.
 */
export const CredenzialiSpente: Story = {
  args: {
    ...Entrambi.args,
    credenzialiAbilitate: false,
  },
}
