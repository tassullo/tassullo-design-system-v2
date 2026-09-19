import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { HomeIcon, RotateCwIcon } from 'lucide-react'

import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { PaginaErrore } from '@/registry/tassullo/pages/pagina-errore'
import { Button } from '@/registry/tassullo/ui/button'

/**
 * **M4.6 — sesta e ultima pagina modello della FASE 4.** Le quattro varianti
 * che il `PIANO.md` nomina per gli stati di sistema: 404, accesso negato,
 * errore del server, manutenzione.
 *
 * Nessuna delle quattro è un blocco nuovo: sono la stessa composizione di
 * `tassullo-empty-state`/`tassullo-error-state` — `Empty` e derivati — con un
 * tono per variante (`lib/toni`) invece del solo `destructive` di
 * `error-state`. V. il commento di testa del componente per il ragionamento
 * completo, in particolare su **dentro/fuori dal guscio**: qui sotto la
 * differenza si vede — 404 e Accesso negato sono montate dentro `AppShell`
 * (la navigazione resta, l'utente ha sbagliato un link interno o una rotta
 * riservata), Errore del server e Manutenzione sono `schermoIntero`, sul
 * modello di `tassullo-pagina-login` (marchio in testa, nessun guscio: non
 * c'è nulla di affidabile da mostrare attorno).
 *
 * Ogni story passa un'azione di ritorno vera — un bottone che aggiorna un
 * contatore visibile sotto la pagina, per provare col dito che il clic parte
 * davvero (non solo che il bottone è disegnato).
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
  nome: 'Francesco',
  cognome: 'Sartori',
  email: 'fsartori@covicostruzioni.it',
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
 * Le quattro varianti fianco a fianco, coi rispettivi toni — utile per un
 * controllo visivo rapido, non sostituisce le quattro story sopra (ognuna
 * verifica anche dentro/fuori dal guscio).
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
