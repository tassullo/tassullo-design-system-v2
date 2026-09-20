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
  /** Mai un'emoji: la disegna il sistema operativo. Il default è `MapPinIcon`. */
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

  return (
    <Item
      data-slot="barra-contesto"
      variant="muted"
      size="sm"
      className={cn("rounded-lg", className)}
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
              <DropdownMenuTrigger
                render={<Button variant="outline" aria-label={`${cambia}: ${titolo}`} />}
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
