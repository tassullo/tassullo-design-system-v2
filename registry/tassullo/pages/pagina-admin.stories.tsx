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
 * **M4.5 — quinta pagina modello.** Anagrafe (`Admin.tsx`, 212 righe di CSS)
 * e SuperTM condividono la stessa amministrazione a tab.
 *
 * ## Seconda passata (decisione di Francesco): la tabella utenti è del blocco
 *
 * Prima versione di questa story: `SezioneUtenti`/`MenuAzioniUtente`/
 * `RuoliUtente` erano scritti qui, come un tab qualunque passato a `sezioni`.
 * **Corretto**: un utente (nome, email, ruoli multipli, stato) è la stessa
 * forma in ogni app dello studio — lo stesso argomento per cui
 * `tassullo-pagina-scheda` monta sempre `VersionTimeline` per `storico`, non
 * lo lascia libero come `documenti`. Quel codice è quindi migrato dentro
 * `pagina-admin.tsx` (v. il suo commento di testa): questa story passa solo
 * i **dati** e le **callback** — `utenti={{ dati, ruoli, onRimuovi,
 * onCambiaRuoli }}` — e tiene lo `useState` che le rende vere.
 *
 * Resta qui, in `sezioni`, solo **Ruoli**: una tabella statica di sola
 * consultazione (regola 4bis, gradino 1: la primitiva `table` basta, stessa
 * ragione per cui «Attività recenti» di `tassullo-pagina-dashboard` non usa
 * `tassullo-data-table`), perché il suo vocabolario — quali ruoli esistono,
 * cosa fanno — è specifico di questa app, mentre la sua *forma* (poche righe,
 * niente ricerca) non è la stessa forma della tabella utenti.
 *
 * ## Le azioni sono vere
 *
 * «Ruoli…» apre il dialogo con `ToggleGroup multiple` e chiama
 * `onCambiaRuoli`, che scrive davvero sull'utente nello stato della story.
 * «Rimuovi» apre `ConfirmDialog` (controllato, com'è sempre nella tendina di
 * riga: cliccare la voce chiude il menu e smonterebbe un dialogo montato
 * dentro) e alla conferma toglie davvero la riga.
 *
 * ## Il banner degrada, non blocca
 *
 * `soloLettura` (story `SenzaPermessi`) mostra il banner fisso e passa `true`
 * a ogni tab: la tabella Utenti — ora del blocco — perde `menuRiga` (nessuna
 * tendina «⋯», nessun tasto destro) e il tab Ruoli non mostra «Nuovo ruolo»,
 * ma **resta leggibile**: non un vicolo cieco muto.
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
  nome: 'Francesco',
  cognome: 'Sartori',
  email: 'fsartori@covicostruzioni.it',
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
    nome: 'Francesco Sartori',
    email: 'fsartori@covicostruzioni.it',
    ruoli: ['amministratore', 'editor'],
    attivo: true,
  },
  {
    id: '2',
    nome: 'Roberto Zanetti',
    email: 'rzanetti@covicostruzioni.it',
    ruoli: ['editor'],
    attivo: true,
  },
  {
    id: '3',
    nome: 'Michela Bort',
    email: 'mbort@covicostruzioni.it',
    ruoli: ['lettore', 'supervisore'],
    attivo: true,
  },
  {
    id: '4',
    nome: 'Luca Menegatti',
    email: 'lmenegatti@covicostruzioni.it',
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
 * Il caso comune: tab Utenti (del blocco) con menu di riga e azioni vere
 * (Ruoli…, Rimuovi), tab Ruoli come elenco di sola consultazione.
 */
export const ConDati: Story = {
  render: () => <Guscio />,
  // Il grilletto di riga vive dentro il `<tbody>` del tab Utenti, aperto di
  // default (`tuttiITab[0]` in `pagina-admin.tsx`) — stessa nota di
  // `pagina-lista.stories.tsx`/`PaginaProdotti.stories.tsx`.
  play: apriCol('tbody [data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * **Senza il ruolo di amministrazione**: il banner fisso in cima, «Nuovo
 * ruolo» assente, la tabella Utenti senza `menuRiga` — nessuna tendina «⋯»,
 * nessun tasto destro. La pagina resta leggibile: non un vicolo cieco muto,
 * chi la apre può ancora vedere chi ha quale ruolo.
 */
export const SenzaPermessi: Story = {
  render: () => <Guscio soloLettura />,
}

/** `stato="caricamento"`: uno scheletro di tabella, PageHeader già montato. */
export const Caricamento: Story = {
  render: () => <Guscio stato="caricamento" />,
}

/** `stato="errore"`: la chiamata che carica l'amministrazione è fallita. */
export const Errore: Story = {
  render: () => <Guscio stato="errore" />,
}
