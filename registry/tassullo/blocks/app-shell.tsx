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
 * Più una settima, dalla proposta #50 di Anagrafe: a colonna chiusa l'icona di
 * un gruppo con `figli` in `sidebar-07` non porta da nessuna parte. Qui apre un
 * menu con le voci del gruppo (vedi `Voci`).
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
 * **Il contenuto della fascia.** Il guscio disegna la fascia — grilletto,
 * altezza, la garanzia che resti una riga sola — ma percorso e azioni sono
 * della **pagina**, che li dichiara con `<PageHeader>`
 * (`tassullo-page-header`, M3.2), reso nella fascia attraverso un portale. Il
 * guscio si monta una volta sola attorno all'`<Outlet />`: una prop non ci
 * arriverebbe mai.
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
import { CheckIcon, ChevronRightIcon, ChevronsUpDownIcon } from "lucide-react"

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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/tassullo/ui/dropdown-menu"
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
import {
  FasciaIntestazione,
  IntestazioneProvider,
} from "@/registry/tassullo/blocks/page-header"

/**
 * Le due larghezze della colonna, riscritte in unità di `--spacing` così che
 * seguano la densità.
 *
 * `SIDEBAR_WIDTH` e `SIDEBAR_WIDTH_ICON` sono **costanti JavaScript** dentro
 * `sidebar.tsx`: non derivano da `--spacing` e in touch resterebbero identiche
 * mentre il loro contenuto cresce — misurato: rail collassato a 48px
 * riempito *esattamente* da una voce da 48, zero margine attorno all'icona.
 * `calc(var(--spacing) * 64)` fa 256px in normale e 384 in touch,
 * `calc(var(--spacing) * 12)` fa 48 e 72: in densità normale la resa è identica
 * a quella del preset.
 *
 * È l'unica eccezione accertata alla densità del tema, e sta **qui**
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
  /**
   * Il sottomenu. Si decide **voce per voce**: basta passarlo, o non passarlo.
   *
   * A colonna aperta, e sul telefono, è un gruppo che si apre e si chiude. A
   * colonna chiusa a icone l'icona del gruppo apre un menu a destra con le
   * stesse voci: il nome del gruppo in cima, la voce attiva con la spunta.
   */
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
  /**
   * Passata alla `SidebarGroup`. Serve per una cosa sola: `mt-auto`, che
   * ancora una sezione — tipicamente `Admin` — al fondo della colonna,
   * sopra il piede. `SidebarContent` è già `flex flex-col`: non serve altro.
   */
  className?: string
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
 * `currentColor`. Arriva con `add @tassullo/tema`, che porta `tema-logo` fra le proprie dipendenze.
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
 * forma di `sidebar-07`, e il sottolivello sparisce da sé quando la colonna è
 * collassata a icone — un albero dentro un rail da 48px non si legge.
 *
 * **Nel rail, però, il gruppo diventa un menu.** In `sidebar-07` l'icona di un
 * gruppo, a colonna chiusa, apre e chiude un sottolivello che non si vede: un
 * clic che non fa niente, e l'unica strada per arrivare alle voci è riaprire la
 * colonna. Qui l'icona apre un `DropdownMenu` a destra, con le voci del gruppo:
 * è la forma che lo stesso `sidebar-07` usa per il menu utente, e da tastiera
 * è un menu — frecce, `Invio`, `Esc` che riporta il fuoco sull'icona.
 *
 * La voce attiva porta la **spunta** e `aria-current="page"`, come la commessa
 * attiva nel selettore del contesto. Non lo sfondo: nei menu lo sfondo è il
 * segno del fuoco, e con due righe grigie non si capirebbe quale delle due è
 * la pagina in cui si è.
 *
 * `disabilitata` si esprime con `aria-disabled` e non con `disabled`: la voce
 * può essere un `<a>` (col `render` del router), e `disabled` su un ancoraggio
 * non vuol dire niente. Il preset veste tutti e due allo stesso modo.
 */
function Voci({ voci, rail }: { voci: VoceNav[]; rail: boolean }) {
  const { isMobile } = useSidebar()
  /*
   * Il tooltip non si passa affatto sotto la soglia mobile. Il preset lo
   * nasconde ma la radice Base UI resta montata, si apre col fuoco e si prende
   * il primo `Esc` — misurato: nel pannello a scomparsa il primo `Esc`
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

        if (voce.figli && voce.figli.length > 0 && rail) {
          return (
            <SidebarMenuItem key={voce.titolo}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      {...comuni}
                      className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                    />
                  }
                >
                  {Icona ? <Icona /> : null}
                  <span>{voce.titolo}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" sideOffset={4} className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{voce.titolo}</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  {voce.figli.map((figlio) => (
                    <DropdownMenuItem
                      key={figlio.titolo}
                      render={figlio.render ?? (figlio.href ? <a href={figlio.href} /> : undefined)}
                      disabled={figlio.disabilitata}
                      aria-current={figlio.attiva ? "page" : undefined}
                      className={cn(figlio.attiva && "font-medium")}
                    >
                      <span className="truncate">{figlio.titolo}</span>
                      {figlio.attiva ? <CheckIcon className="ml-auto" /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        }

        if (voce.figli && voce.figli.length > 0) {
          return (
            <Collapsible
              key={voce.titolo}
              /*
               * Aperto di default per **tutti** i gruppi, non solo quello
               * attivo: legarlo ad `attiva` dava una via di mezzo — un solo
               * gruppo aperto e gli altri collassati — che non è né «tutto
               * visibile» né «tutto compatto», ed è la forma peggiore delle
               * due. `attiva` resta a governare solo l'evidenziazione.
               */
              defaultOpen
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
function Navigazione({ sezioni, collassa }: { sezioni: SezioneNav[]; collassa: "icona" | "fuori" }) {
  const { isMobile, state } = useSidebar()
  // Il rail c'è solo a colonna chiusa a icone e sulla scrivania: sotto la
  // soglia mobile la colonna è un pannello a scomparsa, sempre intera.
  const rail = collassa === "icona" && !isMobile && state === "collapsed"
  return (
    <>
      {sezioni.map((sezione, i) => (
        <SidebarGroup key={sezione.titolo ?? i} className={sezione.className}>
          {/*
           * Nel rail l'etichetta non sparisce: diventa trasparente e risale di
           * tutta la sua altezza, e così copre la metà bassa dell'ultima icona
           * della sezione sopra — misurato, 16px su 32, 24 su 48 in touch, dove
           * il clic arrivava all'etichetta invece che alla voce. Trasparente,
           * deve lasciar passare anche il puntatore.
           */}
          {sezione.titolo ? (
            <SidebarGroupLabel className="group-data-[collapsible=icon]:pointer-events-none">
              {sezione.titolo}
            </SidebarGroupLabel>
          ) : null}
          <Voci voci={sezione.voci} rail={rail} />
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
  // **Lo slot della testata della colonna, sotto il marchio** — tipicamente
  // il `<SelettoreContesto>` di `tassullo-barra-contesto`.
  //
  // È uno slot e non delle prop tipizzate, per la stessa ragione per cui la
  // fascia non riceve il percorso da qui: il guscio non sa che cosa sia una
  // commessa, e non deve impararlo. Riceve un nodo e gli fa posto.
  //
  // **È una variante, non il nuovo normale.** Serve alle app che hanno
  // un'entità attiva che attraversa tutte le pagine — una commessa, un
  // cantiere — e la mostrano due volte, una qui e una in pagina. Le altre non passano niente e la testata resta
  // quella di prima, marchio e nome dell'applicativo.
  //
  // Con `collassa="icona"` la colonna stretta riduce il selettore al suo
  // quadrato, come fa con le voci di navigazione: è `SidebarMenuButton` a
  // saperlo fare, non una regola nostra.
  /**
   * Lo spazio sotto il marchio, in cima alla colonna, per l'entità su cui si
   * lavora in tutte le pagine: di solito il `<SelettoreContesto>` di
   * `tassullo-barra-contesto`. Serve solo alle app che hanno un'entità attiva
   * di questo tipo; le altre non lo passano.
   *
   * Con `collassa="icona"` la colonna chiusa riduce il selettore al suo
   * quadrato, come fa con le voci.
   */
  contesto?: ReactNode
  /**
   * **Il contenuto della fascia non si passa da qui**, e non è una dimenticanza.
   *
   * Percorso e azioni sono della **pagina**, non del guscio, e il guscio si
   * monta una volta sola attorno all'`<Outlet />`: la pagina non avrebbe modo
   * di passargli niente. Li dichiara con `<PageHeader>` (blocco
   * `tassullo-page-header`), che rende dentro la fascia attraverso un portale.
   * Una forma sola, per tutte le pagine di tutte le app.
   */
  /**
   * Come si comprime la colonna. `icona` la riduce al rail delle sole icone —
   * e presuppone che le voci **abbiano** un'icona; nel rail l'icona di una
   * voce con `figli` apre un menu con le sue voci. `fuori` la fa sparire del
   * tutto. Sotto i 768px non cambia niente: in tutti e due i casi la colonna
   * esce dal DOM e il grilletto apre uno `Sheet`.
   */
  collassa?: "icona" | "fuori"
  defaultAperta?: boolean
  // La larghezza del contenuto.
  //
  // **`piena` è il predefinito**, e il contenuto si adatta alla larghezza della
  // pagina. Col tetto attivo, collassare la colonna **non dava un pixel di contenuto in più** —
  // misurato a 1440, la card restava 1148px e si limitava a scivolare a
  // sinistra di 104, perché i 208px liberati andavano ai margini. Collassare la
  // colonna deve dare spazio al contenuto, o il grilletto non serve a niente.
  //
  // `pagina` tiene il contenuto entro `--container-page` (1180px) e lo centra:
  // resta la scelta giusta dove una riga lunga si legge
  // male — un form, un testo. Si chiede, non si subisce.
  /**
   * La larghezza del contenuto. `"piena"`, il predefinito, gli dà tutta la
   * larghezza che resta, così chiudere la colonna gli lascia più spazio.
   * `"pagina"` lo tiene entro `--container-page` (1180px) e lo centra: per
   * un modulo o un testo lungo, dove una riga troppo larga si legge male.
   */
  larghezza?: "pagina" | "piena"
  // Se la pagina **scorre** (il predefinito) o **riempie** esattamente lo
  // schermo.
  //
  // `scorre` è la forma di sempre: il guscio ha un'altezza minima — una
  // pagina più corta dello schermo non lascia un vuoto sotto il piede — ma
  // cresce con un form lungo o una scheda con molte sezioni.
  //
  // `riempie` blocca il guscio all'altezza esatta della finestra
  // (`h-svh` invece di `min-h-svh`): serve alle pagine **sola lista** —
  // Prodotti, Norme, Certificazioni — il cui contenuto è `<DataTable
  // altezza="ferma">`: senza un'altezza *ferma* a cui
  // appoggiarsi, `flex-1` non avrebbe un numero a cui arrivare e la tabella
  // non saprebbe quante righe entrano. La pagina che lo chiede deve rendere
  // a sua volta una colonna flex alta quanto il contenuto (`flex h-full
  // min-h-0 flex-col`), con la tabella come solo figlio `flex-1 min-h-0`.
  /**
   * Se la pagina scorre o riempie la finestra.
   *
   * `"scorre"`, il predefinito: il guscio è alto almeno quanto la finestra e
   * cresce col contenuto.
   *
   * `"riempie"`: il guscio è alto esattamente quanto la finestra. Serve a una
   * pagina che è una lista con lo scorrimento interno, cioè una
   * `tassullo-data-table` con `altezza="ferma"`. La pagina rende una colonna
   * `flex h-full min-h-0 flex-col`, con la tabella come figlio
   * `min-h-0 flex-1`.
   */
  contenuto?: "scorre" | "riempie"
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
  contesto,
  collassa = "icona",
  defaultAperta = true,
  larghezza = "piena",
  contenuto = "scorre",
  className,
  children,
  ...props
}: AppShellProps) {
  return (
    /*
     * Il provider dei tooltip sta QUI, una volta sola, e non è un dettaglio di
     * gusto: senza, a colonna collassata le etichette non compaiono né col
     * mouse né col fuoco, e **nessun errore lo dice**. Misurato: zero
     * tooltip su tre `Tab` e su un hover da nove decimi di secondo.
     */
    <TooltipProvider>
      {/*
       * Il contesto della fascia sta dentro tutto il resto: l'ancora è nella
       * fascia, chi ci rende dentro sta nel contenuto, e i due devono vedersi.
       */}
      <IntestazioneProvider>
        <SidebarProvider
          defaultOpen={defaultAperta}
          style={LARGHEZZE}
          className={contenuto === "riempie" ? "h-svh overflow-hidden" : undefined}
        >
          <Sidebar collapsible={collassa === "icona" ? "icon" : "offcanvas"}>
            <SidebarHeader>
              <Testata applicazione={applicazione} render={testataRender} />
              {contesto}
            </SidebarHeader>
            <SidebarContent>
              <Navigazione sezioni={sezioni} collassa={collassa} />
            </SidebarContent>
            {utente ? (
              <SidebarFooter>
                <Utente utente={utente} azioni={azioniUtente} />
              </SidebarFooter>
            ) : null}
          </Sidebar>

          {/*
           * `min-w-0` sull'inset, ed è la riga che impedisce al guscio di
           * sbordare in orizzontale — qualunque cosa ci si metta dentro.
           *
           * Un elemento flex ha `min-width: auto`, cioè **non scende sotto il
           * proprio contenuto minimo**. Senza questa riga il contenuto minimo
           * dell'inset diventa il pavimento del documento, e il guscio si allarga
           * oltre lo schermo invece di stringere ciò che ha dentro. È il
           * meccanismo che stava sotto tutti gli sbordi misurati in questa coda:
           * a 1024 in touch la fascia riceveva 789px di spazio dove ce n'erano
           * 640, e il percorso — che si tronca correttamente, misurato — se ne
           * prendeva 319 invece dei 170 che gli spettavano.
           *
           * Con `min-w-0` il guscio non sborda mai: a cedere è il contenuto,
           * che sa come farlo (il percorso si tronca, le azioni entrano nel menu).
           */}
          <SidebarInset className={cn("min-w-0", contenuto === "riempie" && "min-h-0")}>
            {/*
             * La fascia in alto. Il guscio la **disegna** — grilletto, altezza,
             * e la garanzia che resti una riga sola; ciò che ci va dentro,
             * percorso e azioni, lo dichiara la **pagina** con `<PageHeader>`,
             * che ci rende attraverso un portale.
             */}
            <FasciaIntestazione grilletto={<SidebarTrigger />} />

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
             * `p-4` segue la densità: 16px in normale, 24 in touch. Su uno
             * schermo da 375 il padding è l'unica cosa che
             * mangia larghezza, perché sotto i 768px la colonna non c'è più.
             *
             * **È un `div`, e va saputo perché**: il punto di riferimento `main`
             * lo mette già `SidebarInset`, che *è* un `<main>`. Un secondo `main`
             * qui dentro darebbe tre violazioni axe — `landmark-unique`,
             * `landmark-no-duplicate-main`, `landmark-main-is-top-level`. La fascia in alto sta dentro il
             * `main` come nel `sidebar-07` di shadcn: è la loro forma, non una
             * nostra deriva.
             */}
            <div
              className={cn(
                "min-w-0 flex-1 p-4",
                larghezza === "pagina" && "mx-auto w-full max-w-page",
                contenuto === "riempie" && "flex min-h-0 flex-col overflow-hidden",
                className,
              )}
              {...props}
            >
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </IntestazioneProvider>
    </TooltipProvider>
  )
}
