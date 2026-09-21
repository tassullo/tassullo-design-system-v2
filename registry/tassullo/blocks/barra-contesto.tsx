/**
 * `tassullo-barra-contesto` — la fascia che dice su cosa si sta lavorando, e
 * lascia cambiarlo (FASE 4ter, M4ter.9).
 *
 * ── Il caso vero ────────────────────────────────────────────────────────
 *
 * Cinque pagine di Studio montano oggi una barra a mano — Computo,
 * TaskCalcoloStrutturale, AnalisiCapitolato, AnalisiProdotto, TaskSearch —
 * per **12 selettori** in tutto (`docs/ANALISI-COPERTURA-APP.md` §1, riga
 * 12). Quello che ci guadagnano passando al registry non è l'aspetto: è
 * `Esc`, il fuoco da tastiera e il clic fuori, che una `div` con un menu
 * scritto a mano non ha. È la stessa cosa che la migrazione delle modali
 * chiude in Anagrafe, dove **nessuna delle cinque** gestisce `Escape`.
 *
 * **La pagina se lo monta**, come oggi: lo slot in `app-shell` per una fascia
 * persistente fra la testata e `<Outlet/>` resta sospeso, con l'innesco
 * scritto in `CHECKLIST.md` — «quando una seconda app ha un contesto attivo
 * che attraversa le pagine». Oggi Anagrafe e Officina un contesto del genere
 * non ce l'hanno, e con un consumatore solo lo slot non vale un'API in più
 * nel guscio.
 *
 * ── L'emoji non entra ───────────────────────────────────────────────────
 *
 * La barra di Studio comincia con 📍. L'emoji la disegna il **sistema
 * operativo**: stessa forma su due macchine diverse, due disegni diversi —
 * che è l'opposto di un design system, ed è l'obiezione esatta con cui si è
 * chiusa la decisione sul `<select>` nativo (`docs/DECISIONI.md` §42).
 * L'icona è quindi una Lucide, e il default è `MapPinIcon`, che è la stessa
 * cosa disegnata da noi.
 *
 * ── Perché il grilletto sta in `ItemActions` e non è la riga intera ──────
 *
 * La tentazione è rendere **tutta** la fascia un `DropdownMenuTrigger`: il
 * bersaglio diventa enorme e in touch non si sbaglia. Non si fa, per due
 * ragioni che tirano dalla stessa parte:
 *
 * 1. **Una fascia che è un bottone gigante ruba la scena alla pagina**, che è
 *    il difetto che questo blocco esiste per non avere. La barra dice su cosa
 *    stai lavorando; cambiarlo è un atto secondario, e si chiede con un
 *    controllo secondario.
 * 2. **Dentro un bottone non ci va un altro bottone.** Con la riga intera
 *    come grilletto, `azioni` — l'azione di pagina che la barra spesso porta
 *    accanto al contesto — sarebbe annidata dentro il controllo, che è markup
 *    non valido prima ancora che un problema di accessibilità.
 *
 * Il bersaglio resta comunque sopra soglia: il grilletto è un `Button` di
 * taglia **`default`**, cioè 32px in densità normale e **48 in touch**, ed è
 * il solo motivo per cui non è `size="sm"` — quello darebbe `h-7`, cioè 42px
 * in touch, sotto i 44 che `npm run misura:bersagli` chiede.
 *
 * ── Le voci sono dati, non figli ────────────────────────────────────────
 *
 * `app-shell` prende le voci del menù utente come `ReactNode` (`azioni`), e
 * qui sarebbe stato coerente fare lo stesso. Non si fa, perché **questo menu
 * ha uno stato**: una delle voci è quella attiva, e va spuntata. Passandole
 * come dati il blocco monta un `DropdownMenuRadioGroup`, che porta con sé il
 * segno di spunta, `role="menuitemradio"` e `aria-checked` — cioè esattamente
 * la parte che una `div` scritta a mano non ha e che nessuno riscriverebbe
 * uguale cinque volte. Con i figli, il segno di spunta tornerebbe a carico
 * di chi compone.
 *
 * ── La larghezza del pannello non si eredita ────────────────────────────
 *
 * `DropdownMenuContent` porta `w-(--anchor-width)`: senza una larghezza sua,
 * il pannello prende quella del grilletto — che qui è un bottone da un
 * centinaio di pixel, cioè un menu in cui nessun nome di commessa ci sta. È
 * la stessa riga che `app-shell` risolve con `w-56` sul menù utente.
 *
 * ── Il nome lungo si tronca, e si tronca il nome ─────────────────────────
 *
 * `ItemTitle` porta `line-clamp-1`, ma dentro c'è anche l'etichetta del tipo
 * («Commessa»), che non deve sparire per prima: senza di lei resta un codice
 * senza soggetto. L'etichetta è quindi `shrink-0` e il nome `truncate` — lo
 * stesso accorgimento che nel piede del guscio fa cadere il cognome e non il
 * nome. Si misura leggendo `textContent` e i rettangoli di riga
 * (`Range.getClientRects()`) contro la larghezza utile: `scrollWidth >
 * clientWidth` su una cella con `truncate` **coincide sempre**, e su un testo
 * che va a capo non vede niente (M4ter.7 e M4ter.8, due volte).
 */
import type { ComponentType, ReactNode } from "react"
import { ChevronsUpDownIcon, MapPinIcon } from "lucide-react"

import { cn } from "cn"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/tassullo/ui/dropdown-menu"
import { Button } from "@/registry/tassullo/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/registry/tassullo/ui/item"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/registry/tassullo/ui/sidebar"

/** Un'icona Lucide, o qualunque componente che accetti una `className`. */
type Icona = ComponentType<{ className?: string }>

export type VoceContesto = {
  /** Quello che torna a `onCambia`, e quello che `attiva` confronta. */
  id: string
  titolo: string
  /** La seconda riga della voce: dove sta, di chi è, quando scade. */
  descrizione?: string
}

export type BarraContestoProps = {
  /**
   * Il tipo di cosa — «Commessa», «Impianto», «Cantiere». Sta davanti al
   * nome e **non si tronca**: senza di lei resta un codice senza soggetto.
   */
  etichetta?: string
  /** Il nome dell'entità attiva. Si tronca lui, quando lo spazio manca. */
  titolo: string
  /** Sotto il nome: indirizzo, committente, stato — quello che serve a non sbagliare entità. */
  descrizione?: ReactNode
  /**
   * L'icona del contesto. **Mai un'emoji**: la disegna il sistema operativo,
   * quindi la stessa riga rende un simbolo diverso su Mac, su Windows e su
   * Android — l'unica cosa che un design system non può tenere ferma. La barra
   * vera di Studio comincia con 📍, e `MapPinIcon` è quel segnaposto disegnato
   * da noi.
   *
   * **La sceglie l'app, da Lucide** (Francesco, 2026-09-21): il default resta
   * `MapPinIcon` perché un default deve essere quello che non sbaglia mai —
   * «ecco dove sei» vale per una commessa, un impianto, una famiglia di
   * prodotti — mentre l'icona che *dice qualcosa* dipende da cosa sia il
   * contesto, e lo sa solo l'app. Le story mostrano `HardHatIcon` per il
   * cantiere di Studio e `CalculatorIcon` per un calcolo strutturale: sono
   * **esempi**, non un vocabolario che il registry fissa.
   */
  icona?: Icona
  /** Le entità fra cui scegliere. Se sono meno di due il menu non si monta. */
  voci?: VoceContesto[]
  /** L'`id` della voce attiva: è lei a portare il segno di spunta nel menu. */
  attiva?: string
  onCambia?: (id: string) => void
  /** Il testo del grilletto. Default: «Cambia». */
  cambia?: string
  /** L'intestazione del pannello. Default: l'`etichetta` al plurale non si sa fare, quindi si scrive. */
  etichettaMenu?: string
  /** Accanto al grilletto: l'azione di pagina che la barra porta con sé. */
  azioni?: ReactNode
  className?: string
}

/**
 * La fascia che dice su cosa si sta lavorando e lascia cambiarlo.
 *
 * ```tsx
 * <BarraContesto
 *   etichetta="Commessa"
 *   titolo="2026-114 — Palazzo Roccabruna"
 *   descrizione="Trento, via Santa Trinità · 212 voci di computo"
 *   voci={commesse}
 *   attiva={commessa.id}
 *   onCambia={setCommessa}
 * />
 * ```
 *
 * Senza `voci` (o con una sola) è una fascia di sola lettura: il grilletto
 * non si monta, invece di montarne uno che apre un menu con dentro quello che
 * c'è già scritto sopra.
 */
export function BarraContesto({
  etichetta,
  titolo,
  descrizione,
  icona: Icona = MapPinIcon,
  voci = [],
  attiva,
  onCambia,
  cambia = "Cambia",
  etichettaMenu,
  azioni,
  className,
}: BarraContestoProps) {
  const siCambia = voci.length > 1

  /*
   * `outline` più `bg-muted`, e il bordo non è ornamento: è ciò che fa
   * leggere la fascia. La prima stesura usava `variant="muted"`, cioè
   * `bg-muted/50` e `border-transparent`, ed è stata bocciata a video — «si
   * fa fatica a vedere». Misurato col colore risolto su canvas (il browser
   * restituisce `oklch`: leggerlo come tre numeri RGB dà misure senza senso),
   * in modalità chiara: il fondo translucido sta a **1.053:1** dalla pagina,
   * il fondo pieno a **1.109**, e il bordo a **1.274**. È il bordo a portare
   * il salto, non il fondo. In scuro: 1.093 → 1.217.
   *
   * Lo conferma la barra vera di Studio, letta nel suo CSS
   * (`CantiereContextBar.css`): `background: var(--color-surface-3)` — un
   * grigio quasi indistinguibile dalla pagina, come qui — **più**
   * `border: 1px solid var(--color-border)`. Anche lì il fondo da solo non
   * separa niente, e il bordo fa tutto il lavoro.
   *
   * Per una fascia ancora più discreta la leva è `className="bg-transparent"`,
   * che lascia il solo filo.
   */
  return (
    <Item
      data-slot="barra-contesto"
      variant="outline"
      size="sm"
      className={cn("rounded-lg bg-muted", className)}
    >
      <ItemMedia variant="icon" className="text-muted-foreground">
        <Icona />
      </ItemMedia>
      {/*
       * `min-w-0` non è ornamento: `ItemContent` è `flex-1` dentro una riga
       * flex, e la larghezza minima automatica di un elemento flex è la sua
       * larghezza a contenuto minimo. Senza, un nome lungo allarga la riga
       * invece di troncarsi, e spinge il grilletto fuori dalla fascia.
       */}
      <ItemContent className="min-w-0">
        {/*
         * `w-full` non è ridondante, e questa è la riga che il difetto l'ha
         * avuto davvero. `ItemTitle` nasce `w-fit`, cioè `width: fit-content`,
         * che *dovrebbe* fermarsi alla larghezza disponibile; dentro
         * `ItemContent`, che è una colonna flex, risolve invece alla larghezza
         * a contenuto massimo. Misurato: in un contenitore da 448px
         * `ItemContent` sta a 298.8 e il titolo a **668.6** — il nome usciva
         * dalla fascia, passava sotto il bottone «Cambia» e `truncate` non
         * scattava mai, perché lo spazio, dal suo punto di vista, non mancava.
         * Con `w-full` il titolo prende i 298.8 del genitore e il nome si
         * accorcia. Non si vede da nessun gate: si vede guardando la story.
         */}
        <ItemTitle className="w-full">
          {etichetta ? (
            <span className="shrink-0 font-normal text-muted-foreground">{etichetta}</span>
          ) : null}
          <span className="truncate">{titolo}</span>
        </ItemTitle>
        {descrizione ? <ItemDescription>{descrizione}</ItemDescription> : null}
      </ItemContent>
      {siCambia || azioni ? (
        <ItemActions>
          {siCambia ? (
            <DropdownMenu>
              {/*
               * Taglia `default` e non `sm`: `sm` è `h-7`, cioè 42px in
               * densità touch — sotto i 44 che `misura:bersagli` chiede.
               * `default` è `h-8`, che in touch fa 48.
               */}
              {/*
               * **Solo il bordo, niente fondo.** `variant="outline"` porta
               * `bg-background` — cioè il bianco della carta — e su una
               * fascia grigia quel bianco spicca più del nome della
               * commessa, che è la cosa che si deve leggere per prima.
               * `bg-transparent` lascia il solo filo; il `dark:` serve
               * perché in scuro la variante porta `dark:bg-input/30`, che
               * altrimenti resterebbe acceso.
               */}
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    className="bg-transparent dark:bg-transparent"
                    aria-label={`${cambia}: ${titolo}`}
                  />
                }
              >
                {cambia}
                <ChevronsUpDownIcon />
              </DropdownMenuTrigger>
              {/*
               * Il pannello dichiara la **propria** larghezza, perché
               * `DropdownMenuContent` porta `w-(--anchor-width)`: senza,
               * prende quella del bottone «Cambia» — un centinaio di pixel,
               * in cui nessun nome di commessa ci sta. Stessa riga del menù
               * utente del guscio, che si difende con `w-56`.
               *
               * **`w-xs` e non `w-80`**, e la differenza si vede solo in
               * touch: `w-80` è sulla scala di `--spacing`, quindi in densità
               * touch diventa 480px e sfonda uno schermo da 375. `w-xs` è
               * sulla scala dei contenitori, cioè 20rem **in tutte e due** le
               * densità. Misurato sul caso peggiore delle voci qui accanto,
               * un nome da 36 caratteri: in densità normale vuole 246px di
               * testo e ne restano 274, quindi ci sta intero; in touch ne
               * vuole 265 e ne restano 251, quindi si tronca. È il
               * comportamento voluto — il pannello ha una larghezza sua e il
               * nome troppo lungo cede lui — e va saputo, perché nel caso
               * limite il codice della commessa in testa resta leggibile
               * mentre la coda del nome no.
               */}
              <DropdownMenuContent align="end" className="w-xs">
                {/*
                 * L'intestazione sta **dentro** il gruppo, non sopra.
                 * `DropdownMenuLabel` è `Menu.GroupLabel` di Base UI, che
                 * pretende un `Menu.Group` o un `Menu.RadioGroup` sopra di sé
                 * e altrimenti lancia — «MenuGroupContext is missing». Non è
                 * un dettaglio di stile: è il modo in cui l'etichetta diventa
                 * il nome accessibile del gruppo di voci.
                 */}
                <DropdownMenuRadioGroup
                  value={attiva}
                  onValueChange={(v) => onCambia?.(String(v))}
                >
                  {etichettaMenu ? (
                    <DropdownMenuLabel>{etichettaMenu}</DropdownMenuLabel>
                  ) : null}
                  {/*
                   * `closeOnClick` non è pignoleria: in Base UI una
                   * `Menu.RadioItem` di suo **non chiude il menu**, perché il
                   * caso per cui esiste è una preferenza che si commuta più
                   * volte di seguito. Qui è l'opposto — si sceglie l'entità su
                   * cui si lavora, e allora il menu ha finito. Misurato in
                   * Chromium vero prima di correggerlo: `Invio` su una voce
                   * lasciava il pannello aperto e il fuoco dentro, cioè
                   * bisognava premere `Esc` dopo aver scelto.
                   */}
                  {voci.map((v) => (
                    <DropdownMenuRadioItem key={v.id} value={v.id} closeOnClick>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{v.titolo}</span>
                        {v.descrizione ? (
                          <span className="truncate text-xs text-muted-foreground">
                            {v.descrizione}
                          </span>
                        ) : null}
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {azioni}
        </ItemActions>
      ) : null}
    </Item>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * Il selettore nella colonna — la seconda metà della stessa cosa
 * ──────────────────────────────────────────────────────────────────────── */

export type SelettoreContestoProps = Pick<
  BarraContestoProps,
  "etichetta" | "titolo" | "descrizione" | "icona" | "voci" | "attiva" | "onCambia" | "etichettaMenu" | "className"
>

/**
 * **Il commutatore del contesto, nella testata della colonna.** Si passa ad
 * `AppShell` con la prop `contesto`, e sta sotto il marchio.
 *
 * ```tsx
 * <AppShell
 *   applicazione="Studio"
 *   contesto={
 *     <SelettoreContesto
 *       etichetta="Commessa"
 *       titolo="2026-114 — Palazzo Roccabruna"
 *       voci={commesse}
 *       attiva={commessa.id}
 *       onCambia={setCommessa}
 *     />
 *   }
 *   sezioni={SEZIONI}
 * />
 * ```
 *
 * ── Perché due forme e non una (2026-09-21) ──────────────────────────────
 *
 * Studio ne ha **due**, e la scoperta è di Francesco guardando l'app vera in
 * M4ter.11: una nella colonna — il riquadro «PROGETTO ATTIVO» — e una in
 * pagina. Fino a quel momento il registry ne conosceva una sola, e
 * `docs/ANALISI-COPERTURA-APP.md` teneva lo slot del guscio **differito** con
 * l'innesco sbagliato («quando una seconda app avrà un contesto che attraversa
 * le pagine»): l'innesco vero era un altro, e era già scattato.
 *
 * Le due non sono un doppione **se hanno ruoli diversi**, ed è la forma
 * scelta:
 *
 * - **la colonna dice *quale*, e lo cambia.** È persistente, si vede da ogni
 *   pagina, e collassando la colonna si riduce alla sua icona.
 * - **la pagina dice *cosa comporta*** — indirizzo, consegna, stato — e **non
 *   porta il «Cambia»**: `BarraContesto` senza `voci` (o con una sola) è già
 *   di sola lettura da sé, non serve una prop nuova.
 *
 * Tenerle tutte e due col «Cambia» era il difetto che si vedeva nello
 * screenshot: «PROGETTO ATTIVO / Prova» e «Progetto attivo: Prova» a 60px di
 * distanza, con due grilletti che fanno la stessa cosa.
 *
 * ── La forma è quella di shadcn, non una nostra ──────────────────────────
 *
 * È il `TeamSwitcher` di `@shadcn/sidebar-07`, chiesto all'MCP e ricomposto
 * qui: `SidebarMenuButton size="lg"` dentro un `SidebarMenu`, con il riquadro
 * dell'icona a sinistra, due righe di testo al centro e `ChevronsUpDown` a
 * destra, e un `DropdownMenu` sopra. Gradino 1 della regola 4bis — la forma
 * esisteva già — e nessuna primitiva nuova: `componenti-propri.json` resta a 1.
 *
 * L'unico scarto dal loro è il **menu a scelta esclusiva**
 * (`DropdownMenuRadioGroup`) invece di voci semplici: qui una delle entità è
 * quella attiva e deve portare il segno di spunta, esattamente come nella
 * `BarraContesto`. Le due forme condividono il vocabolario apposta — stessa
 * `VoceContesto`, stessa `attiva`, stesso `onCambia` — così l'app le alimenta
 * da un dato solo.
 *
 * `side="right"`: il pannello si apre **accanto** alla colonna e non sopra la
 * navigazione, che è ciò che fa anche shadcn. Con la colonna collassata a
 * icona il bottone resta il quadrato dell'icona e il menu si apre lo stesso.
 *
 * ── `titolo` qui è il **nome**, senza il codice ──────────────────────────
 *
 * E non è un gusto: è misurato. Nella colonna al testo restano **159px** in
 * densità normale — 255 di colonna, meno il quadrato dell'icona, il chevron e
 * i margini — mentre «2026-114 — Palazzo Roccabruna» ne vuole **350**: con
 * `truncate` erano **191px fuori**, cioè più di metà nome. (In touch la
 * colonna vale 383px e ci sta: il difetto c'è **solo** in densità normale, che
 * è il modo più facile di non accorgersene provando col guanto.)
 *
 * Provate tutte e tre, misurate, e scelta da Francesco il 2026-09-21:
 *
 * | forma | righe rese | larghezza del testo | cosa si perde |
 * |---|---|---|---|
 * | nome intero, `truncate` | 1 | 350px su 159 | **metà nome**, tagliata |
 * | nome intero, `line-clamp-2` | 2 | 126 + 75 | niente, ma 49px di testo in un bottone alto 48 |
 * | **solo il nome, senza codice** | **1** | **127 su 159** | **il codice, che è in pagina** |
 *
 * (Il bottone è `size="lg"`, cioè **48px fissi** in densità normale e 72 in
 * touch: l'altezza della testata non cambia fra le tre forme — a cambiare è
 * se il testo ci sta dentro.)
 *
 * Vince la terza: il codice non è ciò che si riconosce a colpo d'occhio — il
 * nome sì — e il codice **non sparisce**, sta nella `BarraContesto` della
 * pagina quaranta pixel più a destra, e in ogni voce del menu. Quindi
 * `titolo="Palazzo Roccabruna"` in colonna e `titolo="2026-114 — Palazzo
 * Roccabruna"` in pagina, dallo stesso dato.
 *
 * `line-clamp-2` resta come rete: un nome che non ci sta va a capo e si ferma
 * alla seconda riga, invece di perdere la coda. Non è il caso normale — è
 * quello che succede quando l'app ha un nome più lungo dei nostri.
 *
 * Il menu, invece, mostra codice e nome interi: lì la larghezza la dichiara il
 * pannello (`w-xs`), non la colonna.
 */
export function SelettoreContesto({
  etichetta,
  titolo,
  descrizione,
  icona: Icona = MapPinIcon,
  voci = [],
  attiva,
  onCambia,
  etichettaMenu,
  className,
}: SelettoreContestoProps) {
  const siCambia = voci.length > 1
  /*
   * **Sul telefono il pannello si apre sotto, non a destra.** È la stessa
   * riga che shadcn scrive nel `TeamSwitcher` (`side={isMobile ? "bottom" :
   * "right"}`), e serve per un difetto che si vede solo a 375px: lì la
   * colonna è uno `Sheet` che copre quasi tutto lo schermo, e un pannello
   * aperto alla sua destra **esce dallo schermo** — misurato a video da
   * Francesco. `useSidebar()` è la primitiva a saperlo, non noi.
   */
  const { isMobile } = useSidebar()
  const contenuto = (
    <>
      {/*
       * Il riquadro dell'icona. `bg-sidebar-primary` è il token che shadcn usa
       * qui: nel tema Tassullo è l'arancio del marchio, ed è il solo punto di
       * colore della colonna — il che è voluto, perché è anche l'unica cosa
       * della colonna che non è navigazione.
       */}
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Icona className="size-4" />
      </div>
      {/*
       * `min-w-0` sulla colonna del testo, o un nome lungo allarga il bottone
       * invece di troncarsi: è lo stesso difetto misurato su `ItemTitle` in
       * M4ter.9 (668.6px in un contenitore da 448), un livello più in là.
       */}
      <div className="grid min-w-0 flex-1 text-left leading-tight">
        {/*
         * **Niente opacità sul testo**, ed è un difetto preso dal gate appena
         * scritto: `text-sidebar-foreground/70` sul fondo scuro della colonna
         * dà **4.41:1**, cioè sotto i 4.5 per un soffio. È esattamente la
         * trappola che `CLAUDE.md` mette in guardia — l'opacità cambia il
         * colore *in composizione*, e nessun token la dichiara, quindi
         * `check:contrast` non può vederla: la vede solo axe, e solo se una
         * story la mette in scena.
         *
         * La gerarchia la fa la **misura**, non la trasparenza: `text-xs`
         * contro `font-medium`, che è anche ciò che fa il `TeamSwitcher` di
         * shadcn.
         */}
        {etichetta ? (
          <span className="truncate text-xs">{etichetta}</span>
        ) : null}
        {/*
         * **Due righe, non un troncamento.** `line-clamp-2` manda a capo e
         * taglia alla seconda riga; `truncate` taglierebbe alla prima, e in
         * colonna la prima riga sono ~159px in densità normale — «2026-114 —
         * Palazzo Roccabruna» ne vuole 350, cioè più di metà nome fuori.
         * `break-words` perché un codice lungo senza spazi non ha un punto
         * dove andare a capo, e senza di lui sborderebbe invece di spezzarsi.
         */}
        <span className="line-clamp-2 font-medium break-words">{titolo}</span>
        {descrizione ? (
          <span className="truncate text-xs">{descrizione}</span>
        ) : null}
      </div>
      {siCambia ? <ChevronsUpDownIcon className="ml-auto shrink-0" /> : null}
    </>
  )

  return (
    <SidebarMenu data-slot="selettore-contesto" className={className}>
      <SidebarMenuItem>
        {siCambia ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  aria-label={`${etichetta ?? "Contesto"}: ${titolo}`}
                  className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
                />
              }
            >
              {contenuto}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
              className="w-xs"
            >
              <DropdownMenuRadioGroup
                value={attiva}
                onValueChange={(v) => onCambia?.(String(v))}
              >
                {etichettaMenu ? (
                  <DropdownMenuLabel>{etichettaMenu}</DropdownMenuLabel>
                ) : null}
                {voci.map((v) => (
                  <DropdownMenuRadioItem key={v.id} value={v.id} closeOnClick>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{v.titolo}</span>
                      {v.descrizione ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {v.descrizione}
                        </span>
                      ) : null}
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /*
           * Una sola entità: resta la targhetta, senza grilletto. Stessa
           * regola della `BarraContesto` — un menu che contiene solo quello
           * che c'è già scritto sopra non si monta.
           */
          <SidebarMenuButton size="lg" render={<div />}>
            {contenuto}
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
