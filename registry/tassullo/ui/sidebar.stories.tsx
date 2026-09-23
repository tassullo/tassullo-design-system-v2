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
 * La colonna di navigazione dell'applicativo: il marchio e il nome in cima, le
 * sezioni e le voci al centro, l'utente in fondo. Si chiude a una fila di
 * icone e sul telefono diventa un pannello a scomparsa.
 *
 * **Quando sì, quando no.** Per un applicativo intero non si compone a mano:
 * il blocco `tassullo-app-shell` ha già la colonna, la testata di pagina e
 * tutte le regole qui sotto. La primitiva serve quando il guscio non basta.
 * Una navigazione dentro una pagina — schede di un dettaglio, passi di una
 * procedura — è `tabs` o `stepper`, non una seconda sidebar.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/sidebar
 * ```
 *
 * **Parti e opzioni.** `SidebarProvider` avvolge colonna e pagina, con
 * `defaultOpen`; `Sidebar` con `collapsible="icon"` si chiude a icone;
 * `SidebarHeader`, `SidebarContent`, `SidebarFooter` sono cima, centro e
 * fondo; `SidebarGroup` e `SidebarGroupLabel` una sezione col suo nome;
 * `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` (con `isActive`,
 * `tooltip`, `size="lg"` per testata e utente); `SidebarMenuSub` e le sue
 * voci per il sottolivello; `SidebarMenuBadge` per un conteggio;
 * `SidebarMenuSkeleton` durante il caricamento; `SidebarTrigger` il bottone
 * che apre e chiude; `SidebarRail` il bordo che si clicca per fare lo stesso;
 * `SidebarInset` la pagina accanto; `useSidebar()` dà `isMobile` e lo stato.
 *
 * **Regole d'uso.**
 *
 * - **La densità non scala la sidebar da sola.** Le larghezze sono costanti
 *   del componente, non derivano da `--spacing`: in densità touch le voci
 *   crescono e la colonna no. Per farla crescere insieme, `SidebarProvider`
 *   riceve uno `style` con due variabili, `--sidebar-width` a
 *   `calc(var(--spacing) * 64)` e `--sidebar-width-icon` a
 *   `calc(var(--spacing) * 12)`: in densità normale rendono la stessa misura
 *   del componente. La larghezza del pannello sul telefono non si può
 *   cambiare da fuori.
 * - Un `TooltipProvider` avvolge l'applicativo, una volta sola alla radice:
 *   a colonna chiusa i nomi delle voci arrivano come tooltip, e senza il
 *   provider non compaiono, senza alcun errore.
 * - Il `tooltip` di una voce si passa solo fuori dal telefono:
 *   `tooltip={isMobile ? undefined : titolo}`. Sul telefono il tooltip non si
 *   vede ma resta montato, e si prende il primo `Esc`.
 * - Nei bottoni `size="lg"` — testata e utente — il blocco di testo porta
 *   `group-data-[collapsible=icon]:hidden`, e il bottone
 *   `group-data-[collapsible=icon]:justify-center`: senza il primo, nella
 *   colonna chiusa spunta un pezzo del nome; senza il secondo, il marchio
 *   esce dall'asse delle icone.
 * - Nascosto il testo, il bottone resta senza nome: testata e utente hanno un
 *   `aria-label` esplicito. Il tooltip non vale come nome.
 * - Il menu dell'utente si apre di lato sulla scrivania e sotto sul telefono:
 *   `side={isMobile ? 'bottom' : 'right'}`.
 * - Il marchio è la classe `.marchio-t` del tema, in un elemento
 *   `aria-hidden` con `size-6`: il colore lo dà il testo.
 * - Le sezioni sono facoltative: con una sezione sola il raggruppamento non
 *   si vede. Il sottolivello si decide voce per voce: un `Collapsible` che
 *   rende il `SidebarMenuItem`, con un `CollapsibleTrigger` che rende il
 *   `SidebarMenuButton`. A colonna chiusa i sottolivelli spariscono e restano
 *   gli stacchi fra le sezioni, senza i loro nomi.
 *
 * **Tastiera e accessibilità.** `Ctrl`+`B` o `⌘`+`B` apre e chiude la
 * colonna da qualunque punto della pagina. Sotto i 768px la colonna esce dal
 * DOM e il grilletto apre un pannello laterale: il fuoco entra e gira al suo
 * interno, `Esc` chiude e il fuoco torna sul grilletto. La colonna resta
 * antracite in entrambe le modalità, coi colori della famiglia `--sidebar-*`.
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
 * La colonna aperta: marchio e nome in cima, due sezioni con la voce attiva,
 * un sottolivello aperto e un conteggio, l'utente in fondo.
 */
export const Aperta: Story = {
  render: () => (
    <Guscio>
      La colonna resta antracite anche in modalità chiara: i suoi colori sono la famiglia di
      token <code>--sidebar-*</code>.
    </Guscio>
  ),
}

/**
 * Chiusa a icone: la T in cima, l'avatar in fondo, niente sottolivelli. I
 * nomi delle voci compaiono come tooltip al passaggio e al fuoco.
 */
export const Collassata: Story = {
  render: () => <Guscio aperta={false}>Il grilletto in testata la riapre.</Guscio>,
}

/**
 * Il menu mentre i dati arrivano: righe di larghezza diversa, perché una fila
 * di barre identiche sembra un'interfaccia rotta.
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
 * Alla larghezza del telefono: la colonna non c'è, e il grilletto in testata
 * apre il pannello laterale.
 */
export const Telefono: Story = {
  globals: { viewport: { value: 'telefono', isRotated: false } },
  render: () => <Guscio>Il grilletto apre il pannello a scomparsa.</Guscio>,
}
