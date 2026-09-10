import type { CSSProperties, ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BoxesIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  FileTextIcon,
  HardHatIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react'

import { cn } from 'cn'
import { Avatar, AvatarFallback } from '@/registry/tassullo/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/registry/tassullo/ui/breadcrumb'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/registry/tassullo/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/tassullo/ui/dropdown-menu'
import { Separator } from '@/registry/tassullo/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/registry/tassullo/ui/sidebar'
import { TooltipProvider } from '@/registry/tassullo/ui/tooltip'

/**
 * `sidebar.tsx` è **identico all'originale nella forma**, con un solo ri-stile
 * e un intervento di lingua — «Toggle Sidebar» e il titolo del pannello
 * mobile, che sono le sole stringhe del componente che arrivano a un utente, e
 * le sente **solo chi usa uno screen reader**.
 *
 * **Il ri-stile è l'opacità sull'etichetta di gruppo.** Il preset scrive
 * `text-sidebar-foreground/70`: il token pieno sul fondo della sidebar fa
 * 7.75:1, al 70% fa **4.41 in chiaro e 4.21 in scuro**, cioè sotto soglia in
 * entrambe. È la **seconda volta** che l'opacità su un testo apre un difetto
 * che `check:contrast` non può vedere — la prima erano gli alert di M2.4 —
 * perché il gate verifica le *coppie di token* e nessun token dichiara con
 * quanta opacità un componente lo usa. Tolto il `/70`: la gerarchia fra
 * etichetta e voce la fanno già la taglia (`text-xs` contro `text-sm`) e il
 * peso, che non costano contrasto.
 *
 * Che non ci fosse altro da ri-stilare non era scontato, ed è la conferma che
 * la palette è nel posto giusto: il preset dipinge la sidebar con la famiglia
 * `--sidebar-*`, che il tema Tassullo definisce **antracite in entrambe le
 * modalità** (`#141414` in chiaro, `#1C1C1C` in scuro). La sidebar del v1 non
 * è una superficie che segue il tema: è *l'unica superficie scura* delle app,
 * e resta scura anche quando la pagina è chiara.
 *
 * **Lo stato attivo è già quello del v1, alla lettera.** In `components.css`
 * del v1 la regola è `.sidebar-item:hover, .sidebar-item.is-active { background:
 * var(--color-sidebar-hover); color: var(--color-sidebar-text-hi) }` — cioè
 * esattamente `data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground`
 * del preset, sugli stessi due colori. shadcn ci aggiunge
 * `data-active:font-medium`, che il v1 non aveva perché dava peso 500 a
 * *tutte* le voci: è un guadagno, perché nel v1 attivo e hover erano
 * indistinguibili.
 *
 * ## La composizione: marchio in cima, utente in fondo
 *
 * L'impianto è quello del blocco **`sidebar-07`** di shadcn — «a sidebar that
 * collapses to icons» — coi menu annidati del suo `nav-main`: un `Collapsible`
 * che *rende* il `SidebarMenuItem` e un `CollapsibleTrigger` che rende il
 * `SidebarMenuButton`. È indicazione di Francesco, e coincide con la sidebar
 * che Anagrafe ha già in produzione.
 *
 * Due estremi fissi:
 *
 * - **in cima il marchio più il nome dell'applicativo**, e a sidebar chiusa
 *   resta la sola T. Non c'è niente da nascondere a mano: la testata è un
 *   `SidebarMenuButton size="lg"`, e il marchio sta nel riquadro d'icona che il
 *   bottone tiene sempre. **Il nome però non sparisce da sé, e questa è la
 *   trappola**: il bottone collassato è 32px con `overflow-hidden`, ma il testo
 *   comincia dopo l'icona da 16 e il divario da 8, quindi gli restano **8px
 *   dentro il riquadro** — misurato — e nel rail si vedeva una «A» accanto
 *   alla T. Non lo cura né `truncate` né `flex-1`: va scritto
 *   `group-data-[collapsible=icon]:hidden` sul blocco di testo, che è come
 *   shadcn stesso spegne le parti che nel rail non ci stanno.
 * - **in fondo l'utente**, con avatar, indirizzo, ruolo e un menu per le
 *   opzioni — profilo, impostazioni, uscita. Stessa forma: collassato resta il
 *   solo avatar, e il menu si apre di lato invece che sopra.
 *
 * **Nel rail il marchio va centrato a mano, e non è ovvio perché.** I bottoni
 * `size="lg"` — testata e utente — portano `group-data-[collapsible=icon]:p-0!`,
 * che annulla il `p-2!` della base: il contenuto resta appoggiato a sinistra
 * invece di stare al centro. Misurato: bottone da 32px centrato a 24 nel rail,
 * ma il marchio dentro centrato a **18**, cioè **6px fuori asse** rispetto alle
 * icone delle voci. Si rimette con `group-data-[collapsible=icon]:justify-center`
 * sul bottone — segnalato da Francesco guardando la story, e vale per
 * qualunque `size="lg"` nella sidebar.
 *
 * ## Le sezioni sono facoltative, e i sottomenu si decidono voce per voce
 *
 * `sidebar-07` raggruppa le voci in sezioni — da loro *Platform* e *Projects* —
 * e la navigazione qui è scritta allo stesso modo: un elenco di **sezioni**,
 * ciascuna con la sua `SidebarGroup` e la sua `SidebarGroupLabel`, ciascuna
 * con le sue **voci**. Sono due libertà che restano **all'app**, non al design
 * system:
 *
 * - **se raggruppare**: una sezione sola e il raggruppamento sparisce da sé,
 *   senza cambiare un componente;
 * - **quali voci hanno un sottomenu**: basta passare `figli`, o non passarli.
 *   Qui `Prodotti` e `Documenti` ce l'hanno, `Cruscotto` no.
 *
 * Una conseguenza da conoscere: **nel rail spariscono i nomi delle sezioni,
 * non le sezioni.** Il preset spegne le etichette di gruppo quando la sidebar
 * è collassata (`group-data-[collapsible=icon]:-mt-8` e `opacity-0`), ma il
 * `p-2` di ogni `SidebarGroup` resta, quindi fra un gruppo e l'altro rimane
 * uno stacco visibile: si vede *che* ci sono due sezioni, non *come si
 * chiamano*. Se anche il nome deve arrivare a rail chiuso, l'unica strada è
 * il tooltip sulle voci — e per quello serve il `TooltipProvider` di cui
 * sopra.
 *
 * **Il marchio non è più incollato qui.** Fino a M2.9 il tracciato stava in
 * questa story, ed era la deriva che la regola permanente vieta: una copia in
 * ogni app. Ora è una **classe del tema** — `.marchio-t`, l'item `tema-logo`,
 * che arriva con `add @tassullo/tema` — e il tracciato fa da maschera, quindi
 * il colore segue il testo. È **D13**, chiusa il 2026-09-10 (`docs/DECISIONI.md`
 * §28).
 *
 * ## Un requisito d'uso che costa le etichette: serve un `TooltipProvider`
 *
 * A sidebar collassata le voci sono sole icone, e il preset restituisce
 * l'etichetta come tooltip. **Senza un `TooltipProvider` che avvolge l'albero
 * il tooltip non compare — né col fuoco né col mouse — e non c'è nessun
 * errore**: la sidebar chiusa diventa una fila di icone mute. Misurato: senza
 * provider, zero tooltip su tre `Tab` e su un hover da nove decimi di secondo.
 * È la stessa famiglia del `select` che vuole `items` (M2.2) e del
 * `DropdownMenuLabel` che vuole un `Group` (M2.3), e va nel fascicolo di M3.1:
 * il provider sta **una volta sola**, alla radice dell'app.
 *
 * **E nascondere l'etichetta toglie anche il nome accessibile.** Con
 * `group-data-[collapsible=icon]:hidden` sul testo, a sidebar chiusa la
 * testata resta un bottone con dentro un solo SVG: axe l'ha presa come
 * `button-name`, in entrambe le modalità. Il tooltip **non** è un nome — è un
 * popup che compare al passaggio, non qualcosa che un lettore di schermo
 * annuncia al posto del contenuto. Serve un `aria-label` esplicito su testata
 * e piede. Il bottone dell'utente non era stato segnalato solo perché
 * l'avatar porta le iniziali, e «FS» come nome di un bottone è peggio di
 * niente: ha un `aria-label` anche lui.
 *
 * ## E sul telefono il primo `Esc` non chiude niente
 *
 * Misurato sullo `Sheet` da 375: aperto il pannello, il fuoco va su un
 * `SidebarMenuButton`; **il primo `Esc` non chiude, il secondo sì**. Non è lo
 * `Sheet`: togliendo il fuoco, un `Esc` solo basta.
 *
 * La causa è il `tooltip` del bottone. Sotto la soglia mobile il preset non
 * *mostra* il tooltip — `hidden={state !== "collapsed" || isMobile}` — ma la
 * radice Base UI resta montata lo stesso, si apre col fuoco e **si prende il
 * primo `Esc`**, invisibile. Su un telefono è il tasto che sembra rotto.
 *
 * È comportamento, non stringhe di classi: non si ri-stila. Ma non serve
 * toccare il componente, perché il rimedio sta nella composizione e usa la sua
 * API pubblica — `useSidebar().isMobile`, e il `tooltip` non si passa affatto
 * quando non servirebbe. È la forma che queste story usano, e con quella
 * l'`Esc` chiude al primo colpo. Da portare in `tassullo-app-shell` (M3.1):
 * `sidebar-07` di shadcn passa il tooltip sempre, quindi chiunque copi il
 * blocco a occhi chiusi si porta dietro il difetto.
 *
 * ## La densità: qui si chiude l'unica eccezione di M1.4
 *
 * `SIDEBAR_WIDTH` (`16rem`) e `SIDEBAR_WIDTH_ICON` (`3rem`) sono **costanti
 * JavaScript**, non utility Tailwind: non derivano da `--spacing` e in touch
 * restavano identiche mentre il loro contenuto cresceva. Misurato senza
 * rimedio, in touch: colonna ferma a **256px** con voci da 48, e rail
 * collassato a **48px** riempito **esattamente** da un `SidebarMenuButton` da
 * 48 — zero margine attorno all'icona, come M1.4 aveva previsto.
 *
 * Non si patcha il componente: `SidebarProvider` accetta uno `style` che
 * sovrascrive le due variabili, e lì le si esprime in unità di `--spacing`
 * conservando i valori di densità normale — `calc(var(--spacing) * 64)` fa
 * **256px in normale e 384 in touch**, `calc(var(--spacing) * 12)` fa **48 e
 * 72**. È la forma che tutte le story qui usano, ed è quella che il blocco
 * `tassullo-app-shell` (M3.1) porterà alle app: **l'override non va copiato in
 * ogni app**, ci sta il blocco, e il blocco sta nel registry.
 *
 * **La terza costante non ha via d'uscita, e va saputo.**
 * `SIDEBAR_WIDTH_MOBILE` (`18rem`) è scritta *dentro* `Sidebar`, sullo `style`
 * dello `SheetContent`, dove non arrivano né `style` né `className` del
 * chiamante: da fuori non è sovrascrivibile in nessun modo. Non è un problema
 * — misurati 281px su un telefono da 375, ed è già più largo dei 256 della
 * scrivania — ma è una libertà che il componente non concede, e chi scrive
 * M3.1 non deve perderci una mezz'ora.
 *
 * ## Sotto la soglia mobile diventa uno `Sheet`, e non lo scriviamo noi
 *
 * `useIsMobile` (768px) fa passare `Sidebar` al ramo `Sheet`: la colonna fissa
 * sparisce del tutto dal DOM e il grilletto apre un pannello a scomparsa col
 * fuoco intrappolato ed `Esc` che chiude riportando il fuoco al grilletto —
 * verificato in un browser vero. È responsive nativo di shadcn: si eredita,
 * non si riscrive.
 */
const meta = {
  title: 'Primitive/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Le due larghezze in unità di `--spacing`, così la sidebar segue la densità.
 * Sono i valori di shadcn — 16rem e 3rem — riscritti sulla scala: in densità
 * normale la resa è identica a quella del preset, in touch cresce con tutto il
 * resto.
 */
const larghezze = {
  '--sidebar-width': 'calc(var(--spacing) * 64)',
  '--sidebar-width-icon': 'calc(var(--spacing) * 12)',
} as CSSProperties

/**
 * Il marchio Tassullo. Non è un componente e non è un file in `public/`: è la
 * classe `.marchio-t` del tema (item `tema-logo`, D13 chiusa il 2026-09-10).
 *
 * Il tracciato fa da **maschera** e il colore lo dà `currentColor`, quindi la
 * stessa classe è giusta sulla sidebar antracite come su una pagina chiara.
 * `size-6` e non `h-6`: il `viewBox` non è quadrato — la T è più alta che larga
 * (24×38) — e dentro un quadrato la maschera si allinea all'altezza e resta
 * stretta, che è come si allinea alle icone quadrate delle voci.
 */
function MarchioT({ className }: { className?: string }) {
  return <span aria-hidden className={cn('marchio-t', className)} />
}

const sezioni = [
  {
    titolo: 'Anagrafe',
    voci: [
      { titolo: 'Cruscotto', icona: LayoutDashboardIcon },
      {
        titolo: 'Prodotti',
        icona: BoxesIcon,
        attiva: true,
        figli: ['Famiglie', 'Sistemi', 'Norme'],
      },
      { titolo: 'Documenti', icona: FileTextIcon, figli: ['Schede tecniche', 'Certificati'] },
    ],
  },
  {
    titolo: 'Gestione',
    voci: [
      { titolo: 'Cantieri', icona: HardHatIcon, badge: '7' },
      { titolo: 'Utenti', icona: UsersIcon },
    ],
  },
]

/** La testata: marchio più nome dell'applicativo. Collassata resta la T. */
function Testata() {
  const { isMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip={isMobile ? undefined : 'Anagrafe'}
          aria-label="Anagrafe"
          className="group-data-[collapsible=icon]:justify-center"
        >
          <MarchioT className="size-6 shrink-0 text-sidebar-accent-foreground" />
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold text-sidebar-accent-foreground">Anagrafe</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/**
 * Il piede: l'utente e le sue opzioni. Collassato resta il solo avatar.
 *
 * **Il menù si apre a destra sulla scrivania e in basso sul telefono**, ed è
 * il pattern che shadcn scrive nel proprio blocco `sidebar-07`. Non è un
 * dettaglio di gusto: `side="right"` fisso chiede al menù di aprirsi fuori
 * da una colonna larga 256px dentro uno schermo da 375, e il pannello
 * finisce tagliato dal bordo (segnalato da Francesco guardando la story a
 * 375px in densità touch). Non si risolve da sé con una larghezza massima:
 * la posizione la decide questa riga.
 *
 * `isMobile` non è una novità da introdurre — `useSidebar()` lo espone già, e
 * la `Testata` qui sopra lo usa per spegnere i tooltip. È una scelta di
 * **composizione**, non una modifica al componente: nessuna divergenza da
 * riportare al prossimo aggiornamento di shadcn, anzi un allineamento al loro.
 */
function Utente() {
  const { isMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                aria-label="fsartori@covicostruzioni.it — opzioni dell'utente"
                className="group-data-[collapsible=icon]:justify-center data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                FS
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-medium text-sidebar-accent-foreground">
                fsartori@covicostruzioni.it
              </span>
              <span className="truncate text-xs">Sola lettura</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
            className="w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                fsartori@covicostruzioni.it
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
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
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/**
 * Le voci di una sezione. Quelle con figli sono un `Collapsible` che *rende*
 * il `SidebarMenuItem`: è la forma di `sidebar-07`, e il vantaggio è che il
 * sottolivello sparisce da sé quando la sidebar è collassata a icone — un
 * albero di navigazione dentro un rail da 48px non si legge.
 *
 * Il sottomenu è **per voce**, non per sezione: `Prodotti` e `Documenti` ce
 * l'hanno, `Cruscotto` no, e non serve dichiararlo da nessuna parte — basta
 * non passare `figli`.
 */
function Voci({ voci }: { voci: (typeof sezioni)[number]['voci'] }) {
  const { isMobile } = useSidebar()
  const suggerimento = (titolo: string) => (isMobile ? undefined : titolo)
  return (
    <SidebarMenu>
      {voci.map((voce) => {
        const Icona = voce.icona
        return 'figli' in voce && voce.figli ? (
          <Collapsible
            key={voce.titolo}
            defaultOpen={'attiva' in voce && voce.attiva}
            className="group/collapsible"
            render={<SidebarMenuItem />}
          >
            <CollapsibleTrigger
              render={
                <SidebarMenuButton
                  isActive={'attiva' in voce && voce.attiva}
                  tooltip={suggerimento(voce.titolo)}
                />
              }
            >
              <Icona />
              <span>{voce.titolo}</span>
              <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {voce.figli.map((figlio) => (
                  <SidebarMenuSubItem key={figlio}>
                    <SidebarMenuSubButton href="#" isActive={figlio === 'Famiglie'}>
                      <span>{figlio}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <SidebarMenuItem key={voce.titolo}>
            <SidebarMenuButton tooltip={suggerimento(voce.titolo)}>
              <Icona />
              <span>{voce.titolo}</span>
            </SidebarMenuButton>
            {'badge' in voce && voce.badge ? (
              <SidebarMenuBadge>{voce.badge}</SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

/** Le sezioni, una `SidebarGroup` ciascuna con la sua etichetta. */
function Navigazione() {
  return (
    <>
      {sezioni.map((sezione) => (
        <SidebarGroup key={sezione.titolo}>
          <SidebarGroupLabel>{sezione.titolo}</SidebarGroupLabel>
          <Voci voci={sezione.voci} />
        </SidebarGroup>
      ))}
    </>
  )
}

/**
 * La pagina accanto alla sidebar. La testata è quella di `sidebar-07`:
 * grilletto, filo verticale, **breadcrumb** — e il percorso rispecchia la voce
 * attiva nel menu, `Prodotti › Famiglie`.
 *
 * **Il percorso è dato, non stato del design system.** Qui è scritto a mano
 * perché una story non naviga da nessuna parte; in un'app lo si calcola dalla
 * rotta corrente, e il design system dà solo la forma. La testata come
 * elemento a sé — titolo, breadcrumb e slot per le azioni, una sola per tutte
 * le pagine di tutte le app — è `page-header`, M3.2.
 */
function Pagina({ children }: { children: ReactNode }) {
  return (
    <SidebarInset>
      <header className="flex h-12 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-auto" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Prodotti</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Famiglie</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="p-4 text-sm text-muted-foreground">{children}</div>
    </SidebarInset>
  )
}

function Guscio({
  aperta = true,
  contenuto,
  children,
}: {
  aperta?: boolean
  contenuto?: ReactNode
  children: ReactNode
}) {
  return (
    // Senza questo provider le etichette della sidebar collassata non
    // compaiono, e nessun errore lo dice.
    <TooltipProvider>
      <SidebarProvider defaultOpen={aperta} style={larghezze}>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Testata />
          </SidebarHeader>
          <SidebarContent>
            {contenuto ?? <Navigazione />}
          </SidebarContent>
          <SidebarFooter>
            <Utente />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <Pagina>{children}</Pagina>
      </SidebarProvider>
    </TooltipProvider>
  )
}

/**
 * La sidebar aperta: marchio e nome in cima, menu annidati al centro con la
 * voce attiva e i contatori, utente in fondo. Il grilletto in testata la
 * chiude e la riapre; da tastiera risponde anche a `Ctrl`/`Cmd`+`B`.
 */
export const Aperta: Story = {
  render: () => (
    <Guscio>
      La colonna scura resta scura anche in modalità chiara: nel v1 è l&apos;unica superficie
      antracite, e il tema la dichiara con la famiglia <code>--sidebar-*</code>.
    </Guscio>
  ),
}

/**
 * Collassata a icone: resta la sola T in cima, il solo avatar in fondo, e i
 * sottolivelli spariscono. È qui che si vedeva l&apos;eccezione di M1.4 —
 * senza l&apos;override il rail resta 48px in entrambe le densità, e in touch
 * la voce da 48px lo riempie fino al bordo. Con `--sidebar-width-icon` sulla
 * scala il rail passa a 72px e il margine attorno all&apos;icona torna.
 *
 * Le etichette diventano tooltip, e per quelle serve il `TooltipProvider`.
 */
export const Collassata: Story = {
  render: () => <Guscio aperta={false}>Il grilletto in testata la riapre.</Guscio>,
}

/**
 * Il menu mentre i dati arrivano. `SidebarMenuSkeleton` dà a ogni riga una
 * larghezza casuale fra il 50 e il 90%: una fila di barre identiche si legge
 * come un&apos;interfaccia rotta, non come un caricamento.
 */
export const InCaricamento: Story = {
  render: () => (
    <Guscio
      contenuto={
        <SidebarGroup>
          <SidebarGroupLabel>Anagrafe</SidebarGroupLabel>
          <SidebarMenu>
            {[0, 1, 2, 3, 4].map((i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      }
    >
      Le righe hanno larghezze diverse apposta.
    </Guscio>
  ),
}

/**
 * Sotto i 768px la sidebar **non** si comprime: sparisce dal DOM, e il
 * grilletto apre al suo posto uno `Sheet` da 281px col fuoco intrappolato ed
 * `Esc` che chiude. È il ramo `isMobile` del componente, e non c&apos;è niente
 * da scrivere per averlo.
 */
export const Telefono: Story = {
  globals: { viewport: { value: 'telefono', isRotated: false } },
  render: () => <Guscio>Il grilletto apre il pannello a scomparsa.</Guscio>,
}
