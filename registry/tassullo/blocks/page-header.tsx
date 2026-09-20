/**
 * `tassullo-page-header` — l'intestazione di pagina, e l'unica forma che ne
 * esiste in tutte le app Tassullo.
 *
 * Non è una barra che si mette *dentro* la pagina: è **la fascia in alto del
 * guscio**, che il guscio disegna e la pagina riempie. Percorso a sinistra,
 * azioni a destra, nessun titolo visibile.
 *
 * ── Perché non c'è un `<h1>` che si vede ────────────────────────────────
 *
 * Perché il nome della pagina comparirebbe **tre volte in 80px**: voce attiva
 * in colonna, ultimo livello del percorso, titolo. Deciso da Francesco il
 * 2026-09-10 guardando la story di M3.1 accanto a `dashboard-01` di shadcn,
 * che un titolo di pagina non ce l'ha. Tolto, ogni pagina guadagna ~50px di
 * altezza utile — che a 375px non sono pochi. È uno **scostamento dichiarato**
 * dal criterio di `PIANO.md` §M3.2, che diceva «titolo + breadcrumb + slot
 * azioni»: il titolo resta, ma **solo per chi non vede lo schermo**, come `h1`
 * in `sr-only` ricavato dall'ultimo livello del percorso. Zero pixel, e la
 * pagina non resta senza intestazione nell'albero dei documenti.
 *
 * ── Il problema che questo blocco esiste per risolvere ──────────────────
 *
 * `<AppShell>` si monta **una volta sola**, attorno all'`<Outlet />`. La
 * fascia è dentro il guscio, ma ciò che ci va — percorso e azioni — è della
 * **pagina**, che sta molte righe più in basso e a cui il guscio non può
 * passare prop. shadcn il problema non ce l'ha perché i suoi blocchi rendono
 * il guscio intero dentro ogni pagina; noi no, e rimontare il guscio a ogni
 * cambio di rotta vorrebbe dire perdere lo stato della colonna a ogni clic.
 *
 * La pagina quindi **dichiara**:
 *
 * ```tsx
 * export function Prodotti() {
 *   return (
 *     <>
 *       <PageHeader
 *         percorso={[{ titolo: "Prodotti", href: "/prodotti" }, { titolo: "Famiglie" }]}
 *         azioni={[{ titolo: "Nuovo prodotto", icona: PlusIcon, ruolo: "primaria", onClick: apri }]}
 *       />
 *       <TabellaFamiglie />
 *     </>
 *   )
 * }
 * ```
 *
 * ── Un portale, e non uno stato condiviso ───────────────────────────────
 *
 * `PageHeader` non rende niente dove sta scritto: rende **dentro la fascia**,
 * con `createPortal`. La strada alternativa — un contesto con dentro uno stato
 * che la pagina aggiorna in un `useEffect` — ha due difetti, e il primo è
 * quello che `CLAUDE.md` elenca fra le trappole che costano riscritture: le
 * dipendenze di quell'effetto sarebbero `percorso` e `azioni`, cioè **array
 * scritti inline** dalla pagina, nuovi a ogni render. L'effetto riparte, chiama
 * `setState`, il render riparte, e React **non interrompe il ciclo e non stampa
 * niente**. Il secondo difetto è più insidioso: lo stato conserverebbe gli
 * `onClick` catturati al momento dell'effetto, quindi un gestore che legge una
 * variabile di stato della pagina leggerebbe il valore di un render fa.
 *
 * Col portale non c'è nessun effetto e nessuna copia: il contenuto è renderizzato
 * **dall'albero della pagina** — quindi vede il router, le traduzioni, tutto — e
 * finisce nel DOM della fascia, che è dove serve che stia per l'ordine di
 * tabulazione.
 *
 * ── Perché le soglie sono `@container` e non `md:`/`lg:` ────────────────
 *
 * Perché ciò che decide se le azioni ci stano non è la larghezza dello schermo
 * ma **la larghezza della fascia**, e le due non vanno d'accordo: sotto i 768px
 * la colonna esce dal DOM, quindi passando da 767 a 768 lo schermo si allarga
 * di 1px e la fascia si **restringe** di 255 (di 383 in densità touch). Una
 * regola sulla viewport deve inseguire quella discontinuità, e in M3.1 lo
 * faceva ramificandosi per densità — con una trappola di specificità dentro
 * (`in-data-[density=touch]:` genera `:where()`, che pesa **zero** e perdeva
 * contro `md:block`). Sulla larghezza della fascia la discontinuità non esiste:
 * una soglia sola, nessuna ramificazione, e la regola vale identica dentro il
 * guscio, fuori dal guscio e a qualunque densità.
 */
import { createPortal } from "react-dom"
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react"
import { EllipsisVerticalIcon } from "lucide-react"

import { cn } from "cn"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/tassullo/ui/breadcrumb"
import { Button } from "@/registry/tassullo/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/tassullo/ui/dropdown-menu"
import { Separator } from "@/registry/tassullo/ui/separator"

/** Un'icona Lucide, o qualunque componente che accetti una `className`. */
type Icona = ComponentType<{ className?: string }>

/**
 * Un livello del percorso. **L'ultimo è la pagina corrente** e non è un
 * collegamento: non lo si dichiara, lo si deduce dalla posizione.
 */
export type LivelloPercorso = {
  /**
   * `ReactNode` e non `string`: sull'**ultimo** livello — il nome della pagina
   * — ci sta accanto il contatore che Officina scrive in Triage, Ricambi e
   * Piani, «Segnalazioni da smistare · 4». Le due strade erano «il numero va
   * fra le azioni» e questa: vince questa, perché il numero appartiene al
   * nome della pagina e non ai comandi — un'azione è qualcosa che si clicca.
   * A chi passa una stringa non toglie niente.
   *
   * Il contatore si scrive **in un tono diverso dal nome** (`text-muted-foreground`),
   * o si legge come una parte del nome invece che come «quanti ce ne sono».
   */
  titolo: ReactNode
  href?: string
  /** L'elemento che rende il collegamento — tipicamente il `<Link>` del router. */
  render?: ReactElement
}

/**
 * Un'azione di pagina, **dichiarata e non già disegnata**.
 *
 * L'intestazione deve poter rendere la stessa azione in due forme — bottone
 * intero quando la fascia è larga, riga di menu quando è stretta — e per farlo
 * deve sapere *cosa* è un'azione, non riceverla già fatta. Con del JSX opaco
 * l'unica strada sarebbe disegnarlo due volte, cioè dei bottoni dentro le righe
 * di un menu: markup sbagliato, e ogni azione annunciata due volte.
 *
 * Si dichiara il **ruolo**, non il colore: è la grammatica delle azioni, e il
 * colore viene dietro. **Una sola `primaria` per pagina** — due bottoni
 * arancioni nella stessa intestazione non sono due azioni importanti, sono zero.
 *
 * `icona` non è facoltativa per vezzo: quando la fascia è stretta l'azione
 * diventa una riga di menu, e una riga senza icona dentro un elenco che ne ha
 * resta disallineata.
 */
export type AzionePagina = {
  titolo: string
  icona: Icona
  /** Il ruolo, non il colore. Una sola `primaria` per pagina. */
  ruolo?: "primaria" | "secondaria" | "distruttiva"
  onClick?: () => void
  href?: string
  disabilitata?: boolean
}

const VARIANTE = {
  primaria: "default",
  secondaria: "outline",
  distruttiva: "destructive",
} as const

/**
 * Il nodo della fascia in cui la pagina rende, e il conto di quante pagine ci
 * stanno rendendo dentro.
 *
 * Il nodo è uno **stato** e non una `ref`, perché il portale deve rifare il
 * render quando la fascia si monta: una `ref` cambia in silenzio e nessuno se
 * ne accorge. Il *setter* di `useState` è una funzione di identità stabile,
 * quindi si passa direttamente come `ref` di callback senza `useCallback` e
 * senza rischio di cicli.
 */
const AncoraCtx = createContext<HTMLElement | null>(null)
const SetAncoraCtx = createContext<((n: HTMLElement | null) => void) | null>(
  null,
)

/**
 * Il contesto della fascia. Lo monta il guscio, una volta sola, attorno a tutto
 * — colonna, fascia e contenuto — perché la pagina che dichiara sta dentro il
 * contenuto e l'ancora sta dentro la fascia.
 */
export function IntestazioneProvider({ children }: { children: ReactNode }) {
  const [nodo, setNodo] = useState<HTMLElement | null>(null)
  return (
    <SetAncoraCtx.Provider value={setNodo}>
      <AncoraCtx.Provider value={nodo}>{children}</AncoraCtx.Provider>
    </SetAncoraCtx.Provider>
  )
}

/**
 * La fascia in alto: il grilletto della colonna e, accanto, il posto in cui la
 * pagina rende la propria intestazione.
 *
 * **`@container/fascia` è la riga che rende le soglie sensate**: da qui in giù
 * `@md/fascia:` e `@2xl/fascia:` guardano la larghezza di questa barra, non
 * quella dello schermo. Attenzione a quale larghezza: una container query
 * `inline-size` misura il **riquadro di contenuto**, cioè al netto del `px-4` —
 * che segue la densità, 32px in tutto in normale e 48 in touch. È una
 * differenza che si nota solo misurando, e sposta ogni soglia di quel tanto.
 *
 * `overflow-hidden` più `whitespace-nowrap` su tutta la discendenza sono la
 * garanzia che il guscio deve dare: **la fascia è una riga sola, sempre**.
 * L'altezza è fissa (`h-12`), quindi una seconda riga non alzerebbe la barra —
 * le uscirebbe fuori, ed è successo (misurato in M3.1 a 375px in touch, con una
 * sola azione: il numero delle azioni non c'entrava). Dove tagliare lo decide
 * invece il contenuto, e per il percorso lo decide `Percorso` qui sotto.
 */
export function FasciaIntestazione({
  grilletto,
  className,
}: {
  /** Il grilletto della colonna. Nel guscio è `<SidebarTrigger />`. */
  grilletto?: ReactNode
  className?: string
}) {
  const setNodo = useContext(SetAncoraCtx)
  return (
    <header
      data-slot="page-header-bar"
      className={cn(
        "@container/fascia flex h-12 shrink-0 items-center gap-2 border-b px-4",
        className,
      )}
    >
      {grilletto ? (
        <>
          {grilletto}
          {/*
           * Il filo verticale fra il grilletto e il contenuto. Sta **qui** e non
           * in `PageHeader`, dove pure era nato: è il divisorio fra ciò che è
           * del guscio e ciò che è della pagina, quindi lo possiede il guscio —
           * e senza grilletto non c'è niente da dividere, mentre in `PageHeader`
           * finiva come un trattino appoggiato al bordo sinistro. `Separator` in
           * verticale si stira su tutta l'altezza del genitore, e qui ne serve
           * un pezzo alto quanto il testo: è la forma di `sidebar-07`.
           */}
          <Separator
            orientation="vertical"
            className="shrink-0 data-vertical:h-4 data-vertical:self-auto"
          />
        </>
      ) : null}
      <div
        data-slot="page-header-slot"
        ref={setNodo ?? undefined}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden [&_*]:whitespace-nowrap"
      />
    </header>
  )
}

/**
 * Il percorso.
 *
 * **I livelli intermedi spariscono quando la fascia si stringe**, ed è il
 * pattern di `sidebar-07`. Restano il primo — che è la sezione — e l'ultimo,
 * che è la pagina; al posto di quelli tolti compaiono i **puntini di
 * sospensione**, così non si perde l'informazione che il percorso era più
 * lungo. Sopra la soglia il percorso è intero e i puntini spariscono: le due
 * forme stanno entrambe nel DOM, quella spenta con `hidden` — cioè
 * `display: none`, quindi fuori anche dall'albero di accessibilità.
 *
 * **`truncate` sta sull'ultimo livello**, non sul percorso intero: è il nome
 * della pagina, cioè la parte che si vuole leggere anche tagliata. Sul percorso
 * intero darebbe i puntini in fondo alla riga, che è il posto in cui non
 * servono a niente.
 *
 * `@md/fascia` (448px) è la larghezza sotto la quale gli intermedi non ci
 * stanno più, e si misura **sulla fascia** e non sullo schermo. Misurato in
 * Chromium sullo Storybook costruito, larghezza utile della fascia (al netto
 * del `px-4`): 1152 a 1440×normale, 1008 a 1440×touch, 736 a 1024×normale, 592
 * a 1024×touch, 480 a 768×normale, 336 a 768×touch, **343 e 327** nelle due
 * celle da 375px — che sono, alla cifra, le stesse due di D10 in M3.1: è la
 * stessa larghezza vista nella fascia invece che nel contenuto.
 *
 * Una soglia sola copre le otto celle, dove la regola sulla viewport di M3.1
 * doveva ramificarsi per densità.
 */
function Collegamento({ l }: { l: LivelloPercorso }) {
  return (
    <BreadcrumbLink render={l.render} href={l.render ? undefined : l.href}>
      {l.titolo}
    </BreadcrumbLink>
  )
}

function Percorso({ livelli }: { livelli: LivelloPercorso[] }) {
  const ultimo = livelli[livelli.length - 1]!
  const primo = livelli.length > 1 ? livelli[0]! : undefined
  const intermedi = livelli.slice(1, -1)

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-nowrap">
        {primo ? (
          <>
            <BreadcrumbItem className="shrink-0">
              <Collegamento l={primo} />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="shrink-0" />
          </>
        ) : null}

        {intermedi.length > 0 ? (
          <>
            <BreadcrumbItem className="shrink-0 @md/fascia:hidden">
              {/*
               * **I livelli nascosti restano raggiungibili.** Il `…` non è un
               * segnaposto: è il grilletto di un menu che contiene i livelli
               * che non ci stanno. È la forma che shadcn documenta come
               * «Breadcrumb with Dropdown», e senza di essa il percorso a
               * schermo stretto non *collassa* — **perde** dei livelli, che su
               * un telefono sono esattamente quelli che servono per risalire.
               *
               * `BreadcrumbEllipsis` è `aria-hidden`, quindi il nome
               * accessibile del bottone non può venire da lì: sta nell'`sr-only`
               * accanto, come nell'esempio di shadcn.
               */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon" className="-mx-1" />}
                >
                  <BreadcrumbEllipsis />
                  <span className="sr-only">Mostra i livelli nascosti</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={4}>
                  {intermedi.map((l, i) => (
                    <DropdownMenuItem
                      key={`livello-${i}`}
                      render={l.render ?? (l.href ? <a href={l.href} /> : undefined)}
                    >
                      {l.titolo}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="shrink-0 @md/fascia:hidden" />
            {intermedi.map((l, i) => (
              <Fragment key={`livello-${i}`}>
                <BreadcrumbItem className="hidden shrink-0 @md/fascia:inline-flex">
                  <Collegamento l={l} />
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden shrink-0 @md/fascia:flex" />
              </Fragment>
            ))}
          </>
        ) : null}

        <BreadcrumbItem className="min-w-0">
          <BreadcrumbPage className="truncate">{ultimo.titolo}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/**
 * Le azioni, in due forme e una fonte sola.
 *
 * **Fascia larga: bottoni interi. Fascia stretta: un solo bottone «⋯»** con
 * dentro tutte le azioni. Non è una preferenza estetica, è aritmetica misurata
 * in M3.1 a 375px: due bottoni con l'etichetta per esteso occupano 283px dei
 * 375 disponibili, e al nome della pagina ne restano **7** — sparisce. Con una
 * sola azione ne restano 149, che bastano per «Famiglie» ma non per un titolo
 * vero. Il numero delle azioni non era il problema, e ridurle a icone era una
 * risposta parziale che non scala: cinque icone in touch fanno 328px di 375.
 *
 * Le due forme stanno **entrambe nel DOM**, una spenta con `hidden`. `hidden` è
 * `display: none`, quindi la forma spenta esce anche dall'albero di
 * accessibilità: nessuna azione viene annunciata due volte.
 *
 * **`@2xl/fascia` (672px) sposta di una cella il confine di M3.1**, e la
 * differenza va dichiarata: a **1024×touch** la fascia ha 592px utili, quindi
 * qui le azioni entrano nel menu mentre la regola `lg:` le teneva intere. Non
 * è una svista: i 1024 di M3.1 erano un compromesso *imposto* dalla
 * ramificazione per densità — «a 768 in touch non resterebbe niente» — e una
 * soglia sulla fascia quel compromesso non deve farlo. Nelle altre sette celle
 * misurate le due regole danno lo stesso esito.
 *
 * **Taglia normale, non `sm` come nel v1**: `sm` in densità touch fa 42px, cioè
 * sotto i 44 di WCAG e sotto i 48 che il v1 dà a `.btn` in cantiere. La normale
 * fa 32px in normale e 48 in touch.
 */
function Azioni({ azioni }: { azioni: AzionePagina[] }) {
  if (azioni.length === 0) return null
  return (
    <>
      <div className="ml-auto hidden shrink-0 items-center gap-2 @2xl/fascia:flex">
        {azioni.map((a) => (
          <Button
            key={a.titolo}
            variant={VARIANTE[a.ruolo ?? "secondaria"]}
            disabled={a.disabilitata}
            onClick={a.onClick}
            {...(a.href ? { render: <a href={a.href} /> } : {})}
          >
            <a.icona />
            {a.titolo}
          </Button>
        ))}
      </div>
      <div className="ml-auto shrink-0 @2xl/fascia:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Altre azioni">
                <EllipsisVerticalIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end" sideOffset={4} className="w-56">
            {azioni.map((a) => (
              /*
               * `variant="destructive"` e non `className="text-destructive"`,
               * che è quello che il guscio faceva in M3.1: `--destructive` è
               * l'arancione-rosso dei *fondi*, e come testo su un menu scuro
               * dà **3.52:1** — misurato dal gate, che l'ha preso appena una
               * story ha aperto il menu con un'azione distruttiva dentro. La
               * variante del componente usa `destructive-subtle-foreground`,
               * che è il rosso *leggibile*. Stessa coppia di trappole di
               * `--primary`/`--accent-ink`: il colore del fondo non è il colore
               * del testo.
               */
              <DropdownMenuItem
                key={a.titolo}
                disabled={a.disabilitata}
                onClick={a.onClick}
                variant={a.ruolo === "distruttiva" ? "destructive" : "default"}
              >
                <a.icona />
                {a.titolo}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

export type PageHeaderProps = {
  /** Il percorso, dal livello più alto alla pagina corrente. L'ultimo non è un collegamento. */
  percorso?: LivelloPercorso[]
  /** Le azioni della pagina. Una sola `primaria`. */
  azioni?: AzionePagina[]
  /**
   * Il titolo per chi non vede lo schermo. **Non si vede**: è un `h1` in
   * `sr-only`. Se non si passa, è l'ultimo livello del percorso — che è la
   * stessa cosa scritta una volta invece che due. Resta una `string` anche da
   * quando `LivelloPercorso.titolo` è un `ReactNode`: qui serve un nome, e un
   * nome è testo.
   */
  titolo?: string
}

/**
 * L'intestazione della pagina corrente. **Si rende dentro la pagina e compare
 * nella fascia**: non occupa spazio dove sta scritta.
 *
 * ```tsx
 * <PageHeader percorso={[{ titolo: "Prodotti", href: "/prodotti" }, { titolo: "Famiglie" }]} />
 * ```
 *
 * Fuori da un `IntestazioneProvider` — cioè fuori dal guscio — non rende
 * niente e non lancia: una pagina montata da sola in un test o in una story
 * deve poter funzionare senza tirarsi dietro il guscio intero.
 */
export function PageHeader({
  percorso = [],
  azioni = [],
  titolo,
}: PageHeaderProps) {
  const nodo = useContext(AncoraCtx)

  /*
   * Due intestazioni montate insieme — due rotte annidate che la dichiarano
   * entrambe — renderebbero **tutte e due** nella fascia, una accanto
   * all'altra. È un difetto muto: nessun errore, solo un percorso doppio.
   *
   * Il conto si fa **contando i nodi che ci sono già nella fascia**, e non
   * tenendo un contatore da qualche parte: un contatore o sta in un contesto —
   * e un contesto che si muta non è un contesto, è una variabile globale
   * travestita, che React non sa essere cambiata — o sta in una `ref` letta
   * durante il render. Il DOM il conto ce l'ha già.
   *
   * La dipendenza è un solo riferimento stabile, quindi l'effetto scatta a
   * montaggio e smontaggio e basta — che è la forma che la trappola delle
   * dipendenze non primitive di `CLAUDE.md` chiede.
   */
  useEffect(() => {
    // `import.meta.env.DEV` e non `process.env.NODE_ENV`: `process` non
    // esiste in un'app Vite appena creata, e il typecheck del consumatore si
    // ferma su «Cannot find name 'process'» benché a runtime funzioni
    // (misurato nel gate di fine FASE 4, M4.6).
    if (!nodo || !import.meta.env.DEV) return
    const n = nodo.querySelectorAll('[data-slot="page-header-content"]').length
    if (n > 1) {
      console.warn(
        `[page-header] ${n} <PageHeader> montati insieme: la fascia li renderà tutti. ` +
          "Ne dichiara una sola la pagina più interna.",
      )
    }
  }, [nodo])

  if (!nodo) return null

  const nome = titolo ?? percorso[percorso.length - 1]?.titolo
  return createPortal(
    /*
     * `contents` non è un riquadro: il `div` sparisce dal layout e i figli
     * restano figli diretti della fascia, cioè elementi flex come se il
     * contenitore non ci fosse. Serve solo a dare un nome nel DOM a ciò che una
     * pagina ha dichiarato — e a poterlo contare.
     */
    <div data-slot="page-header-content" className="contents">
      {nome ? <h1 className="sr-only">{nome}</h1> : null}
      {percorso.length > 0 ? <Percorso livelli={percorso} /> : null}
      <Azioni azioni={azioni} />
    </div>,
    nodo,
  )
}
