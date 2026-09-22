import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  BookOpenIcon,
  BoxesIcon,
  FolderTreeIcon,
  LogOutIcon,
  PackagePlusIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SendIcon,
  SettingsIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react'

import { apriCol } from '@/prove/apri'
import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { ConfirmDialog } from '@/registry/tassullo/blocks/confirm-dialog'
import {
  DataTable,
  RowMenuItem,
  RowMenuSeparator,
  IntestazioneColonnaMenu,
  creaColonne,
  useDataTableRow,
} from '@/registry/tassullo/blocks/data-table'
import { FiltroResetTutti } from '@/registry/tassullo/blocks/data-table-filtro-reset'
import { FiltroSfaccettato } from '@/registry/tassullo/blocks/data-table-filtro-sfaccettato'
import { EmptyState } from '@/registry/tassullo/blocks/empty-state'
import { FormField } from '@/registry/tassullo/blocks/form-field'
import { PageHeader, type AzionePagina } from '@/registry/tassullo/blocks/page-header'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/registry/tassullo/blocks/responsive-dialog'
import { toastConAnnullo } from '@/registry/tassullo/blocks/toast-con-annullo'
import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/registry/tassullo/ui/dropdown-menu'
import { FieldGroup } from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'
import { Toaster } from '@/registry/tassullo/ui/sonner'

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
 *   a mano) diventano tre filtri **sfaccettati** (M3bis.6), passati nella
 *   barra del blocco `DataTable` — stesso posto, stessa fila, di default
 *   nessuna opzione scelta e tutti i prodotti visibili, come i tre `<select>`
 *   dell'originale. Stato è passato per ultimo dopo un giro su
 *   `toggle-group` (coda di M3bis.11b): coerenza con Famiglia/Tipo ha
 *   vinto su «è booleano, ha una forma diversa».
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
 *   mano) restano fuori da questo gate nella forma in cui esistevano in
 *   Anagrafe (un modulo intero di creazione prodotto): il bottone di testata
 *   «Nuovo prodotto» resta un dato di vetrina, come le azioni di Anagrafe che
 *   non sono del design system. **Modifica ed Elimina**, invece, sono
 *   compresi in questo gate — v. il menu di riga, sotto.
 * - **Le colonne** sono le stesse sette dell'originale (Nome, Variante, Tipo,
 *   Famiglia, Codice interno, BC, Stato), coi due badge — Tipo neutro, Stato
 *   con tono — al posto delle classi `badge`/`badge-success`/`badge-warn`
 *   scritte a mano.
 *
 * Confronto a schermata in `WORKLOG.md`, voce M3.10.
 *
 * ## M3bis.11b — le capacità di FASE 3bis, e il gate della fase
 *
 * Ambito confermato da Francesco (`WORKLOG.md`, 2026-09-17): non un elenco di
 * capacità dimostrate a vuoto, ma applicate alla pagina reale con azioni
 * **testabili davvero**, non uno stub `console.info`.
 *
 * - **Resize** (`ridimensionabile`, M3bis.3): ogni intestazione porta la
 *   maniglia sul bordo destro, come già su Norme (M3bis.11a). Le sette
 *   colonne dichiarano `size`/`minSize`, non più `meta.larghezza`.
 * - **Menu colonna unico** (`colonneBloccabili` + intestazioni proprie,
 *   `azioniProprie: true`): la forma confermata su `Blocchi/Data Table` →
 *   `Menu Colonna` — un solo grilletto «⋮» che compone ordinamento e pin,
 *   non due bottoni separati. **Da M4ter.14 è `IntestazioneColonnaMenu`, dal
 *   blocco**, non più riscritta qui: resta un'alternativa opt-in, scelta
 *   colonna per colonna, ma da una sorgente sola.
 * - **Menu di riga condiviso** (`menuRiga`, M3bis.9), con azioni vere:
 *   **Modifica** apre un `responsive-dialog` con un modulo `form-field` —
 *   Denominazione, Famiglia, Variante — che scrive davvero sulla riga.
 *   **Elimina** apre `confirm-dialog`: la conferma toglie la riga dai dati
 *   della story e apre `toast-con-annullo` (D18) — «Annulla» entro cinque
 *   secondi la rimette, altrimenti resta tolta. Nessuno dei due è un
 *   `console.info`.
 * - **Filtri sfaccettati** (M3bis.6) su Famiglia, Tipo e Stato, al posto dei
 *   tre `Select`/`toggle-group` che c'erano prima — con il conteggio per
 *   opzione ricalcolato sulle righe che passano gli altri filtri. Stato ha
 *   un filtro scritto a mano (`col.accessor('attivo', { filterFn: ... })`,
 *   sopra): `arrHas` confronta con `===` senza stringificare, e un
 *   booleano contro le stringhe delle opzioni non troverebbe mai un pari.
 *
 * **Non incluso, deliberatamente** (lo stesso elenco di `WORKLOG.md`): il
 * riordino di colonna per trascinamento (`colonneRiordinabili`, M3bis.8) — il
 * "menu colonna" copre già ordinamento e pin, e Francesco non l'ha chiesto.
 * Tree/subtotale, espansione, virtualizzazione e la Data Grid editabile
 * restano il pattern "Computo" (`Blocchi/Data Table`/`Blocchi/Data Grid`),
 * non quello di un elenco.
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
 * Le colonne — le stesse sette dell'originale. `size`/`minSize`, non
 * `meta.larghezza` (M3bis.3/M3bis.11b): con `ridimensionabile` la larghezza
 * di partenza la dichiara l'utente trascinando, `larghezza` verrebbe
 * ignorata. Nessuna colonna azioni scritta a mano: `menuRiga`, sotto, la
 * aggiunge da sé in coda.
 * ──────────────────────────────────────────────────────────────────────── */

const col = creaColonne<Prodotto>()

const COLONNE = col.columns([
  col.accessor('nome', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Nome" />,
    meta: { titolo: 'Nome', azioniProprie: true },
    sortFn: 'text',
    size: 220,
    minSize: 140,
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
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Variante" />,
    meta: { titolo: 'Variante', azioniProprie: true },
    sortFn: 'text',
    size: 110,
    minSize: 80,
    cell: ({ getValue }) => getValue<string | null>() ?? '—',
  }),
  col.accessor('tipo', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Tipo" />,
    meta: { titolo: 'Tipo', azioniProprie: true },
    sortFn: 'text',
    // Un valore per riga: `arrHas` tiene la riga il cui valore compare fra
    // quelli scelti nel filtro sfaccettato (M3bis.11b, sotto).
    filterFn: 'arrHas',
    size: 140,
    minSize: 100,
    cell: ({ getValue }) => <Badge variant="secondary">{LABEL_TIPO[getValue<Tipo>()]}</Badge>,
  }),
  col.accessor('famiglia', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Famiglia" />,
    meta: { titolo: 'Famiglia', azioniProprie: true },
    sortFn: 'text',
    filterFn: 'arrHas',
    size: 200,
    minSize: 120,
  }),
  col.accessor('codiceInterno', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Codice interno" />,
    meta: { titolo: 'Codice interno', azioniProprie: true },
    sortFn: 'alphanumeric',
    size: 150,
    minSize: 110,
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue<string | null>() ?? '—'}</span>
    ),
  }),
  col.accessor('bcSystemCode', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="BC" />,
    meta: { titolo: 'BC', azioniProprie: true },
    sortFn: 'alphanumeric',
    size: 120,
    minSize: 90,
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue<string | null>() ?? '—'}</span>
    ),
  }),
  col.accessor('attivo', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Stato" />,
    meta: { titolo: 'Stato', azioniProprie: true },
    sortFn: 'basic',
    // `arrHas` (TanStack) confronta il valore grezzo della colonna con
    // `===`, senza convertirlo — su un booleano contro le stringhe che il
    // filtro sfaccettato porta ("true"/"false", dalle opzioni statiche sotto)
    // non troverebbe mai un pari. Filtro scritto a mano, stessa forma di
    // `arrHas` ma con la stringificazione che qui serve.
    filterFn: (riga, id, valori: string[]) => valori.includes(String(riga.getValue(id))),
    size: 110,
    minSize: 90,
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
 * Il menu di riga condiviso (M3bis.9/M3bis.11b): una sola definizione,
 * letta da `useDataTableRow<Prodotto>()`, montata da `menuRiga` sia nella
 * tendina «⋯» sia sul tasto destro. Le due azioni sono passate dalla pagina
 * (`onModifica`/`onElimina`) perché i due dialoghi che aprono vivono
 * **fuori** dal menu: cliccando una voce il menu si chiude e si smonta, e
 * con lui si smonterebbe un dialogo montato dentro (v. `confirm-dialog`,
 * story `DaUnMenuDiRiga`).
 * ──────────────────────────────────────────────────────────────────────── */

function MenuAzioniProdotto({
  onModifica,
  onElimina,
}: {
  onModifica: (prodotto: Prodotto) => void
  onElimina: (prodotto: Prodotto) => void
}) {
  const prodotto = useDataTableRow<Prodotto>()
  return (
    <>
      <RowMenuItem onClick={() => onModifica(prodotto)}>
        <PencilIcon aria-hidden />
        Modifica
      </RowMenuItem>
      <RowMenuSeparator />
      {/* `variant="destructive"`, non una classe di colore — la trappola di
          `CLAUDE.md` sul testo di `--destructive`. */}
      <RowMenuItem variant="destructive" onClick={() => onElimina(prodotto)}>
        <Trash2Icon aria-hidden />
        Elimina
      </RowMenuItem>
    </>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * Il modulo di modifica — `responsive-dialog` + `form-field` (M3.4),
 * entrambi già nel registry. Il `<form>` porta un `id`: il bottone «Salva»
 * vive nel piè del dialogo, fuori dal corpo dove sta il modulo, e li
 * collega l'attributo HTML `form`, non uno stato in più.
 * ──────────────────────────────────────────────────────────────────────── */

const schemaModifica = z.object({
  nome: z.string().min(1, 'Il nome è obbligatorio.'),
  famiglia: z.string().min(1, 'Scegli una famiglia.'),
  variante: z.string().optional(),
})

function ModuloModificaProdotto({
  prodotto,
  onSalva,
}: {
  prodotto: Prodotto
  onSalva: (valori: z.infer<typeof schemaModifica>) => void
}) {
  const form = useForm<z.infer<typeof schemaModifica>>({
    resolver: zodResolver(schemaModifica),
    defaultValues: {
      nome: prodotto.nome,
      famiglia: prodotto.famiglia,
      variante: prodotto.variante ?? '',
    },
  })

  return (
    <form id="modifica-prodotto" noValidate onSubmit={form.handleSubmit(onSalva)}>
      <FieldGroup>
        <FormField control={form.control} nome="nome" etichetta="Denominazione">
          {(campo) => <Input {...campo} autoComplete="off" />}
        </FormField>
        {/* Il `Select` di Base UI non ha `onChange`: si scompone il campo e
            si rimappa (stesso pattern di `form-field.stories.tsx`). */}
        <FormField control={form.control} nome="famiglia" etichetta="Famiglia">
          {({ onChange, value, ...campo }) => (
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger {...campo}>
                <SelectValue placeholder="Scegli una famiglia" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {FAMIGLIE.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </FormField>
        <FormField control={form.control} nome="variante" etichetta="Variante" descrizione="Facoltativa.">
          {(campo) => <Input {...campo} autoComplete="off" />}
        </FormField>
      </FieldGroup>
    </form>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * La pagina
 * ──────────────────────────────────────────────────────────────────────── */

function PaginaProdotti({ dati }: { dati: Prodotto[] }) {
  // I dati diventano stato di pagina: Elimina toglie davvero una riga,
  // Modifica scrive davvero sulla riga (M3bis.11b) — non più un array
  // costante filtrato in sola lettura.
  const [prodotti, setProdotti] = useState(dati)
  const [inModifica, setInModifica] = useState<Prodotto | null>(null)
  const [inEliminazione, setInEliminazione] = useState<Prodotto | null>(null)

  return (
    // «Sola lista»: la pagina è una colonna alta quanto lo spazio che
    // `<AppShell contenuto="riempie">` le concede, con la tabella sola
    // figlia a `flex-1 min-h-0` — è la cooperazione che `perPagina="infinito"`
    // chiede (commento di testa di `DataTableProps.perPagina`, M3.10 coda).
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader percorso={[{ titolo: 'Prodotti' }]} azioni={AZIONI_DI_PAGINA} />

      {prodotti.length === 0 ? (
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
          dati={prodotti}
          idRiga={(p) => String(p.id)}
          cerca="Cerca nome, variante, codice…"
          perPagina="infinito"
          altezza="ferma"
          className="min-h-0 flex-1"
          vuoto={{ titolo: 'Nessun prodotto in anagrafica' }}
          nomeRighe={{ singolare: 'prodotto', plurale: 'prodotti' }}
          // Le capacità di FASE 3bis confermate per questa pagina
          // (M3bis.11b, v. WORKLOG.md): resize + menu colonna unico
          // (ordinamento e pin), menu di riga condiviso con azioni vere.
          ridimensionabile
          colonneBloccabili
          menuRiga={{
            menu: <MenuAzioniProdotto onModifica={setInModifica} onElimina={setInEliminazione} />,
            ariaLabel: (p) => `Azioni su ${p.nome}`,
          }}
          barra={(_scelti, tabella) => (
            <>
              <FiltroSfaccettato tabella={tabella} accessore="famiglia" titolo="Famiglia" />
              <FiltroSfaccettato
                tabella={tabella}
                accessore="tipo"
                titolo="Tipo"
                opzioni={Object.entries(LABEL_TIPO).map(([value, label]) => ({ value, label }))}
              />
              {/*
                Stato torna un filtro sfaccettato come Famiglia/Tipo (rilievo
                di Francesco: coerenza con gli altri due, non una terza forma
                a sé) — di default nessuna opzione scelta, tutti i prodotti
                compaiono, esattamente come Famiglia/Tipo. `opzioni` statiche
                perché il valore grezzo è un booleano: la label la scrive la
                pagina («Attivo»/«Disattivo»), non `formattaEtichetta` che
                renderebbe «True»/«False». Il filtro stesso è una funzione
                scritta a mano sulla colonna (sopra, non `arrHas`): `arrHas`
                confronta con `===` senza stringificare, e un booleano contro
                le stringhe delle opzioni non troverebbe mai un pari.
              */}
              <FiltroSfaccettato
                tabella={tabella}
                accessore="attivo"
                titolo="Stato"
                opzioni={[
                  { value: 'true', label: 'Attivo' },
                  { value: 'false', label: 'Disattivo' },
                ]}
              />
              {/* Sparisce da sé quando non c'è niente da cancellare
                  (`FiltroResetTutti` legge `tabella.state.columnFilters`) —
                  mancava, rilievo di Francesco. */}
              <FiltroResetTutti tabella={tabella} />
            </>
          )}
        />
      )}

      {/* Il grilletto non può stare dentro: la voce del menu di riga,
          cliccata, chiude il menu e si smonta con lui. Lo stato
          dell'apertura lo tiene quindi la pagina (v. `confirm-dialog`,
          story `DaUnMenuDiRiga`). */}
      <ConfirmDialog
        titolo="Eliminare il prodotto?"
        descrizione={
          inEliminazione
            ? `La scheda «${inEliminazione.nome}» e i suoi allegati non si possono recuperare.`
            : undefined
        }
        conferma="Elimina"
        tono="distruttivo"
        aperto={!!inEliminazione}
        onApertoChange={(aperto) => {
          if (!aperto) setInEliminazione(null)
        }}
        onConferma={() => {
          const prodotto = inEliminazione
          if (!prodotto) return
          // Tolta subito (ottimista): il toast che segue è la finestra
          // d'annullo, non una seconda conferma — D18, `toastConAnnullo`.
          setProdotti((righe) => righe.filter((r) => r.id !== prodotto.id))
          setInEliminazione(null)
          toastConAnnullo(() => {}, {
            messaggio: `«${prodotto.nome}» eliminato`,
            onAnnulla: () =>
              setProdotti((righe) => [...righe, prodotto].sort((a, b) => a.id - b.id)),
          })
        }}
      />

      <ResponsiveDialog
        open={!!inModifica}
        onOpenChange={(aperto) => {
          if (!aperto) setInModifica(null)
        }}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Modifica prodotto</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {inModifica ? `Scheda «${inModifica.nome}».` : ''}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
            {inModifica ? (
              <ModuloModificaProdotto
                prodotto={inModifica}
                onSalva={(valori) => {
                  setProdotti((righe) =>
                    righe.map((r) =>
                      r.id === inModifica.id
                        ? {
                            ...r,
                            nome: valori.nome,
                            famiglia: valori.famiglia,
                            variante: valori.variante || null,
                          }
                        : r
                    )
                  )
                  setInModifica(null)
                }}
              />
            ) : null}
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <ResponsiveDialogClose render={<Button variant="outline">Annulla</Button>} />
            <Button type="submit" form="modifica-prodotto">
              Salva
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
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
      {/* Una volta sola in cima all'app, come `Blocchi/Toast con annullo` —
          serve a `toastConAnnullo` dietro l'Elimina del menu di riga. */}
      <Toaster />
    </AppShell>
  )
}

/**
 * La pagina com'è oggi in produzione, con le capacità di FASE 3bis
 * (M3bis.11b): 220 prodotti finti, scorrimento infinito, ricerca, filtri
 * sfaccettati Famiglia/Tipo + Stato, ordinamento da tastiera su ogni
 * colonna, resize e menu colonna unico, menu di riga condiviso con
 * Modifica/Elimina testabili davvero.
 */
export const ConDati: Story = {
  render: () => <Guscio dati={PRODOTTI} />,
  // Non il primo `dropdown-menu-trigger` della pagina: quello è il menu
  // utente della sidebar (`AppShell`), montato prima della tabella nel DOM,
  // e nemmeno quello del menu colonna, in `thead`. Il grilletto di riga
  // vive dentro il `<tbody>` (stessa nota di `pagina-lista.stories.tsx`).
  play: apriCol('tbody [data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
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
