import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BookOpenIcon, LifeBuoyIcon, PackageIcon } from 'lucide-react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { RICHIESTE } from '@/prove/supporto-dati'
import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { RichiestaSupporto } from '@/registry/tassullo/blocks/richiesta-supporto'
import type { Richiesta } from '@/registry/tassullo/lib/supporto'
import { PaginaSupporto } from '@/registry/tassullo/pages/pagina-supporto'
import { DropdownMenuItem } from '@/registry/tassullo/ui/dropdown-menu'

/**
 * L'elenco delle richieste di supporto di chi usa l'app: la fascia con
 * «Apri una richiesta» e «Aggiorna», la tabella con titolo, tipo, data,
 * stato e risposte, e sotto i 1024px una scheda per richiesta.
 *
 * **Quando sì, quando no.** È la pagina «Supporto» del canale di supporto,
 * uguale in tutte le app; la scheda di una richiesta è
 * `tassullo-pagina-supporto-richiesta`. Per un elenco qualunque c'è
 * `tassullo-pagina-lista`.
 *
 * **È una pagina d'esempio**: mostra come si compongono i blocchi. Non si
 * installa e non si importa: se ne legge il codice con il comando che segue,
 * o chiedendolo all'MCP, e la si ricompone nell'app, nella cartella delle
 * pagine.
 *
 * ```bash
 * npx shadcn@latest view tassullo/tassullo-design-system-v2/tassullo-pagina-supporto
 * ```
 *
 * **I blocchi che la compongono**, da installare nell'app per nome:
 * `tassullo-page-header`, `tassullo-data-table` coi filtri
 * `tassullo-data-table-filtro-sfaccettato` e
 * `tassullo-data-table-filtro-reset`, `tassullo-empty-state`,
 * `tassullo-error-state`, `tassullo-page-skeleton`, `use-soglia`, e `supporto`
 * per i tipi, i nomi e i toni degli stati. Il dialogo che «Apri una
 * richiesta» apre è `tassullo-richiesta-supporto`, montato una volta nel
 * guscio.
 *
 * **Com'è fatto l'esempio: le prop.**
 *
 * - `richieste`: le righe, dalla più recente, coi campi del tipo
 *   `Richiesta` di `supporto`.
 * - `stato`: `"pronto"`, il predefinito, `"caricamento"` o `"errore"`, con
 *   `messaggioErrore` e `onRiprovaErrore`.
 * - `onApriRichiesta` apre il dialogo; `onAggiorna` rilegge l'elenco, e
 *   `aggiornamentoInCorso` spegne «Aggiorna» nel frattempo.
 * - `collegamento(richiesta)`: l'elemento che rende il titolo come
 *   collegamento alla scheda, di solito il `Link` del router. La pagina gli
 *   aggiunge il testo e le classi.
 * - `percorso`, di serie «Supporto»; `faccia`, come in
 *   `tassullo-pagina-lista`.
 *
 * **Regole d'uso.**
 *
 * - Il titolo è il solo collegamento della riga, ed è la colonna elastica:
 *   prende lo spazio che avanza, mai sotto i 240px.
 * - Lo stato ha il suo tono: Ricevuta neutro, Aperta azzurro, In
 *   lavorazione giallo, Chiusa verde. «Ricevuta» vuol dire che la richiesta
 *   è registrata ma non è ancora arrivata a chi la gestisce.
 * - Le risposte da leggere si contano accanto al totale, «2 nuove». Lo
 *   stesso numero, sommato su tutte le richieste, va nel `badge` della voce
 *   «Supporto» del guscio, come nelle scene.
 * - Senza richieste, al posto della tabella c'è l'invito ad aprirne una.
 *
 * **Tastiera e accessibilità.** I titoli sono collegamenti e si
 * raggiungono col `Tab`; ricerca, filtri e intestazioni sono quelli di
 * `tassullo-data-table`. Sulle schede il collegamento è il titolo.
 */
const meta = {
  title: 'Pagine/Supporto',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const UTENTE = { nome: 'Stefano', cognome: 'Bertolini', email: 'sbertolini@esempio.it', ruolo: 'Editor' }

const nuove = (righe: Richiesta[]) => righe.reduce((somma, r) => somma + r.non_lette, 0)

function sezioni(nonLette: number): SezioneNav[] {
  return [
    {
      voci: [
        { titolo: 'Prodotti', icona: PackageIcon, href: '#' },
        { titolo: 'Riferimenti', icona: BookOpenIcon, href: '#' },
      ],
    },
    {
      className: 'mt-auto',
      voci: [
        {
          titolo: 'Supporto',
          icona: LifeBuoyIcon,
          href: '#',
          attiva: true,
          // Le risposte non lette, su tutte le richieste.
          badge: nonLette > 0 ? nonLette : undefined,
        },
      ],
    },
  ]
}

function Guscio({
  richieste,
  stato,
  faccia,
}: {
  richieste: Richiesta[]
  stato?: 'pronto' | 'caricamento' | 'errore'
  faccia?: 'auto' | 'tabella' | 'schede'
}) {
  const [aperto, setAperto] = useState(false)
  const [rilegge, setRilegge] = useState(false)
  return (
    <AppShell
      applicazione="Anagrafe"
      collassa="icona"
      contenuto="riempie"
      utente={UTENTE}
      sezioni={sezioni(nuove(richieste))}
      azioniUtente={<DropdownMenuItem onClick={() => setAperto(true)}>Apri una richiesta</DropdownMenuItem>}
    >
      <PaginaSupporto
        richieste={richieste}
        stato={stato}
        faccia={faccia}
        onApriRichiesta={() => setAperto(true)}
        onAggiorna={() => {
          setRilegge(true)
          setTimeout(() => setRilegge(false), 800)
        }}
        aggiornamentoInCorso={rilegge}
        collegamento={(r) => <a href={`#richiesta-${r.id}`} />}
        onRiprovaErrore={() => {}}
      />
      <RichiestaSupporto aperto={aperto} onApertoChange={setAperto} onInvia={async () => {}} />
    </AppShell>
  )
}

/**
 * Otto richieste nella tabella, e sulla voce «Supporto» il conto delle
 * risposte da leggere. La scena passa `faccia="tabella"`.
 */
export const Elenco: Story = {
  render: () => <Guscio richieste={RICHIESTE} faccia="tabella" />,
}

/** Sotto i 1024px: una scheda per richiesta. La scena passa `faccia="schede"`. */
export const Schede: Story = {
  globals: { viewport: { value: 'telefono', isRotated: false } },
  render: () => <Guscio richieste={RICHIESTE} faccia="schede" />,
}

/**
 * `faccia="auto"`: la tabella da 1024px di finestra, le schede sotto. Si
 * vede aprendo la scena da sola e stringendo la finestra.
 */
export const SogliaDellaPagina: Story = {
  name: 'Soglia della pagina',
  render: () => <Guscio richieste={RICHIESTE} />,
}

/** Nessuna richiesta ancora: l'invito ad aprirne una. */
export const NessunaRichiesta: Story = {
  name: 'Nessuna richiesta',
  render: () => <Guscio richieste={[]} />,
}

/** `stato="caricamento"`. */
export const Caricamento: Story = {
  render: () => <Guscio richieste={[]} stato="caricamento" />,
}

/** `stato="errore"`: l'elenco non si è caricato. */
export const Errore: Story = {
  render: () => <Guscio richieste={[]} stato="errore" />,
}

// Scena di misura: la voce «Supporto» porta il conto delle risposte da
// leggere (3); i titoli sono collegamenti; «Apri una richiesta» nella fascia
// apre il dialogo, ed `Esc` lo chiude. `!dev` la toglie dalla barra e da
// Docs; il gate la esegue.
export const Prova: Story = {
  name: 'Prova',
  tags: ['!dev', '!autodocs'],
  render: () => <Guscio richieste={RICHIESTE} faccia="tabella" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-sidebar="menu-badge"]')).toHaveTextContent('3'),
    )
    await expect(c.getByRole('link', { name: /Il listino 2027 non si salva/ })).toHaveAttribute(
      'href',
      '#richiesta-41',
    )
    await expect(c.getByText('2 nuove')).toBeInTheDocument()
    await userEvent.click(c.getByRole('button', { name: 'Apri una richiesta' }))
    const corpo = within(document.body)
    await waitFor(() => expect(corpo.getByLabelText('Titolo')).toBeInTheDocument())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(corpo.queryByLabelText('Titolo')).not.toBeInTheDocument())
  },
}
