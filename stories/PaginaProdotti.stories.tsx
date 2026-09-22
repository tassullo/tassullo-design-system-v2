import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  BookOpenIcon,
  BoxesIcon,
  ChevronDownIcon,
  FolderTreeIcon,
  LogOutIcon,
  PackagePlusIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
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
import { useSoglia } from '@/registry/tassullo/hooks/use-soglia'
import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import { Card } from '@/registry/tassullo/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/registry/tassullo/ui/collapsible'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/registry/tassullo/ui/dropdown-menu'
import { FieldGroup } from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/registry/tassullo/ui/input-group'
import { Label } from '@/registry/tassullo/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'
import { Toaster } from '@/registry/tassullo/ui/sonner'
import { ToggleGroup, ToggleGroupItem } from '@/registry/tassullo/ui/toggle-group'

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
 * La faccia stretta (M4ter.15)
 *
 * La ricetta è `Pagine/Lista a due facce` (M4ter.6): `useSoglia` decide, e
 * **la faccia stretta la scrive la pagina**, non un blocco — le due facce
 * non sono la stessa lista impaginata due volte, e nessun blocco può
 * indovinare dall'elenco delle `colonne` che sotto soglia lo stato diventa
 * una fila di chip e la famiglia smette di essere una colonna per diventare
 * un'intestazione.
 *
 * **Sette colonne su un telefono non ci stanno**, e comprimerle non è la
 * risposta: le colonne sommano 1102px, e a 375px utili si leggerebbero
 * quattro caratteri per cella.
 *
 * ── Tre filtri diventano uno, e non è una perdita ────────────────────────
 *
 * Sopra soglia i filtri sono tre — Famiglia, Tipo, Stato — e li tiene la
 * tabella. Qui **resta il solo Stato**, a chip, e la **Famiglia diventa il
 * raggruppamento**: scelta di Francesco, sull'esempio di `Pagine/Scelta da
 * catalogo` (M4ter.13), dove il catalogo si sfoglia per categoria invece di
 * filtrarlo. Su un telefono è la differenza fra aprire una tendina per
 * sapere quante famiglie esistono e vederle scorrendo. Il **Tipo** non
 * sparisce: resta il badge sulla scheda, che è dove lo si guarda davvero —
 * come filtro su tre valori costava un terzo grilletto per togliere poco.
 *
 * Conseguenza voluta: sotto soglia **non c'è un popover di filtro**, quindi
 * nessuna tendina da aprire col pollice. La ricerca copre nome, variante e
 * codici, cioè il modo in cui un prodotto si cerca davvero quando lo si sa
 * già.
 * ──────────────────────────────────────────────────────────────────────── */

type FiltriStretti = {
  cerca: string
  /** `"true"`/`"false"`: le stesse stringhe delle opzioni sopra soglia. */
  attivo: string[]
}

const FILTRI_VUOTI: FiltriStretti = { cerca: '', attivo: [] }

function passaFiltri(p: Prodotto, f: FiltriStretti): boolean {
  const ago = f.cerca.trim().toLowerCase()
  if (
    ago &&
    !`${p.nome} ${p.variante ?? ''} ${p.famiglia} ${p.codiceInterno ?? ''} ${p.bcSystemCode ?? ''}`
      .toLowerCase()
      .includes(ago)
  ) {
    return false
  }
  if (f.attivo.length > 0 && !f.attivo.includes(String(p.attivo))) return false
  return true
}

/**
 * Ricerca a tutta larghezza e lo stato a chip. Un solo filtro, nessun
 * popover: v. la nota del blocco qui sopra.
 */
function ComandiStretti({
  filtri,
  setFiltri,
}: {
  filtri: FiltriStretti
  setFiltri: Dispatch<SetStateAction<FiltriStretti>>
}) {
  const stato = filtri.attivo.length === 1 ? filtri.attivo[0]! : 'tutti'
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="prd-cerca-stretto">Cerca</Label>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id="prd-cerca-stretto"
            placeholder="Nome, famiglia, codice…"
            value={filtri.cerca}
            onChange={(e) => setFiltri((f) => ({ ...f, cerca: e.target.value }))}
          />
        </InputGroup>
      </div>
      <ToggleGroup
        variant="outline"
        aria-label="Stato"
        value={[stato]}
        /*
         * Base UI torna sempre un array, anche a scelta singola, e il
         * ripiego su `tutti` non è cosmesi: senza, ri-cliccare il chip
         * acceso lo spegnerebbe e la lista resterebbe filtrata su niente
         * (stessa nota di `Pagine/Lista a due facce`).
         */
        onValueChange={(valori) => {
          const scelto = (valori[0] as string | undefined) ?? 'tutti'
          setFiltri((f) => ({ ...f, attivo: scelto === 'tutti' ? [] : [scelto] }))
        }}
        className="flex-wrap"
      >
        <ToggleGroupItem value="tutti">Tutti</ToggleGroupItem>
        <ToggleGroupItem value="true">Attivi</ToggleGroupItem>
        <ToggleGroupItem value="false">Disattivi</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

/**
 * Una scheda per prodotto, **raggruppate per famiglia**.
 *
 * **La testata porta quello che si cerca sfogliando** — nome, variante, il
 * badge del tipo e quello dello stato — e non ripete la famiglia, che è già
 * scritta nell'intestazione del gruppo. Il resto (codice interno, BC) sta
 * nel pannello: sono codici che si guardano quando il prodotto è già stato
 * trovato, non mentre lo si cerca.
 *
 * Il grilletto è la **scheda intera**, che è anche il bersaglio più grande
 * possibile col pollice; il chevron resta come **segno**, non come bersaglio
 * separato — due bersagli concentrici sono il modo di sbagliare mira.
 * **Modifica ed Elimina** stanno nel pannello e non in un menu «⋯»: un menu
 * dentro il grilletto sarebbe `nested-interactive` per axe, la stessa
 * famiglia di difetti già presa in M4ter.12 e M4ter.13.
 *
 * **L'intestazione del gruppo è un `<h2>` appiccicato**, non un `CommandGroup`
 * come in `Pagine/Scelta da catalogo`: là le voci sono opzioni di un
 * `listbox` e non possono contenere controlli, qui ogni scheda ne porta tre.
 * Stessa idea di lettura, struttura diversa perché il contenuto è diverso.
 */
const PASSO_SCHEDE = 40

function SchedeProdotti({
  dati,
  onModifica,
  onElimina,
}: {
  dati: Prodotto[]
  onModifica: (p: Prodotto) => void
  onElimina: (p: Prodotto) => void
}) {
  /*
   * **Quaranta alla volta, non tutte.** Sopra soglia lo fa `perPagina=
   * "infinito"` (stesso passo di 40); qui una tabella non c'è, e rendere
   * 220 schede — ognuna con un `Collapsible` e due bottoni nel pannello —
   * è mezzo migliaio di nodi che il telefono monta per mostrarne sette.
   *
   * Il taglio è **sull'elenco piatto**, prima di raggruppare: così i gruppi
   * compaiono man mano, invece di mostrare tutte le famiglie a un quarto
   * ciascuna. Un bottone e non un `IntersectionObserver`: una lista che si
   * allunga da sé non ha una fine raggiungibile da tastiera, ed è anche
   * l'unico dei due che dice **quante** ne mancano.
   */
  /*
   * **Cambiano i filtri → si riparte dal primo passo**, o restando su un
   * «mostrate» alto il taglio non servirebbe più a niente. Il ripristino è
   * *derivato durante il render* e non fatto in un `useEffect`: un
   * `setState` dentro un effetto costa un secondo giro di render e oxlint lo
   * segnala (`set-state-in-effect`). Lo stato porta quindi con sé la
   * condizione in cui è stato scelto, e quando quella non vale più il valore
   * torna al passo senza che nessuno debba scriverlo.
   */
  const [taglio, setTaglio] = useState({ conta: dati.length, quante: PASSO_SCHEDE })
  const mostrate = taglio.conta === dati.length ? taglio.quante : PASSO_SCHEDE

  if (dati.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nessun prodotto con questi filtri
      </p>
    )
  }

  const visibili = dati.slice(0, mostrate)
  const restanti = dati.length - visibili.length

  // `Map` e non un oggetto: conserva l'ordine d'inserimento, che qui è
  // l'ordine in cui le famiglie compaiono nell'elenco già ordinato.
  const gruppi = new Map<string, Prodotto[]>()
  for (const p of visibili) {
    const riga = gruppi.get(p.famiglia)
    if (riga) riga.push(p)
    else gruppi.set(p.famiglia, [p])
  }

  /*
   * **Il numero nell'intestazione conta la famiglia intera, non le schede
   * già caricate.** Contare `gruppi.get(f).length` sembrava giusto e dava un
   * numero *vero* ma di un'altra cosa: con il taglio a 40 la prima famiglia
   * ne dichiarava «40» che era il passo, non il suo totale — e alla seconda
   * pressione di «Mostra altri» lo stesso gruppo cambiava numero da solo.
   * Un conteggio accanto a un nome si legge come «quanti ce n'è», mai come
   * «quanti se ne vedono adesso».
   */
  const totali = new Map<string, number>()
  for (const p of dati) totali.set(p.famiglia, (totali.get(p.famiglia) ?? 0) + 1)

  return (
    /*
     * **`p-px`, e serve davvero** — rilievo di Francesco a video, «bordo
     * mancante» sul fianco destro delle schede. `Card` non disegna un
     * `border`: disegna `ring-1`, che è un `box-shadow` **fuori** dalla
     * scatola. Il fianco destro della scheda cadeva esattamente sul bordo
     * del contenitore che scorre (misurato: scheda a 359, area utile del
     * contenitore a 359), e `overflow-y-auto` **ritaglia anche in
     * orizzontale** — non esiste scorrere su un asse e lasciar debordare
     * sull'altro: se un asse non è `visible`, l'altro diventa `auto`. Quel
     * pixel di ombra finiva quindi fuori dall'area utile e spariva, su
     * quel lato soltanto, perché a sinistra il margine glielo lasciava.
     *
     * Un pixel di riempimento restituisce all'ombra lo spazio in cui
     * esistere, su tutti e quattro i lati. Da sapere ovunque si metta una
     * `Card` dentro qualcosa che scorre: il difetto è **muto** e si vede
     * solo a schermo ingrandito.
     */
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-px">
      {Array.from(gruppi.entries()).map(([famiglia, prodotti]) => (
        <section key={famiglia} className="flex flex-col gap-2">
          {/* **Non `sticky`**, ed è un rilievo di Francesco a video: appiccicata
              copriva la scheda che le scorreva sotto — e soprattutto diceva la
              cosa sbagliata. Un'intestazione che resta in cima si legge come
              l'intestazione **della lista**; questa è il nome di un **gruppo
              dentro** la lista, e quando il gruppo esce di scena deve uscire
              con lui. */}
          <h2 className="flex items-baseline gap-2 text-sm font-semibold">
            {famiglia}
            <span className="font-normal text-muted-foreground tabular-nums">
              {totali.get(famiglia)}
            </span>
          </h2>
          {prodotti.map((p) => (
            <Collapsible key={p.id}>
              <Card className="gap-0 overflow-hidden py-0">
                <CollapsibleTrigger className="group/riga flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-medium">
                      {p.nome}
                      {p.variante ? (
                        <span className="text-muted-foreground"> {p.variante}</span>
                      ) : null}
                    </span>
                    {/* I due badge **sotto** e non incolonnati a destra: le
                        etichette di Tipo vanno da «Kit» a «Materia prima», e
                        a destra lasciavano un bordo frastagliato che si legge
                        come disordine — misurato a video a 375px. */}
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge variant="secondary">{LABEL_TIPO[p.tipo]}</Badge>
                      <Badge className={p.attivo ? TONO.success : TONO.warning}>
                        {p.attivo ? 'Attivo' : 'Disattivo'}
                      </Badge>
                    </div>
                  </div>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]/riga:rotate-180"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-3 border-t p-3">
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">Codice interno</dt>
                        <dd>{p.codiceInterno ?? '—'}</dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">BC</dt>
                        <dd>{p.bcSystemCode ?? '—'}</dd>
                      </div>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => onModifica(p)}>
                        <PencilIcon aria-hidden />
                        Modifica
                      </Button>
                      {/* `variant="destructive"`, non una classe di colore —
                          la trappola di `CLAUDE.md` sul testo di
                          `--destructive`. */}
                      <Button variant="destructive" size="sm" onClick={() => onElimina(p)}>
                        <Trash2Icon aria-hidden />
                        Elimina
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </section>
      ))}
      {restanti > 0 ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setTaglio({ conta: dati.length, quante: mostrate + PASSO_SCHEDE })}
        >
          Mostra altri {Math.min(restanti, PASSO_SCHEDE)} · ne restano {restanti}
        </Button>
      ) : null}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * La pagina
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * **`faccia` è una prop della pagina, non dell'hook**, e la ragione è la
 * stessa di `Pagine/Lista a due facce` (`docs/DECISIONI.md` §46): `useSoglia`
 * legge una media query **sulla finestra**, e la larghezza della finestra non
 * si commuta dal canvas — l'interruttore Viewport ridimensiona l'iframe nella
 * cornice del manager, e nel canvas aperto per URL, che è come lo aprono
 * `test:a11y` e `misura:bersagli`, `window.innerWidth` resta quello della
 * finestra vera, **senza errore**. Con `'auto'` la faccia la sceglie l'hook;
 * `'tabella'` e `'schede'` la rendono in modo deterministico, così il gate
 * vede markup largo vero *e* markup stretto vero.
 *
 * `soglia` la dichiara la pagina, ed è **1024px** — quella di Officina
 * (`useDesktop()`); Studio RadarOpere usa 900. Non si deriva dalla tabella, e
 * la misura dice perché: le sette colonne sommano **1102px** di contenuto, e
 * dentro questo guscio il riquadro smette davvero di scorrere solo a
 * **1392px** di finestra (misurato in Chromium: 1366 → 26px di deficit, 1380
 * → 12, 1392 → 0, e da lì in su resta 0). Mettere la soglia lì sarebbe
 * l'errore che `Pagine/Lista a due facce` scrive per esteso: **se la tabella
 * non ci sta, la risposta non è alzare la soglia, è scorrere** — con
 * `bloccaPrimaColonna` a tenere ferma la colonna d'identità. Alzandola a
 * 1392 un portatile da 1280 non vedrebbe mai la tabella, cioè si sposterebbe
 * sul telefono una pagina che sulla scrivania funzionava. Fra 1024 e 1392 la
 * tabella scorre in orizzontale, ed è voluto; sotto 1024 non si scorre più,
 * si cambia forma.
 */
function PaginaProdotti({
  dati,
  faccia = 'auto',
  soglia = '(min-width: 1024px)',
}: {
  dati: Prodotto[]
  faccia?: 'auto' | 'tabella' | 'schede'
  soglia?: string
}) {
  // I dati diventano stato di pagina: Elimina toglie davvero una riga,
  // Modifica scrive davvero sulla riga (M3bis.11b) — non più un array
  // costante filtrato in sola lettura.
  const [prodotti, setProdotti] = useState(dati)
  const [inModifica, setInModifica] = useState<Prodotto | null>(null)
  const [inEliminazione, setInEliminazione] = useState<Prodotto | null>(null)

  // Lo stato dei filtri della faccia stretta vive **qui**, non dentro
  // `SchedeProdotti`: così attraversare la soglia avanti e indietro non lo
  // perde. Sopra soglia i filtri restano invece della tabella, ed è la
  // cucitura da conoscere — v. la nota di testa della story.
  const [filtriStretti, setFiltriStretti] = useState<FiltriStretti>(FILTRI_VUOTI)

  const largoDavvero = useSoglia(soglia)
  const largo = faccia === 'auto' ? largoDavvero : faccia === 'tabella'
  // Ordinate per famiglia **prima** di raggruppare: l'elenco arriva
  // mescolato, e senza questo la stessa famiglia comparirebbe come sei
  // gruppi diversi lungo la pagina. A parità di famiglia resta l'ordine
  // d'origine, che è quello della faccia larga.
  const visibili = largo
    ? prodotti
    : prodotti
        .filter((p) => passaFiltri(p, filtriStretti))
        .sort((a, b) => a.famiglia.localeCompare(b.famiglia, 'it') || a.id - b.id)

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
      ) : !largo ? (
        <>
          <ComandiStretti filtri={filtriStretti} setFiltri={setFiltriStretti} />
          {/* Il conteggio che sopra soglia scrive `nomeRighe` da sé: qui
              una tabella non c'è, e senza questa riga non si saprebbe
              quanto sta filtrando. */}
          <p className="text-sm text-muted-foreground">
            {visibili.length === prodotti.length
              ? `${prodotti.length} prodotti`
              : `${visibili.length} di ${prodotti.length} prodotti`}
          </p>
          <SchedeProdotti
            dati={visibili}
            onModifica={setInModifica}
            onElimina={setInEliminazione}
          />
        </>
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

function Guscio({
  dati,
  faccia,
  soglia,
}: {
  dati: Prodotto[]
  faccia?: 'auto' | 'tabella' | 'schede'
  soglia?: string
}) {
  return (
    <AppShell
      applicazione="Anagrafe"
      collassa="icona"
      contenuto="riempie"
      utente={UTENTE}
      azioniUtente={AZIONI_UTENTE}
      sezioni={SEZIONI}
    >
      <PaginaProdotti dati={dati} faccia={faccia} soglia={soglia} />
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
  // `faccia="tabella"`, non `'auto'`: il gate deve vedere il markup largo
  // **vero**, non quello che capita alla larghezza con cui la finestra del
  // test è stata aperta (`docs/DECISIONI.md` §46). La scena che dipende
  // davvero dall'hook è `Soglia della pagina`, sotto.
  render: () => <Guscio dati={PRODOTTI} faccia="tabella" />,
  // Non il primo `dropdown-menu-trigger` della pagina: quello è il menu
  // utente della sidebar (`AppShell`), montato prima della tabella nel DOM,
  // e nemmeno quello del menu colonna, in `thead`. Il grilletto di riga
  // vive dentro il `<tbody>` (stessa nota di `pagina-lista.stories.tsx`).
  play: apriCol('tbody [data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * **La faccia stretta**, resa in modo deterministico: una scheda per
 * prodotto, il pannello con codice interno/BC e le due azioni, la ricerca a
 * tutta larghezza, Famiglia e Tipo sfaccettati, Stato a chip.
 *
 * Le azioni sono **le stesse** della faccia larga, non stub: Modifica apre il
 * `responsive-dialog` col modulo che scrive davvero sulla riga, Elimina apre
 * `confirm-dialog` e poi `toast-con-annullo`. Sul telefono il dialogo è già
 * un cassetto dal basso, senza che la pagina faccia niente.
 *
 * Da guardare **restringendo la finestra del browser**, non con
 * l'interruttore Viewport: quello ridimensiona l'iframe nella cornice del
 * manager e `window.innerWidth` non si muove (`docs/DECISIONI.md` §46).
 * Questa scena non ne ha bisogno, perché rende la faccia per la prop.
 */
export const FacciaStretta: Story = {
  name: 'Faccia stretta',
  render: () => <Guscio dati={PRODOTTI} faccia="schede" />,
}

/**
 * **La scena che dipende davvero dalla finestra.** `faccia="auto"`: la sceglie
 * `useSoglia('(min-width: 1024px)')`, quindi questa story cambia forma
 * restringendo la finestra del browser — ed è l'unica delle tre che lo fa.
 *
 * Nel gate rende **la faccia larga**, perché la finestra dell'imbracatura è
 * 1440. È un numero da rimisurare ogni volta che la soglia cambia: portandola
 * sopra 1440 questa scena passerebbe alle schede e il gate continuerebbe a
 * dire «0 violazioni» senza segnalare niente — è §46 applicata alla story che
 * la cita.
 *
 * **Se la tabella non ci sta, la risposta non è alzare la soglia**: è
 * scorrere, con `bloccaPrimaColonna` che tiene ferma la colonna d'identità.
 * Alzare la soglia sposta sul telefono una pagina che sulla scrivania
 * funzionava.
 */
export const SogliaDellaPagina: Story = {
  name: 'Soglia della pagina',
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
