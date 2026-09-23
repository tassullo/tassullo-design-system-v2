import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { HomeIcon, RotateCwIcon } from 'lucide-react'

import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { PaginaErrore } from '@/registry/tassullo/pages/pagina-errore'
import { Button } from '@/registry/tassullo/ui/button'

/**
 * Le pagine degli stati di sistema: pagina non trovata, accesso negato,
 * errore del server, manutenzione. Ognuna con la sua icona, il suo tono e
 * un messaggio che dice cosa fare.
 *
 * **Quando sì, quando no.** Quando non c'è niente da mostrare al posto
 * della pagina intera. Una sezione che non carica, dentro una pagina che
 * funziona, è `tassullo-error-state`; un elenco ancora vuoto è
 * `tassullo-empty-state`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-pagina-errore
 * ```
 *
 * È composta sulla primitiva `empty`, la stessa di `tassullo-empty-state` e
 * `tassullo-error-state`, con i toni di `lib/toni`.
 *
 * **Le prop.**
 *
 * - `variante`: `"404"`, `"accesso-negato"`, `"errore-server"` o
 *   `"manutenzione"`. Sceglie icona, tono, titolo e messaggio di default.
 * - `titolo`, `messaggio`, `icona`: sostituiscono quelli della variante.
 * - `azione`: il nodo che riporta da qualche parte — un collegamento alla
 *   pagina iniziale, un bottone che riprova, un indirizzo dell'assistenza. Di
 *   default non c'è, perché il blocco non sa quale rotta esista.
 * - `schermoIntero`: la pagina a tutto schermo, col marchio in testa e senza
 *   guscio. Di default è vero per `"errore-server"` e `"manutenzione"`, falso
 *   per le altre due.
 *
 * **Regole d'uso.**
 *
 * - Pagina non trovata e accesso negato stanno dentro il guscio: la
 *   navigazione resta, perché è sbagliato un collegamento, non l'app.
 * - Errore del server e manutenzione stanno a tutto schermo: capitano prima
 *   che l'app abbia la sessione e i permessi, e un guscio vuoto sarebbe
 *   peggio di nessun guscio.
 * - Accesso negato serve per una rotta che senza un ruolo non ha niente da
 *   mostrare. Una pagina che si può ancora consultare non è un errore: è
 *   sola lettura, come `soloLettura` di `tassullo-pagina-admin`.
 * - Conviene passare sempre un'`azione`: una pagina d'errore senza una via
 *   d'uscita è un vicolo cieco.
 */
const meta = {
  title: 'Pagine/Errore',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SEZIONI_NAV: SezioneNav[] = [
  {
    voci: [{ titolo: 'Prodotti', attiva: true, href: '#' }],
  },
]

const UTENTE_CORRENTE = {
  nome: 'Stefano',
  cognome: 'Bertolini',
  email: 'sbertolini@esempio.it',
  ruolo: 'Lettore',
}

/** L'azione di ritorno, resa vera: il clic aggiorna un contatore visibile — non solo un bottone disegnato. */
function AzioneDiProva({ etichetta, icona: Icona }: { etichetta: string; icona: typeof HomeIcon }) {
  const [clic, setClic] = useState(0)
  return (
    <div className="flex flex-col items-center gap-2">
      <Button variant="outline" onClick={() => setClic((n) => n + 1)}>
        <Icona />
        {etichetta}
      </Button>
      {clic > 0 ? (
        <p className="text-xs text-muted-foreground" role="status">
          Cliccato {clic} {clic === 1 ? 'volta' : 'volte'}
        </p>
      ) : null}
    </div>
  )
}

/**
 * **404** — dentro il guscio: la navigazione resta, l'utente ha sbagliato un
 * link interno, non l'app intera.
 */
export const NonTrovata: Story = {
  render: () => (
    <AppShell applicazione="Anagrafe" collassa="icona" utente={UTENTE_CORRENTE} sezioni={SEZIONI_NAV}>
      <PaginaErrore
        variante="404"
        azione={<AzioneDiProva etichetta="Torna a Prodotti" icona={HomeIcon} />}
      />
    </AppShell>
  ),
}

/**
 * **Accesso negato** — anche questa dentro il guscio, e con un contenuto
 * vero: non "non hai i permessi" e basta, ma la stessa informazione onesta
 * del banner `soloLettura` di `tassullo-pagina-admin` — le sezioni che non
 * richiedono un ruolo restano visibili altrove.
 */
export const AccessoNegato: Story = {
  render: () => (
    <AppShell applicazione="Anagrafe" collassa="icona" utente={UTENTE_CORRENTE} sezioni={SEZIONI_NAV}>
      <PaginaErrore
        variante="accesso-negato"
        azione={<AzioneDiProva etichetta="Torna alla home" icona={HomeIcon} />}
      />
    </AppShell>
  ),
}

/**
 * **Errore del server** — `schermoIntero` di default: la sessione o i
 * permessi potrebbero non essere ancora caricati, mostrare un guscio vuoto
 * sarebbe peggio che non mostrarlo.
 */
export const ErroreServer: Story = {
  render: () => (
    <PaginaErrore
      variante="errore-server"
      azione={<AzioneDiProva etichetta="Riprova" icona={RotateCwIcon} />}
    />
  ),
}

/**
 * **Manutenzione** — `schermoIntero` di default, stessa composizione di
 * `tassullo-pagina-login`: capita prima che l'app abbia potuto autenticare
 * nessuno.
 */
export const Manutenzione: Story = {
  render: () => (
    <PaginaErrore
      variante="manutenzione"
      azione={<AzioneDiProva etichetta="Riprova" icona={RotateCwIcon} />}
    />
  ),
}

/**
 * Le quattro varianti affiancate, coi loro toni: per un confronto a colpo
 * d'occhio. Dentro o fuori dal guscio si vede nelle quattro scene sopra.
 */
export const Confronto: Story = {
  render: () => (
    <div className="flex min-h-svh flex-col gap-8 bg-background p-8 md:flex-row">
      {(['404', 'accesso-negato', 'errore-server', 'manutenzione'] as const).map((variante) => (
        <div key={variante} className="flex-1">
          <PaginaErrore variante={variante} schermoIntero={false} />
        </div>
      ))}
    </div>
  ),
}
