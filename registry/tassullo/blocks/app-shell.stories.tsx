import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import {
  BoxesIcon,
  CalculatorIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  HardHatIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react'

import { apriCol } from '@/prove/apri'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/registry/tassullo/ui/card'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/registry/tassullo/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/tassullo/ui/tabs'
import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { SelettoreContesto, type VoceContesto } from '@/registry/tassullo/blocks/barra-contesto'
import {
  PageHeader,
  type AzionePagina,
  type LivelloPercorso,
} from '@/registry/tassullo/blocks/page-header'

/**
 * Il guscio di un applicativo: la colonna di navigazione a sinistra, la fascia
 * in alto, l'area del contenuto. Si monta una volta sola, attorno a tutte le
 * pagine.
 *
 * **Quando sì, quando no.** Ogni applicativo Tassullo parte da qui, e non
 * compone a mano la primitiva `sidebar`: il guscio ha già la colonna con
 * tutte le sue regole — i tooltip a colonna chiusa, i nomi accessibili, il
 * menu dell'utente che sul telefono si apre in basso, le larghezze che
 * seguono la densità. La primitiva serve solo dove il guscio non basta. Il
 * contenuto della fascia non si passa da qui: percorso e azioni sono della
 * pagina, che li dichiara con `tassullo-page-header`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-app-shell
 * ```
 *
 * ```tsx
 * <AppShell applicazione="Anagrafe" sezioni={SEZIONI} utente={utente} azioniUtente={voci}>
 *   <Outlet />
 * </AppShell>
 * ```
 *
 * **Le prop.**
 *
 * - `applicazione`, il nome accanto al marchio; `testataRender`, l'elemento
 *   della testata, di solito il collegamento alla pagina iniziale del router.
 * - `sezioni`: ogni sezione ha un `titolo` facoltativo e le sue `voci`. Una
 *   voce ha `titolo`, `icona`, `href` o `render`, `attiva`, `disabilitata`,
 *   `badge` per un conteggio, e `figli` per un sottolivello.
 * - `utente` (`nome`, `cognome`, `email`, `ruolo`, `iniziali`) e
 *   `azioniUtente`, le voci del suo menu: `DropdownMenuItem` e separatori.
 * - `contesto`, uno spazio sotto il marchio per l'entità su cui si lavora in
 *   tutte le pagine — il `SelettoreContesto` di `tassullo-barra-contesto`,
 *   nelle scene «Con contesto». Serve solo alle app che hanno un'entità
 *   attiva di questo tipo; come si divide il lavoro con la fascia in pagina
 *   lo spiega `Blocchi/Barra di contesto`.
 * - `collassa`: `"icona"`, il predefinito, chiude la colonna a una fila di
 *   icone, e l'icona di una voce con `figli` apre un menu con le sue voci;
 *   `"fuori"` la fa sparire, ed è la scelta per voci senza icona.
 * - `defaultAperta`: la colonna parte aperta o chiusa.
 * - `larghezza`: `"piena"`, il predefinito, dà al contenuto tutta la
 *   larghezza; `"pagina"` lo tiene entro `--container-page` e lo centra, per
 *   un modulo o un testo lungo.
 * - `contenuto`: `"scorre"`, il predefinito, lascia crescere la pagina e
 *   scorre la finestra, con la fascia in alto ferma in cima; `"riempie"`
 *   ferma il guscio all'altezza della finestra, per una pagina che è una
 *   lista con lo scorrimento interno.
 *
 * **Regole d'uso.**
 *
 * - Il guscio non sa quali rotte esistano: la voce attiva la dichiara l'app
 *   con `attiva`, e i collegamenti del router passano da `render` — un
 *   `<NavLink>`, un `<Link>`. Senza `href` né `render` la voce è un bottone.
 * - Il guscio non ha bottoni propri: tutto ciò che si clicca arriva dalle
 *   prop.
 * - Il respiro attorno alla pagina lo dà il guscio, e segue la densità: la
 *   pagina non aggiunge un suo margine esterno.
 * - Non c'è un titolo di pagina visibile: la fascia ha il percorso, e il
 *   titolo per chi non vede lo scrive `tassullo-page-header`.
 * - Nel modo `"scorre"` la fascia resta ferma e ciò che la pagina tiene
 *   fermo le passa sotto, mai sopra: una colonna bloccata, una testata. Le
 *   tab di una scheda lunga si fermano sotto la fascia con una fascia loro,
 *   `sticky top-12` col fondo della pagina: la ricetta è nella scena
 *   «Scheda Lunga».
 * - Con `contenuto="riempie"` la pagina rende una colonna
 *   `flex h-full min-h-0 flex-col`, con la tabella come figlio
 *   `min-h-0 flex-1`: è la forma di `altezza="ferma"` di
 *   `tassullo-data-table`.
 *
 * **Tastiera e accessibilità.** `Ctrl`+`B` o `⌘`+`B` apre e chiude la colonna
 * da qualunque punto; lo fa anche il grilletto in fascia. A colonna chiusa i
 * nomi delle voci arrivano come tooltip, al passaggio e al fuoco, e l'icona di
 * un gruppo apre un menu che si usa con le frecce e si chiude con `Esc`; testata e
 * utente hanno un nome accessibile anche quando il testo è nascosto. Sotto i
 * 768px la colonna esce dal DOM e il grilletto apre un pannello laterale: il
 * fuoco resta al suo interno, e `Esc` lo chiude al primo colpo. Il menu
 * dell'utente si apre di lato sulla scrivania e in basso sul telefono.
 */
const meta = {
  title: 'Blocchi/App shell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

const SEZIONI: SezioneNav[] = [
  {
    titolo: 'Anagrafe',
    voci: [
      { titolo: 'Cruscotto', icona: LayoutDashboardIcon, href: '#' },
      {
        titolo: 'Prodotti',
        icona: BoxesIcon,
        attiva: true,
        figli: [
          { titolo: 'Famiglie', href: '#', attiva: true },
          { titolo: 'Sistemi', href: '#' },
          { titolo: 'Norme', href: '#' },
        ],
      },
      {
        titolo: 'Documenti',
        icona: FileTextIcon,
        figli: [
          { titolo: 'Schede tecniche', href: '#' },
          // «In arrivo»: la forma che Anagrafe usa già per le voci non ancora
          // pronte. È `aria-disabled` e non `disabled`, perché la voce può
          // essere un `<a>` e su un ancoraggio `disabled` non vuol dire niente.
          { titolo: 'Certificati', disabilitata: true },
        ],
      },
    ],
  },
  {
    titolo: 'Gestione',
    voci: [
      { titolo: 'Cantieri', icona: HardHatIcon, href: '#', badge: '7' },
      { titolo: 'Utenti', icona: UsersIcon, href: '#' },
    ],
  },
]

/**
 * L'utente. Nel vivo questi campi arrivano dall'account Microsoft collegato —
 * `givenName`, `surname`, `mail` — e le iniziali si ricavano da sé: si passano
 * solo se l'app ne vuole di diverse.
 */
const UTENTE = {
  nome: 'Stefano',
  cognome: 'Bertolini',
  email: 'sbertolini@esempio.it',
  ruolo: 'Sola lettura',
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

/**
 * **Percorso e azioni non sono prop del guscio**: sono di `<PageHeader>`, che
 * la pagina rende dentro `children` e che compare nella fascia attraverso un
 * portale. La ragione è in `Blocchi/Intestazione di pagina` — il guscio si
 * monta una volta sola attorno all&apos;`<Outlet />`, quindi la pagina non ha
 * modo di passargli niente.
 *
 * Qui sono dati della vetrina, come l&apos;indirizzo dell&apos;utente: «Nuovo
 * prodotto» è un bottone di *Anagrafe*, non del design system.
 */
const PERCORSO: LivelloPercorso[] = [
  { titolo: 'Prodotti', href: '#' },
  { titolo: 'Famiglie' },
]

const AZIONI_DI_PAGINA: AzionePagina[] = [
  { titolo: 'Sistema da BC', icona: RefreshCwIcon, ruolo: 'secondaria' },
  { titolo: 'Nuovo prodotto', icona: PlusIcon, ruolo: 'primaria' },
]

/**
 * Il contenuto di una pagina — che comincia **dichiarando la propria
 * intestazione**. `<PageHeader>` non occupa spazio dove sta scritta: rende
 * nella fascia in alto.
 */
function Contenuto() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader percorso={PERCORSO} azioni={AZIONI_DI_PAGINA} />
      <Card>
        <CardHeader>
          <CardTitle>L&apos;area di contenuto</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Il respiro attorno alla pagina lo possiede il guscio, non la pagina: è una utility
          soltanto, <code>p-4</code>, ed è l&apos;unico modo perché un form e una tabella comincino
          allo stesso punto in tutte le app. Il padding segue la densità: 16px in normale, 24 in
          touch. Il contenuto si adatta alla larghezza della pagina; il tetto di{' '}
          <code>max-w-page</code> si chiede con <code>larghezza=&quot;pagina&quot;</code>.
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Il guscio come lo vede chi apre l'applicativo: colonna aperta, percorso e
 * azioni in fascia, l'utente in fondo col suo menu aperto.
 */
export const Predefinito: Story = {
  args: {
    applicazione: 'Anagrafe',
    sezioni: SEZIONI,
    utente: UTENTE,
    azioniUtente: AZIONI_UTENTE,
    children: <Contenuto />,
  },
  /*
   * Il grilletto è il bottone dell'utente, e il suo `data-slot` va **guardato,
   * non dedotto**. Qui `DropdownMenuTrigger` rende *attraverso*
   * `SidebarMenuButton` e nel DOM vince `dropdown-menu-trigger`; nel `combobox`
   * la stessa forma dà il risultato opposto — lì `InputGroupButton` si riprende
   * lo slot. Le due composizioni si somigliano e finiscono in modo diverso: è
   * la ragione per cui `apri.ts` vuole un **selettore** e non un nome di slot.
   * `grilletto()` lancia quando il selettore non trova niente, invece di
   * lasciar passare la story per «senza popup».
   */
  play: apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * La colonna chiusa a icone: la T in cima, l'avatar in fondo, i sottolivelli
 * nascosti. I nomi delle voci compaiono come tooltip, e l'icona di un gruppo
 * apre un menu con le sue voci.
 */
export const Collassato: Story = {
  args: { ...Predefinito.args, defaultAperta: false },
}

// Il grilletto si cerca dentro il contenuto della colonna: anche il menu
// dell'utente è un `dropdown-menu-trigger`, e il primo gruppo è «Prodotti».
/**
 * La colonna chiusa, col menu di un gruppo aperto. A colonna chiusa i gruppi
 * non possono aprirsi sotto la loro icona: l'icona apre un menu a destra con
 * il nome del gruppo e le sue voci. La voce della pagina in cui si è porta la
 * spunta; una voce non ancora pronta resta spenta, come a colonna aperta.
 *
 * Da tastiera è un menu: `Invio` o `Spazio` lo aprono, le frecce scorrono le
 * voci, `Esc` lo chiude e riporta il fuoco sull'icona.
 */
export const CollassatoMenuGruppo: Story = {
  name: 'Collassato, menu di un gruppo',
  args: { ...Predefinito.args, defaultAperta: false },
  play: apriCol(
    '[data-slot="sidebar-content"] [data-slot="dropdown-menu-trigger"]',
    'dropdown-menu-content'
  ),
}

/**
 * Voci senza icona, con `collassa="fuori"`: chiusa, la colonna sparisce invece
 * di ridursi a una fila di quadrati vuoti. Una voce è disabilitata.
 */
export const SenzaIcone: Story = {
  args: {
    applicazione: 'Anagrafe',
    collassa: 'fuori',
    larghezza: 'piena',
    utente: UTENTE,
    azioniUtente: AZIONI_UTENTE,
    sezioni: [
      {
        titolo: 'Qualifica',
        voci: [
          { titolo: 'Materie prime', href: '#' },
          { titolo: 'Prodotti', href: '#', attiva: true },
          { titolo: 'Kit', href: '#' },
        ],
      },
      {
        titolo: 'Classificazione',
        voci: [
          { titolo: 'Famiglie TDS', href: '#' },
          { titolo: 'Famiglie EPD', disabilitata: true },
          { titolo: 'Sistemi', href: '#' },
        ],
      },
      {
        titolo: 'Distribuzione',
        voci: [
          { titolo: 'Norme', href: '#' },
          { titolo: 'Change set', href: '#' },
          { titolo: 'Traduzioni', href: '#' },
          { titolo: 'Pubblicazioni', href: '#' },
        ],
      },
    ],
    children: <Contenuto />,
  },
}

/**
 * Alla larghezza del telefono la colonna non c'è, e il grilletto in fascia
 * apre il pannello laterale. In questa pagina la scena sta in un riquadro
 * largo 375px, come lo schermo di un telefono.
 */
export const Telefono: Story = {
  globals: { viewport: { value: 'telefono', isRotated: false } },
  args: Predefinito.args,
}

const COMMESSE: VoceContesto[] = [
  { id: '2026-114', titolo: '2026-114 — Palazzo Roccabruna', descrizione: 'Trento, via Santa Trinità' },
  { id: '2026-092', titolo: '2026-092 — Scuola media Bolghera', descrizione: 'Trento, via Volta' },
  { id: '2025-233', titolo: '2025-233 — Capannone Pergine lotto B', descrizione: 'Pergine Valsugana' },
]

/** La commessa attiva è dell'app: la scena la tiene per far vedere che cambia. */
function SelettoreCommessa() {
  const [attiva, setAttiva] = useState(COMMESSE[0]!.id)
  const voce = COMMESSE.find((c) => c.id === attiva) ?? COMMESSE[0]!
  return (
    <SelettoreContesto
      etichetta="Commessa attiva"
      // In colonna il solo nome, senza il codice: sulla scrivania al testo
      // restano circa 160px.
      titolo={voce.titolo.split(' — ')[1] ?? voce.titolo}
      icona={HardHatIcon}
      voci={COMMESSE}
      attiva={attiva}
      onCambia={setAttiva}
      etichettaMenu="Commesse aperte"
    />
  )
}

const SEZIONI_STUDIO: SezioneNav[] = [
  {
    titolo: 'Lavoro',
    voci: [
      { titolo: 'Cruscotto', icona: LayoutDashboardIcon, href: '#' },
      { titolo: 'Computo', icona: CalculatorIcon, href: '#', attiva: true },
      { titolo: 'Capitolati', icona: FileTextIcon, href: '#' },
    ],
  },
]

/** Una pagina di Studio, con la sua intestazione: il computo della commessa. */
function ContenutoStudio() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        percorso={[{ titolo: 'Commesse', href: '#' }, { titolo: 'Computo' }]}
        azioni={[{ titolo: 'Nuova voce', icona: PlusIcon, ruolo: 'primaria' }]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Computo metrico estimativo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Ogni pagina lavora sulla commessa scelta in colonna: cambiarla lì cambia il contesto di
          tutte, senza tornare a un elenco.
        </CardContent>
      </Card>
    </div>
  )
}

// Il grilletto si cerca dentro la testata della colonna: anche il menu
// dell'utente è un `dropdown-menu-trigger`, e un selettore senza contesto
// aprirebbe quello che capita per primo.
/**
 * Con `contesto`: sotto il marchio, la commessa su cui si lavora in tutte le
 * pagine, col menu per cambiarla aperto. Il menu si apre accanto alla colonna.
 */
export const ConContesto: Story = {
  name: 'Con contesto',
  args: {
    applicazione: 'Studio',
    contesto: <SelettoreCommessa />,
    sezioni: SEZIONI_STUDIO,
    utente: UTENTE,
    azioniUtente: AZIONI_UTENTE,
    children: <ContenutoStudio />,
  },
  play: apriCol(
    '[data-slot="sidebar-header"] [data-slot="dropdown-menu-trigger"]',
    'dropdown-menu-content'
  ),
}

/**
 * La stessa colonna chiusa a icone: il selettore si riduce al quadrato della
 * sua icona, allineato alle voci, e il menu si apre lo stesso.
 */
export const ConContestoChiuso: Story = {
  name: 'Con contesto, chiuso',
  args: { ...ConContesto.args, defaultAperta: false },
}

const SEZIONI_SCHEDA = [
  { value: 'anagrafica', titolo: 'Anagrafica' },
  { value: 'composizione', titolo: 'Composizione' },
  { value: 'documenti', titolo: 'Documenti' },
  { value: 'storico', titolo: 'Storico' },
]

const CAMPI_SCHEDA = [
  ['Codice', 'MB-400-A'],
  ['Nome', 'Membrana armata 4 mm'],
  ['Famiglia', 'Membrane bituminose'],
  ['Sistema', 'Copertura piana'],
  ['Norma', 'UNI EN 13707'],
  ['Spessore', '4 mm'],
  ['Armatura', 'Poliestere non tessuto'],
  ['Finitura superiore', 'Talcata'],
  ['Finitura inferiore', 'Film termofusibile'],
  ['Flessibilità a freddo', '−20 °C'],
  ['Resistenza a trazione', '800 N/50 mm'],
  ['Allungamento a rottura', '45 %'],
  ['Stabilità di forma', '100 °C'],
  ['Reazione al fuoco', 'Classe E'],
  ['Rotoli per bancale', '23'],
  ['Stabilimento', 'Stabilimento nord'],
] as const

function PannelloScheda({ value, titolo }: { value: string; titolo: string }) {
  const lungo = value === 'anagrafica' || value === 'composizione'
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titolo}</CardTitle>
        <CardDescription>
          {lungo ? 'Sedici campi: la scheda è più alta della finestra.' : 'Un pannello corto.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lungo ? (
          <FieldGroup>
            {CAMPI_SCHEDA.map(([etichetta, valore]) => (
              <Field key={etichetta}>
                <FieldLabel htmlFor={`${value}-${etichetta}`}>{etichetta}</FieldLabel>
                <Input id={`${value}-${etichetta}`} defaultValue={valore} />
              </Field>
            ))}
          </FieldGroup>
        ) : (
          <p className="text-sm text-muted-foreground">
            Disegno tecnico, certificato di conformità, scheda di sicurezza.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/*
 * La scheda di un prodotto con le tab ferme sotto la fascia. Tre pezzi, tutti
 * della pagina e non del guscio:
 *
 * - la fascia delle tab è `sticky top-12`, cioè si ferma sotto quella del
 *   guscio, alta `h-12`; `-mx-4 px-4` la allarga fino ai bordi dell'area del
 *   contenuto, col fondo della pagina, perché ciò che le scorre sotto non si
 *   veda ai lati. `scroll-pt-24` sulla radice del documento è la somma delle
 *   due fasce: un campo raggiunto con Maiusc+Tab si ferma sotto tutte e due;
 * - cambiando tab, se le tab sono già ferme, la finestra torna all'inizio del
 *   pannello. Senza, il pannello nuovo si aprirebbe a metà, con l'inizio
 *   nascosto sotto le fasce. Il salto è immediato: nessuna animazione.
 */
function PaginaSchedaLunga() {
  const [tab, setTab] = useState('anagrafica')
  const radice = useRef<HTMLDivElement>(null)
  const fasciaTab = useRef<HTMLDivElement>(null)

  function cambia(valore: string) {
    const r = radice.current?.getBoundingClientRect()
    const f = fasciaTab.current?.getBoundingClientRect()
    // La fascia delle tab è ferma quando sta più in basso del punto in cui
    // starebbe senza `sticky`, cioè della cima della radice.
    if (r && f && r.top < f.top) window.scrollBy({ top: r.top - f.top, behavior: 'instant' })
    setTab(valore)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        percorso={[{ titolo: 'Prodotti', href: '#' }, { titolo: 'Membrana armata 4 mm' }]}
        azioni={[{ titolo: 'Modifica', icona: PencilIcon, ruolo: 'secondaria' }]}
      />
      <Tabs ref={radice} value={tab} onValueChange={(v) => cambia(String(v))}>
        <div
          ref={fasciaTab}
          data-slot="fascia-tab"
          className="sticky top-12 z-10 -mx-4 bg-background px-4 py-2 [html:has(&)]:scroll-pt-24"
        >
          <TabsList aria-label="Sezioni">
            {SEZIONI_SCHEDA.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.titolo}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {SEZIONI_SCHEDA.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <PannelloScheda value={t.value} titolo={t.titolo} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

/**
 * Una pagina più alta della finestra: la scheda di un prodotto, con quattro
 * tab e sedici campi. Scorrendo, la fascia in alto resta ferma, e sotto di lei
 * si fermano le tab; cambiando tab la pagina torna all'inizio del pannello.
 * Scorre la finestra, quindi PaginaGiù funziona appena aperta la pagina.
 *
 * Le tab ferme sono della pagina, non del guscio: una fascia `sticky top-12`
 * col fondo della pagina, attorno alla `TabsList`. Nel codice della scena c'è
 * la ricetta intera.
 */
export const SchedaLunga: Story = {
  name: 'Scheda Lunga',
  args: {
    applicazione: 'Anagrafe',
    sezioni: SEZIONI,
    utente: UTENTE,
    azioniUtente: AZIONI_UTENTE,
    children: <PaginaSchedaLunga />,
  },
}

/*
 * La prova della scheda lunga. Si scorre la finestra di 400px: la fascia del
 * guscio deve stare a 0 (senza la fascia ferma scorreva via, −400) e la fascia
 * delle tab subito sotto, alla sua altezza. Poi si cambia tab: il titolo del
 * pannello nuovo deve vedersi, sotto le due fasce e dentro la finestra — senza
 * il ritorno all'inizio del pannello restava nascosto sopra. Alla fine la
 * finestra torna in cima e la tab alla prima, perché la scansione guardi la
 * scena a riposo.
 */
async function provaSchedaLunga({ canvasElement }: { canvasElement: HTMLElement }) {
  const fascia = () => canvasElement.querySelector<HTMLElement>('[data-slot="page-header-bar"]')
  const fasciaTab = () => canvasElement.querySelector<HTMLElement>('[data-slot="fascia-tab"]')
  const pagina = document.scrollingElement ?? document.documentElement
  await waitFor(() => expect(fascia() && fasciaTab()).toBeTruthy())
  expect(`corsa ${pagina.scrollHeight - pagina.clientHeight >= 400}`).toBe('corsa true')
  const px = (n: number) => Math.round(n)
  const tab = (nome: string) =>
    [...canvasElement.querySelectorAll<HTMLElement>('[role="tab"]')].find(
      (t) => t.textContent?.trim() === nome,
    )!
  try {
    window.scrollTo({ top: 400, behavior: 'instant' })
    const f = fascia()!.getBoundingClientRect()
    expect(`fascia a ${px(f.top)}`).toBe('fascia a 0')
    expect(`tab a ${px(fasciaTab()!.getBoundingClientRect().top)}`).toBe(`tab a ${px(f.bottom)}`)

    // Un clic solo, senza spostare il fuoco: il fuoco dato da programma fa
    // scorrere la pagina da sé fino alla tab, e la prova non misurerebbe più
    // il ritorno all'inizio del pannello ma lo scorrimento del fuoco.
    tab('Composizione').click()
    await waitFor(() => expect(tab('Composizione')).toHaveAttribute('aria-selected', 'true'))
    const pannello = canvasElement.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])')!
    const titolo = pannello.querySelector<HTMLElement>('[data-slot="card-title"]')!
    const t = titolo.getBoundingClientRect()
    const sotto = px(fasciaTab()!.getBoundingClientRect().bottom)
    expect(`titolo sotto le fasce: ${px(t.top) >= sotto}`).toBe('titolo sotto le fasce: true')
    expect(`titolo nella finestra: ${t.bottom <= innerHeight}`).toBe('titolo nella finestra: true')
  } finally {
    tab('Anagrafica').click()
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
}

// Scena di misura di «Scheda Lunga»: la stessa resa, con la prova. `!dev` la
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo; il
// controllo automatico la esegue lo stesso.
export const SchedaLungaProva: Story = {
  ...SchedaLunga,
  name: 'Scheda Lunga, prova',
  tags: ['!dev', '!autodocs'],
  play: provaSchedaLunga,
}
