import {
  memo,
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  BookOpenIcon,
  BoxesIcon,
  BracesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  FolderTreeIcon,
  LanguagesIcon,
  ListChecksIcon,
  ListTreeIcon,
  LogOutIcon,
  NetworkIcon,
  PackageIcon,
  PlusIcon,
  SendIcon,
  SettingsIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from 'lucide-react'

import { apriCol } from '@/prove/apri'
import {
  Albero,
  AlberoConto,
  AlberoLegenda,
  AlberoSegno,
  type AlberoRef,
  type MossaAlbero,
  type NodoAlbero,
  type PostoAlbero,
} from '@/registry/tassullo/blocks/albero'
import { AppShell, ColonnaLaterale, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { BarraSalva } from '@/registry/tassullo/blocks/barra-salva'
import { ConfirmDialog } from '@/registry/tassullo/blocks/confirm-dialog'
import { ElencoDettaglio } from '@/registry/tassullo/blocks/elenco-dettaglio'
import { EmptyState } from '@/registry/tassullo/blocks/empty-state'
import { Campo, type CampoLibero } from '@/registry/tassullo/blocks/form-field'
import { PageHeader } from '@/registry/tassullo/blocks/page-header'
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
import {
  TestoSegnaposto,
  TestoSegnapostoElenco,
  type TestoSegnapostoRef,
  type VoceSegnaposto,
} from '@/registry/tassullo/blocks/testo-segnaposto'
import { Button } from '@/registry/tassullo/ui/button'
import { Card, CardContent } from '@/registry/tassullo/ui/card'
import { Checkbox } from '@/registry/tassullo/ui/checkbox'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/registry/tassullo/ui/combobox'
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '@/registry/tassullo/ui/dropdown-menu'
import { FieldGroup } from '@/registry/tassullo/ui/field'
import { Toaster } from '@/registry/tassullo/ui/sonner'
import { Spinner } from '@/registry/tassullo/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/tassullo/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/registry/tassullo/ui/toggle-group'
import { intero } from '@/registry/tassullo/lib/numeri'

import {
  ALTRE_FAMIGLIE,
  FAMIGLIA,
  SCHEDA,
  SCHEDA_DA_LEGGERE,
  SCHEDA_LUNGA,
  SCHEMA_COMUNE,
  SOSTENIBILITA,
  TITOLI,
  VOCI,
} from './scheda-a-blocchi/dati'
import {
  NOME_LIVELLO,
  bloccoNuovo,
  conta,
  controlla,
  daModello,
  daScrivere,
  datiSconosciuti,
  formaAlbero,
  impronta,
  inOrdine,
  livelliAmmessi,
  nomeBlocco,
  nomeSenzaTitolo,
  riduci,
  salvati,
  statoDa,
  titoliPerLivello,
  titoloContiene,
  trova,
  type Blocco,
  type BloccoModello,
  type ErroriBlocco,
  type FormaBlocco,
  type Livello,
  type Titolo,
  type TitoloBlocco,
  type Voce,
} from './scheda-a-blocchi/struttura'

/**
 * La tab «Testi» della scheda di una famiglia di prodotti, con la scheda
 * tecnica scritta a blocchi: capitoli, sottocapitoli e titoletti che chi
 * scrive aggiunge, sposta ed elimina, ognuno col suo testo. È la pagina da cui
 * partire per una scheda a blocchi in qualunque applicativo.
 *
 * **Cos'è.** Una pagina d'esempio da ricomporre, non un item da installare.
 * Ogni pezzo viene dal registry: il guscio, le tab ferme, `tassullo-elenco-dettaglio`
 * con `tassullo-albero` a sinistra e il blocco scelto a destra,
 * `tassullo-testo-segnaposto` per i testi e per la colonna dei dati,
 * `tassullo-form-field` (`Campo`), `tassullo-empty-state`, `tassullo-barra-salva`,
 * `tassullo-confirm-dialog`, `tassullo-responsive-dialog`. Ciò che resta della
 * pagina è il modo di metterli insieme, e le regole della scheda: stanno nel
 * codice della style guide, in `stories/scheda-a-blocchi/` — `struttura.ts`
 * ha l'albero e lo stato, puri, senza React; `dati.ts` i dati d'esempio.
 *
 * **Quando sì, quando no.** Quando un documento è fatto di parti che chi
 * scrive aggiunge, toglie e riordina, e ogni parte ha un titolo da un elenco
 * fisso e un testo. Per testi a campi fissi, che ci sono sempre e sono sempre
 * quelli, bastano un `Campo` e un testo ciascuno, come nella seconda card.
 *
 * **Com'è fatta.**
 *
 * - Sopra la cornice l'introduzione e «Inserisci un dato», che apre la colonna
 *   «Dati da citare» accanto al contenuto: si stringe il blocco, non l'albero.
 * - A sinistra l'albero: il titolo del documento, quanti blocchi e quanti da
 *   scrivere, le righe annidate col loro segno, «Aggiungi capitolo». Resta
 *   fermo mentre la pagina scorre, e se è più alto della finestra scorre per
 *   conto suo. La legenda dei segni sta nel piede della cornice.
 * - A destra il blocco scelto, uno solo: il percorso dei padri, il titolo, il
 *   livello, il testo, «Elimina il blocco» e i due passi
 *   al blocco prima e dopo, col titolo del blocco d'arrivo.
 * - Sotto la cornice la seconda card, a campi fissi. «Salva» e «Annulla»
 *   stanno in una barra ferma in fondo alla finestra: compare alla prima
 *   modifica, da qualunque punto della pagina, e sparisce se si torna
 *   com'era.
 *
 * **Regole d'uso.**
 *
 * - Un solo campo di testo per tutti i blocchi, con `chiave`: cambiando blocco
 *   il campo non si rimonta, e ogni testo ritrova il suo cursore e il suo
 *   annulla. I testi degli altri blocchi stanno nello stato dell'albero.
 * - I livelli: un capitolo non ha padre, un sottocapitolo sta sotto un
 *   capitolo, un titoletto sotto un capitolo o sotto un sottocapitolo. Il
 *   secondo livello si può saltare: un titoletto messo direttamente sotto un
 *   capitolo pesa come un titoletto, e nell'albero il suo livello è detto.
 *   Sotto «Livello» i livelli che il posto del blocco non ammette sono spenti.
 * - I titoli sono una scelta fissa: la tendina cerca fra quelli dell'elenco,
 *   prima quelli che di solito stanno a quel livello. Il titolo pesa come il
 *   livello del blocco. Un titolo con una frase standard la mette nel testo,
 *   se il testo è vuoto.
 * - Si riordina fra fratelli, trascinando la riga o dal suo menu («Sposta su»,
 *   «Sposta giù»). Il menu aggiunge sottocapitoli e titoletti; il blocco nuovo
 *   diventa quello scelto, col fuoco sul titolo.
 * - Un blocco senza testo né figli si elimina subito; altrimenti si chiede
 *   conferma, dicendo quanti blocchi spariscono. Finché non si salva, «Annulla»
 *   li rimette.
 * - «Da salvare» è un confronto con la scheda salvata: uno spostamento rifatto
 *   al contrario non lascia niente da salvare.
 * - Il salvataggio controlla tutto insieme. Un blocco respinto ha il segno
 *   d'errore nell'albero e il messaggio sotto il testo, e il primo respinto
 *   diventa il blocco scelto, col fuoco in fondo al testo.
 * - Un blocco che cita un dato che la scheda non può citare ha l'avviso
 *   nell'albero anche se nessuno lo tocca: al salvataggio sarebbe respinto.
 * - Un dato cliccato nella colonna va nell'ultimo testo usato, dov'era il
 *   cursore; scegliere un blocco lo fa l'ultimo testo usato. Un testo solo
 *   attraversato col `Tab` non conta.
 * - Una scheda vuota parte dallo schema comune, da un'altra famiglia o da un
 *   capitolo. In sola lettura l'albero non ha menu né riordino, e a destra
 *   titolo e testo si leggono.
 *
 * **Tastiera e accessibilità.** L'albero è una fermata sola del `Tab`: le
 * frecce, `Inizio` e `Fine` passano da una riga all'altra, `Invio` sceglie e
 * porta il fuoco in fondo al testo del blocco. Il menu di riga si raggiunge con
 * un altro `Tab`. Passando al blocco prima o dopo coi due bottoni il fuoco
 * resta sul bottone, e un annuncio dice quale blocco si sta guardando.
 */
const meta = {
  title: 'Pagine/Scheda a blocchi',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      config: {
        rules: [
          // L'elenco dei suggerimenti del testo scorre con le frecce dal testo.
          { id: 'scrollable-region-focusable', enabled: false },
          // Questo elenco sostituisce quello dell'imbracatura, che a popup aperto spegne
          // `aria-hidden-focus` per lo sfondo che Base UI rende inerte: si ripete qui.
          ...(import.meta.env.VITE_POPUP !== 'chiuso' ? [{ id: 'aria-hidden-focus', enabled: false }] : []),
        ],
      },
      // Il bottone che apre la tendina del titolo non ha un nome, come in ogni combobox.
      context: { exclude: ['[data-slot="input-group-button"]'] },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/* ────────────────────────────────────────────────────────────────────────
 * Il guscio e la scheda della famiglia: fascia, tab ferme sotto la fascia.
 * ──────────────────────────────────────────────────────────────────────── */

// Le sezioni col loro nome e le voci in fila, come nella barra di Anagrafe.
const SEZIONI: SezioneNav[] = [
  {
    titolo: 'Riferimenti',
    voci: [
      { titolo: 'Norme', icona: BookOpenIcon, href: '#' },
      { titolo: 'Caratteristiche', icona: ListChecksIcon, href: '#' },
    ],
  },
  {
    titolo: 'Qualifica',
    voci: [
      { titolo: 'Materie prime', icona: BoxesIcon, href: '#' },
      { titolo: 'Prodotti', icona: PackageIcon, href: '#' },
    ],
  },
  {
    titolo: 'Classificazione',
    voci: [
      { titolo: 'Famiglie TDS', icona: FolderTreeIcon, href: '#', attiva: true },
      { titolo: 'Sistemi', icona: NetworkIcon, href: '#' },
    ],
  },
  {
    titolo: 'Distribuzione',
    voci: [
      { titolo: 'Traduzioni', icona: LanguagesIcon, href: '#' },
      { titolo: 'Pubblicazioni', icona: SendIcon, href: '#' },
    ],
  },
  { voci: [{ titolo: 'Admin', icona: ShieldIcon, href: '#' }], className: 'mt-auto' },
]

const UTENTE = { nome: 'Stefano', cognome: 'Bertolini', email: 'sbertolini@esempio.it', ruolo: 'Admin' }

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

type Opzioni = {
  /** I blocchi con cui la scheda si apre. */
  blocchi: BloccoModello[]
  /** Chi guarda può scrivere la scheda. */
  scrive?: boolean
  /** La colonna «Dati da citare» è aperta all'apertura. */
  colonna?: boolean
  /** La cornice più stretta di 576px: l'albero sta sopra, il blocco sotto. */
  stretta?: boolean
}

const TAB = [
  { value: 'anagrafica', titolo: 'Anagrafica' },
  { value: 'articoli', titolo: 'Articoli' },
  { value: 'testi', titolo: 'Testi' },
  { value: 'documenti', titolo: 'Documenti' },
]

function Pagina(opzioni: Opzioni) {
  return (
    <AppShell applicazione="Anagrafe" sezioni={SEZIONI} utente={UTENTE} azioniUtente={AZIONI_UTENTE}>
      <SchedaFamiglia {...opzioni} />
      <Toaster />
    </AppShell>
  )
}

// Le tab ferme sotto la fascia, come in `Blocchi/App Shell › Scheda Lunga`. La
// tab «Testi» resta montata quando non si vede (`keepMounted`): un testo non
// salvato non si perde cambiando tab.
function SchedaFamiglia(opzioni: Opzioni) {
  const [tab, setTab] = useState('testi')
  const radice = useRef<HTMLDivElement>(null)
  const fasciaTab = useRef<HTMLDivElement>(null)

  function cambia(valore: string) {
    const r = radice.current?.getBoundingClientRect()
    const f = fasciaTab.current?.getBoundingClientRect()
    // Con le tab già ferme, la finestra torna all'inizio del pannello.
    if (r && f && r.top < f.top) window.scrollBy({ top: r.top - f.top, behavior: 'instant' })
    setTab(valore)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader percorso={[{ titolo: 'Famiglie TDS', href: '#' }, { titolo: FAMIGLIA }]} />
      <Tabs ref={radice} value={tab} onValueChange={(v) => cambia(String(v))}>
        <div
          ref={fasciaTab}
          data-slot="fascia-tab"
          className="sticky top-12 z-10 -mx-4 bg-background px-4 py-2 [html:has(&)]:scroll-pt-24"
        >
          <TabsList aria-label="Sezioni">
            {TAB.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.titolo}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {TAB.filter((t) => t.value !== 'testi').map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <Card>
              <CardContent>
                <p className="text-sm text-muted-foreground">La sezione «{t.titolo}» della famiglia.</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
        <TabsContent value="testi" keepMounted>
          <TabTesti {...opzioni} visibile={tab === 'testi'} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * La tab «Testi»: l'introduzione, «Inserisci un dato», la scheda a blocchi,
 * la card a campi fissi, «Salva» e «Annulla», la colonna «Dati da citare».
 * ──────────────────────────────────────────────────────────────────────── */

/** Com'è finito il salvataggio della scheda a blocchi: `intatta` se non c'era niente da salvare. */
type EsitoStruttura = 'intatta' | 'salvata' | 'respinta'

/** Ciò che la tab chiama da «Salva» e da «Annulla». */
type SchedaBlocchiRef = {
  salva: () => EsitoStruttura
  annulla: () => void
}

// I tasti che da soli non sono un gesto: `Maiusc` prima di `Maiusc+Tab`.
const MODIFICATORI = new Set(['Shift', 'Control', 'Alt', 'Meta'])

/** Il tempo di un salvataggio, che qui non va da nessuna parte: i campi stanno fermi intanto. */
const attesa = (ms: number) => new Promise((fatto) => setTimeout(fatto, ms))

function TabTesti({ blocchi, scrive = true, colonna = false, stretta = false, visibile }: Opzioni & { visibile: boolean }) {
  const [colonnaAperta, setColonnaAperta] = useState(colonna)
  // Il gruppo scelto e la ricerca dell'elenco stanno qui, non nella colonna: la
  // colonna si smonta a ogni chiusura, e li perderebbe.
  const [gruppo, setGruppo] = useState<string | null>(null)
  const [ricerca, setRicerca] = useState('')
  const bottoneColonna = useRef<HTMLButtonElement>(null)
  const idColonna = useId()
  const fuocoAllaColonna = useRef(false)

  const scheda = useRef<SchedaBlocchiRef>(null)
  const [schedaSporca, setSchedaSporca] = useState(false)
  const [inCorso, setInCorso] = useState(false)

  // I testi a campi fissi: ciò che si vede, ciò che è salvato, gli errori del salvataggio.
  const iniziali = useMemo(() => Object.fromEntries(SOSTENIBILITA.map((s) => [s.sezione, s.testo])), [])
  const [valori, setValori] = useState<Record<string, string>>(iniziali)
  const [salvatiSezioni, setSalvatiSezioni] = useState<Record<string, string>>(iniziali)
  const [erroriSezioni, setErroriSezioni] = useState<Record<string, string[]>>({})
  const sezioniSporche = SOSTENIBILITA.some((s) => valori[s.sezione] !== salvatiSezioni[s.sezione])
  const sporco = schedaSporca || sezioniSporche

  const citabili = useMemo(() => new Set(VOCI.map((v) => v.testo)), [])

  // ── L'ultimo testo usato: lì va il dato cliccato nella colonna ─────────────
  // Ogni campo consegna la sua maniglia quando prende il fuoco. Chi va alla
  // colonna con `Tab` attraversa gli altri campi: un campo in cui il fuoco entra
  // con `Tab` ed esce con `Tab` nello stesso verso, senza un altro gesto in
  // mezzo, è solo di passaggio, e l'ultimo usato torna quello di prima.
  const maniglie = useRef<Record<string, TestoSegnapostoRef>>({})
  const ultimo = useRef<string | null>(null)
  const conTab = useRef<'avanti' | 'indietro' | null>(null)
  const diPassaggio = useRef<{ nome: string; prima: string | null; verso: 'avanti' | 'indietro' } | null>(null)
  useEffect(() => {
    function gesto() {
      conTab.current = null
      diPassaggio.current = null
    }
    function tasto(evento: KeyboardEvent) {
      if (evento.key === 'Tab') conTab.current = evento.shiftKey ? 'indietro' : 'avanti'
      else if (!MODIFICATORI.has(evento.key)) gesto()
    }
    document.addEventListener('keydown', tasto, true)
    document.addEventListener('pointerdown', gesto, true)
    return () => {
      document.removeEventListener('keydown', tasto, true)
      document.removeEventListener('pointerdown', gesto, true)
    }
  }, [])
  const usato = useMemo<TestoUsato>(
    () => ({
      onFuoco: (nome, campo) => {
        maniglie.current[nome] = campo
        diPassaggio.current = conTab.current ? { nome, prima: ultimo.current, verso: conTab.current } : null
        ultimo.current = nome
      },
      onLascia: (nome) => {
        const passaggio = diPassaggio.current
        if (passaggio?.nome !== nome) return
        diPassaggio.current = null
        if (passaggio.verso === conTab.current) ultimo.current = passaggio.prima
      },
      // Un testo che non c'è più (il blocco è stato eliminato) non è l'ultimo usato.
      onSmontato: (nome) => {
        delete maniglie.current[nome]
        if (ultimo.current === nome) ultimo.current = null
        if (diPassaggio.current?.nome === nome) diPassaggio.current = null
      },
    }),
    []
  )
  function inserisci(voce: VoceSegnaposto) {
    const campo = ultimo.current ? maniglie.current[ultimo.current] : undefined
    if (!campo) {
      toast('Metti prima il cursore nel testo, nel punto dove va il dato.')
      return
    }
    campo.inserisci(voce.testo)
  }

  async function salva() {
    if (!sporco) return
    setInCorso(true)
    await attesa(600)
    try {
      // I testi a campi fissi, uno per uno: uno respinto non ferma gli altri.
      let respinte = 0
      const errori: Record<string, string[]> = {}
      const salvate: Record<string, string> = {}
      for (const s of SOSTENIBILITA) {
        if (valori[s.sezione] === salvatiSezioni[s.sezione]) continue
        const sconosciuti = datiSconosciuti(valori[s.sezione], citabili)
        if (sconosciuti.length > 0) {
          errori[s.sezione] = sconosciuti.map((scritto) => `${scritto}: non è fra i dati che questa scheda può citare.`)
          respinte++
        } else salvate[s.sezione] = valori[s.sezione]
      }
      setErroriSezioni(errori)
      setSalvatiSezioni((prima) => ({ ...prima, ...salvate }))
      // Poi la scheda a blocchi, tutta insieme: i suoi errori li mostra lei.
      const esito = scheda.current?.salva() ?? 'intatta'
      if (esito === 'respinta') respinte++
      if (respinte === 0) toast.success('Testi salvati.')
    } finally {
      setInCorso(false)
    }
  }

  function annulla() {
    setValori(salvatiSezioni)
    setErroriSezioni({})
    scheda.current?.annulla()
  }

  return (
    <div className={stretta ? 'flex max-w-xl flex-col gap-4' : 'flex flex-col gap-4'}>
      {/* Il bottone sta a sinistra, sotto l'introduzione: in una finestra stretta la
          colonna sta sopra la parte destra dei testi, e lì lo coprirebbe. */}
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted-foreground">
          {scrive ? (
            <>
              I valori non si scrivono a mano: si citano. Scrivi <code className="font-mono">{'{{'}</code> e scegli il dato,
              oppure apri «Inserisci un dato». Un dato col bordo tratteggiato oggi non ha un valore: si può citare lo
              stesso. Un dato rosso non si può citare in questa scheda, e il testo non si salva.
            </>
          ) : (
            <>
              I valori citati in questi testi vengono dall'archivio. Un dato col bordo tratteggiato oggi non ha un valore;
              uno rosso non si può citare in questa scheda.
            </>
          )}
        </p>
        {scrive ? (
          <Button
            ref={bottoneColonna}
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={colonnaAperta}
            aria-controls={colonnaAperta ? idColonna : undefined}
            onClick={() => {
              fuocoAllaColonna.current = !colonnaAperta
              setColonnaAperta(!colonnaAperta)
            }}
          >
            <BracesIcon data-icon="inline-start" />
            Inserisci un dato
          </Button>
        ) : null}
      </div>
      <form
        className="flex min-w-0 flex-col gap-4"
        noValidate
        onSubmit={(evento) => {
          evento.preventDefault()
          void salva()
        }}
      >
        <SchedaBlocchi
          ref={scheda}
          iniziali={blocchi}
          scrive={scrive}
          fermo={inCorso}
          citabili={citabili}
          usato={usato}
          onSporco={setSchedaSporca}
        />
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold">Scheda di sostenibilità</h2>
            {!scrive ? (
              <p className="text-sm text-muted-foreground">Questi testi li scrive un altro ufficio: qui si leggono.</p>
            ) : null}
            <FieldGroup>
              {SOSTENIBILITA.map((s) => (
                <Campo key={s.sezione} etichetta={s.etichetta} errore={erroriSezioni[s.sezione]}>
                  {(campo) => (
                    <TestoSegnaposto
                      {...campo}
                      voci={VOCI}
                      value={valori[s.sezione]}
                      readOnly={!scrive}
                      disabled={scrive && inCorso}
                      onChange={(testo) => {
                        setValori((prima) => ({ ...prima, [s.sezione]: testo }))
                        setErroriSezioni((prima) => ({ ...prima, [s.sezione]: [] }))
                      }}
                      onFocus={(questo) => usato.onFuoco(s.sezione, questo)}
                      onBlur={() => usato.onLascia(s.sezione)}
                    />
                  )}
                </Campo>
              ))}
            </FieldGroup>
          </CardContent>
        </Card>
        {/* In fondo al modulo, come ultimo figlio: la barra sta ferma in fondo alla finestra. */}
        <BarraSalva sporco={sporco} inCorso={inCorso} onAnnulla={annulla} />
      </form>
      {/* Fuori dal `form`: `Invio` nella ricerca non salva. Solo con la tab in vista: la
          colonna la rende il guscio, fuori dal pannello, e resterebbe accanto alle altre tab. */}
      {scrive && colonnaAperta && visibile ? (
        <ColonnaDati
          id={idColonna}
          gruppo={gruppo}
          onGruppo={setGruppo}
          ricerca={ricerca}
          onRicerca={setRicerca}
          fermo={inCorso}
          onMontata={(titolo) => {
            if (!fuocoAllaColonna.current) return
            fuocoAllaColonna.current = false
            titolo?.focus({ preventScroll: true })
          }}
          onScegli={inserisci}
          onChiudi={() => {
            setColonnaAperta(false)
            bottoneColonna.current?.focus()
          }}
        />
      ) : null}
    </div>
  )
}

// La `ColonnaLaterale` del guscio: la dichiara la tab, la rende il guscio accanto
// al contenuto, ferma sotto la fascia mentre la pagina scorre.
function ColonnaDati({
  id,
  gruppo,
  onGruppo,
  ricerca,
  onRicerca,
  fermo,
  onMontata,
  onScegli,
  onChiudi,
}: {
  id: string
  gruppo: string | null
  onGruppo: (gruppo: string | null) => void
  ricerca: string
  onRicerca: (ricerca: string) => void
  fermo: boolean
  onMontata: (titolo: HTMLElement | null) => void
  onScegli: (voce: VoceSegnaposto) => void
  onChiudi: () => void
}) {
  const titolo = useRef<HTMLHeadingElement>(null)
  const montata = useEffectEvent(onMontata)
  useEffect(() => montata(titolo.current), [])
  return (
    <ColonnaLaterale id={id} etichetta="Dati da citare">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 ref={titolo} tabIndex={-1} className="text-base font-medium outline-none">
            Dati da citare
          </h2>
          <p className="text-sm text-muted-foreground">
            Coi valori di oggi di {FAMIGLIA}. Clicca un dato: va nell'ultimo testo usato, dov'era il cursore. Oppure
            trascinalo nel testo.
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Chiudi" onClick={onChiudi}>
          <XIcon />
        </Button>
      </div>
      <TestoSegnapostoElenco
        voci={VOCI}
        onScegli={onScegli}
        gruppo={gruppo}
        onGruppo={onGruppo}
        ricerca={ricerca}
        onRicerca={onRicerca}
        disabled={fermo}
        className="flex-1"
      />
    </ColonnaLaterale>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * La scheda a blocchi: la cornice con l'albero e il blocco scelto.
 * ──────────────────────────────────────────────────────────────────────── */

/** I tre gesti dell'«ultimo testo usato», fermi: il nome di un testo è la sua chiave. */
type TestoUsato = {
  onFuoco: (nome: string, campo: TestoSegnapostoRef) => void
  onLascia: (nome: string) => void
  onSmontato: (nome: string) => void
}

type PropsScheda = {
  iniziali: BloccoModello[]
  scrive: boolean
  /** Un salvataggio è in corso: i campi sono fermi. */
  fermo: boolean
  citabili: ReadonlySet<string>
  usato: TestoUsato
  onSporco: (sporco: boolean) => void
  ref?: Ref<SchedaBlocchiRef>
}

function SchedaBlocchi(props: PropsScheda) {
  return props.scrive ? <BlocchiDaScrivere {...props} /> : <BlocchiDaLeggere {...props} />
}

// I titoli dei tre livelli, sotto il titolo dell'albero (un `h2`): pesano come le righe
// dell'albero e scendono di misura.
const INTESTAZIONE = { 1: 'h3', 2: 'h4', 3: 'h5' } as const
const CLASSE_INTESTAZIONE: Record<Livello, string> = {
  1: 'text-lg font-semibold',
  2: 'text-base font-semibold',
  3: 'text-sm font-semibold',
}
// Nella tendina il titolo pesa come nell'albero: il peso passa al campo per eredità.
const CLASSE_TENDINA: Record<Livello, string> = { 1: 'font-semibold', 2: 'font-medium', 3: '' }
// Chi prende il fuoco da qui può essere fuori dalla finestra: si porta in vista sotto la
// fascia e le tab, con un po' d'aria sotto.
const CLASSE_BLOCCO = 'flex min-w-0 flex-col gap-4 scroll-mb-8 outline-none'

// Porta in vista un elemento sotto la fascia e le tab. Se è più alto dello spazio che resta
// (densità touch, un testo lungo) si allinea la sua testa: allineato al fondo, titolo e
// livello finirebbero dietro le tab.
function portaInVista(elemento: HTMLElement | null) {
  if (!elemento) return
  const stile = getComputedStyle(elemento)
  const sopra = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  const margini = sopra + (parseFloat(stile.scrollMarginTop) || 0) + (parseFloat(stile.scrollMarginBottom) || 0)
  const entra = elemento.getBoundingClientRect().height + margini <= window.innerHeight
  elemento.scrollIntoView({ block: entra ? 'nearest' : 'start' })
}

// Ciò che l'albero mostra dei blocchi. Resta lo stesso oggetto finché non cambia qualcosa che
// si vede (un titolo, un livello, un segno, l'ordine): scrivendo un testo l'albero non si ridisegna.
function useForma(albero: readonly Blocco[], errori: Readonly<Record<string, unknown>>, citabili: ReadonlySet<string>) {
  const scritta = JSON.stringify(formaAlbero(albero, errori, citabili))
  return useMemo(() => JSON.parse(scritta) as FormaBlocco[], [scritta])
}

// Dice a chi non vede qual è il blocco scelto, ogni volta che cambia: passando al blocco prima
// o dopo coi due bottoni il fuoco resta sul bottone, e a video cambia solo ciò che gli sta sopra.
function Annuncio({ voci, posto }: { voci: Voce[]; posto: number }) {
  const blocco = voci[posto]?.blocco
  return (
    <p role="status" className="sr-only">
      {blocco
        ? `${nomeBlocco(blocco)}: ${NOME_LIVELLO[blocco.livello].toLowerCase()}, blocco ${intero(posto + 1)} di ${intero(voci.length)}`
        : ''}
    </p>
  )
}

// ── In sola lettura ──────────────────────────────────────────────────────────

function BlocchiDaLeggere({ iniziali, citabili, usato }: PropsScheda) {
  const albero = useMemo(() => salvati(iniziali), [iniziali])
  const voci = useMemo(() => inOrdine(albero), [albero])
  const forma = useForma(albero, {}, citabili)
  const [scelta, setScelta] = useState<string | null>(null)
  const i = Math.max(0, voci.findIndex((v) => v.blocco.chiave === scelta))
  const voce = voci.at(i)
  // Scelto dall'albero, il blocco prende il fuoco: dopo la resa, quando porta già il nome nuovo.
  const blocco = useRef<HTMLDivElement>(null)
  const daMostrare = useRef(false)
  useEffect(() => {
    if (!daMostrare.current) return
    daMostrare.current = false
    blocco.current?.focus({ preventScroll: true })
    portaInVista(blocco.current)
  })
  const scegli = useCallback((chiave: string) => {
    daMostrare.current = true
    setScelta(chiave)
  }, [])

  if (!voce) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Scheda tecnica</h2>
          <p className="text-sm text-muted-foreground">Questi testi li scrive un altro ufficio, e non ci sono ancora.</p>
        </CardContent>
      </Card>
    )
  }
  const { chiave, livello, titolo, testo } = voce.blocco
  const Intestazione = INTESTAZIONE[livello]
  return (
    <ElencoDettaglio
      sotto="fascia-e-tab"
      elenco={
        <AlberoBlocchi
          nota="Questi testi li scrive un altro ufficio: qui si leggono."
          forma={forma}
          scelto={chiave}
          onScegli={scegli}
        />
      }
      piede={<LegendaBlocchi errori={false} />}
    >
      <div
        ref={blocco}
        role="group"
        aria-label={`${NOME_LIVELLO[livello]}: ${nomeBlocco(voce.blocco)}`}
        tabIndex={-1}
        className={CLASSE_BLOCCO}
      >
        <Percorso voce={voce} />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{NOME_LIVELLO[livello]}</span>
          <Intestazione className={CLASSE_INTESTAZIONE[livello]}>{titolo?.titolo}</Intestazione>
        </div>
        {testo ? (
          <TestoSegnaposto
            voci={VOCI}
            chiave={chiave}
            value={testo}
            readOnly
            etichetta={`Testo di «${titolo?.titolo ?? ''}»`}
            onFocus={(questo) => usato.onFuoco(chiave, questo)}
            onBlur={() => usato.onLascia(chiave)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {voce.blocco.figli.length > 0 ? 'Questo blocco non ha un testo suo: contiene altri blocchi.' : 'Ancora senza testo.'}
          </p>
        )}
        <div className="flex justify-end">
          <Passi prima={voci[i - 1]?.blocco} dopo={voci[i + 1]?.blocco} onScegli={setScelta} />
        </div>
        <Annuncio voci={voci} posto={i} />
      </div>
    </ElencoDettaglio>
  )
}

// ── La scheda che si scrive ──────────────────────────────────────────────────

function BlocchiDaScrivere({ iniziali, fermo, citabili, usato, onSporco, ref }: PropsScheda) {
  const [stato, dispatch] = useReducer(riduci, iniziali, (modello) => statoDa(salvati(modello)))
  const perLivello = useMemo(
    () => ({ 1: titoliPerLivello(TITOLI, 1), 2: titoliPerLivello(TITOLI, 2), 3: titoliPerLivello(TITOLI, 3) }),
    []
  )

  const salvata = useMemo(() => impronta(stato.base), [stato.base])
  const sporco = useMemo(() => impronta(stato.albero) !== salvata, [stato.albero, salvata])
  const diLo = useEffectEvent(onSporco)
  useEffect(() => diLo(sporco), [sporco])

  const [leggendoSchema, setLeggendoSchema] = useState(false)
  const [copia, setCopia] = useState(false)
  // Il blocco di cui si chiede conferma: resta scritto mentre il dialogo si chiude.
  const [daEliminare, setDaEliminare] = useState<{ chiave: string; titolo: string; descrizione: string } | null>(null)
  const [conferma, setConferma] = useState(false)

  useImperativeHandle(ref, () => ({
    salva: () => {
      if (!sporco) return 'intatta'
      const errori = controlla(stato.albero, citabili)
      if (Object.keys(errori).length > 0) {
        dispatch({ tipo: 'respinta', errori })
        return 'respinta'
      }
      dispatch({ tipo: 'salvata' })
      return 'salvata'
    },
    annulla: () => dispatch({ tipo: 'annulla' }),
  }))

  // Il titolo di un blocco cambia: con lui parte la frase standard del titolo nuovo e
  // quella del titolo di prima, che decidono se il testo va cambiato.
  const albero = useRef(stato.albero)
  useEffect(() => {
    albero.current = stato.albero
  })
  const scegliTitolo = useCallback((chiave: string, titolo: TitoloBlocco | null) => {
    const fraseDi = (id: number | undefined) => TITOLI.find((t) => t.id === id)?.frase ?? null
    const prima = trova(albero.current, chiave)?.titolo
    dispatch({ tipo: 'titolo', chiave, titolo, frase: fraseDi(titolo?.id), frasePrima: fraseDi(prima?.id) })
  }, [])

  // Senza testo né figli non c'è niente da perdere: il blocco si toglie subito. Sennò si chiede.
  const elimina = useCallback((chiave: string) => {
    const blocco = trova(albero.current, chiave)
    if (!blocco) return
    if (daScrivere(blocco)) return dispatch({ tipo: 'togli', chiave })
    const quanti = conta(blocco)
    const dentro = quanti - 1
    setDaEliminare({
      chiave,
      titolo: blocco.titolo
        ? `Eliminare «${blocco.titolo.titolo}»?`
        : `Eliminare questo ${NOME_LIVELLO[blocco.livello].toLowerCase()}?`,
      descrizione:
        (dentro === 0
          ? 'Sparisce questo blocco, col suo testo.'
          : `Spariscono ${intero(quanti)} blocchi: questo e ${dentro === 1 ? 'quello che contiene' : `i ${intero(dentro)} che contiene`}, coi loro testi.`) +
        ' Finché non salvi, «Annulla» li rimette.',
    })
    setConferma(true)
  }, [])

  async function partiDalloSchema() {
    setLeggendoSchema(true)
    await attesa(400)
    dispatch({ tipo: 'carica', blocchi: daModello(SCHEMA_COMUNE, false) })
    setLeggendoSchema(false)
  }

  const azioni = useMemo<AzioniAlbero>(
    () => ({
      onAggiungi: (padre, livello) => dispatch({ tipo: 'aggiungi', padre, blocco: bloccoNuovo(livello) }),
      onSposta: (mossa) => dispatch({ tipo: 'sposta', chiave: mossa.id, indice: mossa.indice }),
      onElimina: elimina,
    }),
    [elimina]
  )
  const scegli = useCallback((chiave: string, fuoco: 'testo' | null = 'testo') => dispatch({ tipo: 'scegli', chiave, fuoco }), [])
  const cambiaLivello = useCallback((chiave: string, livello: Livello) => dispatch({ tipo: 'livello', chiave, livello }), [])
  const scriviTesto = useCallback((chiave: string, testo: string) => dispatch({ tipo: 'testo', chiave, testo }), [])
  const datoIlFuoco = useCallback(() => dispatch({ tipo: 'fuocoDato' }), [])

  const voci = useMemo(() => inOrdine(stato.albero), [stato.albero])
  const forma = useForma(stato.albero, stato.errori, citabili)
  // Il campo del titolo del blocco scelto: dopo «Aggiungi…» dal menu di una riga il fuoco va lì.
  const inputTitolo = useRef<HTMLInputElement>(null)
  const campoTitolo = useCallback(() => inputTitolo.current, [])
  // Il fuoco alla riga scelta: chi l'aveva (il menu della riga, «Elimina il blocco», un bottone
  // dello stato vuoto) non c'è più.
  const alberoRef = useRef<AlberoRef>(null)
  useEffect(() => {
    if (stato.fuoco !== 'riga') return
    alberoRef.current?.focus(stato.scelto ?? undefined)
    datoIlFuoco()
  }, [stato.fuoco, stato.scelto, datoIlFuoco])
  const posto = voci.findIndex((v) => v.blocco.chiave === stato.scelto)
  const voce = voci.at(posto)
  const occupato = fermo || leggendoSchema

  return (
    <>
      {!voce ? (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold">Scheda tecnica</h2>
            <EmptyState
              icona={<ListTreeIcon />}
              titolo="La scheda tecnica non ha ancora testi"
              descrizione="Parti dai capitoli più comuni, copia la struttura di un’altra famiglia, oppure aggiungi i capitoli uno per uno."
              azione={
                <>
                  <Button type="button" disabled={occupato} onClick={() => void partiDalloSchema()}>
                    {leggendoSchema ? <Spinner data-icon="inline-start" /> : <ListTreeIcon data-icon="inline-start" />}
                    Parti dallo schema comune
                  </Button>
                  <Button type="button" variant="outline" disabled={occupato} onClick={() => setCopia(true)}>
                    <CopyIcon data-icon="inline-start" />
                    Copia da un’altra famiglia
                  </Button>
                  <Button type="button" variant="outline" disabled={occupato} onClick={() => azioni.onAggiungi(null, 1)}>
                    <PlusIcon data-icon="inline-start" />
                    Aggiungi capitolo
                  </Button>
                </>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <ElencoDettaglio
          sotto="fascia-e-tab"
          elenco={
            <AlberoBlocchi
              albero={alberoRef}
              forma={forma}
              scelto={stato.scelto}
              onScegli={scegli}
              azioni={azioni}
              campoTitolo={campoTitolo}
              fermo={occupato}
            />
          }
          piede={<LegendaBlocchi errori />}
        >
          <BloccoScelto
            voce={voce}
            prima={voci[posto - 1]?.blocco}
            dopo={voci[posto + 1]?.blocco}
            errori={stato.errori[voce.blocco.chiave]}
            fuoco={stato.fuoco === 'riga' ? null : stato.fuoco}
            fermo={occupato}
            titoli={perLivello[voce.blocco.livello]}
            inputTitolo={inputTitolo}
            usato={usato}
            onScegli={scegli}
            onTitolo={scegliTitolo}
            onLivello={cambiaLivello}
            onTesto={scriviTesto}
            onElimina={elimina}
            onFuocoDato={datoIlFuoco}
          />
          <Annuncio voci={voci} posto={posto} />
        </ElencoDettaglio>
      )}
      <ConfirmDialog
        aperto={conferma}
        onApertoChange={setConferma}
        titolo={daEliminare?.titolo ?? ''}
        descrizione={daEliminare?.descrizione}
        conferma="Elimina"
        tono="distruttivo"
        onConferma={() => {
          if (daEliminare) dispatch({ tipo: 'togli', chiave: daEliminare.chiave })
          setConferma(false)
        }}
      />
      {copia ? (
        <DialogoCopia
          onChiudi={() => setCopia(false)}
          onCopia={(blocchi) => {
            dispatch({ tipo: 'carica', blocchi })
            setCopia(false)
          }}
        />
      ) : null}
    </>
  )
}

/** Il percorso dei padri, dal documento in giù: dice dov'è il blocco scelto. */
function Percorso({ voce }: { voce: Voce }) {
  return <p className="text-sm text-muted-foreground">{['Scheda tecnica', ...voce.antenati.map(nomeBlocco)].join(' › ')}</p>
}

/** I due passi al blocco prima e dopo nell'ordine di stampa, col titolo del blocco di arrivo. */
function Passi({
  prima,
  dopo,
  onScegli,
}: {
  prima: Blocco | undefined
  dopo: Blocco | undefined
  onScegli: (chiave: string) => void
}) {
  // Agli estremi il bottone è spento ma tiene il fuoco: chi scorre i blocchi da tastiera non lo perde all'ultimo.
  return (
    <div className="flex min-w-0 flex-wrap justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={!prima}
        focusableWhenDisabled
        aria-label={prima ? `Blocco precedente: ${nomeBlocco(prima)}` : 'Blocco precedente'}
        className="max-w-56 min-w-0"
        onClick={() => prima && onScegli(prima.chiave)}
      >
        <ChevronLeftIcon data-icon="inline-start" />
        <span className="truncate">{prima ? nomeBlocco(prima) : 'Precedente'}</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={!dopo}
        focusableWhenDisabled
        aria-label={dopo ? `Blocco successivo: ${nomeBlocco(dopo)}` : 'Blocco successivo'}
        className="max-w-56 min-w-0"
        onClick={() => dopo && onScegli(dopo.chiave)}
      >
        <span className="truncate">{dopo ? nomeBlocco(dopo) : 'Successivo'}</span>
        <ChevronRightIcon data-icon="inline-end" />
      </Button>
    </div>
  )
}

// Il campo del testo è uno solo in tutta la scheda e non si rimonta: con `chiave` mostra il
// testo del blocco scelto, e l'annulla di un testo non porta indietro quello di un altro. La
// tendina del titolo si monta da capo a ogni blocco scelto (`key`). Il resto resta montato: chi
// scorre i blocchi con «successivo» tiene il fuoco sul bottone.
function BloccoScelto({
  voce,
  prima,
  dopo,
  errori,
  fuoco,
  fermo,
  titoli,
  inputTitolo,
  usato,
  onScegli,
  onTitolo,
  onLivello,
  onTesto,
  onElimina,
  onFuocoDato,
}: {
  voce: Voce
  prima: Blocco | undefined
  dopo: Blocco | undefined
  errori: ErroriBlocco | undefined
  /** Il campo che deve prendere il fuoco: il titolo di un blocco nuovo, il testo di uno scelto dall'albero. */
  fuoco: 'titolo' | 'testo' | null
  fermo: boolean
  /** I titoli nell'ordine della tendina, per il livello del blocco. */
  titoli: Titolo[]
  inputTitolo: RefObject<HTMLInputElement | null>
  usato: TestoUsato
  /** Passa a un altro blocco: coi due passi il fuoco resta sul bottone (`null`). */
  onScegli: (chiave: string, fuoco: 'testo' | null) => void
  onTitolo: (chiave: string, titolo: TitoloBlocco | null) => void
  onLivello: (chiave: string, livello: Livello) => void
  onTesto: (chiave: string, testo: string) => void
  onElimina: (chiave: string) => void
  onFuocoDato: () => void
}) {
  const { blocco, padre } = voce
  const { chiave, livello } = blocco
  const radice = useRef<HTMLDivElement>(null)
  // Il campo del testo, da quando è pronto (e di nuovo se viene rifatto).
  const [testo, setTesto] = useState<TestoSegnapostoRef | null>(null)
  const ammessi = livelliAmmessi(blocco, padre)

  // Scegliere un blocco lo fa «l'ultimo testo usato»: il dato cliccato nella colonna va qui
  // (in fondo, se nel testo il cursore non è mai stato).
  useEffect(() => {
    if (testo) usato.onFuoco(chiave, testo)
  }, [testo, usato, chiave])

  useEffect(() => {
    // Un campo fermo (si sta salvando) non prende il fuoco: aspetta che riparta.
    if (!fuoco || fermo) return
    if (fuoco === 'titolo') inputTitolo.current?.focus()
    // Il campo del testo non è ancora pronto: l'effetto riparte quando lo è.
    else if (!testo) return
    // Il cursore va in fondo senza scorrere fin lì: in vista va la testa del blocco.
    else testo.focus('fine', { scorri: false })
    portaInVista(radice.current)
    onFuocoDato()
  }, [fuoco, fermo, testo, inputTitolo, onFuocoDato])

  // Il testo di un blocco che non è più quello scelto non è più «l'ultimo testo usato».
  useEffect(() => () => usato.onSmontato(chiave), [usato, chiave])

  return (
    <div ref={radice} className={CLASSE_BLOCCO}>
      <Percorso voce={voce} />
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-56 flex-1">
          <Campo etichetta="Titolo" errore={errori?.titolo}>
            {(riga) => (
              <SceltaTitolo
                key={chiave}
                campo={riga}
                riferimento={inputTitolo}
                className={CLASSE_TENDINA[livello]}
                titoli={titoli}
                valore={blocco.titolo}
                fermo={fermo}
                onScegli={(titolo) => onTitolo(chiave, titolo)}
              />
            )}
          </Campo>
        </div>
        <div>
          <Campo etichetta="Livello">
            {(riga, { idEtichetta }) => (
              <ToggleGroup
                id={riga.id}
                aria-labelledby={idEtichetta}
                variant="outline"
                spacing={0}
                value={[String(livello)]}
                disabled={fermo}
                onValueChange={(scelti) => {
                  // Un livello c'è sempre: il clic su quello scelto non lo toglie.
                  const nuovo = Number(scelti[0]) as Livello
                  if (scelti.length === 1 && nuovo !== livello) onLivello(chiave, nuovo)
                }}
              >
                {([1, 2, 3] as const).map((l) => (
                  <ToggleGroupItem key={l} value={String(l)} disabled={!ammessi.includes(l)}>
                    {NOME_LIVELLO[l]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          </Campo>
        </div>
      </div>
      <Campo etichetta="Testo" errore={errori?.testo}>
        {(riga) => (
          <TestoSegnaposto
            {...riga}
            voci={VOCI}
            chiave={chiave}
            righe={9}
            value={blocco.testo}
            disabled={fermo}
            onPronto={setTesto}
            onChange={(scritto) => onTesto(chiave, scritto)}
            onFocus={(questo) => usato.onFuoco(chiave, questo)}
            onBlur={() => usato.onLascia(chiave)}
          />
        )}
      </Campo>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="destructive-ghost" disabled={fermo} onClick={() => onElimina(chiave)}>
          <Trash2Icon data-icon="inline-start" />
          Elimina il blocco
        </Button>
        <Passi prima={prima} dopo={dopo} onScegli={(arrivo) => onScegli(arrivo, null)} />
      </div>
    </div>
  )
}

/** La tendina dei titoli: cerca scrivendo fra quelli dell'elenco. I titoli sono una scelta fissa. */
function SceltaTitolo({
  campo,
  riferimento,
  className,
  titoli,
  valore,
  fermo,
  onScegli,
}: {
  campo: CampoLibero
  riferimento: Ref<HTMLInputElement>
  className?: string
  titoli: Titolo[]
  valore: TitoloBlocco | null
  fermo: boolean
  /** Il titolo scelto; `null` se il campo è stato svuotato. */
  onScegli: (titolo: TitoloBlocco | null) => void
}) {
  const voci = useMemo<TitoloBlocco[]>(() => titoli.map(({ id, titolo }) => ({ id, titolo })), [titoli])
  return (
    <Combobox
      items={voci}
      value={valore}
      onValueChange={(v) => onScegli((v as TitoloBlocco | null) ?? null)}
      itemToStringLabel={(v: TitoloBlocco) => v.titolo}
      isItemEqualToValue={(a: TitoloBlocco, b: TitoloBlocco) => a.id === b.id}
      filter={(v: TitoloBlocco, cercato) => titoloContiene(v.titolo, cercato)}
      autoHighlight
      disabled={fermo}
    >
      <ComboboxInput
        {...campo}
        ref={riferimento}
        placeholder="Scegli un titolo"
        className={className ? `min-w-0 flex-1 ${className}` : 'min-w-0 flex-1'}
        disabled={fermo}
        // `Invio` sceglie la voce: non deve anche salvare la tab.
        onKeyDown={(evento) => {
          if (evento.key === 'Enter') evento.preventDefault()
        }}
      />
      <ComboboxContent>
        <ComboboxEmpty>Nessun titolo con questo nome.</ComboboxEmpty>
        <ComboboxList>
          {(voce: TitoloBlocco) => (
            <ComboboxItem key={voce.id} value={voce}>
              {voce.titolo}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

/** «Copia da un'altra famiglia»: i blocchi arrivano nuovi, da rivedere, con o senza i testi. */
function DialogoCopia({ onChiudi, onCopia }: { onChiudi: () => void; onCopia: (blocchi: Blocco[]) => void }) {
  const [famiglia, setFamiglia] = useState<(typeof ALTRE_FAMIGLIE)[number] | null>(null)
  const [conTesti, setConTesti] = useState(true)
  const [errore, setErrore] = useState<string | null>(null)
  const idModulo = useId()
  return (
    <ResponsiveDialog open onOpenChange={(aperto) => !aperto && onChiudi()}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Copia da un’altra famiglia</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            I capitoli della scheda tecnica di quella famiglia entrano qui, da rivedere: niente è salvato finché non premi
            «Salva».
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <form
            id={idModulo}
            noValidate
            onSubmit={(evento) => {
              // Il dialogo sta dentro il modulo della tab: il suo invio non deve salvarla.
              evento.preventDefault()
              evento.stopPropagation()
              if (!famiglia) return setErrore('Scegli una famiglia.')
              onCopia(daModello(famiglia.blocchi, conTesti))
            }}
          >
            <FieldGroup>
              <Campo etichetta="Famiglia" errore={errore}>
                {(campo) => (
                  <Combobox
                    items={ALTRE_FAMIGLIE}
                    value={famiglia}
                    onValueChange={(v) => {
                      setFamiglia(v as (typeof ALTRE_FAMIGLIE)[number] | null)
                      setErrore(null)
                    }}
                    itemToStringLabel={(f: (typeof ALTRE_FAMIGLIE)[number]) => f.nome}
                    isItemEqualToValue={(a, b) => a.id === b.id}
                    autoHighlight
                  >
                    <ComboboxInput {...campo} placeholder="Scegli una famiglia" className="w-full" />
                    <ComboboxContent>
                      <ComboboxEmpty>Nessuna famiglia con questo nome.</ComboboxEmpty>
                      <ComboboxList>
                        {(f: (typeof ALTRE_FAMIGLIE)[number]) => (
                          <ComboboxItem key={f.id} value={f}>
                            {f.nome}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                )}
              </Campo>
              <Campo
                etichetta="Copia anche i testi"
                descrizione="Senza, arrivano solo i titoli, coi testi vuoti."
                orientamento="orizzontale"
                etichettaInCoda
              >
                {(campo) => <Checkbox {...campo} checked={conTesti} onCheckedChange={(v) => setConTesti(v === true)} />}
              </Campo>
            </FieldGroup>
          </form>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose render={<Button variant="outline" />}>Annulla</ResponsiveDialogClose>
          <Button type="submit" form={idModulo}>
            Copia
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * L'albero: il titolo del documento, il conto, le righe, «Aggiungi capitolo».
 * ──────────────────────────────────────────────────────────────────────── */

/** «12 blocchi»: è il conto che sta sulle righe e in testa all'albero. */
const quantiBlocchi = (n: number) => (n === 1 ? '1 blocco' : `${intero(n)} blocchi`)

/** Le azioni di chi scrive: mancano in sola lettura. */
interface AzioniAlbero {
  onAggiungi: (padre: string | null, livello: Livello) => void
  onSposta: (mossa: MossaAlbero) => void
  onElimina: (chiave: string) => void
}

type NodoBlocco = NodoAlbero & Pick<FormaBlocco, 'livello' | 'segno' | 'dentro'> & { figli: NodoBlocco[] }

// Il peso del titolo lo dà il `livello` del nodo; un titoletto messo direttamente sotto un
// capitolo, al secondo posto, dice il suo livello a chi non vede.
function titoloDi(b: FormaBlocco, profondita: number): ReactNode {
  const fuoriPosto = b.livello > profondita ? <span className="sr-only">{NOME_LIVELLO[b.livello]}: </span> : null
  if (b.titolo === null) {
    return (
      <span className="font-normal text-muted-foreground italic">
        {fuoriPosto}
        Senza titolo
      </span>
    )
  }
  return fuoriPosto ? (
    <>
      {fuoriPosto}
      {b.titolo}
    </>
  ) : (
    b.titolo
  )
}

const inNodi = (forma: readonly FormaBlocco[], profondita = 1): NodoBlocco[] =>
  forma.map((b) => ({
    id: b.chiave,
    titolo: titoloDi(b, profondita),
    nome: b.titolo ?? nomeSenzaTitolo(b.livello),
    livello: b.livello,
    segno: b.segno,
    dentro: b.dentro,
    figli: inNodi(b.figli, profondita + 1),
  }))

function segnoDi(nodo: NodoBlocco) {
  if (nodo.segno === 'errore') return <AlberoSegno tipo="errore" nome="Con un errore" />
  if (nodo.segno === 'sconosciuto') return <AlberoSegno tipo="avviso" nome="Con un dato che non si può citare" />
  if (nodo.segno === 'testo') return <AlberoSegno tipo="pieno" nome="Con testo" />
  if (nodo.segno === 'vuoto') return <AlberoSegno tipo="vuoto" nome="Da scrivere" />
  return <AlberoConto>{quantiBlocchi(nodo.dentro)}</AlberoConto>
}

function conti(forma: readonly FormaBlocco[]): { quanti: number; mancano: number } {
  return forma.reduce(
    (somma, b) => {
      const dentro = conti(b.figli)
      return { quanti: somma.quanti + 1 + dentro.quanti, mancano: somma.mancano + (b.vuoto ? 1 : 0) + dentro.mancano }
    },
    { quanti: 0, mancano: 0 }
  )
}

// È `memo`, e `forma` cambia solo se cambia ciò che l'albero mostra: scrivendo un testo si
// ridisegna il blocco scelto, non l'albero.
const AlberoBlocchi = memo(function AlberoBlocchi({
  albero,
  nota,
  forma,
  scelto,
  onScegli,
  azioni,
  campoTitolo,
  fermo = false,
}: {
  albero?: Ref<AlberoRef>
  /** Una riga sotto il conto dei blocchi. */
  nota?: string
  forma: readonly FormaBlocco[]
  scelto: string | null
  onScegli: (chiave: string) => void
  azioni?: AzioniAlbero
  /** Il campo del titolo del blocco scelto: dopo «Aggiungi…» il fuoco va lì, non torna al menu. */
  campoTitolo?: () => HTMLElement | null
  fermo?: boolean
}) {
  const nodi = useMemo(() => inNodi(forma), [forma])
  const { quanti, mancano } = useMemo(() => conti(forma), [forma])
  const scegli = useCallback((chiave: string) => onScegli(chiave), [onScegli])
  const menu = useCallback(
    (nodo: NodoBlocco, posto: PostoAlbero<NodoBlocco>) => {
      if (!azioni) return null
      const aggiungi = (livello: Livello) => {
        posto.fuocoAltrove(campoTitolo)
        azioni.onAggiungi(nodo.id, livello)
      }
      return (
        <>
          {nodo.livello < 3 ? (
            <>
              <DropdownMenuGroup>
                {nodo.livello === 1 ? (
                  <DropdownMenuItem onClick={() => aggiungi(2)}>
                    <PlusIcon />
                    Aggiungi sottocapitolo
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={() => aggiungi(3)}>
                  <PlusIcon />
                  Aggiungi titoletto
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              // Il fuoco lo prende il dialogo di conferma, o la riga che resta scelta.
              posto.fuocoAltrove()
              azioni.onElimina(nodo.id)
            }}
          >
            <Trash2Icon />
            Elimina
          </DropdownMenuItem>
        </>
      )
    },
    [azioni, campoTitolo]
  )

  return (
    <>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold">Scheda tecnica</h2>
        <p className="text-sm text-muted-foreground">
          {quantiBlocchi(quanti)}, {mancano === 0 ? 'nessuno' : intero(mancano)} da scrivere
        </p>
        {nota ? <p className="text-sm text-muted-foreground">{nota}</p> : null}
      </div>
      <Albero
        ref={albero}
        etichetta="Struttura della scheda tecnica"
        nodi={nodi}
        scelto={scelto}
        onScegli={scegli}
        segno={segnoDi}
        menu={azioni ? menu : undefined}
        onSposta={azioni?.onSposta}
        fermo={fermo}
      />
      {azioni ? (
        <div>
          <Button type="button" variant="outline" size="sm" disabled={fermo} onClick={() => azioni.onAggiungi(null, 1)}>
            <PlusIcon data-icon="inline-start" />
            Aggiungi capitolo
          </Button>
        </div>
      ) : null}
    </>
  )
})

/** La legenda dei segni dell'albero: una voce per segno. */
function LegendaBlocchi({ errori }: { errori: boolean }) {
  return (
    <AlberoLegenda>
      <li>
        <AlberoSegno tipo="pieno" />
        con testo
      </li>
      <li>
        <AlberoSegno tipo="vuoto" />
        da scrivere
      </li>
      {errori ? (
        <li>
          <AlberoSegno tipo="errore" />
          con un errore
        </li>
      ) : null}
      <li>
        <AlberoSegno tipo="avviso" />
        con un dato che non si può citare
      </li>
    </AlberoLegenda>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * Le scene.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * La scheda tecnica di una famiglia, per chi la scrive: venti blocchi su tre
 * livelli. Sotto «Avvertenze» quattro titoletti senza un sottocapitolo in
 * mezzo. Si sceglie, si scrive, si aggiunge, si elimina, si riordina; «Salva»
 * e «Annulla» compaiono in fondo alla prima modifica. Per vedere un
 * salvataggio respinto, si scrive in un testo un dato che non esiste, come
 * `{{boh.x}}`, e si salva.
 */
export const Predefinita: Story = {
  render: () => <Pagina blocchi={SCHEDA} />,
}

/**
 * Quaranta blocchi: l'albero è più alto della finestra. Resta fermo sotto la
 * fascia e le tab e scorre per conto suo, mentre la pagina scorre col blocco.
 */
export const SchedaLunga: Story = {
  name: 'Scheda Lunga',
  render: () => <Pagina blocchi={SCHEDA_LUNGA} />,
}

/**
 * Una scheda ancora senza testi: lo stato vuoto in una card, con tre azioni.
 * «Parti dallo schema comune» porta quattro capitoli, «Copia da un’altra
 * famiglia» la struttura di un'altra scheda, «Aggiungi capitolo» uno solo.
 */
export const SchedaVuota: Story = {
  name: 'Scheda Vuota',
  render: () => <Pagina blocchi={[]} />,
}

/**
 * Per chi la scheda la legge soltanto: l'albero senza menu né riordino, e a
 * destra il titolo e il testo da leggere. «Dati tecnici» cita un dato che
 * questa scheda non può citare: nell'albero ha il triangolo, e nel testo la
 * pillola rossa.
 */
export const SolaLettura: Story = {
  name: 'Sola Lettura',
  render: () => <Pagina blocchi={SCHEDA_DA_LEGGERE} scrive={false} />,
}

/**
 * La colonna «Dati da citare» aperta accanto al contenuto: si stringe il
 * blocco, l'albero resta largo com'era. Un dato cliccato va nel testo del
 * blocco scelto, dov'era il cursore.
 */
export const ColonnaAperta: Story = {
  name: 'Colonna Aperta',
  render: () => <Pagina blocchi={SCHEDA} colonna />,
}

/**
 * La cornice più stretta di 576px, come in una finestra piccola: l'albero sta
 * sopra, il blocco scelto sotto, e tutti e due scorrono con la pagina.
 */
export const CorniceStretta: Story = {
  name: 'Cornice Stretta',
  render: () => <Pagina blocchi={SCHEDA} stretta />,
}

/** Il menu di una riga: prima «Sposta su» e «Sposta giù», poi «Aggiungi», poi «Elimina». */
export const MenuDiRiga: Story = {
  name: 'Menu di Riga',
  render: () => <Pagina blocchi={SCHEDA} />,
  play: apriCol('[data-slot="albero-riga"][data-scelta] [data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/** La tendina del titolo: i titoli dell'elenco, prima quelli che di solito stanno a quel livello. */
export const TendinaDelTitolo: Story = {
  name: 'Tendina del Titolo',
  render: () => <Pagina blocchi={SCHEDA} />,
  play: apriCol('[data-slot="elenco-dettaglio-dettaglio"] [data-slot="input-group-button"]', 'combobox-content'),
}

/* ────────────────────────────────────────────────────────────────────────
 * Le prove.
 * ──────────────────────────────────────────────────────────────────────── */

type Area = HTMLElement & {
  editor: {
    getText: (o?: { blockSeparator?: string }) => string
    commands: { focus: (dove?: string) => boolean; undo: () => boolean }
    state: { selection: { from: number }; doc: { content: { size: number } } }
  }
}

const scrivi = (testo: string) => userEvent.keyboard(testo.replace(/[{[]/g, '$&$&'))
const righe = () => [...document.querySelectorAll<HTMLElement>('[data-slot="albero-voce"]')]
const rigaDi = (titolo: string) => righe().find((r) => r.textContent?.replace(/\s+/g, ' ').includes(titolo))!
const scelta = () => document.querySelector<HTMLElement>('[data-slot="albero-voce"][aria-current="true"]')
const areaTesto = () =>
  document.querySelector<Area>('[data-slot="elenco-dettaglio-dettaglio"] [data-slot="testo-segnaposto-area"]')!
const valore = () => areaTesto().editor.getText({ blockSeparator: '\n' })
const bottone = (nome: string | RegExp) => within(document.body).queryByRole('button', { name: nome })
const menuChiuso = () => waitFor(() => expect(document.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull())

async function pronta() {
  await waitFor(() => expect(areaTesto()?.editor).toBeTruthy())
  await waitFor(() => expect(scelta()).toBeTruthy())
}

async function apriMenu(r: HTMLElement) {
  const grilletto = r.closest('[data-slot="albero-riga"]')!.querySelector<HTMLElement>('[data-slot="dropdown-menu-trigger"]')!
  await userEvent.click(grilletto)
  return waitFor(() => {
    const menu = document.querySelector<HTMLElement>('[data-slot="dropdown-menu-content"]')
    expect(menu).toBeTruthy()
    return menu!
  })
}

// Scegliere, scrivere, tornare com'era; livello; riordino dal menu; aggiungere un
// blocco dal menu e dargli un titolo; eliminare, con e senza dialogo; «Annulla».
export const ScritturaProva: Story = {
  name: 'Scrittura, prova',
  tags: ['!dev', '!autodocs'],
  render: () => <Pagina blocchi={SCHEDA} />,
  play: async () => {
    await pronta()
    expect(bottone('Salva')).toBeNull()
    expect(document.body).toHaveTextContent('20 blocchi, 3 da scrivere')

    // Scelta una riga, il testo è il suo e il fuoco è in fondo al testo.
    await userEvent.click(rigaDi('Campo di applicazione'))
    await waitFor(() => expect(scelta()).toHaveTextContent('Campo di applicazione'))
    await waitFor(() => expect(document.activeElement).toBe(areaTesto()))
    expect(valore()).toMatch(/^Murature in laterizio/)
    await waitFor(() => expect(areaTesto().editor.state.selection.from).toBe(areaTesto().editor.state.doc.content.size - 1))

    // Si scrive: «Salva» compare. Annullato nel testo, sparisce.
    await scrivi(' Aggiunta.')
    await waitFor(() => expect(bottone('Salva')).toBeTruthy())
    while (valore().endsWith('Aggiunta.') || valore().endsWith(' ')) areaTesto().editor.commands.undo()
    await waitFor(() => expect(bottone('Salva')).toBeNull())

    // Il livello: un titoletto sotto un capitolo può diventare un sottocapitolo, e la riga
    // prende il peso del sottocapitolo; tornato titoletto, niente da salvare.
    await userEvent.click(rigaDi('Protezione dal gelo'))
    const titolo = () => rigaDi('Protezione dal gelo').querySelector<HTMLElement>('[data-slot="albero-titolo"]')!
    expect(getComputedStyle(titolo()).fontWeight).toBe('400')
    expect(rigaDi('Protezione dal gelo')).toHaveAccessibleName(/^Titoletto: Protezione dal gelo/)
    // Ammessi i due livelli sotto un capitolo; il capitolo no.
    await waitFor(() => expect(within(document.body).getByRole('button', { name: 'Capitolo' })).toBeDisabled())
    await userEvent.click(within(document.body).getByRole('button', { name: 'Sottocapitolo' }))
    await waitFor(() => expect(getComputedStyle(titolo()).fontWeight).toBe('500'))
    expect(bottone('Salva')).toBeTruthy()
    await userEvent.click(within(document.body).getByRole('button', { name: 'Titoletto' }))
    await waitFor(() => expect(bottone('Salva')).toBeNull())

    // Il riordino dal menu: giù e di nuovo su, e non resta niente da salvare.
    const ordine = () => righe().slice(0, 3).map((r) => r.textContent?.trim())
    const prima = ordine()
    await userEvent.click(within(await apriMenu(rigaDi('Descrizione'))).getByRole('menuitem', { name: 'Sposta giù' }))
    await waitFor(() => expect(ordine()[1]).toBe(prima[0]))
    expect(bottone('Salva')).toBeTruthy()
    await menuChiuso()
    await userEvent.click(within(await apriMenu(rigaDi('Descrizione'))).getByRole('menuitem', { name: 'Sposta su' }))
    await waitFor(() => expect(ordine()).toEqual(prima))
    await waitFor(() => expect(bottone('Salva')).toBeNull())
    await menuChiuso()

    // Un sottocapitolo nuovo dal menu: diventa il blocco scelto, col fuoco sul titolo.
    await userEvent.click(within(await apriMenu(rigaDi('Manutenzione'))).getByRole('menuitem', { name: 'Aggiungi sottocapitolo' }))
    await waitFor(() => expect(scelta()).toHaveTextContent('Senza titolo'))
    const input = within(document.body).getByRole('combobox', { name: 'Titolo' })
    await waitFor(() => expect(document.activeElement).toBe(input))
    // «Manutenzione» non è più da scrivere: ora contiene un blocco.
    expect(document.body).toHaveTextContent('21 blocchi, 3 da scrivere')
    await scrivi('finit')
    await waitFor(() => expect(within(document.body).getByRole('option', { name: 'Finitura' })).toBeTruthy())
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(scelta()).toHaveTextContent('Finitura'))
    // Il titolo pesa come il livello del blocco.
    expect(getComputedStyle(input).fontWeight).toBe('500')

    // Senza testo né figli si elimina subito; il fuoco va alla riga scelta.
    await userEvent.click(within(document.body).getByRole('button', { name: 'Elimina il blocco' }))
    await waitFor(() => expect(document.body).toHaveTextContent('20 blocchi, 3 da scrivere'))
    await waitFor(() => expect(document.activeElement).toBe(scelta()))
    await waitFor(() => expect(bottone('Salva')).toBeNull())

    // Con dei figli si chiede, e si dice quanti blocchi spariscono.
    await userEvent.click(rigaDi('Applicazione'))
    await userEvent.click(within(document.body).getByRole('button', { name: 'Elimina il blocco' }))
    const dialogo = await waitFor(() => within(document.body).getByRole('alertdialog'))
    expect(dialogo).toHaveTextContent('Eliminare «Applicazione»?')
    expect(dialogo).toHaveTextContent('Spariscono 11 blocchi: questo e i 10 che contiene, coi loro testi.')
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Elimina' }))
    await waitFor(() => expect(document.body).toHaveTextContent('9 blocchi, 1 da scrivere'))
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).toBeNull())
    // «Annulla» li rimette.
    await userEvent.click(bottone('Annulla')!)
    await waitFor(() => expect(document.body).toHaveTextContent('20 blocchi, 3 da scrivere'))
    expect(bottone('Salva')).toBeNull()
  },
}

// Un dato che non esiste: l'avviso sulla riga subito; al salvataggio l'errore sotto il
// testo, il segno d'errore sulla riga, il fuoco in fondo al testo. Corretto, si salva.
export const SalvataggioRespintoProva: Story = {
  name: 'Salvataggio respinto, prova',
  tags: ['!dev', '!autodocs'],
  render: () => <Pagina blocchi={SCHEDA} />,
  play: async () => {
    await pronta()
    await userEvent.click(rigaDi("Destinazione d'uso"))
    await waitFor(() => expect(document.activeElement).toBe(areaTesto()))
    await scrivi(' {{boh.x}}')
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(within(rigaDi("Destinazione d'uso")).getByRole('img', { name: 'Con un dato che non si può citare' })).toBeTruthy()
    )
    // Si sceglie un altro blocco, poi si salva: torna scelto quello respinto.
    await userEvent.click(rigaDi('Descrizione'))
    await userEvent.click(bottone('Salva')!)
    await waitFor(() => expect(scelta()).toHaveTextContent("Destinazione d'uso"), { timeout: 5000 })
    await waitFor(() => expect(document.body).toHaveTextContent('{{boh.x}}: non è fra i dati che questa scheda può citare.'))
    expect(within(scelta()!).getByRole('img', { name: 'Con un errore' })).toBeTruthy()
    await waitFor(() => expect(document.activeElement).toBe(areaTesto()))
    expect(areaTesto()).toHaveAttribute('aria-invalid', 'true')
    await waitFor(() => expect(areaTesto().editor.state.selection.from).toBe(areaTesto().editor.state.doc.content.size - 1))

    // Corretto il testo l'errore sparisce, e il salvataggio passa.
    while (valore().includes('boh')) areaTesto().editor.commands.undo()
    await waitFor(() => expect(document.body).not.toHaveTextContent('non è fra i dati'))
    // Tornato com'era, non resta niente da salvare: si scrive qualcosa di buono.
    await areaTesto().editor.commands.focus('end')
    await scrivi(' Fine.')
    await userEvent.click(bottone('Salva')!)
    await waitFor(() => expect(document.body).toHaveTextContent('Testi salvati.'), { timeout: 5000 })
    await waitFor(() => expect(bottone('Salva')).toBeNull())
  },
}

// La scheda vuota: lo schema comune porta quattro capitoli, la copia venti blocchi.
export const SchedaVuotaProva: Story = {
  name: 'Scheda vuota, prova',
  tags: ['!dev', '!autodocs'],
  render: () => <Pagina blocchi={[]} />,
  play: async () => {
    const schema = await waitFor(() => bottone('Parti dallo schema comune')!)
    await userEvent.click(schema)
    await waitFor(() => expect(righe()).toHaveLength(4))
    await waitFor(() => expect(document.activeElement).toBe(scelta()))
    expect(document.body).toHaveTextContent('4 blocchi, 4 da scrivere')
    await userEvent.click(bottone('Annulla')!)
    await waitFor(() => expect(righe()).toHaveLength(0))

    await userEvent.click(bottone('Copia da un’altra famiglia')!)
    const dialogo = await waitFor(() => within(document.body).getByRole('dialog'))
    await userEvent.click(within(dialogo).getByRole('combobox', { name: 'Famiglia' }))
    await userEvent.click(await waitFor(() => within(document.body).getByRole('option', { name: 'Intonaco Beta' })))
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Copia' }))
    await waitFor(() => expect(righe()).toHaveLength(20))
    expect(document.body).toHaveTextContent('20 blocchi, 3 da scrivere')
  },
}

// La colonna aperta: l'albero resta largo 288px, il dato cliccato va nel blocco scelto.
export const ColonnaApertaProva: Story = {
  name: 'Colonna aperta, prova',
  tags: ['!dev', '!autodocs'],
  render: () => <Pagina blocchi={SCHEDA} />,
  play: async () => {
    await pronta()
    const elenco = document.querySelector<HTMLElement>('[data-slot="elenco-dettaglio-elenco"]')!
    const dettaglio = document.querySelector<HTMLElement>('[data-slot="elenco-dettaglio-dettaglio"]')!
    const largo = dettaglio.getBoundingClientRect().width
    await userEvent.click(bottone('Inserisci un dato')!)
    const colonna = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[data-slot="colonna-laterale"]')
      expect(el).toBeTruthy()
      return el!
    })
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Dati da citare'))
    await waitFor(() => expect(`più stretto: ${dettaglio.getBoundingClientRect().width < largo}`).toBe('più stretto: true'))
    expect(Math.round(elenco.getBoundingClientRect().width)).toBe(288)
    // Scelto un blocco, il dato cliccato va in fondo al suo testo.
    await userEvent.click(rigaDi('Supporti bagnati'))
    await userEvent.click(within(colonna).getByRole('button', { name: /Reazione al fuoco/ }))
    await waitFor(() => expect(valore()).toMatch(/\{\{prestazione\.fuoco\}\}$/))
  },
}

// La cornice stretta: l'albero sopra, il blocco sotto, niente di fermo.
export const CorniceStrettaProva: Story = {
  name: 'Cornice stretta, prova',
  tags: ['!dev', '!autodocs'],
  render: () => <Pagina blocchi={SCHEDA} stretta />,
  play: async () => {
    await pronta()
    const elenco = document.querySelector<HTMLElement>('[data-slot="elenco-dettaglio-elenco"]')!
    const dettaglio = document.querySelector<HTMLElement>('[data-slot="elenco-dettaglio-dettaglio"]')!
    expect(`sotto: ${dettaglio.getBoundingClientRect().top >= elenco.getBoundingClientRect().bottom}`).toBe('sotto: true')
    expect(getComputedStyle(elenco).position).toBe('static')
  },
}

// In sola lettura: niente menu, niente «Salva», il triangolo; scelta una riga il fuoco va al blocco.
export const SolaLetturaProva: Story = {
  name: 'Sola lettura, prova',
  tags: ['!dev', '!autodocs'],
  render: () => <Pagina blocchi={SCHEDA_DA_LEGGERE} scrive={false} />,
  play: async () => {
    await waitFor(() => expect(righe().length).toBeGreaterThan(0))
    expect(document.querySelector('[data-slot="albero-riga"] [data-slot="dropdown-menu-trigger"]')).toBeNull()
    expect(bottone('Inserisci un dato')).toBeNull()
    expect(within(rigaDi('Dati tecnici')).getByRole('img', { name: 'Con un dato che non si può citare' })).toBeTruthy()
    await userEvent.click(rigaDi('Dati tecnici'))
    await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Capitolo: Dati tecnici'))
    expect(bottone('Salva')).toBeNull()
  },
}

