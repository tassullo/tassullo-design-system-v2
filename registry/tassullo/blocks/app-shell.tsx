/**
 * `tassullo-app-shell` — il guscio di ogni applicazione Tassullo.
 *
 * Sostituisce `Sidebar.tsx` + `Sidebar.css` di Anagrafe (190 righe di CSS di
 * pagina) e, con esse, il fatto che ogni app si riscriva il proprio guscio.
 * Qui dentro stanno **le sei correzioni misurate in M2.5**, che chi copiasse a
 * mano il blocco `sidebar-07` di shadcn si porterebbe dietro come difetti:
 *
 * 1. il `TooltipProvider` alla radice — senza, a colonna chiusa le voci sono
 *    icone mute e nessun errore lo dice;
 * 2. il tooltip **non passato affatto** sotto la soglia mobile — la radice
 *    resta montata comunque, si apre col fuoco e si prende il primo `Esc`, che
 *    su un telefono è il tasto che sembra rotto;
 * 3. `justify-center` sui bottoni `size="lg"` nel rail — il loro
 *    `group-data-[collapsible=icon]:p-0!` annulla il padding e lasciava il
 *    marchio 6px fuori asse rispetto alle icone delle voci;
 * 4. il blocco di testo spento con `group-data-[collapsible=icon]:hidden` —
 *    `truncate` e `flex-1` non bastano, restano 8px di riquadro e nel rail si
 *    vedeva la prima lettera del nome accanto al marchio;
 * 5. l'`aria-label` esplicito su testata e piede — nascondere l'etichetta
 *    toglie anche il nome accessibile, e il tooltip non è un nome;
 * 6. il menù utente che si apre **in basso** sul telefono — `side="right"`
 *    fisso lo fa uscire dallo schermo da una colonna di 256px dentro 375.
 *
 * ── Cosa NON c'è, e perché ───────────────────────────────────────────────
 *
 * **Il `SidebarRail`.** È la striscia invisibile a cavallo del bordo destro che
 * apre e chiude la colonna. Non è montato, ed è una scelta di composizione —
 * nessuna divergenza dal componente, che resta esportato da `sidebar.tsx` per
 * chi lo volesse. Tre misure, tutte da M2.5: è **ridondante** (il grilletto in
 * barra resta visibile a colonna chiusa e `Ctrl`/`Cmd`+`B` funziona sempre),
 * è **irraggiungibile da tastiera** (`tabIndex={-1}`), e **mente sul cursore**
 * — mostra `w-resize`, cioè promette un ridimensionamento che non esiste. È il
 * solo dei tre modi di aprire la colonna che ha tutti e tre i difetti.
 *
 * **La `page-header`** — titolo, breadcrumb, azioni di pagina. È M3.2, e sta
 * dentro `children`. Qui c'è solo lo slot `barra`, che è la fascia in alto di
 * `sidebar-07`: grilletto, filo, e ciò che l'app ci mette.
 *
 * **Il percorso corrente.** Il guscio non sa che rotte esistono: `attiva` è un
 * dato che passa l'app, e i collegamenti si passano con `render` — un
 * `<NavLink>` di react-router, un `<Link>`, o niente e resta un bottone. Il
 * design system dà la forma, non la navigazione.
 */
import type {
  ComponentProps,
  ComponentType,
  CSSProperties,
  ReactElement,
  ReactNode,
} from "react"
import { ChevronRightIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "cn"
import { Avatar, AvatarFallback } from "@/registry/tassullo/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/tassullo/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/tassullo/ui/dropdown-menu"
import { Separator } from "@/registry/tassullo/ui/separator"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/registry/tassullo/ui/sidebar"
import { TooltipProvider } from "@/registry/tassullo/ui/tooltip"

/**
 * Le due larghezze della colonna, riscritte in unità di `--spacing` così che
 * seguano la densità.
 *
 * `SIDEBAR_WIDTH` e `SIDEBAR_WIDTH_ICON` sono **costanti JavaScript** dentro
 * `sidebar.tsx`: non derivano da `--spacing` e in touch resterebbero identiche
 * mentre il loro contenuto cresce — misurato in M2.5, rail collassato a 48px
 * riempito *esattamente* da una voce da 48, zero margine attorno all'icona.
 * `calc(var(--spacing) * 64)` fa 256px in normale e 384 in touch,
 * `calc(var(--spacing) * 12)` fa 48 e 72: in densità normale la resa è identica
 * a quella del preset.
 *
 * È l'unica eccezione accertata alla densità del tema (M1.4), e sta **qui**
 * perché nessuna app la ricopi.
 *
 * La terza costante, `SIDEBAR_WIDTH_MOBILE`, è scritta dentro lo `SheetContent`
 * dove non arrivano né `style` né `className` del chiamante: da fuori non è
 * sovrascrivibile in nessun modo. Non è un problema — 281px su un telefono da
 * 375 sono già più dei 256 della scrivania — ma è una libertà che il componente
 * non concede, e vale la pena saperlo prima di cercarla.
 */
const LARGHEZZE = {
  "--sidebar-width": "calc(var(--spacing) * 64)",
  "--sidebar-width-icon": "calc(var(--spacing) * 12)",
} as CSSProperties

/** Un'icona Lucide, o qualunque componente che accetti una `className`. */
type Icona = ComponentType<{ className?: string }>

/** Una voce di secondo livello. Non ha icona: nel sottomenu non ci starebbe. */
export type SottoVoceNav = {
  titolo: string
  href?: string
  attiva?: boolean
  disabilitata?: boolean
  /** L'elemento che rende la voce — tipicamente il `<Link>` del router. */
  render?: ReactElement
}

export type VoceNav = {
  titolo: string
  /**
   * Obbligatoria **di fatto** quando la colonna collassa a icone: nel rail
   * resta solo lei. Se l'app non ha icone — è il caso di Anagrafe oggi — si
   * passa `collassa="fuori"` al guscio, e la colonna sparisce invece di
   * ridursi a una fila di quadrati vuoti.
   */
  icona?: Icona
  href?: string
  attiva?: boolean
  disabilitata?: boolean
  badge?: ReactNode
  render?: ReactElement
  /** Il sottomenu. Si decide **voce per voce**: basta passarlo, o non passarlo. */
  figli?: SottoVoceNav[]
}

/**
 * Una sezione di navigazione. Il `titolo` è facoltativo: una sezione sola senza
 * titolo e il raggruppamento sparisce da sé, senza cambiare un componente.
 *
 * Nel rail spariscono i **nomi** delle sezioni, non le sezioni: il preset spegne
 * le etichette ma tiene il `p-2` di ogni gruppo, quindi resta lo stacco. Si vede
 * *che* ci sono due sezioni, non *come si chiamano* — per quello ci sono i
 * tooltip sulle voci.
 */
export type SezioneNav = {
  titolo?: string
  voci: VoceNav[]
}

/**
 * L'utente in fondo alla colonna.
 *
 * **Nome e cognome sul bottone, email dentro il menù**: è la forma di
 * `sidebar-07`, ed è anche la mappatura naturale dell'account Microsoft che le
 * app Tassullo usano per l'accesso — `givenName`, `surname`, `mail`. Un
 * indirizzo di posta come etichetta principale è lungo, si legge male e dice
 * meno di un nome; nel menù, dove serve a capire *con quale account* si è
 * dentro, è invece la cosa giusta.
 *
 * `cognome` è separato da `nome` e non concatenato dall'app per una ragione
 * sola: **è il cognome a cadere** quando lo spazio non basta, non una parte di
 * parola. Un `truncate` darebbe «Massimiliano Bert…», che non è un nome.
 */
export type UtenteShell = {
  /** Il nome di battesimo. Da Entra ID: `givenName`. */
  nome: string
  /** Il cognome. Da Entra ID: `surname`. Cade per primo se lo spazio non basta. */
  cognome?: string
  /** L'indirizzo di posta. Compare **nel menù**, non sul bottone. */
  email?: string
  /** La riga sotto il nome: ruolo, permessi, «Sola lettura». */
  ruolo?: string
  /** Le iniziali dell'avatar. Se mancano, si ricavano da nome e cognome. */
  iniziali?: string
}

/** Nome e cognome, o il solo nome se il cognome non c'è. */
function nomeCompleto(u: UtenteShell): string {
  return [u.nome, u.cognome].filter(Boolean).join(" ")
}

/**
 * Le iniziali. Da nome e cognome quando ci sono; altrimenti dalle prime due
 * parole di ciò che c'è, che per un'email è la parte prima della chiocciola.
 */
function inizialiDa(u: UtenteShell): string {
  const fonte = u.cognome ? [u.nome, u.cognome] : (u.nome || u.email || "").split(/[\s@._-]+/)
  return fonte
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toUpperCase()
}

/**
 * Il marchio in testata.
 *
 * È una **classe**, non un componente e non un file in `public/`: il tracciato
 * viaggia dentro il CSS del tema come maschera in data URI, e il colore lo dà
 * `currentColor`. È la decisione D13, chiusa il 2026-09-10; arriva con
 * `add @tassullo/tema`, che porta `tema-logo` fra le proprie dipendenze.
 *
 * `size-6` e non `h-6`: la T è più alta che larga (24×38), e dentro un quadrato
 * la maschera si allinea all'altezza e resta stretta — che è come si allinea
 * alle icone da 16 delle voci, tutte quadrate.
 */
function Marchio() {
  return (
    <span
      aria-hidden
      className="marchio-t size-6 shrink-0 text-sidebar-accent-foreground"
    />
  )
}

/** La testata: marchio più nome dell'applicativo. Collassata resta la T. */
function Testata({ applicazione, render }: { applicazione: string; render?: ReactElement }) {
  const { isMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          render={render}
          tooltip={isMobile ? undefined : applicazione}
          aria-label={applicazione}
          className="group-data-[collapsible=icon]:justify-center"
        >
          <Marchio />
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold text-sidebar-accent-foreground">
              {applicazione}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/** Il piede: l'utente e le sue opzioni. Collassato resta il solo avatar. */
function Utente({ utente, azioni }: { utente: UtenteShell; azioni?: ReactNode }) {
  const { isMobile } = useSidebar()
  const iniziali = utente.iniziali ?? inizialiDa(utente)
  const nome = nomeCompleto(utente)
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                aria-label={`${nome} — opzioni dell'utente`}
                className="group-data-[collapsible=icon]:justify-center data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                {iniziali}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              {/*
               * Il cognome cade per primo, e lo fa in CSS senza misurare
               * niente: è un elemento a sé con `min-w-0` e `truncate`, quindi
               * quando lo spazio manca si accorcia lui mentre il nome resta
               * intero. `truncate` sull'intera stringa darebbe invece
               * «Massimiliano Bert…», che non è un nome.
               */}
              <span className="flex min-w-0 gap-1 text-sm font-medium text-sidebar-accent-foreground">
                <span className="shrink-0">{utente.nome}</span>
                {utente.cognome ? <span className="truncate">{utente.cognome}</span> : null}
              </span>
              {utente.ruolo ? <span className="truncate text-xs">{utente.ruolo}</span> : null}
            </div>
            <ChevronsUpDownIcon className="ml-auto group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          {/*
           * In basso sul telefono, di lato sulla scrivania. `side="right"` fisso
           * chiede al menù di aprirsi fuori da una colonna di 256px dentro uno
           * schermo da 375, e il pannello finisce tagliato: non lo cura una
           * larghezza massima, lo decide questa riga. È il pattern che shadcn
           * scrive nel proprio `sidebar-07`.
           */}
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            className="w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                {utente.email ?? nome}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {azioni ? (
              <>
                <DropdownMenuSeparator />
                {azioni}
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/**
 * Le voci di una sezione.
 *
 * Quelle con figli sono un `Collapsible` che *rende* il `SidebarMenuItem`: è la
 * forma di `sidebar-07`, e il vantaggio è che il sottolivello sparisce da sé
 * quando la colonna è collassata a icone — un albero dentro un rail da 48px non
 * si legge.
 *
 * `disabilitata` si esprime con `aria-disabled` e non con `disabled`: la voce
 * può essere un `<a>` (col `render` del router), e `disabled` su un ancoraggio
 * non vuol dire niente. Il preset veste tutti e due allo stesso modo.
 */
function Voci({ voci }: { voci: VoceNav[] }) {
  const { isMobile } = useSidebar()
  /*
   * Il tooltip non si passa affatto sotto la soglia mobile. Il preset lo
   * nasconde ma la radice Base UI resta montata, si apre col fuoco e si prende
   * il primo `Esc` — misurato in M2.5: nel pannello a scomparsa il primo `Esc`
   * non chiudeva niente e il secondo sì.
   */
  const suggerimento = (titolo: string) => (isMobile ? undefined : titolo)

  return (
    <SidebarMenu>
      {voci.map((voce) => {
        const Icona = voce.icona
        const comuni = {
          isActive: voce.attiva,
          "aria-disabled": voce.disabilitata || undefined,
          tooltip: suggerimento(voce.titolo),
        }

        if (voce.figli && voce.figli.length > 0) {
          return (
            <Collapsible
              key={voce.titolo}
              defaultOpen={voce.attiva}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger render={<SidebarMenuButton {...comuni} />}>
                {Icona ? <Icona /> : null}
                <span>{voce.titolo}</span>
                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {voce.figli.map((figlio) => (
                    <SidebarMenuSubItem key={figlio.titolo}>
                      <SidebarMenuSubButton
                        render={figlio.render}
                        href={figlio.render ? undefined : figlio.href}
                        isActive={figlio.attiva}
                        aria-disabled={figlio.disabilitata || undefined}
                      >
                        <span>{figlio.titolo}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )
        }

        const render = voce.render ?? (voce.href ? <a href={voce.href} /> : undefined)
        return (
          <SidebarMenuItem key={voce.titolo}>
            <SidebarMenuButton {...comuni} render={render}>
              {Icona ? <Icona /> : null}
              <span>{voce.titolo}</span>
            </SidebarMenuButton>
            {voce.badge ? <SidebarMenuBadge>{voce.badge}</SidebarMenuBadge> : null}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

/** Le sezioni, una `SidebarGroup` ciascuna con la sua etichetta. */
function Navigazione({ sezioni }: { sezioni: SezioneNav[] }) {
  return (
    <>
      {sezioni.map((sezione, i) => (
        <SidebarGroup key={sezione.titolo ?? i}>
          {sezione.titolo ? <SidebarGroupLabel>{sezione.titolo}</SidebarGroupLabel> : null}
          <Voci voci={sezione.voci} />
        </SidebarGroup>
      ))}
    </>
  )
}

export type AppShellProps = {
  /** Il nome dell'applicativo, accanto al marchio. «Anagrafe», «Officina». */
  applicazione: string
  /** L'elemento della testata — tipicamente il `<Link to="/">` del router. */
  testataRender?: ReactElement
  sezioni: SezioneNav[]
  utente?: UtenteShell
  /** Le voci del menù utente: `<DropdownMenuItem>` e separatori. */
  azioniUtente?: ReactNode
  /** Il contenuto della fascia in alto, dopo il grilletto: di norma il breadcrumb. */
  barra?: ReactNode
  /** Ciò che sta a destra nella fascia in alto: ricerca, notifiche, tema. */
  azioni?: ReactNode
  /**
   * Come si comprime la colonna. `icona` la riduce al rail delle sole icone —
   * e presuppone che le voci **abbiano** un'icona; `fuori` la fa sparire del
   * tutto. Sotto i 768px non cambia niente: in tutti e due i casi la colonna
   * esce dal DOM e il grilletto apre uno `Sheet`.
   */
  collassa?: "icona" | "fuori"
  defaultAperta?: boolean
  /**
   * La larghezza del contenuto.
   *
   * **`piena` è il predefinito**, e il contenuto si adatta alla larghezza della
   * pagina. Scelta di Francesco il 2026-09-10, guardando la story col tetto
   * attivo: collassare la colonna **non dava un pixel di contenuto in più** —
   * misurato a 1440, la card restava 1148px e si limitava a scivolare a
   * sinistra di 104, perché i 208px liberati andavano ai margini. Collassare la
   * colonna deve dare spazio al contenuto, o il grilletto non serve a niente.
   *
   * `pagina` tiene il contenuto entro `--container-page` (1180px) e lo centra:
   * è la misura del v1, e resta la scelta giusta dove una riga lunga si legge
   * male — un form, un testo. Si chiede, non si subisce.
   */
  larghezza?: "pagina" | "piena"
  className?: string
  children: ReactNode
} & Omit<ComponentProps<"div">, "children" | "className">

/**
 * Il guscio. Un solo componente attorno a tutta l'app:
 *
 * ```tsx
 * <AppShell applicazione="Anagrafe" sezioni={SEZIONI} utente={me}>
 *   <Outlet />
 * </AppShell>
 * ```
 */
export function AppShell({
  applicazione,
  testataRender,
  sezioni,
  utente,
  azioniUtente,
  barra,
  azioni,
  collassa = "icona",
  defaultAperta = true,
  larghezza = "piena",
  className,
  children,
  ...props
}: AppShellProps) {
  return (
    /*
     * Il provider dei tooltip sta QUI, una volta sola, e non è un dettaglio di
     * gusto: senza, a colonna collassata le etichette non compaiono né col
     * mouse né col fuoco, e **nessun errore lo dice**. Misurato in M2.5: zero
     * tooltip su tre `Tab` e su un hover da nove decimi di secondo.
     */
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultAperta} style={LARGHEZZE}>
        <Sidebar collapsible={collassa === "icona" ? "icon" : "offcanvas"}>
          <SidebarHeader>
            <Testata applicazione={applicazione} render={testataRender} />
          </SidebarHeader>
          <SidebarContent>
            <Navigazione sezioni={sezioni} />
          </SidebarContent>
          {utente ? (
            <SidebarFooter>
              <Utente utente={utente} azioni={azioniUtente} />
            </SidebarFooter>
          ) : null}
        </Sidebar>

        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            {barra ? (
              <>
                {/*
                 * Il filo verticale: `Separator` in verticale si stira su tutta
                 * l'altezza del genitore, e qui ne serve un pezzo alto quanto il
                 * testo. È la forma di `sidebar-07`.
                 */}
                <Separator
                  orientation="vertical"
                  className="data-vertical:h-4 data-vertical:self-auto"
                />
                {/*
                 * `min-w-0` non è ornamentale: senza, un contenuto lungo nella
                 * fascia non si stringe — la larghezza minima predefinita di un
                 * elemento flex è quella del suo contenuto — e spinge le azioni
                 * fuori dallo schermo. Con `min-w-0` la fascia resta una riga
                 * sola e a cedere è il contenuto, che è la parte che l'app sa
                 * come far cedere.
                 */}
                <div className="min-w-0 flex-1">{barra}</div>
              </>
            ) : null}
            {/*
             * Le azioni della pagina, e la sola cosa che le fa stare su un
             * tablet in densità touch.
             *
             * Il problema, misurato: in touch la colonna vale 384px e le azioni
             * con l'etichetta scritta per esteso ne valgono 310 che NON si
             * stringono mai (un bottone è `whitespace-nowrap`). Sommati, il
             * guscio ha un pavimento di 967px — ma la soglia che toglie la
             * colonna dal DOM è 768, e non sa niente della densità. Fra 768 e
             * 966 il guscio non ci stava: sbordava in orizzontale di 199px al
             * peggio, con le azioni fuori schermo. In densità normale non
             * succede a nessuna larghezza, ed è perché la colonna ne vale 256.
             *
             * Il rimedio è `sr-only` sulle etichette — non `hidden`: il nome
             * accessibile del bottone resta, cambia solo che non si vede.
             * Perciò la condizione è doppia e nessuna delle due è di troppo:
             * **solo in touch** (in normale le etichette servono e c'è posto) e
             * **solo sotto `lg`** (sopra i 1024 ci stanno anche in touch).
             *
             * Si scrive `[[data-density=touch]_&]:` e non `in-data-[density=…]:`,
             * che sarebbe più leggibile: Tailwind genera `in-*` con `:where()`,
             * che ha specificità **zero**, e una regola a specificità zero perde
             * a parità con qualunque utility che l'app metta sullo stesso
             * elemento. Costato una misura sul percorso della fascia, dove
             * `md:block` vinceva e il livello intermedio restava visibile.
             *
             * Il patto con l'app, ed è la parte da conoscere: l'etichetta va
             * marcata con `data-etichetta`, e **ogni azione in fascia vuole
             * un'icona** — un bottone che perde l'etichetta e non ha un'icona
             * resta un rettangolo vuoto. È la grammatica delle azioni, e vale
             * per M3.2 quando la `page-header` prenderà in carico questo slot.
             */}
            {azioni ? (
              <div className="ml-auto flex shrink-0 items-center gap-2 max-lg:[[data-density=touch]_&]:[&_[data-etichetta]]:sr-only">
                {azioni}
              </div>
            ) : null}
          </header>

          {/*
           * L'area di contenuto. **Una utility soltanto** di suo — `p-4` — ed è
           * deliberato: il respiro attorno alla pagina lo possiede il guscio,
           * non le pagine, ed è l'unico modo perché un form e una tabella
           * comincino allo stesso punto in tutte le app.
           *
           * Il tetto `max-w-page` c'è solo se lo si **chiede**, con
           * `larghezza="pagina"`. Di suo il contenuto si adatta alla larghezza
           * della pagina: col tetto acceso, collassare la colonna non dava un
           * pixel di contenuto in più — i 208px liberati andavano ai margini, e
           * la card scivolava a sinistra invece di crescere.
           *
           * `p-4` segue la densità: 16px in normale, 24 in touch. È qui che si
           * misura D10 — su uno schermo da 375 il padding è l'unica cosa che
           * mangia larghezza, perché sotto i 768px la colonna non c'è più.
           *
           * **È un `div`, e va saputo perché**: il punto di riferimento `main`
           * lo mette già `SidebarInset`, che *è* un `<main>`. Un secondo `main`
           * qui dentro dava tre violazioni axe per story — `landmark-unique`,
           * `landmark-no-duplicate-main`, `landmark-main-is-top-level` — e le
           * ha trovate il gate al primo giro. La fascia in alto sta dentro il
           * `main` come nel `sidebar-07` di shadcn: è la loro forma, non una
           * nostra deriva.
           */}
          <div
            className={cn(
              "min-w-0 flex-1 p-4",
              larghezza === "pagina" && "mx-auto w-full max-w-page",
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
