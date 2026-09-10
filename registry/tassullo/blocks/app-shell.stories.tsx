import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BoxesIcon,
  FileTextIcon,
  PlusIcon,
  HardHatIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react'

import { apriCol } from '@/prove/apri'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/registry/tassullo/ui/breadcrumb'
import { Button } from '@/registry/tassullo/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/tassullo/ui/card'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/registry/tassullo/ui/dropdown-menu'
import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'

/**
 * Il **guscio** di un'applicazione Tassullo: colonna scura a sinistra, fascia
 * in alto, area di contenuto. Una chiamata sola, attorno a tutta l'app.
 *
 * ```tsx
 * <AppShell applicazione="Anagrafe" sezioni={SEZIONI} utente={me} barra={<Percorso />}>
 *   <Outlet />
 * </AppShell>
 * ```
 *
 * Sostituisce `Sidebar.tsx` + `Sidebar.css` di Anagrafe — 190 righe di CSS di
 * pagina — e con esse il fatto che ogni app si riscriva il proprio guscio.
 *
 * ## Cosa porta con sé, che copiando `sidebar-07` a mano non si ha
 *
 * Sei correzioni misurate in M2.5, ognuna delle quali è un difetto **muto**:
 * niente errore, niente avviso, solo un'interfaccia che si comporta male.
 *
 * 1. **Il `TooltipProvider` alla radice.** Senza, a colonna chiusa le voci sono
 *    icone senza etichetta — misurati zero tooltip su tre `Tab` e su un hover da
 *    nove decimi di secondo.
 * 2. **Il tooltip non passato affatto sotto la soglia mobile.** Il preset lo
 *    nasconde, ma la radice Base UI resta montata, si apre col fuoco e si prende
 *    il **primo `Esc`**: nel pannello a scomparsa il primo `Esc` non chiudeva
 *    niente e il secondo sì. Su un telefono è il tasto che sembra rotto.
 * 3. **`justify-center` sui bottoni `size="lg"` nel rail.** Il loro
 *    `group-data-[collapsible=icon]:p-0!` annulla il padding della base: il
 *    marchio restava **6px fuori asse** rispetto alle icone delle voci.
 * 4. **Il testo spento con `group-data-[collapsible=icon]:hidden`.** Né
 *    `truncate` né `flex-1` lo curano: restano 8px di riquadro, e nel rail si
 *    vedeva la «A» di Anagrafe accanto alla T.
 * 5. **L'`aria-label` su testata e piede.** Nascondere l'etichetta toglie anche
 *    il nome accessibile, e il tooltip **non è un nome** — è un popup che
 *    compare al passaggio, non qualcosa che un lettore di schermo annunci al
 *    posto del contenuto.
 * 6. **Il menù utente che si apre in basso sul telefono.** `side="right"` fisso
 *    lo fa uscire dallo schermo da una colonna di 256px dentro 375.
 *
 * E le **larghezze della colonna riscritte sulla scala della densità**, che è
 * l'unica eccezione accertata di M1.4: `SIDEBAR_WIDTH` e `SIDEBAR_WIDTH_ICON`
 * sono costanti JavaScript, non derivano da `--spacing`, e senza l'override in
 * touch la colonna resta a 256px mentre il suo contenuto cresce del 50%.
 *
 * ## Cosa non c'è
 *
 * **Il `SidebarRail`** — la striscia invisibile sul bordo destro che apre e
 * chiude la colonna. Non è montato. Tre misure da M2.5: è **ridondante** (il
 * grilletto in barra resta visibile a colonna chiusa, e `Ctrl`/`Cmd`+`B`
 * funziona sempre), è **irraggiungibile da tastiera** (`tabIndex={-1}`), e
 * **mente sul cursore** — mostra `w-resize`, cioè promette un ridimensionamento
 * che non esiste, ed è il solo dei tre modi di aprire la colonna che lo faccia.
 * È composizione, non componente: `SidebarRail` resta esportato, rimetterlo è
 * una riga.
 *
 * **La `page-header`** — titolo, breadcrumb di pagina, azioni. È M3.2, e sta
 * dentro `children`. Qui c'è lo slot `barra`, che è la fascia in alto di
 * `sidebar-07`.
 *
 * ## La fascia è l'unica intestazione, e non c'è un titolo di pagina
 *
 * Breadcrumb a sinistra, azioni della pagina a destra. **Nessun `<h1>`**: il
 * nome della pagina comparirebbe tre volte in 80px — voce attiva in sidebar,
 * ultimo livello del breadcrumb, titolo — ed è la forma che shadcn usa in
 * `dashboard-01`. Tolto il titolo si guadagnano ~50px di altezza utile su ogni
 * pagina, che a 375px non sono pochi.
 *
 * **Il guscio non contiene nessun bottone.** Espone slot vuoti: i bottoni che
 * si vedono in queste story sono dati della vetrina, come l'indirizzo
 * dell'utente o le voci «Cantieri» e «Utenti». Niente di tutto ciò viaggia nel
 * registry — «Nuovo prodotto» è un bottone di *Anagrafe*, non del design
 * system, e non esiste in nessun'altra pagina.
 *
 * **Il percorso corrente.** Il guscio non sa quali rotte esistano: `attiva` è
 * un dato che passa l'app, e i collegamenti si passano con `render` — un
 * `<NavLink>`, un `<Link>`, o niente e la voce resta un bottone.
 *
 * ## Le libertà che restano all'app
 *
 * - **Se raggruppare**: `titolo` di sezione è facoltativo, e una sezione sola
 *   senza titolo fa sparire il raggruppamento senza cambiare un componente.
 * - **Quali voci hanno un sottomenu**: basta passare `figli`, o non passarli.
 * - **Se le voci hanno un'icona.** Anagrafe oggi non ne ha: senza icone il rail
 *   sarebbe una fila di quadrati vuoti, e allora si passa `collassa="fuori"` —
 *   la colonna sparisce invece di ridursi.
 * - **Quanto è larga la pagina**: `larghezza="pagina"` la tiene entro i 1180px
 *   di `--container-page` e la centra; `piena` toglie il limite, ed è ciò che
 *   vogliono le tabelle grandi e i cruscotti.
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
  nome: 'Francesco',
  cognome: 'Sartori',
  email: 'fsartori@covicostruzioni.it',
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
 * Il percorso in fascia. In un'app si calcola dalla rotta; qui è dato.
 *
 * **I livelli intermedi spariscono sotto i 768px**, ed è il pattern di
 * `sidebar-07`. Non è zelo: misurato a 375px in densità **touch** il percorso
 * intero andava a capo dentro la fascia — il testo cresce dell'8%, i divari del
 * 50%, e la larghezza dello schermo di 0. In densità normale, alla stessa
 * larghezza, ci stava: è la cella `375px × touch` di D10, vista nella fascia
 * invece che nel contenuto.
 *
 * Il rimedio sta **qui e non nel guscio**, perché è l'app a sapere quali livelli
 * del proprio percorso si possono perdere. Il guscio fa la sua parte con
 * `min-w-0` sulla fascia: garantisce che a cedere sia il percorso e non le
 * azioni a destra.
 */
const PERCORSO = (
  <Breadcrumb>
    <BreadcrumbList className="flex-nowrap">
      <BreadcrumbItem className="hidden md:block">
        <BreadcrumbLink href="#">Prodotti</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator className="hidden md:block" />
      <BreadcrumbItem>
        <BreadcrumbPage>Famiglie</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
)

/**
 * Le azioni della pagina, nella fascia a destra.
 *
 * ## Perché non c'è un `<h1>` col nome della pagina
 *
 * Perché «Prodotti» comparirebbe **tre volte in 80px di altezza**: voce attiva
 * nella sidebar, ultimo livello del breadcrumb, titolo. Segnalato da Francesco
 * il 2026-09-10 guardando la story accanto a `dashboard-01` di shadcn, che
 * infatti un titolo di pagina non ce l'ha: il nome sta nella fascia. Tolto il
 * titolo, la fascia diventa l'unica riga di intestazione — breadcrumb a
 * sinistra, azioni a destra — e ogni pagina guadagna ~50px di altezza utile,
 * che a 375px non sono pochi.
 *
 * **Conseguenza per M3.2, e non è piccola**: se le azioni stanno nella fascia,
 * la fascia è renderizzata dal guscio ma il suo contenuto è **della pagina**.
 * Con `<AppShell>` montato una volta sola attorno all'`<Outlet />` la pagina
 * non può passargli delle prop: `page-header` dovrà offrire un contesto (o un
 * portale) con cui una pagina *dichiara* il proprio percorso e le proprie
 * azioni. shadcn non ha questo problema perché i suoi blocchi rendono il guscio
 * intero dentro ogni pagina.
 *
 * ## La grammatica delle azioni
 *
 * Non si sceglie il colore pagina per pagina: si sceglie il **ruolo**, e il
 * colore viene dietro.
 *
 * - **una sola** azione primaria per pagina, variante `default` (l'arancio del
 *   brand), **sempre con icona**;
 * - le azioni che le stanno accanto, `outline`;
 * - le distruttive, `destructive` — e mai come azione primaria di pagina.
 *
 * La parte che conta è **«una sola»**: due bottoni arancioni nella stessa
 * intestazione non sono due azioni importanti, sono zero. Anagrafe lo rispetta
 * già — «Sistema da BC» è secondario.
 *
 * **Taglia normale**, non `sm` come nel v1, e la ragione è misurata: `sm` in
 * densità touch fa **42px**, cioè sotto i 44 di WCAG e sotto i 48 che il v1
 * dava a `.btn` in cantiere. La taglia normale fa **32px in normale e 48 in
 * touch** — misurati: è esattamente il bersaglio da cantiere che la densità di
 * M1.4 esiste per produrre. Scelta di Francesco, 2026-09-10. Contrasto del
 * primario **9.49:1** in entrambe le modalità: l'arancio del brand come *fondo*
 * si legge — è come testo che non si usa mai, e per quello c'è `--accent-ink`.
 *
 * **I bottoni concreti restano dell'app**: «Nuovo prodotto» non è un bottone
 * del design system e non compare in nessun'altra pagina. Il guscio non
 * contiene bottoni, espone slot vuoti.
 */
const AZIONI_DI_PAGINA = (
  <>
    <Button variant="outline">Sistema da BC</Button>
    <Button>
      <PlusIcon />
      Nuovo prodotto
    </Button>
  </>
)

function Contenuto() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>L&apos;area di contenuto</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Il respiro attorno alla pagina lo possiede il guscio, non la pagina: sono due utility
          soltanto — <code>p-4</code> e <code>max-w-page</code> — ed è l&apos;unico modo perché un
          form e una tabella comincino allo stesso punto in tutte le app. Il padding segue la
          densità: 16px in normale, 24 in touch.
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Il guscio come lo vede chi apre l&apos;app: colonna aperta, percorso in fascia,
 * utente in fondo. Il grilletto in alto a sinistra chiude e riapre la colonna;
 * da tastiera risponde anche a `Ctrl`/`Cmd`+`B`.
 *
 * La story apre il **menù utente**, che è il popup del blocco: la passata
 * `aperto` del gate lo misura aperto, quella `chiuso` a riposo. Un popup non
 * aperto non è un popup senza violazioni.
 */
export const Predefinito: Story = {
  args: {
    applicazione: 'Anagrafe',
    sezioni: SEZIONI,
    utente: UTENTE,
    azioniUtente: AZIONI_UTENTE,
    barra: PERCORSO,
    azioni: AZIONI_DI_PAGINA,
    children: <Contenuto />,
  },
  /*
   * Il grilletto è il bottone dell'utente, e il suo `data-slot` va **guardato,
   * non dedotto**. Qui `DropdownMenuTrigger` rende *attraverso*
   * `SidebarMenuButton` e nel DOM vince `dropdown-menu-trigger`; nel `combobox`
   * la stessa forma dà il risultato opposto — lì `InputGroupButton` si riprende
   * lo slot. Le due composizioni si somigliano e finiscono in modo diverso: è
   * la ragione per cui `apri.ts` vuole un **selettore** e non un nome di slot.
   *
   * Il gate ha preso la prima stesura sbagliata al primo colpo, e per come deve:
   * `grilletto()` lancia quando il selettore non trova niente, invece di
   * lasciar passare la story per «senza popup».
   */
  play: apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * Collassato a icone: resta la sola T in cima, il solo avatar in fondo, e i
 * sottolivelli spariscono. Le etichette diventano tooltip — ed è per quelle che
 * il guscio monta il `TooltipProvider`.
 *
 * In densità touch il rail passa da 48 a **72px**: senza l&apos;override delle
 * larghezze resterebbe a 48, cioè esattamente riempito da una voce da 48, zero
 * margine attorno all&apos;icona.
 */
export const Collassato: Story = {
  args: { ...Predefinito.args, defaultAperta: false },
}

/**
 * **La forma che serve ad Anagrafe oggi**: voci senza icona, quindi
 * `collassa="fuori"` — la colonna sparisce invece di ridursi a una fila di
 * quadrati vuoti — e `larghezza="piena"`, che è ciò che vuole una tabella di
 * prodotti.
 *
 * Sono le sezioni vere di `NAV_SEZIONI`, con «Famiglie EPD» disabilitata come
 * in produzione.
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
 * Sotto i 768px la colonna **non** si comprime: sparisce dal DOM, e il grilletto
 * apre al suo posto uno `Sheet` da 281px col fuoco intrappolato ed `Esc` che
 * chiude al primo colpo. È il ramo `isMobile` del componente, e non c&apos;è
 * niente da scrivere per averlo.
 *
 * È qui che si guarda **D10**: a 375px la colonna non c&apos;è più, quindi
 * l&apos;unica cosa che mangia larghezza è il padding di pagina — 16px per lato
 * in normale, 24 in touch. La misura è in `WORKLOG.md`, M3.1.
 */
export const Telefono: Story = {
  globals: { viewport: { value: 'telefono', isRotated: false } },
  args: Predefinito.args,
}
