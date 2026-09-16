import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BookOpenIcon,
  BoxesIcon,
  FolderTreeIcon,
  LogOutIcon,
  PackagePlusIcon,
  PlusIcon,
  RefreshCwIcon,
  SendIcon,
  SettingsIcon,
  ShieldIcon,
  UserIcon,
} from 'lucide-react'

import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { DataTable, IntestazioneColonna, creaColonne } from '@/registry/tassullo/blocks/data-table'
import { EmptyState } from '@/registry/tassullo/blocks/empty-state'
import { PageHeader, type AzionePagina } from '@/registry/tassullo/blocks/page-header'
import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/registry/tassullo/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'

/**
 * **M3.10 — gate di fase.** La pagina Prodotti di Anagrafe
 * (`frontend/src/pages/Prodotti.tsx` + `Prodotti.css`, letti in sola lettura)
 * ricostruita con **soli blocchi Tassullo** — `tassullo-app-shell` +
 * `tassullo-page-header` + `tassullo-data-table` + `tassullo-empty-state` —
 * **zero CSS di pagina**: nessuna classe `prd-*`, nessun valore arbitrario,
 * niente fuori dai token del tema.
 *
 * ## Cosa cambia rispetto all'originale, e perché è equivalente
 *
 * - **Il titolo `<h1>`** (`prd-titolo`) sparisce dallo schermo: è la forma di
 *   `tassullo-page-header` (M3.2), che lo tiene solo in `sr-only` — comparirebbe
 *   tre volte in 80px insieme alla voce di sidebar attiva e al percorso. Zero
 *   perdita d'informazione, solo di pixel ripetuti.
 * - **I filtri famiglia/tipo/stato** (`prd-filtri`, tre `<select className="input">`
 *   a mano) diventano tre `Select` del tema, passati nella barra del blocco
 *   `DataTable` — stesso posto, stessa fila, componente del design system invece
 *   che uno stile di pagina.
 * - **Il contatore** (`prd-conta`) è la riga «N prodotti» che `DataTable` scrive
 *   già da sé (`nomeRighe`, M3.10 coda): non va ridichiarato.
 * - **La divisione in pagine (`Prodotti.tsx` non ne aveva, l'API restituisce
 *   tutto in un colpo) diventa `perPagina="infinito"`**: la stessa lista,
 *   la stessa mole di dati di `anagrafe.tassullo.it` in produzione, con la
 *   correzione al solo difetto noto di quell'implementazione — qui la testata
 *   resta `sticky` mentre il **contenitore** scorre, non la pagina intera, e
 *   non si perde mai il nome delle colonne (M3.10, coda).
 * - **Lo stato vuoto per filtro** (`prd-vuoto`, un `<p>`) e quello per «non
 *   esiste ancora niente» erano lo stesso paragrafo nell'originale. Il blocco li
 *   distingue: il primo lo rende `DataTable` internamente (ricerca senza esito,
 *   col bottone che pulisce i filtri); il secondo — *nessun prodotto è mai
 *   stato creato* — è `EmptyState` (story `SenzaProdotti`), con la CTA che porta
 *   a crearne il primo. `INTERFACCE.md` §1.1 li vuole distinti, e i due stati
 *   del v1 li confondevano.
 * - **Le due modali** (`prd-modale-sfondo`/`prd-modale`, CSS di pagina scritto a
 *   mano) restano **fuori da questo gate**: sono `responsive-dialog` +
 *   `form-field` (M3.4), già nel registry — comporle qui avrebbe raddoppiato la
 *   story senza aggiungere niente alla domanda che il gate fa, cioè se
 *   `app-shell` + `page-header` + `data-table` + `empty-state` bastano per
 *   l'**elenco**. I due bottoni di testata restano, come dati della vetrina —
 *   sono azioni di Anagrafe, non del design system.
 * - **Le colonne** sono le stesse sette dell'originale (Nome, Variante, Tipo,
 *   Famiglia, Codice interno, BC, Stato), coi due badge — Tipo neutro, Stato
 *   con tono — al posto delle classi `badge`/`badge-success`/`badge-warn`
 *   scritte a mano.
 *
 * Confronto a schermata in `WORKLOG.md`, voce M3.10.
 */
const meta = {
  title: 'Pagine/Prodotti (Anagrafe)',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/* ────────────────────────────────────────────────────────────────────────
 * Il guscio: le quattro sezioni di Anagrafe come gruppi con icona e
 * sottomenu — la forma di `sidebar-07` già dimostrata in
 * `Primitive/Sidebar` (story `ConGruppi`): un `VoceNav` con `figli` è un
 * `Collapsible` che si apre da sé, non una sezione a parte. `attiva` sale dal
 * figlio al genitore — «Prodotti» apre ed evidenzia «Qualifica» — così il
 * gruppo che contiene la pagina corrente non si scopre solo aprendolo a mano.
 * ──────────────────────────────────────────────────────────────────────── */

const SEZIONI: SezioneNav[] = [
  {
    voci: [
      {
        titolo: 'Riferimenti',
        icona: BookOpenIcon,
        figli: [
          { titolo: 'Norme', href: '#' },
          { titolo: 'Caratteristiche', href: '#' },
          { titolo: 'Organismi notificati', href: '#' },
        ],
      },
      {
        titolo: 'Qualifica',
        icona: BoxesIcon,
        attiva: true,
        figli: [
          { titolo: 'Materie prime', href: '#' },
          { titolo: 'Prodotti', href: '#', attiva: true },
          { titolo: 'Kit', href: '#' },
        ],
      },
      {
        titolo: 'Classificazione',
        icona: FolderTreeIcon,
        figli: [
          { titolo: 'Famiglie TDS', href: '#' },
          { titolo: 'Famiglie EPD', disabilitata: true },
          { titolo: 'Sistemi', href: '#' },
        ],
      },
      {
        titolo: 'Distribuzione',
        icona: SendIcon,
        figli: [
          { titolo: 'Change set', href: '#' },
          { titolo: 'Traduzioni', href: '#' },
          { titolo: 'Pubblicazioni', href: '#' },
        ],
      },
    ],
  },
  {
    voci: [{ titolo: 'Admin', icona: ShieldIcon, href: '#' }],
    className: 'mt-auto',
  },
]

const UTENTE = {
  nome: 'Francesco',
  cognome: 'Sartori',
  email: 'fsartori@covicostruzioni.it',
  ruolo: 'Admin',
}

const AZIONI_UTENTE = (
  <>
    <DropdownMenuGroup>
      <DropdownMenuItem>
        <UserIcon />
        Profilo
      </DropdownMenuItem>
      <DropdownMenuItem>
        <SettingsIcon />
        Impostazioni
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>
        <LogOutIcon />
        Esci
      </DropdownMenuItem>
    </DropdownMenuGroup>
  </>
)

/* ────────────────────────────────────────────────────────────────────────
 * I dati finti — stessa forma dell'API di Anagrafe (`Prodotto`, `Famiglia`),
 * generati con un LCG a seme fisso: la pagina non cambia a ogni ricarica.
 * ──────────────────────────────────────────────────────────────────────── */

type Tipo = 'prodotto' | 'materia_prima' | 'sistema'

type Prodotto = {
  id: number
  famiglia: string
  nome: string
  variante: string | null
  codiceInterno: string | null
  tipo: Tipo
  bcSystemCode: string | null
  attivo: boolean
}

const LABEL_TIPO: Record<Tipo, string> = {
  prodotto: 'Prodotto',
  materia_prima: 'Materia prima',
  sistema: 'Kit',
}

const FAMIGLIE = [
  'Intonaci deumidificanti',
  'Malte da muratura',
  'Massetti',
  'Rasanti',
  'Finiture ai silicati',
  'Adesivi cementizi',
]

const RADICI = ['Calce', 'Tassullo', 'Dolomia', 'Rinzaffo', 'Termo', 'Idro', 'Bio']
const VARIANTI = ['', '', 'M15', 'Bianco', 'Rapido', 'Fine']

function seminato(seme: number) {
  let s = seme
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function generaProdotti(quanti: number): Prodotto[] {
  const caso = seminato(20260915)
  const scegli = <T,>(v: T[]): T => v[Math.floor(caso() * v.length)]

  return Array.from({ length: quanti }, (_, i) => {
    const tipo: Tipo = caso() < 0.15 ? 'sistema' : caso() < 0.6 ? 'prodotto' : 'materia_prima'
    const famiglia = scegli(FAMIGLIE)
    const variante = tipo === 'materia_prima' ? '' : scegli(VARIANTI)
    const prefisso = tipo === 'materia_prima' ? 'IF' : 'PF'
    return {
      id: i + 1,
      famiglia,
      nome: `${scegli(RADICI)} ${famiglia.split(' ')[0]}`,
      variante: variante || null,
      codiceInterno: `${prefisso}${100 + i}${variante ? `-${variante}` : ''}`,
      tipo,
      bcSystemCode: tipo === 'sistema' ? `SYS-${1000 + i}` : null,
      attivo: caso() > 0.12,
    }
  })
}

// 220, non 37: sopra il passo di caricamento di `perPagina="infinito"` (40),
// così lo scorrimento si vede davvero fare qualcosa — con meno righe di un
// passo solo, tutto entrerebbe al primo caricamento e la story non
// proverebbe niente.
const PRODOTTI = generaProdotti(220)

/* ────────────────────────────────────────────────────────────────────────
 * Le colonne — le stesse sette dell'originale
 * ──────────────────────────────────────────────────────────────────────── */

const col = creaColonne<Prodotto>()

const COLONNE = col.columns([
  col.accessor('nome', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Nome" />,
    meta: { titolo: 'Nome', larghezza: 'w-48' },
    sortFn: 'text',
    // Sidebar > lista > scheda: il nome è il varco alla scheda di prodotto —
    // `variant="link"` e non un colore a mano, per la stessa ragione di
    // `text-accent-ink` nel resto del tema (`--primary` non è mai testo).
    // Senza una pagina scheda da aprire in Storybook resta un `#`: qui conta
    // la forma, non la destinazione — è la FASE 4 a costruire la pagina vera.
    cell: ({ getValue }) => (
      <Button variant="link" size="sm" className="h-auto p-0 font-medium" render={<a href="#" />}>
        {getValue<string>()}
      </Button>
    ),
  }),
  col.accessor('variante', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Variante" />,
    meta: { titolo: 'Variante', larghezza: 'w-24' },
    sortFn: 'text',
    cell: ({ getValue }) => getValue<string | null>() ?? '—',
  }),
  col.accessor('tipo', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Tipo" />,
    meta: { titolo: 'Tipo', larghezza: 'w-32' },
    sortFn: 'text',
    cell: ({ getValue }) => <Badge variant="secondary">{LABEL_TIPO[getValue<Tipo>()]}</Badge>,
  }),
  col.accessor('famiglia', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Famiglia" />,
    meta: { titolo: 'Famiglia' },
    sortFn: 'text',
  }),
  col.accessor('codiceInterno', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Codice interno" />,
    meta: { titolo: 'Codice interno', larghezza: 'w-36' },
    sortFn: 'alphanumeric',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue<string | null>() ?? '—'}</span>
    ),
  }),
  col.accessor('bcSystemCode', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="BC" />,
    meta: { titolo: 'BC', larghezza: 'w-28' },
    sortFn: 'alphanumeric',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue<string | null>() ?? '—'}</span>
    ),
  }),
  col.accessor('attivo', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Stato" />,
    meta: { titolo: 'Stato', larghezza: 'w-24' },
    sortFn: 'basic',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge className={TONO.success}>Attivo</Badge>
      ) : (
        <Badge className={TONO.warning}>Disattivo</Badge>
      ),
  }),
])

const AZIONI_DI_PAGINA: AzionePagina[] = [
  { titolo: 'Sistema da BC', icona: RefreshCwIcon, ruolo: 'secondaria' },
  { titolo: 'Nuovo prodotto', icona: PlusIcon, ruolo: 'primaria' },
]

/* ────────────────────────────────────────────────────────────────────────
 * I filtri — famiglia / tipo / stato, nella barra del blocco
 * ──────────────────────────────────────────────────────────────────────── */

function BarraFiltri({
  famiglia,
  setFamiglia,
  tipo,
  setTipo,
  stato,
  setStato,
}: {
  famiglia: string
  setFamiglia: (v: string) => void
  tipo: string
  setTipo: (v: string) => void
  stato: string
  setStato: (v: string) => void
}) {
  return (
    <>
      <Select
        value={famiglia}
        onValueChange={setFamiglia}
        items={[{ value: 'tutte', label: 'Tutte le famiglie' }, ...FAMIGLIE.map((f) => ({ value: f, label: f }))]}
      >
        <SelectTrigger size="sm" aria-label="Famiglia" className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="tutte">Tutte le famiglie</SelectItem>
            {FAMIGLIE.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={tipo}
        onValueChange={setTipo}
        items={[
          { value: 'tutti', label: 'Tutti i tipi' },
          ...Object.entries(LABEL_TIPO).map(([value, label]) => ({ value, label })),
        ]}
      >
        <SelectTrigger size="sm" aria-label="Tipo" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="tutti">Tutti i tipi</SelectItem>
            {Object.entries(LABEL_TIPO).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={stato}
        onValueChange={setStato}
        items={[
          { value: 'tutti', label: 'Attivi e non' },
          { value: 'attivi', label: 'Solo attivi' },
          { value: 'disattivi', label: 'Solo disattivi' },
        ]}
      >
        <SelectTrigger size="sm" aria-label="Stato" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="tutti">Attivi e non</SelectItem>
            <SelectItem value="attivi">Solo attivi</SelectItem>
            <SelectItem value="disattivi">Solo disattivi</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * La pagina
 * ──────────────────────────────────────────────────────────────────────── */

function PaginaProdotti({ dati }: { dati: Prodotto[] }) {
  const [famiglia, setFamiglia] = useState('tutte')
  const [tipo, setTipo] = useState('tutti')
  const [stato, setStato] = useState('tutti')

  const filtrati = useMemo(
    () =>
      dati.filter((p) => {
        if (famiglia !== 'tutte' && p.famiglia !== famiglia) return false
        if (tipo !== 'tutti' && p.tipo !== tipo) return false
        if (stato === 'attivi' && !p.attivo) return false
        if (stato === 'disattivi' && p.attivo) return false
        return true
      }),
    [dati, famiglia, tipo, stato]
  )

  return (
    // «Sola lista»: la pagina è una colonna alta quanto lo spazio che
    // `<AppShell contenuto="riempie">` le concede, con la tabella sola
    // figlia a `flex-1 min-h-0` — è la cooperazione che `perPagina="infinito"`
    // chiede (commento di testa di `DataTableProps.perPagina`, M3.10 coda).
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader percorso={[{ titolo: 'Prodotti' }]} azioni={AZIONI_DI_PAGINA} />

      {dati.length === 0 ? (
        // «Non esiste ancora niente»: la tabella non renderebbe altro che
        // un'intestazione, che `INTERFACCE.md` §1.1 vieta esplicitamente.
        <EmptyState
          icona={<PackagePlusIcon />}
          titolo="Nessun prodotto in anagrafica"
          descrizione="I prodotti creati, o agganciati da Business Central, compariranno qui."
          azione={
            <Button size="sm">
              <PlusIcon />
              Nuovo prodotto
            </Button>
          }
          className="mx-auto max-w-md"
        />
      ) : (
        <DataTable
          colonne={COLONNE}
          dati={filtrati}
          cerca="Cerca nome, variante, codice…"
          perPagina="infinito"
          altezza="ferma"
          className="min-h-0 flex-1"
          vuoto={{ titolo: 'Nessun prodotto in anagrafica' }}
          nomeRighe={{ singolare: 'prodotto', plurale: 'prodotti' }}
          barra={
            <BarraFiltri
              famiglia={famiglia}
              setFamiglia={setFamiglia}
              tipo={tipo}
              setTipo={setTipo}
              stato={stato}
              setStato={setStato}
            />
          }
        />
      )}
    </div>
  )
}

function Guscio({ dati }: { dati: Prodotto[] }) {
  return (
    <AppShell
      applicazione="Anagrafe"
      collassa="icona"
      contenuto="riempie"
      utente={UTENTE}
      azioniUtente={AZIONI_UTENTE}
      sezioni={SEZIONI}
    >
      <PaginaProdotti dati={dati} />
    </AppShell>
  )
}

/**
 * La pagina com'è oggi in produzione: 220 prodotti finti, scorrimento
 * infinito, ricerca, i tre filtri, ordinamento da tastiera su ogni colonna.
 * Da confrontare con lo screenshot dell'originale in `WORKLOG.md`.
 */
export const ConDati: Story = {
  render: () => <Guscio dati={PRODOTTI} />,
}

/**
 * **Nessun prodotto esiste ancora.** Non è lo stesso stato di «la ricerca non
 * trova niente» — quello lo rende `DataTable` da sé, col bottone che pulisce i
 * filtri. Qui la tabella non compare affatto: comparirebbe solo la sua
 * intestazione, che è la forma che `INTERFACCE.md` vieta. `EmptyState`
 * (`tassullo-empty-state`, M3.5) prende il suo posto con la CTA che crea il
 * primo prodotto.
 */
export const SenzaProdotti: Story = {
  render: () => <Guscio dati={[]} />,
}
