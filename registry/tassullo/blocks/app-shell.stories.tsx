import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BoxesIcon,
  FileTextIcon,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/tassullo/ui/card'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/registry/tassullo/ui/dropdown-menu'
import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
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
 *   tutte le pagine — il `SelettoreContesto` di `tassullo-barra-contesto`.
 *   Serve solo alle app che hanno un'entità attiva di questo tipo.
 * - `collassa`: `"icona"`, il predefinito, chiude la colonna a una fila di
 *   icone; `"fuori"` la fa sparire, ed è la scelta per voci senza icona.
 * - `defaultAperta`: la colonna parte aperta o chiusa.
 * - `larghezza`: `"piena"`, il predefinito, dà al contenuto tutta la
 *   larghezza; `"pagina"` lo tiene entro `--container-page` e lo centra, per
 *   un modulo o un testo lungo.
 * - `contenuto`: `"scorre"`, il predefinito, lascia crescere la pagina;
 *   `"riempie"` ferma il guscio all'altezza della finestra, per una pagina
 *   che è una lista con lo scorrimento interno.
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
 * - Con `contenuto="riempie"` la pagina rende una colonna
 *   `flex h-full min-h-0 flex-col`, con la tabella come figlio
 *   `min-h-0 flex-1`: è la forma di `altezza="ferma"` di
 *   `tassullo-data-table`.
 *
 * **Tastiera e accessibilità.** `Ctrl`+`B` o `⌘`+`B` apre e chiude la colonna
 * da qualunque punto; lo fa anche il grilletto in fascia. A colonna chiusa i
 * nomi delle voci arrivano come tooltip, al passaggio e al fuoco; testata e
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
   *
   * Il gate ha preso la prima stesura sbagliata al primo colpo, e per come deve:
   * `grilletto()` lancia quando il selettore non trova niente, invece di
   * lasciar passare la story per «senza popup».
   */
  play: apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * La colonna chiusa a icone: la T in cima, l'avatar in fondo, i sottolivelli
 * nascosti. I nomi delle voci compaiono come tooltip.
 */
export const Collassato: Story = {
  args: { ...Predefinito.args, defaultAperta: false },
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
 * apre il pannello laterale. Si vede aprendo la scena da sola: nella pagina
 * di documentazione rende la forma della scrivania.
 */
export const Telefono: Story = {
  globals: { viewport: { value: 'telefono', isRotated: false } },
  args: Predefinito.args,
}
