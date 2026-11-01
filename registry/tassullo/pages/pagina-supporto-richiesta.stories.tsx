import type { Meta, StoryObj } from '@storybook/react-vite'
import { BookOpenIcon, LifeBuoyIcon, PackageIcon } from 'lucide-react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { comeBlob, disegnaSchermata } from '@/prove/schermate'
import { APPENA_RICEVUTA, SCHEDA, SCREENSHOT_TOLTI } from '@/prove/supporto-dati'
import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import type { CaricaImmagine } from '@/registry/tassullo/blocks/galleria-immagini'
import type { RichiestaScheda } from '@/registry/tassullo/lib/supporto'
import {
  PaginaSupportoRichiesta,
  type PaginaSupportoRichiestaProps,
} from '@/registry/tassullo/pages/pagina-supporto-richiesta'

/**
 * La scheda di una richiesta di supporto: cosa ha scritto chi l'ha aperta,
 * lo stato, gli screenshot e le risposte. Per l'amministratore, a destra,
 * i dettagli tecnici che l'app ha allegato.
 *
 * **Quando sì, quando no.** È la pagina di una richiesta del canale di
 * supporto, uguale in tutte le app; l'elenco è `tassullo-pagina-supporto`.
 * Per la scheda di un'entità che si modifica c'è `tassullo-pagina-scheda`.
 *
 * **È una pagina d'esempio**: mostra come si compongono i blocchi. Non si
 * installa e non si importa: se ne legge il codice con il comando che segue,
 * o chiedendolo all'MCP, e la si ricompone nell'app, nella cartella delle
 * pagine.
 *
 * ```bash
 * npx shadcn@latest view tassullo/tassullo-design-system-v2/tassullo-pagina-supporto-richiesta
 * ```
 *
 * **I blocchi che la compongono**, da installare nell'app per nome:
 * `tassullo-page-header`, `card`, `tassullo-galleria-immagini` per gli
 * screenshot, `tassullo-filo-messaggi` per le risposte, `collapsible` per gli
 * errori nei dettagli, `tassullo-empty-state`, `tassullo-error-state`,
 * `tassullo-page-skeleton`, e `supporto` per i tipi, i nomi e i toni.
 *
 * **Com'è fatto l'esempio: le prop.**
 *
 * - `richiesta`: la scheda, col tipo `RichiestaScheda` di `supporto`.
 * - `stato`: `"pronto"`, il predefinito, `"caricamento"`, `"errore"` o
 *   `"non-trovata"`. La richiesta che non esiste e quella di un altro si
 *   mostrano allo stesso modo, così la pagina non dice che esiste.
 * - `percorsoLista`: il primo livello del percorso, verso l'elenco, col
 *   `Link` del router in `render`.
 * - `onAggiorna` e `aggiornamentoInCorso`: «Aggiorna» nella fascia.
 * - `caricaScreenshot(screenshot, segnale)`: dà ogni screenshot, un URL o un
 *   `Blob`; è il punto in cui l'app mette l'autenticazione.
 * - `amministratore`: mostra i dettagli tecnici.
 *
 * **Regole d'uso.**
 *
 * - La pagina è a tutta larghezza. I dettagli tecnici stanno in una colonna
 *   a destra quando l'area del contenuto è larga almeno 896px; sotto, dopo
 *   le risposte.
 * - Chi ha scritto la richiesta non vede i dettagli tecnici: l'app non li
 *   chiede al server se non per l'amministratore.
 * - Una richiesta «Ricevuta» dice che è registrata e sta per arrivare a chi
 *   la gestisce, perché non la si rifaccia.
 * - Gli screenshot tolti dopo la chiusura si dicono, invece di sparire.
 * - Aprendo la scheda, l'app segna lette le risposte nuove e aggiorna il
 *   conto sulla voce «Supporto».
 *
 * **Tastiera e accessibilità.** Le miniature si aprono con `Invio`, come in
 * `tassullo-galleria-immagini`; gli errori delle chiamate si aprono e si
 * chiudono dal loro bottone, con `Invio` o `Spazio`.
 */
const meta = {
  title: 'Pagine/Richiesta di supporto',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const UTENTE = { nome: 'Stefano', cognome: 'Bertolini', email: 'sbertolini@esempio.it', ruolo: 'Admin' }

const SEZIONI: SezioneNav[] = [
  {
    voci: [
      { titolo: 'Prodotti', icona: PackageIcon, href: '#' },
      { titolo: 'Riferimenti', icona: BookOpenIcon, href: '#' },
    ],
  },
  { className: 'mt-auto', voci: [{ titolo: 'Supporto', icona: LifeBuoyIcon, href: '#', attiva: true }] },
]

const TITOLI: Record<string, string> = {
  s1: 'Listino 2027',
  s2: 'Errore di validazione',
  s3: 'Riga 14',
}

// Come un'app che scarica con l'autenticazione: un `Blob`, dopo un momento.
const carica: CaricaImmagine = async (s, segnale) => {
  await new Promise((risolvi) => setTimeout(risolvi, 150))
  if (segnale.aborted) throw new DOMException('interrotto', 'AbortError')
  return comeBlob(disegnaSchermata(TITOLI[String(s.id)] ?? 'Schermata'))
}

function Guscio({
  richiesta,
  ...props
}: Partial<PaginaSupportoRichiestaProps> & { richiesta?: RichiestaScheda }) {
  return (
    <AppShell applicazione="Anagrafe" collassa="icona" utente={UTENTE} sezioni={SEZIONI}>
      <PaginaSupportoRichiesta
        richiesta={richiesta}
        percorsoLista={{ titolo: 'Supporto', href: '#' }}
        onAggiorna={() => {}}
        onRiprovaErrore={() => {}}
        caricaScreenshot={carica}
        {...props}
      />
    </AppShell>
  )
}

/**
 * Come la vede chi l'ha scritta: la richiesta in lavorazione, tre screenshot
 * e tre risposte, una con un indirizzo lungo che va a capo.
 */
export const ChiLHaScritta: Story = {
  name: "Chi l'ha scritta",
  render: () => <Guscio richiesta={SCHEDA} />,
}

/**
 * Come la vede l'amministratore: a destra i dettagli tecnici, con le due
 * chiamate non riuscite aperte.
 */
export const Amministratore: Story = {
  render: () => <Guscio richiesta={SCHEDA} amministratore />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: '2 chiamate non riuscite' }),
    )
  },
}

/** Appena ricevuta: senza screenshot, senza risposte, con la frase che rassicura. */
export const AppenaRicevuta: Story = {
  name: 'Appena ricevuta',
  render: () => <Guscio richiesta={APPENA_RICEVUTA} />,
}

/** Chiusa da tempo: gli screenshot sono stati tolti, e la scheda lo dice. */
export const ScreenshotTolti: Story = {
  name: 'Screenshot tolti',
  render: () => <Guscio richiesta={SCREENSHOT_TOLTI} />,
}

/** Sul telefono, per l'amministratore: una colonna sola, i dettagli in fondo. */
export const SulTelefono: Story = {
  name: 'Sul telefono',
  globals: { viewport: { value: 'telefono', isRotated: false } },
  render: () => <Guscio richiesta={SCHEDA} amministratore />,
}

/** La richiesta non esiste, o non è di chi la guarda. */
export const NonTrovata: Story = {
  name: 'Non trovata',
  render: () => <Guscio stato="non-trovata" />,
}

/** `stato="caricamento"`. */
export const Caricamento: Story = {
  render: () => <Guscio stato="caricamento" />,
}

/** `stato="errore"`. */
export const Errore: Story = {
  render: () => <Guscio stato="errore" />,
}

// Scena di misura: chi ha scritto non vede i dettagli tecnici,
// l'amministratore sì; la galleria ha tre miniature e il filo tre risposte,
// dalla più vecchia. `!dev` la toglie dalla barra e da Docs; il gate la
// esegue.
export const Prova: Story = {
  name: 'Prova',
  tags: ['!dev', '!autodocs'],
  render: () => (
    <>
      <div data-prova="utente">
        <PaginaSupportoRichiesta richiesta={SCHEDA} caricaScreenshot={carica} />
      </div>
      <div data-prova="admin">
        <PaginaSupportoRichiesta richiesta={SCHEDA} caricaScreenshot={carica} amministratore />
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const utente = canvasElement.querySelector<HTMLElement>('[data-prova="utente"]')!
    const admin = canvasElement.querySelector<HTMLElement>('[data-prova="admin"]')!
    await expect(within(utente).queryByText('Dettagli inviati')).not.toBeInTheDocument()
    await expect(within(admin).getByText('Dettagli inviati')).toBeInTheDocument()
    await expect(within(admin).getByText('/listini/2027')).toBeInTheDocument()
    await waitFor(() =>
      expect(utente.querySelectorAll('[data-slot="galleria-immagini"] button')).toHaveLength(3),
    )
    const autori = utente.querySelectorAll('[data-slot="item"]')
    await expect(autori).toHaveLength(3)
    await expect(autori[0]).toHaveTextContent('Riesco a riprodurlo')
  },
}
