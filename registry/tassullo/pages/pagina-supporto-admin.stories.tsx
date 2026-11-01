import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BookOpenIcon, LifeBuoyIcon, PackageIcon, ShieldIcon } from 'lucide-react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { COLLEGAMENTO, RICHIESTE_ADMIN } from '@/prove/supporto-dati'
import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import type { RichiestaAmministratore, StatoCollegamento } from '@/registry/tassullo/lib/supporto'
import { PaginaSupportoAdmin } from '@/registry/tassullo/pages/pagina-supporto-admin'

/**
 * La vista dell'amministratore sul canale di supporto: gli avvisi sul
 * collegamento con GitHub, dove arrivano le richieste, la card del
 * collegamento e la tabella di tutte le richieste, con quelle che non sono
 * riuscite a partire e «Riprova invio» nella riga.
 *
 * **Quando sì, quando no.** È la pagina «Amministrazione › Supporto» di ogni
 * app che apre il canale di supporto, la vede solo chi amministra. Chi usa
 * l'app vede le sue richieste in `tassullo-pagina-supporto`; la scheda di
 * una richiesta, con i dettagli tecnici per l'amministratore, è
 * `tassullo-pagina-supporto-richiesta`.
 *
 * **È una pagina d'esempio**: mostra come si compongono i blocchi. Non si
 * installa e non si importa: se ne legge il codice con il comando che segue,
 * o chiedendolo all'MCP, e la si ricompone nell'app, nella cartella delle
 * pagine.
 *
 * ```bash
 * npx shadcn@latest view tassullo/tassullo-design-system-v2/tassullo-pagina-supporto-admin
 * ```
 *
 * **I blocchi che la compongono**, da installare nell'app per nome:
 * `tassullo-page-header`, `tassullo-data-table` coi filtri
 * `tassullo-data-table-filtro-sfaccettato` e
 * `tassullo-data-table-filtro-reset`, `tassullo-error-state`,
 * `tassullo-page-skeleton`, e `supporto` per i tipi, i nomi e i toni degli
 * stati. Le primitive sono `alert`, `card`, `badge`, `button` e `spinner`.
 *
 * **Com'è fatto l'esempio: le prop.**
 *
 * - `richieste`: tutte le richieste, coi campi del tipo
 *   `RichiestaAmministratore` di `supporto`: quelli di `Richiesta` più la
 *   issue su GitHub e i tentativi d'invio. `statoRichieste`,
 *   `erroreRichieste` e `onRiprovaRichieste` per caricamento ed errore.
 * - `collegamentoGitHub`: lo stato del collegamento, tipo
 *   `StatoCollegamento`; `statoCollegamento`, `erroreCollegamento` e
 *   `onRiprovaCollegamento` come sopra.
 * - `onRiprovaInvio(richiesta)` rimanda una richiesta che non è partita;
 *   `invioInCorso` elenca quelle di cui il nuovo invio è in corso.
 * - `collegamento(richiesta)`: l'elemento che rende il titolo come
 *   collegamento alla scheda, di solito il `Link` del router.
 * - `onAggiorna` rilegge tutto; `percorso`, di serie «Amministrazione ›
 *   Supporto».
 *
 * **Regole d'uso.**
 *
 * - La pagina sta a tutta altezza: avvisi e card in cima, la tabella sotto
 *   che scorre nel suo riquadro.
 * - Gli avvisi dicono cosa fare: collegamento non configurato e token in
 *   scadenza in giallo, token scaduto in rosso. I nomi delle variabili
 *   d'ambiente si scrivono in codice, perché si copiano.
 * - È una schermata tecnica: l'errore dell'invio si mostra così come arriva
 *   dal server, su due righe, e intero passandoci sopra.
 * - L'utente si scrive con nome e cognome, mai con l'email.
 * - Una richiesta ancora «ricevuta» con un errore d'invio è «Invio fallito»,
 *   in rosso, e il filtro Stato la distingue.
 * - Il titolo sta su una riga e si tronca; si legge intero passandoci sopra
 *   o nella scheda. Il numero della issue si apre su GitHub, «—» se non c'è.
 *
 * **Tastiera e accessibilità.** Titoli, issue e «Riprova invio» si
 * raggiungono col `Tab`; ricerca, filtri e intestazioni sono quelli di
 * `tassullo-data-table`. Durante un nuovo invio il bottone della riga è
 * spento.
 */
const meta = {
  title: 'Pagine/Supporto, amministrazione',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const UTENTE = { nome: 'Giorgio', cognome: 'Pedrotti', email: 'gpedrotti@esempio.it', ruolo: 'Amministratore' }

const SEZIONI: SezioneNav[] = [
  {
    voci: [
      { titolo: 'Prodotti', icona: PackageIcon, href: '#' },
      { titolo: 'Riferimenti', icona: BookOpenIcon, href: '#' },
      { titolo: 'Amministrazione', icona: ShieldIcon, href: '#', attiva: true },
    ],
  },
  { className: 'mt-auto', voci: [{ titolo: 'Supporto', icona: LifeBuoyIcon, href: '#' }] },
]

const attendi = (ms: number) => new Promise((risolvi) => setTimeout(risolvi, ms))

function Guscio({
  collegamento = COLLEGAMENTO,
  statoRichieste,
  statoCollegamento,
  esitoRiprova = 'riesce',
}: {
  collegamento?: StatoCollegamento
  statoRichieste?: 'pronto' | 'caricamento' | 'errore'
  statoCollegamento?: 'pronto' | 'caricamento' | 'errore'
  esitoRiprova?: 'riesce' | 'fallisce'
}) {
  const [righe, setRighe] = useState<RichiestaAmministratore[]>(RICHIESTE_ADMIN)
  const [inCorso, setInCorso] = useState<RichiestaAmministratore['id'][]>([])

  async function riprova(r: RichiestaAmministratore) {
    setInCorso((prima) => [...prima, r.id])
    await attendi(600)
    const tentativi = (r.invio_tentativi ?? 0) + 1
    setRighe((prima) =>
      prima.map((x) =>
        x.id !== r.id
          ? x
          : esitoRiprova === 'riesce'
            ? {
                ...x,
                stato: 'aperta',
                invio_tentativi: tentativi,
                invio_ultimo_errore: null,
                github_numero: 58,
                github_url: 'https://github.com/esempio/supporto/issues/58',
              }
            : { ...x, invio_tentativi: tentativi },
      ),
    )
    setInCorso((prima) => prima.filter((id) => id !== r.id))
  }

  return (
    <AppShell applicazione="Anagrafe" collassa="icona" contenuto="riempie" utente={UTENTE} sezioni={SEZIONI}>
      <PaginaSupportoAdmin
        richieste={righe}
        statoRichieste={statoRichieste}
        erroreRichieste="GET /api/supporto/richieste?tutte=1: 502 Bad Gateway"
        onRiprovaRichieste={() => {}}
        collegamentoGitHub={collegamento}
        statoCollegamento={statoCollegamento}
        erroreCollegamento="GET /api/supporto/stato: 500 Internal Server Error"
        onRiprovaCollegamento={() => {}}
        onRiprovaInvio={(r) => void riprova(r)}
        invioInCorso={inCorso}
        onAggiorna={() => {}}
        collegamento={(r) => <a href={`#richiesta-${r.id}`} />}
      />
    </AppShell>
  )
}

/**
 * Il collegamento configurato e il token valido, quindi nessun avviso. Due
 * richieste non sono partite: «Riprova invio» nella riga le rimanda, e la
 * prima stavolta parte.
 */
export const DiSerie: Story = {
  name: 'Di serie',
  render: () => <Guscio />,
}

/** Il token scade fra pochi giorni: un avviso giallo in cima. */
export const TokenInScadenza: Story = {
  name: 'Token in scadenza',
  render: () => (
    <Guscio
      collegamento={{
        ...COLLEGAMENTO,
        token: { stato: 'in_scadenza', scadenza: '2026-11-09', giorni: 8 },
      }}
    />
  ),
}

/** Il token è scaduto: le richieste non partono, l'avviso è rosso. */
export const TokenScaduto: Story = {
  name: 'Token scaduto',
  render: () => (
    <Guscio
      collegamento={{
        ...COLLEGAMENTO,
        token: { stato: 'scaduta', scadenza: '2026-10-28', giorni: -4 },
        non_inviate: 3,
      }}
      esitoRiprova="fallisce"
    />
  ),
}

/**
 * Il collegamento non è configurato in questo ambiente, e la scadenza del
 * token non è dichiarata: le richieste si salvano e restano «ricevute».
 */
export const NonConfigurato: Story = {
  name: 'Non configurato',
  render: () => (
    <Guscio
      collegamento={{
        ...COLLEGAMENTO,
        configurato: false,
        token: { stato: 'non_dichiarata', scadenza: null, giorni: null },
        non_inviate: 3,
        ultima_sincronizzazione: null,
      }}
      esitoRiprova="fallisce"
    />
  ),
}

/** Collegamento ed elenco in caricamento. */
export const Caricamento: Story = {
  render: () => <Guscio statoRichieste="caricamento" statoCollegamento="caricamento" />,
}

/** Né il collegamento né l'elenco si leggono: l'errore del server così com'è. */
export const Errore: Story = {
  render: () => <Guscio statoRichieste="errore" statoCollegamento="errore" />,
}

// Scena di misura: due righe con «Invio fallito»; «Riprova invio» sulla
// prima spegne il bottone durante l'invio, poi la riga diventa «Aperta» con
// la issue #58 e «Riuscito al 2° tentativo». Il filtro «Stato» ha «Invio
// fallito». L'utente è il nome, mai l'email. `!dev` la toglie dalla barra e
// da Docs; il gate la esegue.
export const Prova: Story = {
  name: 'Prova',
  tags: ['!dev', '!autodocs'],
  render: () => <Guscio />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await waitFor(() => expect(c.getAllByText('Invio fallito')).toHaveLength(2))
    await expect(canvasElement).not.toHaveTextContent('@esempio.it')
    await expect(c.getByRole('link', { name: '#52' })).toHaveAttribute(
      'href',
      'https://github.com/esempio/supporto/issues/52',
    )
    const bottoni = c.getAllByRole('button', { name: 'Riprova invio' })
    await expect(bottoni).toHaveLength(2)
    // Durante l'invio lo spinner entra nel nome del bottone: si tiene il
    // riferimento a quello cliccato invece di cercarlo di nuovo per nome.
    const primo = bottoni[0]
    await userEvent.click(primo)
    await waitFor(() => expect(primo).toBeDisabled())
    // La riga è cambiata solo quando c'è la issue: prima, il conto dei
    // bottoni torna già a uno, perché quello in attesa ha un altro nome.
    await waitFor(() => expect(c.getByRole('link', { name: '#58' })).toBeInTheDocument())
    await expect(c.getByText('Riuscito al 2° tentativo')).toBeInTheDocument()
    await expect(c.getAllByRole('button', { name: 'Riprova invio' })).toHaveLength(1)
  },
}
