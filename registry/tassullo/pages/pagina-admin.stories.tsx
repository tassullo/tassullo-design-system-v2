import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlusIcon, ShieldIcon } from 'lucide-react'

import { apriCol } from '@/prove/apri'
import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { PaginaAdmin, type RuoloAssegnabile, type UtenteAdmin } from '@/registry/tassullo/pages/pagina-admin'
import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/tassullo/ui/table'

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
 * ruoli, `tassullo-confirm-dialog` per togliere un utente, `badge` e `toni`
 * per i ruoli, `alert` per l'avviso di sola lettura, `tassullo-page-skeleton`
 * e `tassullo-error-state` per gli stati.
 *
 * **Le prop.**
 *
 * - `percorso` e `azioni` passano a `tassullo-page-header`.
 * - `utenti`: la gestione degli utenti, montata come prima scheda. Porta
 *   `dati` (ogni utente ha `id`, `nome`, `email`, `ruoli` — più di uno — e
 *   `attivo`), `ruoli` (quelli assegnabili: `valore`, `etichetta` e un
 *   `tono` facoltativo), e le due chiamate `onCambiaRuoli(id, ruoli)` e
 *   `onRimuovi(id)`. `titolo` e `cerca` cambiano l'etichetta della scheda e
 *   il testo della ricerca. Assente, la scheda utenti non c'è.
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
 *   dialogo, con l'elenco intero dei ruoli, e `onRimuovi` dopo la conferma;
 *   cosa scrivere sul server lo decide l'app.
 * - Ogni ruolo ha la sua `etichetta` in italiano: senza, la tabella
 *   mostrerebbe la chiave grezza.
 * - Con `soloLettura` la pagina resta leggibile: l'avviso in cima, la
 *   tabella degli utenti senza menu di riga, e ogni sezione riceve `true` e
 *   decide da sé cosa togliere. Le `azioni` il blocco non le filtra: chi non
 *   amministra non deve riceverle.
 *
 * **Tastiera e accessibilità.** Le schede si scorrono con le frecce, come
 * in `tabs`. Sulla tabella degli utenti il menu di riga si apre dalla
 * tendina «⋯» o col tasto destro; i due dialoghi tengono il fuoco al loro
 * interno finché sono aperti.
 */
const meta = {
  title: 'Pagine/Admin',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

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
                  iniziali — «Ruoli…» e «Rimuovi» nel tab Utenti lo cambiano
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
}: {
  soloLettura?: boolean
  stato?: 'pronto' | 'caricamento' | 'errore'
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
          onRimuovi: (id) => setUtenti((righe) => righe.filter((r) => r.id !== id)),
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
    </AppShell>
  )
}

/**
 * Il caso comune: la scheda Utenti con il menu di riga — «Ruoli…» apre il
 * dialogo dei ruoli, «Rimuovi» chiede conferma, e tutte e due cambiano
 * davvero la tabella — e la scheda Ruoli, un elenco da consultare.
 */
export const ConDati: Story = {
  render: () => <Guscio />,
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

/** `stato="caricamento"`: lo scheletro di una tabella, con la fascia già montata. */
export const Caricamento: Story = {
  render: () => <Guscio stato="caricamento" />,
}

/** `stato="errore"`: la chiamata che carica l'amministrazione è fallita. */
export const Errore: Story = {
  render: () => <Guscio stato="errore" />,
}
