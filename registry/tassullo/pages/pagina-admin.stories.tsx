import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlusIcon, ShieldIcon } from 'lucide-react'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import { apriCol } from '@/prove/apri'
import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { PaginaAdmin, type RuoloAssegnabile, type UtenteAdmin } from '@/registry/tassullo/pages/pagina-admin'
import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import { Toaster } from '@/registry/tassullo/ui/sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/tassullo/ui/table'

// La chiamata all'app, da osservare nelle prove.
type ArgsAdmin = { onCambiaStato?: (id: string, attivo: boolean) => void }

/**
 * La pagina di amministrazione: una fila di schede per le sezioni, e in
 * testa la gestione degli utenti con i loro ruoli. Chi non ha il ruolo di
 * amministrazione la vede lo stesso, in sola lettura.
 *
 * **Quando sì, quando no.** Per l'amministrazione di un applicativo: chi
 * entra e con quali ruoli, più le sezioni proprie dell'app. Un elenco di
 * dati qualunque è `tassullo-pagina-lista`.
 *
 * **È una pagina d'esempio**: mostra come si compongono i blocchi. Non si
 * installa e non si importa: se ne legge il codice con il comando che segue,
 * o chiedendolo all'MCP, e la si ricompone nell'app, nella cartella delle
 * pagine.
 *
 * ```bash
 * npx shadcn@latest view tassullo/tassullo-design-system-v2/tassullo-pagina-admin
 * ```
 *
 * **I blocchi che la compongono**, da installare nell'app per nome:
 * `tassullo-page-header`, `tabs`, `tassullo-data-table` per la tabella degli
 * utenti, `tassullo-responsive-dialog` con `toggle-group` per cambiare i
 * ruoli, `tassullo-toast-con-annullo` per disattivare un utente con
 * l'annullo, `badge` e `toni` per i ruoli, `alert` per l'avviso di sola lettura, `tassullo-page-skeleton`
 * e `tassullo-error-state` per gli stati.
 *
 * **Le prop.**
 *
 * - `percorso` e `azioni` passano a `tassullo-page-header`.
 * - `utenti`: la gestione degli utenti, montata come prima scheda. Porta
 *   `dati` (ogni utente ha `id`, `nome`, `email`, `ruoli` — più di uno — e
 *   `attivo`), `ruoli` (quelli assegnabili: `valore`, `etichetta` e un
 *   `tono` facoltativo), e le due chiamate `onCambiaRuoli(id, ruoli)` e
 *   `onCambiaStato(id, attivo)`. `titolo` e `cerca` cambiano l'etichetta
 *   della scheda e il testo della ricerca, di serie «Cerca nome, email o
 *   ruolo…». Assente, la scheda utenti non c'è.
 * - `sezioni`: le altre schede, dopo quella degli utenti. Ognuna ha `value`,
 *   `titolo`, `icona` facoltativa e `contenuto`, una funzione che riceve
 *   `soloLettura`.
 * - `sezioneIniziale`: la scheda aperta all'avvio. Assente, quella degli
 *   utenti, o la prima delle `sezioni`.
 * - `soloLettura` e `messaggioSoloLettura`: la pagina per chi non ha il
 *   ruolo di amministrazione.
 * - `stato`: `"pronto"`, `"caricamento"` o `"errore"`, con
 *   `messaggioErrore` e `onRiprovaErrore`.
 *
 * **Regole d'uso.**
 *
 * - La tabella degli utenti è del blocco, perché un utente ha la stessa
 *   forma in ogni app. Le altre sezioni sono dell'app, perché il loro
 *   contenuto cambia da un'app all'altra.
 * - I dati li tiene l'app. Il blocco chiama `onCambiaRuoli` al «Salva» del
 *   dialogo, con l'elenco intero dei ruoli, e `onCambiaStato`: subito per
 *   «Riattiva», alla chiusura dell'avviso per «Disattiva»; cosa scrivere sul
 *   server lo decide l'app.
 * - «Disattiva» non chiede conferma: la riga dice subito «Disattivato», e
 *   l'avviso offre «Annulla» per 5 secondi. Se si annulla, o si sceglie
 *   «Riattiva» prima che l'avviso si chiuda, l'app non riceve niente. Un
 *   utente non si cancella: si disattiva, e i suoi ruoli restano.
 * - L'app monta `<Toaster />`, una volta sola in cima: senza, l'avviso non
 *   compare e la disattivazione non parte.
 * - La ricerca trova nome, email e ruoli, con le parole che la tabella
 *   mostra. Il numero degli utenti sta nel piè della tabella, e segue la
 *   ricerca.
 * - Ogni ruolo ha la sua `etichetta` in italiano: senza, la tabella
 *   mostrerebbe la chiave grezza.
 * - Con `soloLettura` la pagina resta leggibile: l'avviso in cima, la
 *   tabella degli utenti senza menu di riga, e ogni sezione riceve `true` e
 *   decide da sé cosa togliere. Le `azioni` il blocco non le filtra: chi non
 *   amministra non deve riceverle.
 *
 * **Tastiera e accessibilità.** Le schede si scorrono con le frecce, come
 * in `tabs`. Sulla tabella degli utenti il menu di riga si apre dalla
 * tendina «⋯» o col tasto destro; il dialogo dei ruoli tiene il fuoco al suo
 * interno finché è aperto. `Alt`+`T` porta il fuoco sull'avviso, e da lì
 * `Tab` raggiunge «Annulla».
 */
const meta = {
  title: 'Pagine/Admin',
  parameters: { layout: 'fullscreen' },
} satisfies Meta<ArgsAdmin>

export default meta
type Story = StoryObj<Meta<ArgsAdmin>>

const SEZIONI_NAV: SezioneNav[] = [
  {
    voci: [
      { titolo: 'Amministrazione', icona: ShieldIcon, attiva: true, href: '#' },
    ],
  },
]

const UTENTE_CORRENTE = {
  nome: 'Stefano',
  cognome: 'Bertolini',
  email: 'sbertolini@esempio.it',
  ruolo: 'Admin',
}

/* ────────────────────────────────────────────────────────────────────────
 * I dati finti — dominio Anagrafe: utenti, ruoli.
 * ──────────────────────────────────────────────────────────────────────── */

const RUOLI: RuoloAssegnabile[] = [
  { valore: 'amministratore', etichetta: 'Amministratore', tono: 'destructive' },
  { valore: 'editor', etichetta: 'Editor', tono: 'info' },
  { valore: 'supervisore', etichetta: 'Supervisore', tono: 'warning' },
  { valore: 'lettore', etichetta: 'Lettore' },
]

const UTENTI_INIZIALI: UtenteAdmin[] = [
  {
    id: '1',
    nome: 'Stefano Bertolini',
    email: 'sbertolini@esempio.it',
    ruoli: ['amministratore', 'editor'],
    attivo: true,
  },
  {
    id: '2',
    nome: 'Giorgio Pedrotti',
    email: 'gpedrotti@esempio.it',
    ruoli: ['editor'],
    attivo: true,
  },
  {
    id: '3',
    nome: 'Elisa Fontana',
    email: 'efontana@esempio.it',
    ruoli: ['lettore', 'supervisore'],
    attivo: true,
  },
  {
    id: '4',
    nome: 'Davide Tomasi',
    email: 'dtomasi@esempio.it',
    ruoli: ['lettore'],
    attivo: false,
  },
]

const RUOLI_DEFINITI: { ruolo: RuoloAssegnabile; descrizione: string }[] = [
  { ruolo: RUOLI[0]!, descrizione: 'Accesso completo, incluse le pagine di amministrazione.' },
  { ruolo: RUOLI[1]!, descrizione: 'Crea e modifica prodotti, famiglie e norme.' },
  { ruolo: RUOLI[2]!, descrizione: 'Approva le revisioni e pubblica le schede.' },
  { ruolo: RUOLI[3]!, descrizione: 'Sola consultazione, nessuna modifica.' },
]

/**
 * La sezione Ruoli: un elenco corto e già dato, senza ricerca né
 * paginazione — la stessa ragione per cui `tassullo-pagina-dashboard` usa la
 * primitiva `table` per «Attività recenti» invece di `tassullo-data-table`
 * (regola 4bis, gradino 1: il default shadcn così com'è basta). A differenza
 * della tabella utenti, il blocco non la possiede: il suo vocabolario è di
 * questa app.
 */
function SezioneRuoli({ utenti, soloLettura }: { utenti: UtenteAdmin[]; soloLettura: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{RUOLI_DEFINITI.length} ruoli</p>
        {!soloLettura ? (
          <Button size="sm" variant="outline">
            <PlusIcon />
            Nuovo ruolo
          </Button>
        ) : null}
      </div>
      {/* Stessa cornice di `tassullo-data-table`: la primitiva `table` non
          ne porta nessuna, e senza una tabella Tassullo non si riconosce. */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ruolo</TableHead>
              <TableHead>Descrizione</TableHead>
              {/* Contato sul vivo (`utenti`, lo stato della story), non sui dati
                  iniziali — «Ruoli…» nel tab Utenti lo cambia
                  davvero, e questo conto deve muoversi con loro. */}
              <TableHead className="text-right">Utenti</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RUOLI_DEFINITI.map(({ ruolo, descrizione }) => (
              <TableRow key={ruolo.valore}>
                <TableCell>
                  <Badge className={TONO[ruolo.tono ?? 'neutro']}>{ruolo.etichetta}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{descrizione}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {utenti.filter((u) => u.ruoli.includes(ruolo.valore)).length}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function Guscio({
  soloLettura,
  stato,
  onCambiaStato,
}: {
  soloLettura?: boolean
  stato?: 'pronto' | 'caricamento' | 'errore'
  onCambiaStato?: (id: string, attivo: boolean) => void
}) {
  const [utenti, setUtenti] = useState(UTENTI_INIZIALI)

  return (
    <AppShell applicazione="Anagrafe" collassa="icona" utente={UTENTE_CORRENTE} sezioni={SEZIONI_NAV}>
      <PaginaAdmin
        percorso={[{ titolo: 'Amministrazione' }]}
        azioni={soloLettura ? undefined : []}
        utenti={{
          dati: utenti,
          ruoli: RUOLI,
          onCambiaStato: (id, attivo) => {
            onCambiaStato?.(id, attivo)
            setUtenti((righe) => righe.map((r) => (r.id === id ? { ...r, attivo } : r)))
          },
          onCambiaRuoli: (id, ruoli) =>
            setUtenti((righe) => righe.map((r) => (r.id === id ? { ...r, ruoli } : r))),
        }}
        sezioni={[
          {
            value: 'ruoli',
            titolo: 'Ruoli',
            icona: ShieldIcon,
            contenuto: (soloLetturaTab) => <SezioneRuoli utenti={utenti} soloLettura={soloLetturaTab} />,
          },
        ]}
        soloLettura={soloLettura}
        stato={stato}
      />
      <Toaster />
    </AppShell>
  )
}

/**
 * Il caso comune: la scheda Utenti con il menu di riga — «Ruoli…» apre il
 * dialogo dei ruoli, «Disattiva» disattiva l'utente subito e offre «Annulla»
 * nell'avviso, «Riattiva» lo riattiva — e la scheda Ruoli, un elenco da
 * consultare. La ricerca trova anche i ruoli, e il numero degli utenti sta
 * nel piè della tabella.
 */
export const ConDati: Story = {
  render: (args) => <Guscio onCambiaStato={args.onCambiaStato} />,
  // Il grilletto di riga vive dentro il `<tbody>` del tab Utenti, aperto di
  // default (`tuttiITab[0]` in `pagina-admin.tsx`) — stessa nota di
  // `pagina-lista.stories.tsx`/`PaginaProdotti.stories.tsx`.
  play: apriCol('tbody [data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * `soloLettura`: l'avviso fisso in cima, niente «Nuovo ruolo», la tabella
 * degli utenti senza menu di riga. La pagina resta leggibile: si vede
 * ancora chi ha quale ruolo.
 */
export const SenzaPermessi: Story = {
  render: () => <Guscio soloLettura />,
}

/*
 * Le prove della tabella degli utenti, sulla stessa resa di «Con Dati». Alla
 * fine di ognuna la ricerca torna vuota e la tabella com'era, perché la
 * scansione guardi la scena a riposo.
 */
const ricerca = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLInputElement>('input[type="search"]')!

const righeUtenti = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll('tbody tr')].filter((r) => r.textContent?.includes('@esempio.it'))

// Cercando «zzz» non resta nessun utente: il numero degli utenti deve
// comparire una volta sola, nel piè della tabella, e seguire la ricerca.
async function provaUnConteggio({ canvasElement }: { canvasElement: HTMLElement }) {
  await waitFor(() => expect(ricerca(canvasElement)).toBeTruthy())
  try {
    await userEvent.type(ricerca(canvasElement), 'zzz')
    await waitFor(() => expect(righeUtenti(canvasElement)).toHaveLength(0))
    const conteggi = [...canvasElement.querySelectorAll('p')]
      .map((p) => p.textContent?.trim() ?? '')
      .filter((t) => /^\d+ utent[ei]$/.test(t))
    expect(conteggi).toEqual(['0 utenti'])
  } finally {
    await userEvent.clear(ricerca(canvasElement))
  }
}

// La ricerca guarda anche i ruoli, con le parole che la tabella mostra:
// «editor» trova i due utenti che hanno il ruolo Editor.
async function provaRicercaRuoli({ canvasElement }: { canvasElement: HTMLElement }) {
  await waitFor(() => expect(ricerca(canvasElement)).toBeTruthy())
  try {
    await userEvent.type(ricerca(canvasElement), 'editor')
    await waitFor(() => expect(`righe ${righeUtenti(canvasElement).length}`).toBe('righe 2'))
  } finally {
    await userEvent.clear(ricerca(canvasElement))
  }
}

// «Disattiva» dal menu della riga: la riga dice subito «Disattivato» e
// l'avviso offre «Annulla»; annullando, la riga torna «Attivo» e la chiamata
// all'app non parte.
async function provaDisattivaConAnnullo({
  canvasElement,
  args,
}: {
  canvasElement: HTMLElement
  args: { onCambiaStato?: (id: string, attivo: boolean) => void }
}) {
  const riga = () =>
    righeUtenti(canvasElement).find((r) => r.textContent?.includes('Giorgio Pedrotti')) as HTMLElement
  await waitFor(() => expect(riga()).toBeTruthy())
  await userEvent.click(within(riga()).getByRole('button', { name: 'Azioni su Giorgio Pedrotti' }))
  await userEvent.click(await screen.findByRole('menuitem', { name: 'Disattiva' }))
  await waitFor(() => expect(within(riga()).getByText('Disattivato')).toBeVisible())
  const annulla = await screen.findByRole('button', { name: 'Annulla' })
  await userEvent.click(annulla)
  await waitFor(() => expect(within(riga()).getByText('Attivo')).toBeVisible())
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Annulla' })).toBeNull())
  expect(args.onCambiaStato).not.toHaveBeenCalled()
}

// Scene di misura di «Con Dati»: la stessa resa, con le prove. `!dev` le
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo; il
// controllo automatico le esegue lo stesso.
export const ConDatiConteggioProva: Story = {
  ...ConDati,
  name: 'Con Dati, un conteggio, prova',
  tags: ['!dev', '!autodocs'],
  play: provaUnConteggio,
}

export const ConDatiRicercaRuoliProva: Story = {
  ...ConDati,
  name: 'Con Dati, ricerca sui ruoli, prova',
  tags: ['!dev', '!autodocs'],
  play: provaRicercaRuoli,
}

export const ConDatiDisattivaProva: Story = {
  ...ConDati,
  name: 'Con Dati, disattiva e annulla, prova',
  tags: ['!dev', '!autodocs'],
  args: { onCambiaStato: fn() },
  play: provaDisattivaConAnnullo,
}

/** `stato="caricamento"`: lo scheletro di una tabella, con la fascia già montata. */
export const Caricamento: Story = {
  render: () => <Guscio stato="caricamento" />,
}

/** `stato="errore"`: la chiamata che carica l'amministrazione è fallita. */
export const Errore: Story = {
  render: () => <Guscio stato="errore" />,
}
