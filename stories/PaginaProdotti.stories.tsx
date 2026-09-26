import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { reset as azzeraAvvisiBaseUI } from '@base-ui/utils/error'
import { cn } from 'cn'
import { expect, waitFor, within } from 'storybook/test'
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
import { useSoglia } from '@/registry/tassullo/hooks/use-soglia'
import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button, buttonVariants } from '@/registry/tassullo/ui/button'
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
import { ToggleGroup, ToggleGroupItem } from '@/registry/tassullo/ui/toggle-group'

/**
 * L'elenco dei prodotti di Anagrafe, composto blocco per blocco con il solo
 * registry e senza CSS di pagina. È l'esempio di una pagina elenco completa:
 * le azioni di riga funzionano, i filtri contano, e sotto i 1024px la
 * tabella diventa un elenco di schede.
 *
 * **Quando sì, quando no.** Per una pagina elenco nuova si parte da
 * `tassullo-pagina-lista`, che ha già questa forma in un import solo. Questa
 * pagina serve a vedere dove sta ogni pezzo, e cosa si scrive a mano quando
 * la si compone da sé.
 *
 * ```bash
 * npx shadcn@latest add \
 *   tassullo/tassullo-design-system-v2/tassullo-app-shell \
 *   tassullo/tassullo-design-system-v2/tassullo-page-header \
 *   tassullo/tassullo-design-system-v2/tassullo-data-table \
 *   tassullo/tassullo-design-system-v2/tassullo-data-table-filtro-sfaccettato \
 *   tassullo/tassullo-design-system-v2/tassullo-data-table-filtro-reset \
 *   tassullo/tassullo-design-system-v2/tassullo-empty-state \
 *   tassullo/tassullo-design-system-v2/tassullo-responsive-dialog \
 *   tassullo/tassullo-design-system-v2/tassullo-form-field \
 *   tassullo/tassullo-design-system-v2/tassullo-confirm-dialog \
 *   tassullo/tassullo-design-system-v2/use-soglia \
 *   tassullo/tassullo-design-system-v2/toni \
 *   tassullo/tassullo-design-system-v2/card \
 *   tassullo/tassullo-design-system-v2/toggle-group
 * ```
 *
 * **Come è composta.**
 *
 * - `tassullo-app-shell` con `contenuto="riempie"`, e dentro una colonna
 *   `flex h-full min-h-0 flex-col`: la tabella ne è il figlio
 *   `min-h-0 flex-1`.
 * - `tassullo-page-header`: il percorso «Prodotti» e l'azione primaria
 *   «Nuovo prodotto», nella fascia in alto.
 * - `tassullo-data-table` con `perPagina="infinito"` e `altezza="ferma"`: la
 *   tabella carica le righe man mano che si scorre, dentro un riquadro che
 *   si ferma all'altezza della finestra, con le intestazioni sempre in
 *   vista. `nomeRighe` scrive il conteggio «220 prodotti».
 * - Colonne che si allargano col trascinamento (`ridimensionabile`) e si
 *   bloccano (`colonneBloccabili`); ogni intestazione è
 *   `IntestazioneColonnaMenu`, un solo grilletto «⋮» per ordinare e
 *   bloccare, con `meta.azioniProprie: true`.
 * - I filtri sfaccettati su Famiglia, Tipo e Stato, nella `barra`, con il
 *   conteggio accanto a ogni opzione; `FiltroResetTutti` li toglie insieme.
 * - Il menu di riga (`menuRiga`), dalla tendina «⋯» o col tasto destro.
 *   «Modifica» apre `tassullo-responsive-dialog` con un modulo di
 *   `tassullo-form-field` — denominazione, famiglia, variante — che scrive
 *   sulla riga. «Elimina» chiede conferma con `tassullo-confirm-dialog`.
 * - `tassullo-empty-state` quando non esiste ancora nessun prodotto.
 * - Sotto i 1024px, deciso da `useSoglia`, le schede che la pagina scrive: la
 *   famiglia diventa il raggruppamento, lo stato una fila di chip, il tipo
 *   un badge sulla scheda. Nessun filtro in un popover; la ricerca copre
 *   nome, variante e codici. Le schede si caricano quaranta alla volta, con
 *   un bottone «Mostra altri».
 *
 * **Regole d'uso.**
 *
 * - Il titolo della pagina non si scrive sopra la tabella: è l'ultimo
 *   livello del percorso.
 * - Il conteggio delle righe lo scrive la tabella con `nomeRighe`, non la
 *   pagina.
 * - Ogni colonna dichiara `size` e `minSize`: con `ridimensionabile` la
 *   larghezza di partenza è quella.
 * - Il tipo è un badge neutro, lo stato un badge col tono di `lib/toni`.
 * - Un filtro sfaccettato su una colonna booleana vuole un `filterFn` suo,
 *   `valori.includes(String(riga.getValue(id)))`: `arrHas` confronta i
 *   valori senza convertirli, e un booleano non è mai uguale alle stringhe
 *   `"true"` e `"false"` delle opzioni.
 * - Il vuoto dei filtri e il vuoto iniziale sono due stati: il primo lo
 *   rende la tabella, col bottone che toglie i filtri; il secondo è
 *   `tassullo-empty-state` al posto della tabella, con l'azione che crea il
 *   primo prodotto.
 * - Da sapere: passando la soglia i filtri non vanno da una faccia
 *   all'altra. Sopra li tiene la tabella, sotto la pagina.
 *
 * **Tastiera e accessibilità.** Quelle dei blocchi: l'ordinamento e i menu
 * di colonna dalle intestazioni, il menu di riga dal grilletto «⋯», i
 * dialoghi che tengono il fuoco al loro interno finché sono aperti. Nella
 * faccia stretta ogni scheda è un bottone, e `Invio` o `Spazio` aprono il
 * pannello con i codici e le due azioni.
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
  nome: 'Stefano',
  cognome: 'Bertolini',
  email: 'sbertolini@esempio.it',
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
    // Un collegamento, non un `Button` col `render` di un `<a>`: quello
    // scriveva un errore di Base UI in console e metteva `type="button"` sul
    // link (40 su 40). Nell'app, al posto dell'`<a>`, il `Link` del router.
    cell: ({ getValue }) => (
      <a href="#" className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'h-auto p-0 font-medium')}>
        {getValue<string>()}
      </a>
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
                <CollapsibleTrigger className="group/riga flex w-full items-center gap-3 p-3 text-left rounded-xl hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset focus-visible:outline-none data-[panel-open]:rounded-b-none">
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
          {/* **Nessuna riga di conteggio** (richiesta di Francesco): sopra
              soglia la scrive `nomeRighe`, qui era una riga di testo fra i
              filtri e la prima scheda — cioè uno scalino che allontana la
              lista dal pollice per dire un numero che i conteggi di gruppo
              già danno, famiglia per famiglia. */}
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
                pagina («Attivo»/«Disattivo»): il filtro mostra i valori
                come sono nel dato, e si leggerebbe «true»/«false». Il filtro stesso è una funzione
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
          setProdotti((righe) => righe.filter((r) => r.id !== prodotto.id))
          setInEliminazione(null)
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
    </AppShell>
  )
}

/**
 * Il caso comune: 220 prodotti, lo scorrimento che carica le righe man
 * mano, la ricerca, i filtri sfaccettati, il menu «⋮» delle intestazioni e
 * il menu di riga con «Modifica» ed «Elimina» funzionanti. La scena passa
 * `faccia="tabella"`.
 */
export const ConDati: Story = {
  // `faccia="tabella"`, non `'auto'`: la faccia larga a ogni larghezza della
  // finestra, anche in una prova automatica. La scena che dipende davvero
  // dalla finestra è `Soglia della pagina`, sotto.
  render: () => <Guscio dati={PRODOTTI} faccia="tabella" />,
  // Non il primo `dropdown-menu-trigger` della pagina: quello è il menu
  // utente della sidebar (`AppShell`), montato prima della tabella nel DOM,
  // e nemmeno quello del menu colonna, in `thead`. Il grilletto di riga
  // vive dentro il `<tbody>` (stessa nota di `pagina-lista.stories.tsx`).
  play: apriCol('tbody [data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

// Scena di misura di «Con dati»: il nome di ogni riga resta un collegamento.
// Le 40 righe caricate all'apertura sono 40 link senza `type` e senza
// `role="button"`, e Base UI non scrive in console l'errore del bottone
// che rende un non-bottone. Il registro degli avvisi di Base UI si svuota
// prima del render, perché ogni messaggio lo scrive una volta per pagina e
// una scena precedente lo avrebbe già consumato. `!dev` la toglie dalla
// barra e da Docs; il gate la esegue.
const erroriConsole: string[] = []

export const ConDatiProva: Story = {
  ...ConDati,
  name: 'Con dati, prova',
  tags: ['!dev', '!autodocs'],
  beforeEach: () => {
    azzeraAvvisiBaseUI()
    erroriConsole.length = 0
    const originale = console.error
    console.error = (...argomenti: unknown[]) => {
      erroriConsole.push(argomenti.map(String).join(' '))
      originale(...argomenti)
    }
    return () => {
      console.error = originale
    }
  },
  play: async ({ canvasElement }) => {
    const corpo = await waitFor(() => {
      const t = canvasElement.querySelector('tbody')
      if (!t || t.querySelectorAll('tr').length < 40) throw new Error('righe non ancora rese')
      return t as HTMLElement
    })
    const link = within(corpo).getAllByRole('link')
    await expect(link).toHaveLength(40)
    await expect(link.filter((a) => a.hasAttribute('type'))).toHaveLength(0)
    await expect(erroriConsole.filter((m) => m.includes('nativeButton'))).toHaveLength(0)
  },
}

/**
 * La faccia stretta, fissata con `faccia="schede"`: una scheda per
 * prodotto, raggruppate per famiglia, la ricerca a tutta larghezza e lo
 * stato a chip. Le azioni sono le stesse della tabella: «Modifica» apre il
 * dialogo, che sul telefono è un cassetto dal basso, ed «Elimina» chiede
 * conferma.
 */
export const FacciaStretta: Story = {
  name: 'Faccia stretta',
  globals: { viewport: { value: 'telefono', isRotated: false } },
  render: () => <Guscio dati={PRODOTTI} faccia="schede" />,
}

/**
 * `faccia="auto"`: decide `useSoglia('(min-width: 1024px)')`. È la sola
 * scena che cambia forma con la larghezza della finestra — la tabella sopra
 * i 1024px, le schede sotto. Si vede aprendo la scena da sola e stringendo
 * la finestra, o con l'interruttore Viewport.
 */
export const SogliaDellaPagina: Story = {
  name: 'Soglia della pagina',
  render: () => <Guscio dati={PRODOTTI} />,
}

/**
 * Non esiste ancora nessun prodotto: al posto della tabella,
 * `tassullo-empty-state` con l'azione che crea il primo. La ricerca che non
 * trova niente è un'altra cosa, e la rende la tabella.
 */
export const SenzaProdotti: Story = {
  render: () => <Guscio dati={[]} />,
}
