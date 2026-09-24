/**
 * `tassullo-calendario` — il calendario a eventi coi default di casa Tassullo,
 * montato sopra il motore `@reui/event-calendar` adottato in M4ter.1.
 *
 * **È un blocco, non un componente nostro.** Il motore e le due viste sono
 * primitive adottate, con originale in `registry/.upstream/` e riga in
 * `registry/.upstream/provenienze.json`; qui sopra non c'è niente di
 * riscritto, solo composizione e configurazione. Per questo
 * `registry/componenti-propri.json` non lo riguarda e resta vuoto
 * (CLAUDE.md, regola 4bis).
 *
 * **Niente qui è inventato: ogni pezzo viene da una demo di ReUI**, adattato
 * ai nostri token e alle nostre primitive (`docs/DECISIONI.md` §43 dice che le
 * demo sono materiale di lettura, MIT, e che di loro si prende la *geometria*
 * e non il file). La mappa, perché chi aggiorna sappia dove guardare:
 *
 * | pezzo | demo |
 * |---|---|
 * | dialogo unico crea/modifica/elimina, `apiRef` | `c-event-calendar-3` |
 * | `renderEvent` con icona e titolo | `c-event-calendar-4` |
 * | avatar dell'assegnatario dentro il chip | `c-event-calendar-5` |
 * | `interactions: { drag, resize }` | `c-event-calendar-3/4/5` |
 *
 * **Quello che delle demo NON si prende è la tavolozza.** Loro usano
 * `var(--color-blue-500)`, `bg-violet-500`, `text-[9px]`: colori grezzi di
 * Tailwind e valori arbitrari, che la **regola 3** non ammette. I colori qui
 * sono i dieci `--chart-*` del tema, e si scelgono per nome.
 *
 * ── I QUATTRO DEFAULT DI CASA ───────────────────────────────────────────
 *
 * Presi dal `Calendario.tsx` di Officina:
 *
 * 1. **La settimana comincia di lunedì** (`weekStartsOn: 1`), in tutte le
 *    viste. Non basta passare il `locale` italiano: il motore legge
 *    `options.weekStartsOn ?? locale?.options?.weekStartsOn ?? 0`, quindi un
 *    consumatore che dimentica il locale si ritroverebbe la domenica in
 *    prima colonna senza nessun errore. Lo scriviamo esplicito.
 * 2. **Niente creazione dell'evento dal clic sulla griglia** — finché non si
 *    accende `modifica` o non si passa `onGiornoClick`.
 * 3. **Trascinamento spento** — ed è una **prop che si spegne**, non un
 *    comportamento imposto: `trascinamento` lo riaccende. La ragione la
 *    scrive il commento di testa di quella pagina di Officina: «la
 *    riprogrammazione è un date-picker nel pannello, non un drag&drop;
 *    trascinare su una griglia da 42 celle è preciso col mouse e impossibile
 *    col pollice, e sarebbe l'unica azione dell'app senza una conferma».
 * 4. **L'evento prende `start` e `end`.** Un fermo macchina può durare
 *    giorni, e le barre pluri-giorno — cioè il calcolo delle corsie — sono la
 *    parte cara che il motore ci dà già fatta.
 *
 * **I default restano default anche adesso che l'interattività c'è**: senza
 * `modifica` e senza `trascinamento` il calendario è di sola lettura, che è
 * ciò che Officina ha scelto. Le due prop dicono quanto aprirlo.
 *
 * ── DUE COSE DA SAPERE PRIMA DI USARLO ──────────────────────────────────
 *
 * **Gli eventi sono controllati.** Trascinamento e dialogo non mutano niente
 * da sé: chiamano `onEventiChange` con l'elenco nuovo, e l'app lo rimette
 * dentro da `eventi`. È il motore a volerlo così — in modo controllato
 * `setField` emette il callback e non tocca lo stato interno — ed è anche il
 * comportamento giusto, perché una riprogrammazione passa dal backend.
 * Accendere `modifica` o `trascinamento` **senza** `onEventiChange` fa un
 * calendario che sembra rispondere e non salva niente.
 *
 * **Il contenitore deve avere un'altezza.** Il blocco è `min-h-0 flex-1`:
 * dentro un genitore `flex flex-col` con altezza nota riempie lo spazio.
 *
 * **La vista mese ha un pavimento di tre eventi per cella**: sotto quella
 * misura non si comprime e il contenitore scorre; sopra cresce, e su uno
 * schermo grande la giornata carica ci sta per intero. Il ragionamento e le
 * misure stanno su `monthRow`, più sotto. Le altre due viste scorrono al
 * proprio interno.
 */
import * as React from "react"
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react"
import {
  addDays,
  addMinutes,
  differenceInMinutes,
  format,
  getDaysInMonth,
  isSameMonth,
  isSameYear,
  setHours,
  startOfDay,
  startOfMonth,
  subMilliseconds,
} from "date-fns"
import { it } from "date-fns/locale"

import { cn } from "cn"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/registry/tassullo/ui/avatar"
import { EmptyState } from "@/registry/tassullo/blocks/empty-state"
import { Button } from "@/registry/tassullo/ui/button"
import { Calendar } from "@/registry/tassullo/ui/calendar"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/registry/tassullo/ui/combobox"
import { ButtonGroup } from "@/registry/tassullo/ui/button-group"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/tassullo/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/registry/tassullo/ui/field"
import { Input } from "@/registry/tassullo/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/tassullo/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/tassullo/ui/select"
import { Switch } from "@/registry/tassullo/ui/switch"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/tassullo/ui/toggle-group"
import {
  EventCalendar,
  useEventCalendarNavigation,
} from "@/registry/tassullo/ui/event-calendar"
import type {
  EventCalendarApi,
  EventCalendarRenderEventProps,
} from "@/registry/tassullo/ui/event-calendar"
import { EventCalendarAgendaView } from "@/registry/tassullo/ui/event-calendar-agenda-view"
import { EventCalendarMonthView } from "@/registry/tassullo/ui/event-calendar-month-view"
import { EventCalendarWeekView } from "@/registry/tassullo/ui/event-calendar-time-grid"
import type { EventCalendarI18nOverrides } from "@/registry/tassullo/ui/event-calendar-i18n"
import type {
  CalendarEvent,
  EventCalendarOccurrence,
  EventCalendarSlotInfo,
} from "@/registry/tassullo/ui/event-calendar-types"

/* ─────────────────────────── I colori ─────────────────────────── */

/**
 * **I dieci colori del calendario sono i `--chart-*` del tema**, scelti per
 * nome e mai per valore. Un evento non porta un colore: porta il *nome* di un
 * colore, e la traduzione in token la fa questo file. È il modo in cui il
 * divieto degli esadecimali si fa rispettare per costruzione — `color` del
 * motore è una `string`, quindi accetterebbe `#F4AC3D` senza che nessun
 * controllo se ne accorga (i valori nelle prop non sono classi di Tailwind).
 *
 * Perché proprio i `--chart-*`: sono l'unica famiglia del tema pensata per
 * **distinguere categorie fra loro**, ed è lo stesso mestiere.
 *
 * **Sono dieci**, perché un'app può avere più di cinque tipi di intervento,
 * e un «Guasto» vuole il **rosso**: `rosso`, ed è
 * `--chart-10`, **non `--destructive`** — quello resta il colore dell'allarme,
 * e una categoria «Guasto» non è un'azione distruttiva.
 *
 * `grigio` è la sola tinta neutra: serve a dire
 * «questo non è una categoria», per esempio un fermo chiuso o annullato.
 */
export const COLORI_EVENTO = {
  arancio: "var(--chart-1)",
  verde: "var(--chart-2)",
  blu: "var(--chart-3)",
  grigio: "var(--chart-4)",
  ocra: "var(--chart-5)",
  prugna: "var(--chart-6)",
  indaco: "var(--chart-7)",
  oliva: "var(--chart-8)",
  malva: "var(--chart-9)",
  rosso: "var(--chart-10)",
} as const

export type ColoreEvento = keyof typeof COLORI_EVENTO

const ETICHETTE_COLORE: Record<ColoreEvento, string> = {
  arancio: "Arancio",
  verde: "Verde",
  blu: "Blu",
  grigio: "Grigio",
  ocra: "Ocra",
  prugna: "Prugna",
  indaco: "Indaco",
  oliva: "Oliva",
  malva: "Malva",
  rosso: "Rosso",
}

/* ─────────────────────────── I tipi ─────────────────────────── */

/**
 * **Un calendario**, cioè il raggruppamento a cui un evento appartiene: ha un
 * nome e un colore.
 *
 * **Non è la persona**, ed è una distinzione che viene da Officina: là i
 * calendari sono i **tipi di intervento** — Guasto, Preventiva, Ispezione,
 * Miglioria — con la loro legenda a colori, e l'assegnatario è un filtro a
 * parte («Tutti gli assegnatari»). Confonderli sembra comodo finché due
 * persone non lavorano allo stesso guasto.
 *
 * Nel motore questo concetto esiste già e si chiama `resource`
 * (`EventCalendarResource`: `id`, `title`, `color`): il blocco non lo
 * inventa, gli dà il nome di casa e ne deriva il colore del chip, che il
 * motore da sé non fa (legge solo `event.color`).
 *
 * **Il caso di Officina è «il calendario è la persona»**: un calendario per
 * manutentore, e il colore dell'evento dice a chi è affidato. Ma il concetto
 * regge anche quando la persona non c'entra — un calendario per linea, per
 * reparto, per commessa — e per questo la prop si chiama `calendari` e non
 * `persone`.
 */
export interface CalendarioSorgente {
  id: string
  /** «Guasto», «Preventiva», «Ispezione», «Miglioria». */
  nome: string
  colore: ColoreEvento
}

/**
 * **Chi è assegnato all'evento.** È la persona, e nel chip è l'**avatar** —
 * un canale diverso dal colore, che dice il calendario. In Officina sono due
 * filtri distinti, e nel calendario si leggono insieme: il colore dice *che
 * tipo di intervento è*, l'avatar *chi ci va*.
 */
export interface PersonaEvento {
  id: string
  nome: string
  /** Le iniziali del ripiego. Senza, si ricava la prima lettera del nome. */
  iniziali?: string
  /** L'immagine. Senza, resta l'iniziale. */
  immagine?: string
}

/**
 * L'evento. **`start` e `end` sono quelli del motore**, non campi tradotti:
 * rimappare la forma vorrebbe dire mantenere uno strato di traduzione contro
 * 7 012 righe di terzi, da rileggere a ogni aggiornamento, in cambio di due
 * nomi italiani. Quello che si traduce sono i **due** campi che hanno un
 * nome di casa: il calendario e il colore.
 *
 * `end` è **esclusivo**: un fermo del solo 9 finisce alle 00:00 del 10.
 */
export interface EventoCalendario<TData = unknown>
  extends Omit<CalendarEvent<TData>, "color" | "resourceId"> {
  /**
   * Il calendario a cui l'evento appartiene — l'`id` di una voce di
   * `calendari`. Da lì viene il **colore** del chip.
   */
  calendarioId?: string
  /**
   * Chi ci va — gli `id` delle voci di `persone`. Da lì vengono gli
   * **avatar**, che nel chip stanno in un `AvatarGroup`. È un canale diverso
   * dal colore, apposta: **su un fermo possono esserci in due**, e lo stesso
   * manutentore fa guasti e preventive.
   */
  assegnatariId?: string[]
  /**
   * Il colore, per un evento che non appartiene a nessun calendario. Con
   * `calendarioId` valorizzato vince il calendario: un evento colorato
   * diversamente dal proprio calendario direbbe il falso.
   */
  colore?: ColoreEvento
}

export type VistaCalendario = "mese" | "settimana" | "agenda"

/**
 * **Due iniziali, come nella primitiva** — «Stefano Bertolini» è `SB`.
 *
 * Ci stanno perché il chip è stato alzato: `--ec-month-bar-h` è una
 * variabile del motore e il blocco la lega a `--spacing`, così il chip
 * cresce con la densità invece di restare fermo a 26px. Le misure sono nel
 * commento di quella riga.
 */
function iniziali(a: PersonaEvento): string {
  if (a.iniziali) return a.iniziali
  return a.nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase()
}

/* ─────────────────────────── Le etichette ─────────────────────────── */

/**
 * Le etichette del motore, in italiano. I nomi dei mesi e dei giorni li dà
 * il `locale` di date-fns; qui stanno solo le stringhe che ReUI scrive da sé.
 */
/** L'orario di un evento, in italiano. Usato dal motore e dal tooltip. */
function oraDi(inizio: Date, fine: Date, tuttoIlGiorno: boolean): string {
  if (tuttoIlGiorno) return "Tutto il giorno"
  const opts = { locale: it }
  // `end` è esclusivo: l'ultimo istante reso è un millisecondo prima, o un
  // evento che finisce a mezzanotte sembrerebbe durare un giorno in più.
  const ultimo =
    fine.getTime() - 1 >= inizio.getTime() ? subMilliseconds(fine, 1) : inizio
  if (format(inizio, "yyyy-MM-dd") !== format(ultimo, "yyyy-MM-dd"))
    return `${format(inizio, "d MMM HH:mm", opts)} – ${format(fine, "d MMM HH:mm", opts)}`
  return `${format(inizio, "HH:mm", opts)}–${format(fine, "HH:mm", opts)}`
}

const ETICHETTE_IT: EventCalendarI18nOverrides = {
  labels: {
    today: "Oggi",
    previous: "Precedente",
    next: "Successivo",
    addEvent: "Aggiungi evento",
    allDay: "Tutto il giorno",
    more: (n) => (n === 1 ? "+1 altro" : `+${n} altri`),
    noEvents: "Nessun evento",
    loading: "Caricamento degli eventi",
    event: "evento",
    events: (n) => (n === 1 ? "1 evento" : `${n} eventi`),
    selectView: "Scegli la vista",
    week: (n) => `S${n}`,
    goToDate: "Vai alla data",
    dropNotAllowed: "Non si può spostare qui",
    continues: "continua",
    timeFrom: (t) => `Dalle ${t}`,
    timeUntil: (t) => `Fino alle ${t}`,
    toggleDayEvents: (n) => (n === 1 ? "1 evento" : `${n} eventi`),
    moreCompact: (n) => `+${n}`,
    timeRange: (da, a) => `${da}–${a}`,
  },
  viewNames: { month: "Mese", week: "Settimana", agenda: "Agenda" },
  formats: {
    // 24 ore: in italiano "9:30 AM" non si scrive.
    eventTime: "HH:mm",
    timeGutter: "HH",
    timeGutterMinute: "HH:mm",
    agendaDayHeader: "EEEE d MMMM",
    moreDayHeader: "EEEE d MMMM",
  },
  // L'ordine delle parole, non solo la lingua. Il `locale` di date-fns
  // traduce «September» in «settembre» ma lascia in piedi la forma inglese
  // «settembre 7 - 13, 2026», che le `functions` di ReUI compongono a mano.
  // Si riscrivono qui, che è configurazione del motore e non un ri-stile.
  functions: {
    formatTitle: (vista, { date, activeRange, locale }) => {
      const opts = { locale }
      if (vista === "month") return format(date, "MMMM yyyy", opts)
      if (vista === "day") return format(date, "EEEE d MMMM yyyy", opts)
      const ultimo = subMilliseconds(activeRange.end, 1)
      const primo = activeRange.start
      // Spazi attorno al trattino anche qui, come negli altri due rami.
      // Senza, «1–7 settembre» si legge sbilanciato: l'«1» di Inter ha la
      // spalla destra stretta e il trattino gli si appiccica addosso,
      // sembrando staccato dal numero dopo.
      if (isSameMonth(primo, ultimo))
        return `${format(primo, "d", opts)} – ${format(ultimo, "d MMMM yyyy", opts)}`
      if (isSameYear(primo, ultimo))
        return `${format(primo, "d MMM", opts)} – ${format(ultimo, "d MMM yyyy", opts)}`
      return `${format(primo, "d MMM yyyy", opts)} – ${format(ultimo, "d MMM yyyy", opts)}`
    },
    formatDayRange: (intervallo, opts) =>
      `${format(intervallo.start, "d MMM", opts)} – ${format(subMilliseconds(intervallo.end, 1), "d MMM", opts)}`,
    formatEventTime: (inizio, fine, tuttoIlGiorno) =>
      oraDi(inizio, fine, tuttoIlGiorno),
  },
}

/* ─────────────────────────── Il chip ─────────────────────────── */

/**
 * **Il chip lo rendiamo noi, sempre** — geometria di `c-event-calendar-4` e
 * `c-event-calendar-5`, colori nostri. Non solo quando c'è un calendario, e
 * la ragione è **misurata**: il chip di serie scrive l'ora in
 * `text-muted-foreground`, che sul fondo tinto di un evento grigio dà
 * **4,11:1** in modalità scura — sotto soglia. Il fondo del chip è
 * `bg-(--ec-event-color)/15` (e `/20` in scuro), e su quello l'unico colore di
 * testo che regge con tutti e cinque i colori è `text-foreground`: titolo e
 * ora si distinguono per **peso**, non per colore.
 *
 * Stessa storia per le iniziali dell'avatar: la ricetta di ReUI le scrive in
 * `text-(--ec-event-color)` su `bg-(--ec-event-color)/25`, cioè un colore su
 * sé stesso — da **2,35:1** (grigio) a 4,11 (arancio). Il colore resta come
 * tinta del cerchio, il testo torna `foreground`, e la tinta scende da `/25`
 * a `/20` perché a `/25` l'arancio in scuro si fermava a **4,49:1**: un
 * centesimo sotto, che è comunque sotto.
 *
 * **E il cerchio è `size-5`, non `size-4`.** Due iniziali al gradino più
 * piccolo che il tema tara (`text-xs`, 12px) **escono** da un cerchio di
 * 16px: ReUI lo risolve con `text-[9px]`, che è un valore arbitrario e non
 * scala con la densità. La strada nostra è allargare il cerchio — 20px in
 * normale, 30 in touch, perché `size-*` deriva da `--spacing` — e stringere
 * la spaziatura con `tracking-tight`.
 */
function creaChip<TData>(perPersona: Map<string, PersonaEvento>) {
  return function chipCalendario({
    occurrence,
    view,
  }: EventCalendarRenderEventProps<TData>) {
    const evento = occurrence.event as unknown as CalendarEvent<TData> & {
      assegnatariId?: string[]
    }
    const chi = (evento.assegnatariId ?? [])
      .map((id) => perPersona.get(id))
      .filter((x): x is PersonaEvento => x !== undefined)
    // L'agenda ha una riga sua, con l'ora in colonna a parte: lì il chip di
    // serie va bene, e sostituirlo toglierebbe l'allineamento.
    if (view === "agenda" && chi.length === 0) return undefined
    // Oltre i due, il terzo posto dice **quanti** invece di **chi**: tre
    // cerchi in un chip alto 26px non si distinguono comunque.
    const mostrati = chi.slice(0, 2)
    const restano = chi.length - mostrati.length
    return (
      <span className="text-foreground flex w-full min-w-0 items-center gap-1.5">
        {chi.length > 0 ? (
          // **Sovrapposti come vuole la primitiva, ma in proporzione.**
          // `AvatarGroup` stringe di `-space-x-2`, cioè 8px: è un quarto di
          // `size-8`, la taglia per cui è disegnato. Su un avatar da 16px
          // quegli stessi 8px sono **mezzo cerchio**, e la prima iniziale
          // spariva sotto la seconda. `-space-x-1` è lo stesso quarto alla
          // metà della taglia — e l'anello resta quello della primitiva,
          // che è ciò che rende leggibile la sovrapposizione.
          <AvatarGroup className="shrink-0 -space-x-1.5">
            {mostrati.map((x) => (
              // **La primitiva così com'è, senza vestirla.** Il fallback
              // aveva `bg-(--ec-event-color)/20`, cioè un fondo
              // **semi-trasparente**: sovrapposti da `AvatarGroup` (che li
              // stringe di `-space-x-2`) si vedevano l'uno attraverso
              // l'altro, e l'anello della primitiva — che è un `after` con
              // `mix-blend-darken` — ci si sommava sopra. Gli artefatti
              // venivano da lì. Il fondo torna quello di casa (`bg-muted`,
              // opaco) e il colore resta dov'è il suo posto: **il chip**,
              // che dice il calendario. L'avatar dice la persona.
              //
              // **`size-4` sopra la taglia `sm`, e non una taglia nuova.**
              // La misura: il chip del mese è alto **26px e non scala**
              // (`--ec-month-bar-h` è in `rem`, non deriva da `--spacing`),
              // mentre l'avatar sì — `sm` fa 24px in normale e **36 in
              // touch**, cioè sfora. `size-4` fa 16 e 24: ci sta in
              // entrambe, e l'iniziale (7,1px) tiene 4,45px di margine.
              //
              // E la classe si posa sulla taglia **base**, non su `sm`:
              // `data-[size=sm]:size-6` è una variante con attributo e ha
              // specificità più alta di `size-4`, quindi vinceva lei — la
              // misura lo diceva, 36px in touch anche con la classe. Sulla
              // base, invece, è `tailwind-merge` a sostituire `size-8`.
              //
              // Una **taglia `xs` dentro `avatar.tsx`** sarebbe più pulita,
              // ma aggiungere un valore all'union di `size` cambierebbe la
              // **forma** della primitiva, che resta identica all'originale
              // shadcn per poterla aggiornare. Con **un** punto d'uso, la classe dal punto di chiamata costa meno
              // della macchina.
              <Avatar key={x.id} className="size-5" title={x.nome}>
                {x.immagine ? (
                  <AvatarImage src={x.immagine} alt={x.nome} />
                ) : null}
                {/*
                  `text-xs` esplicito: il corpo piccolo del fallback è
                  agganciato a `data-[size=sm]`, e la taglia qui la dà una
                  classe, non la prop — v. sopra.
                */}
                <AvatarFallback className="text-xs">
                  {iniziali(x)}
                </AvatarFallback>
              </Avatar>
            ))}
            {restano > 0 ? (
              <AvatarGroupCount className="size-5 text-xs">
                +{restano}
              </AvatarGroupCount>
            ) : null}
          </AvatarGroup>
        ) : (
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-(--ec-event-color)"
          />
        )}
        <span className="truncate font-medium">{evento.title}</span>
        {!evento.allDay && view !== "agenda" ? (
          <span className="ms-auto shrink-0 font-normal opacity-70">
            {format(occurrence.start, "HH:mm")}
          </span>
        ) : null}
      </span>
    )
  }
}

/* ─────────────────────────── La legenda ─────────────────────────── */

/**
 * **La legenda dei calendari**, geometria di `c-event-calendar-4` — un
 * pallino e un nome per calendario, in riga. In Officina sta in alto a
 * destra, accanto ai filtri, e lì l'abbiamo messa: senza, il colore di un
 * chip è un'informazione che non si può decodificare.
 */
function CalendarioLegenda({
  calendari,
  vista,
}: {
  calendari: CalendarioSorgente[]
  vista: VistaCalendario
}) {
  return (
    <div
      data-slot="calendario-legenda"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-xs",
        // **Il bordo in cima, tranne che nella settimana.** Le righe orarie
        // della griglia sono un `repeating-linear-gradient`, e l'ultima
        // linea che disegna cade esattamente **sul fondo della colonna**:
        // lì il `border-t` della legenda ci si somma, e si legge come un
        // bordo doppio sotto l'ultima ora. Nel mese e nell'agenda quella
        // linea non c'è, e senza il bordo la legenda sembrerebbe attaccata.
        vista !== "settimana" && "border-t"
      )}
    >
      {calendari.map((c) => (
        <span key={c.id} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-full"
            // Il colore è un dato, non uno stile: cambia per calendario e
            // non può stare in una classe di Tailwind, che è statica. Il
            // valore resta un token del tema.
            style={{ backgroundColor: COLORI_EVENTO[c.colore] }}
          />
          {c.nome}
        </span>
      ))}
    </div>
  )
}

/* ─────────────────────────── Le opzioni ─────────────────────────── */

/** Le tre leve di vista, come le tiene il blocco. */
interface OpzioniVista {
  weekend: boolean
  numeroSettimana: boolean
  tooltip: boolean
}

/**
 * **Il menù delle opzioni**, geometria del pannello «Settings» di
 * `c-event-calendar-1`: un popover con un interruttore per riga. Loro ne
 * hanno tre schede e una dozzina di leve — lingua, fuso orario, durata dello
 * slot, tre modi di trascinare; qui ce ne sono **tre**, che sono quelle che
 * cambiano cosa si vede e non come funziona il calendario.
 *
 * Le altre non ci sono per scelta, non per fretta: la lingua e il fuso li
 * decide l'app, non chi guarda; e accendere il trascinamento da un menù
 * vorrebbe dire che una riprogrammazione senza conferma è a un clic di
 * distanza, che è esattamente ciò che il commento di Officina evita.
 */
function CalendarioOpzioni({
  opzioni,
  onOpzioni,
  vista,
}: {
  opzioni: OpzioniVista
  onOpzioni: (o: OpzioniVista) => void
  vista: VistaCalendario
}) {
  /**
   * **Ogni leva dichiara in quali viste ha effetto, e fuori si disabilita.**
   * Non è pignoleria: il motore legge `weekNumbers` **solo** nella vista
   * mese e `weekends` non lo legge in agenda — verificato a grep sui tre
   * file. Lasciare l'interruttore acceso dove non fa niente è il difetto
   * peggiore di un pannello di impostazioni, perché chi lo tocca conclude
   * che il calendario è rotto. È la stessa regola per cui il commutatore
   * delle viste sparisce quando commutare non cambierebbe niente.
   */
  const righe: {
    chiave: keyof OpzioniVista
    etichetta: string
    viste: VistaCalendario[]
  }[] = [
    { chiave: "weekend", etichetta: "Sabato e domenica", viste: ["mese", "settimana"] },
    { chiave: "numeroSettimana", etichetta: "Numero della settimana", viste: ["mese"] },
    { chiave: "tooltip", etichetta: "Tooltip sull'evento", viste: ["mese", "settimana", "agenda"] },
  ]
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" aria-label="Opzioni di vista" />}
      >
        <Settings2Icon data-icon="inline-start" />
        Opzioni
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        {righe.map(({ chiave, etichetta, viste }) => {
          const vale = viste.includes(vista)
          return (
            <Field
              key={chiave}
              orientation="horizontal"
              className="justify-between"
            >
              <FieldLabel htmlFor={`cal-op-${chiave}`} className="font-normal">
                {etichetta}
              </FieldLabel>
              {/*
                Disabilitato dove non ha effetto, e **senza una nota che lo
                spieghi**: l'interruttore spento dice già tutto, e una riga
                di testo in più per ognuno fa di un menù di tre voci un
                pannello da leggere.
              */}
              <Switch
                id={`cal-op-${chiave}`}
                checked={opzioni[chiave]}
                disabled={!vale}
                onCheckedChange={(v: boolean) =>
                  onOpzioni({ ...opzioni, [chiave]: v })
                }
              />
            </Field>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

/* ─────────────────────────── La testata ─────────────────────────── */

/**
 * La testata: titolo del periodo, «‹ Oggi ›» e il commutatore mese/agenda.
 * Sta dentro `<EventCalendar>` perché legge la navigazione dallo store.
 *
 * **Non è `event-calendar-nav`**: la loro sono 648 righe con un commutatore a sei
 * viste e noi ne spediamo due, e Officina la testata la compone già così.
 */
function CalendarioTestata({
  vista,
  onVista,
  onNuovo,
  opzioni,
  onOpzioni,
  azioni,
}: {
  vista: VistaCalendario
  onVista?: (vista: VistaCalendario) => void
  onNuovo?: () => void
  opzioni?: OpzioniVista
  onOpzioni?: (o: OpzioniVista) => void
  azioni?: React.ReactNode
}) {
  const { title, prev, next, today } = useEventCalendarNavigation()

  return (
    <div
      data-slot="calendario-testata"
      className="flex flex-wrap items-center gap-3 pb-3"
    >
      <ButtonGroup aria-label="Navigazione del calendario">
        <Button variant="outline" size="icon" onClick={prev} aria-label="Periodo precedente">
          <ChevronLeftIcon />
        </Button>
        <Button variant="outline" onClick={today}>
          Oggi
        </Button>
        <Button variant="outline" size="icon" onClick={next} aria-label="Periodo successivo">
          <ChevronRightIcon />
        </Button>
      </ButtonGroup>
      <p
        data-slot="calendario-titolo"
        aria-live="polite"
        className="text-base font-semibold first-letter:uppercase"
      >
        {title}
      </p>
      <div className="ms-auto flex items-center gap-2">
        {onVista ? (
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[vista]}
            onValueChange={(valori: string[]) => {
              const scelta = valori[0] as VistaCalendario | undefined
              if (scelta) onVista(scelta)
            }}
            aria-label="Vista del calendario"
          >
            <ToggleGroupItem value="mese">Mese</ToggleGroupItem>
            <ToggleGroupItem value="settimana">Settimana</ToggleGroupItem>
            <ToggleGroupItem value="agenda">Agenda</ToggleGroupItem>
          </ToggleGroup>
        ) : null}
        {opzioni && onOpzioni ? (
          <CalendarioOpzioni
            opzioni={opzioni}
            onOpzioni={onOpzioni}
            vista={vista}
          />
        ) : null}
        {azioni}
        {onNuovo ? (
          <Button onClick={onNuovo}>
            <PlusIcon data-icon="inline-start" />
            Nuovo
          </Button>
        ) : null}
      </div>
    </div>
  )
}

/* ─────────────────────────── Il dialogo ─────────────────────────── */

/**
 * La bozza è **una sola**, e il suo `id` dice tutto: `null` significa «stai
 * creando», valorizzato significa «stai modificando». È la forma di
 * `c-event-calendar-3`, e regge perché i due casi hanno gli stessi campi.
 */
interface BozzaEvento {
  id: string | null
  titolo: string
  giorno: Date
  oraInizio: number
  durata: number
  tuttoIlGiorno: boolean
  /** Usato quando non ci sono calendari: allora il colore è dell'evento. */
  colore: ColoreEvento
  /** L'`id` del calendario, quando ce ne sono. */
  calendarioId?: string
  /** Gli `id` delle persone assegnate. */
  assegnatariId: string[]
}

const ORE = Array.from({ length: 17 }, (_, i) => i + 5) // 05:00 – 21:00
const DURATE = [
  { valore: 30, etichetta: "30 minuti" },
  { valore: 60, etichetta: "1 ora" },
  { valore: 120, etichetta: "2 ore" },
  { valore: 240, etichetta: "mezza giornata" },
  { valore: 480, etichetta: "1 giornata" },
  { valore: 1440, etichetta: "24 ore" },
  { valore: 2880, etichetta: "2 giorni" },
  { valore: 4320, etichetta: "3 giorni" },
]

function CalendarioDialogoEvento({
  bozza,
  setBozza,
  calendari,
  persone,
  perPersona,
  aperto,
  setAperto,
  onSalva,
  onElimina,
}: {
  bozza: BozzaEvento | null
  setBozza: (b: BozzaEvento) => void
  calendari: CalendarioSorgente[]
  persone: PersonaEvento[]
  perPersona: Map<string, PersonaEvento>
  aperto: boolean
  setAperto: (v: boolean) => void
  onSalva: () => void
  onElimina: () => void
}) {
  const modifica = bozza?.id != null
  const [dataAperta, setDataAperta] = React.useState(false)
  const ancora = useComboboxAnchor()
  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      {bozza ? (
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {modifica ? "Modifica evento" : "Nuovo evento"}
            </DialogTitle>
            <DialogDescription>
              {modifica
                ? "Cambia quando succede, quanto dura e di chi è."
                : "Scegli il giorno, la durata e il calendario a cui appartiene."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cal-titolo">Titolo</FieldLabel>
              <Input
                id="cal-titolo"
                placeholder="Per esempio: fermo pressa 3"
                value={bozza.titolo}
                autoFocus
                onChange={(e) => setBozza({ ...bozza, titolo: e.target.value })}
              />
            </Field>

            {/*
              **La data è un campo, non una conseguenza del punto di
              partenza.** Dal «+» di una cella il giorno è già deciso e il
              campo arriva compilato; dal bottone «Nuovo» non c'è nessun
              giorno da cui partire, e senza questo campo si sarebbe
              costretti a creare sempre «oggi» e poi trascinare.

              È anche il pattern che il commento di testa del `Calendario.tsx`
              di Officina descrive: «la riprogrammazione è un **date-picker
              nel pannello**, non un drag&drop». Quindi il campo c'è anche in
              modifica, ed è la strada con la conferma — il trascinamento
              resta la scorciatoia senza.
            */}
            <Field>
              <FieldLabel htmlFor="cal-data">Data</FieldLabel>
              <Popover open={dataAperta} onOpenChange={setDataAperta}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      id="cal-data"
                      // **Le classi che lo fanno somigliare a un campo, non a
                      // un bottone.** `variant="outline"` porta
                      // `bg-background`, che è il grigio della *pagina*: su
                      // una pagina non si nota, dentro un dialogo — che è
                      // `bg-popover`, quasi bianco — diventa l'unico campo
                      // grigio in mezzo a tre trasparenti. Si allinea agli
                      // altri campi del modulo: stesso fondo, stesso bordo,
                      // stesso raggio, e niente hover, perché nemmeno i
                      // `select` accanto ce l'hanno.
                      className="justify-start rounded-lg border-input bg-transparent font-normal hover:bg-transparent aria-expanded:bg-transparent"
                    />
                  }
                >
                  <CalendarIcon data-icon="inline-start" />
                  <span className="first-letter:uppercase">
                    {format(bozza.giorno, "EEEE d MMMM yyyy", { locale: it })}
                  </span>
                  <ChevronDownIcon data-icon="inline-end" className="ms-auto" />
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                  aria-label="Scegli il giorno"
                >
                  <Calendar
                    mode="single"
                    locale={it}
                    selected={bozza.giorno}
                    defaultMonth={bozza.giorno}
                    onSelect={(scelto) => {
                      if (scelto) setBozza({ ...bozza, giorno: startOfDay(scelto) })
                      setDataAperta(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            {/*
              **Il campo è «Calendario», non «Colore»**, ed è il modello
              giusto: non si sceglie una tinta, si sceglie *a
              chi appartiene* l'evento, e il colore è la conseguenza. Nel caso
              di Officina il calendario è la persona a cui il fermo è
              affidato, quindi il menu mostra pallino, avatar e nome.

              Le cinque pastiglie di colore restano **solo** quando l'app non
              passa `calendari`: lì il colore è un dato dell'evento e non c'è
              niente a cui appartenere.
            */}
            {calendari.length > 0 ? (
              <Field>
                <FieldLabel htmlFor="cal-calendario">Calendario</FieldLabel>
                <Select
                  value={bozza.calendarioId ?? calendari[0].id}
                  onValueChange={(v: string | null) =>
                    setBozza({ ...bozza, calendarioId: v ?? calendari[0].id })
                  }
                >
                  <SelectTrigger id="cal-calendario">
                    <SelectValue>
                      {(() => {
                        const c =
                          calendari.find((x) => x.id === bozza.calendarioId) ??
                          calendari[0]
                        return (
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: COLORI_EVENTO[c.colore] }}
                            />
                            {c.nome}
                          </span>
                        )
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  {/*
                    **`alignItemWithTrigger={false}`**: di serie Base UI
                    allinea la *voce scelta* al valore nel grilletto, come
                    fa un `select` nativo di macOS. Qui il valore porta un
                    pallino colorato davanti al nome e la voce dell'elenco
                    no, quindi per far combaciare i due testi il pannello
                    slitta — **5px contro 1** del `Primitive/Select`, che
                    di pallini non ne ha. Cinque pixel bastano a farlo
                    leggere come storto rispetto al campo sotto.
                    Allineandolo al **grilletto** il pannello sta sul bordo
                    del campo, che è quel che ci si aspetta da un modulo —
                    e lo si fa su **tutti e tre** i `select` del dialogo,
                    non solo su questo: in un modulo i pannelli che si
                    aprono da campi allineati devono aprirsi allineati.
                  */}
                  <SelectContent alignItemWithTrigger={false} align="start">
                    {calendari.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="size-2.5 shrink-0 rounded-full"
                            // Il colore è un **dato**, non uno stile: cambia
                            // per calendario, quindi non può stare in una
                            // classe di Tailwind, che è statica. Il valore
                            // resta un token del tema — `COLORI_EVENTO` non
                            // contiene esadecimali.
                            style={{ backgroundColor: COLORI_EVENTO[c.colore] }}
                          />
                          {c.nome}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : (
              <Field>
                <FieldLabel>Colore</FieldLabel>
                <div className="flex gap-2">
                  {(Object.keys(COLORI_EVENTO) as ColoreEvento[]).map((nome) => (
                    <button
                      key={nome}
                      type="button"
                      aria-label={ETICHETTE_COLORE[nome]}
                      aria-pressed={bozza.colore === nome}
                      onClick={() => setBozza({ ...bozza, colore: nome })}
                      style={{ backgroundColor: COLORI_EVENTO[nome] }}
                      className={cn(
                        "focus-visible:ring-ring size-6 rounded-full outline-none focus-visible:ring-2",
                        bozza.colore === nome &&
                          "ring-foreground ring-offset-background ring-2 ring-offset-2"
                      )}
                    />
                  ))}
                </div>
              </Field>
            )}

            {persone.length > 0 ? (
              <Field>
                <FieldLabel htmlFor="cal-assegnatari">Assegnatari</FieldLabel>
                {/*
                  **Più di uno**, perché su un fermo possono esserci in due.
                  Il controllo è il `combobox` a più scelte con le pillole —
                  la composizione di `Primitive/Combobox → Più scelte, con
                  pillole` — e non un gruppo di interruttori: una squadra di
                  manutenzione può essere di quindici persone, e un
                  `toggle-group` è un filtro che si clicca, non un campo che
                  si cerca: il nome dice la funzione, non l'aspetto.
                */}
                <Combobox
                  multiple
                  autoHighlight
                  items={persone.map((x) => x.nome)}
                  value={bozza.assegnatariId
                    .map((id) => perPersona.get(id)?.nome)
                    .filter((n): n is string => n !== undefined)}
                  onValueChange={(nomi: string[]) =>
                    setBozza({
                      ...bozza,
                      assegnatariId: nomi
                        .map((n) => persone.find((x) => x.nome === n)?.id)
                        .filter((id): id is string => id !== undefined),
                    })
                  }
                >
                  <ComboboxChips ref={ancora}>
                    <ComboboxValue>
                      {(nomi: string[]) => (
                        <React.Fragment>
                          {nomi.map((n) => (
                            <ComboboxChip key={n}>{n}</ComboboxChip>
                          ))}
                          <ComboboxChipsInput
                            id="cal-assegnatari"
                            placeholder={nomi.length ? "" : "Nessuno"}
                          />
                        </React.Fragment>
                      )}
                    </ComboboxValue>
                  </ComboboxChips>
                  <ComboboxContent anchor={ancora}>
                    <ComboboxEmpty>Nessuna persona trovata.</ComboboxEmpty>
                    <ComboboxList>
                      {(nome: string) => (
                        <ComboboxItem key={nome} value={nome}>
                          {nome}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
            ) : null}

            {!bozza.tuttoIlGiorno ? (
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="cal-inizio">Inizio</FieldLabel>
                  <Select
                    value={String(bozza.oraInizio)}
                    onValueChange={(v: string | null) =>
                      setBozza({ ...bozza, oraInizio: Number(v ?? bozza.oraInizio) })
                    }
                  >
                    <SelectTrigger id="cal-inizio">
                      <SelectValue>
                        {`${String(bozza.oraInizio).padStart(2, "0")}:00`}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="start">
                      {ORE.map((ora) => (
                        <SelectItem key={ora} value={String(ora)}>
                          {`${String(ora).padStart(2, "0")}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="cal-durata">Durata</FieldLabel>
                  <Select
                    value={String(bozza.durata)}
                    onValueChange={(v: string | null) =>
                      setBozza({ ...bozza, durata: Number(v ?? bozza.durata) })
                    }
                  >
                    <SelectTrigger id="cal-durata">
                      <SelectValue>
                        {DURATE.find((d) => d.valore === bozza.durata)?.etichetta ??
                          `${bozza.durata} minuti`}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="start">
                      {DURATE.map((d) => (
                        <SelectItem key={d.valore} value={String(d.valore)}>
                          {d.etichetta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            ) : null}

            <Field orientation="horizontal">
              <FieldLabel htmlFor="cal-giornata" className="font-normal">
                Tutto il giorno
              </FieldLabel>
              <Switch
                id="cal-giornata"
                checked={bozza.tuttoIlGiorno}
                onCheckedChange={(v: boolean) =>
                  setBozza({ ...bozza, tuttoIlGiorno: v })
                }
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="sm:justify-between">
            {modifica ? (
              // `variant="destructive"`, non `text-destructive`: quel token è
              // il colore dei **fondi** e come testo dà 3.52:1. La demo di ReUI usa proprio la classe
              // vietata — è uno dei punti in cui non la si copia.
              <Button variant="destructive" onClick={onElimina}>
                Elimina
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <DialogClose render={<Button variant="outline" />}>
                Annulla
              </DialogClose>
              <Button onClick={onSalva} disabled={!bozza.titolo.trim()}>
                {modifica ? "Salva" : "Crea"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}

/* ─────────────────────────── Il blocco ─────────────────────────── */

export interface CalendarioProps<TData = unknown> {
  /** Gli eventi, con inizio **e** fine. `end` è esclusivo. */
  eventi: EventoCalendario<TData>[]
  /**
   * L'elenco nuovo dopo un trascinamento, un salvataggio o un'eliminazione.
   * **Gli eventi sono controllati**: senza questa prop il calendario sembra
   * rispondere e non salva niente. Obbligatoria di fatto con `modifica` o
   * `trascinamento`.
   */
  onEventiChange?: (eventi: EventoCalendario<TData>[]) => void
  /**
   * Accende il dialogo di crea/modifica/elimina: il clic su un evento lo
   * apre in modifica, il clic su un giorno vuoto in creazione, e in testata
   * compare «Nuovo». @default false
   */
  modifica?: boolean
  /**
   * Riaccende trascinamento e ridimensionamento. **Spento per default**: su
   * una griglia da 42 celle il pollice sbaglia cella, e sarebbe l'unica
   * azione senza conferma. @default false
   */
  trascinamento?: boolean
  /** Vista controllata. Senza, la testata commuta da sé. */
  vista?: VistaCalendario
  /** @default "mese" */
  vistaIniziale?: VistaCalendario
  onVistaChange?: (vista: VistaCalendario) => void
  /** Data d'ancoraggio controllata (il mese o la finestra d'agenda mostrati). */
  data?: Date
  dataIniziale?: Date
  onDataChange?: (data: Date) => void
  /**
   * Il clic su un evento. Con `modifica` acceso il dialogo si apre lo stesso,
   * **dopo** questa chiamata; `e.preventDefault()` lo impedisce, ed è la
   * strada per aprire un pannello proprio al posto del dialogo.
   */
  onEventoClick?: (
    occorrenza: EventCalendarOccurrence<TData>,
    e: React.MouseEvent
  ) => void
  /**
   * Il clic su una cella del mese. **Assente per default**: senza questa prop
   * e senza `modifica`, una cella cliccata non fa niente — il default di casa.
   */
  onGiornoClick?: (slot: EventCalendarSlotInfo, e: React.MouseEvent) => void
  /**
   * Quanti giorni mostra l'agenda. **`"mese"` (il default) la tiene
   * sincronizzata col mese**: commutando vista si vedono gli stessi eventi,
   * perché cambia la faccia e non il periodo. Un numero fissa invece una
   * finestra scorrevole di N giorni a partire dal giorno ancorato.
   */
  giorniAgenda?: number | "mese"
  /** Quante barre per cella prima del «+N altri». @default "auto" */
  maxEventiPerCella?: number | "auto"
  /** La testata con «‹ Oggi ›» e il commutatore. @default true */
  testata?: boolean
  /** Nodi in fondo alla testata, prima di «Nuovo» (filtri, una legenda). */
  azioni?: React.ReactNode
  // Cosa mostrare quando non c'è nessun evento. Il default è
  // `tassullo-empty-state`, cioè lo standard unico del vuoto — **non**
  // lo stato vuoto di ReUI, che porterebbe una sua illustrazione e un suo
  // tono. Si passa un nodo per cambiare la frase o aggiungerci una CTA.
  /**
   * Cosa mostrare quando non c'è nessun evento. Di default è
   * `tassullo-empty-state`; si passa un nodo per cambiare la frase o per
   * aggiungere un'azione.
   */
  statoVuoto?: React.ReactNode
  /** Fuso orario di visualizzazione. @default quello del browser */
  fusoOrario?: string
  /**
   * I calendari a cui gli eventi possono appartenere: da qui vengono il
   * **colore** del chip e l'**avatar**. Nel caso di Officina un calendario è
   * una persona, e il colore dice a chi il fermo è affidato.
   */
  calendari?: CalendarioSorgente[]
  /**
   * Le persone assegnabili. Da qui viene l'**avatar** nel chip, e il campo
   * «Assegnatario» nel dialogo. Senza assegnatario il chip mostra il pallino
   * col colore del calendario: il colore c'è sempre, la persona no.
   */
  persone?: PersonaEvento[]
  /** La legenda dei calendari sotto la testata. @default true con `calendari` */
  legenda?: boolean
  // Mostrare sabato e domenica nelle viste **mese** e **settimana**.
  //
  // **`false` di default**: quello
  // delle app Tassullo è un calendario **lavorativo**, da lunedì a venerdì, e
  // il fine settimana è rumore in cinque colonne su sette. Il motore non lo
  // legge in **agenda**, che continua a elencare tutto — verificato: con
  // `weekend={false}` un evento del solo sabato sparisce dalla griglia del
  // mese ma resta in agenda, quindi **non si perde niente**, si nasconde.
  //
  // Misurato a prop accesa e spenta: 42 celle e 7 colonne contro **30 celle e
  // 5 colonne**, e una barra a cavallo del fine settimana (venerdì→lunedì) si
  // **spezza in due segmenti** invece di attraversare.
  //
  // Chi ha bisogno del sabato — un cantiere che lavora, un turno di
  // reperibilità — lo riaccende con `weekend`, e l'interruttore c'è anche nel
  // menù Opzioni. @default false
  /**
   * Mostrare sabato e domenica nelle viste mese e settimana. Spento di
   * default: è un calendario di lavoro, da lunedì a venerdì. L'agenda elenca
   * comunque tutti gli eventi, anche quelli del fine settimana, quindi non si
   * perde niente. Un evento che attraversa il fine settimana si divide in due
   * tratti. L'interruttore c'è anche nel menu Opzioni.
   * @default false
   */
  weekend?: boolean
  /** Il numero della settimana in una colonna a sinistra. @default false */
  numeroSettimana?: boolean
  /**
   * Il tooltip che compare passando sopra un evento, col titolo, l'orario e
   * il calendario. È la strada per leggere il **nome per esteso** della
   * persona, che nel cerchio dell'avatar ci sta con una lettera sola.
   * @default false
   */
  tooltip?: boolean
  /**
   * Il menù «Opzioni» in testata, da cui chi guarda commuta le tre leve qui
   * sopra. Con il menù acceso le tre prop diventano il **valore di
   * partenza**, non il valore fisso. @default false
   */
  opzioni?: boolean
  /** Il colore di un evento senza calendario e senza colore. @default "arancio" */
  coloreDefault?: ColoreEvento
  className?: string
}

const VISTA_MOTORE = {
  mese: "month",
  settimana: "week",
  agenda: "agenda",
} as const

/** Un array letterale come default sarebbe nuovo a ogni render. */
const VUOTI: CalendarioSorgente[] = []
const SENZA_PERSONE: PersonaEvento[] = []

export function Calendario<TData = unknown>({
  eventi,
  onEventiChange,
  modifica = false,
  trascinamento = false,
  vista,
  vistaIniziale = "mese",
  onVistaChange,
  data,
  dataIniziale,
  onDataChange,
  onEventoClick,
  onGiornoClick,
  giorniAgenda = "mese",
  maxEventiPerCella = "auto",
  testata = true,
  azioni,
  statoVuoto,
  weekend = false,
  numeroSettimana = false,
  tooltip = false,
  opzioni = false,
  fusoOrario,
  calendari = VUOTI,
  persone = SENZA_PERSONE,
  legenda = true,
  coloreDefault = "arancio",
  className,
}: CalendarioProps<TData>) {
  const [vistaInterna, setVistaInterna] =
    React.useState<VistaCalendario>(vistaIniziale)
  const vistaCorrente = vista ?? vistaInterna
  /**
   * L'ancora corrente, seguita anche quando la naviga il motore. Serve a
   * tenere l'agenda **sincronizzata col mese**: il motore ancora il mese a
   * `startOfMonth(date)` e l'agenda a `startOfDay(date)` per
   * `agendaDayCount` giorni, quindi commutando vista si vedrebbero due
   * periodi diversi — con `dataIniziale` al 1° e sette giorni d'agenda, i
   * fermi dopo il 7 sparivano.
   */
  const [ancora, setAncora] = React.useState<Date>(
    () => data ?? dataIniziale ?? new Date()
  )
  const ancoraCorrente = data ?? ancora
  const seguiData = React.useCallback(
    (d: Date) => {
      setAncora(d)
      onDataChange?.(d)
    },
    [onDataChange]
  )
  const giorniAgendaRisolti =
    giorniAgenda === "mese" ? getDaysInMonth(ancoraCorrente) : giorniAgenda
  const apiRef = React.useRef<EventCalendarApi<TData> | null>(null)
  const progressivo = React.useRef(0)
  const [dialogoAperto, setDialogoAperto] = React.useState(false)
  // Con il menù acceso le tre prop sono il punto di partenza e poi comanda
  // chi guarda; senza, restano quello che l'app ha deciso.
  const [leve, setLeve] = React.useState<OpzioniVista>({
    weekend,
    numeroSettimana,
    tooltip,
  })
  const vistaLeve: OpzioniVista = opzioni
    ? leve
    : { weekend, numeroSettimana, tooltip }
  const [bozza, setBozza] = React.useState<BozzaEvento | null>(null)

  /**
   * **In agenda l'ancora si porta all'inizio del mese**, quando la finestra
   * è quella del mese. È il pezzo che chiude la sincronizzazione: senza,
   * l'agenda partirebbe dal giorno ancorato — dal 19 se si è premuto «Oggi»
   * — e mostrerebbe un pezzo diverso di calendario.
   *
   * Converge in un giro: `goTo` emette `onDateChange`, l'ancora diventa il
   * primo del mese, e alla passata dopo la condizione è falsa. La dipendenza
   * è il **millisecondo**, non l'oggetto `Date`: un `Date` è un riferimento
   * nuovo a ogni render e l'effetto non si fermerebbe più.
   */
  const msAncora = ancoraCorrente.getTime()
  React.useEffect(() => {
    if (vistaCorrente !== "agenda" || giorniAgenda !== "mese") return
    const inizio = startOfMonth(new Date(msAncora))
    if (inizio.getTime() !== msAncora) apiRef.current?.goTo(inizio)
  }, [vistaCorrente, giorniAgenda, msAncora])

  const cambiaVista = React.useCallback(
    (scelta: VistaCalendario) => {
      // **Passando a una vista più stretta si resta su un giorno che ha
      // senso.** Il mese è ancorato al suo primo giorno, quindi la settimana
      // ricadrebbe sempre sulla **prima** del mese — che nella metà dei casi
      // è quella che comincia nel mese prima, e che quasi sempre è vuota. La
      // regola, che è quella dei calendari che usiamo tutti: se **oggi** sta
      // nel mese che si sta guardando, la settimana è quella di oggi;
      // altrimenti si resta dove si era.
      if (scelta === "settimana") {
        const oggi = new Date()
        if (isSameMonth(oggi, ancoraCorrente)) apiRef.current?.goTo(oggi)
      }
      if (vista === undefined) setVistaInterna(scelta)
      onVistaChange?.(scelta)
    },
    [vista, onVistaChange, ancoraCorrente]
  )

  const perId = React.useMemo(
    () => new Map(calendari.map((c) => [c.id, c])),
    [calendari]
  )
  const perPersona = React.useMemo(
    () => new Map(persone.map((x) => [x.id, x])),
    [persone]
  )
  // `renderEvent` legge la mappa: si rifà solo quando i calendari cambiano,
  // o ogni render rimonterebbe tutti i chip.
  const chip = React.useMemo(() => creaChip<TData>(perPersona), [perPersona])

  /**
   * L'unica traduzione fra il nostro evento e quello del motore. Due campi:
   * `calendarioId` → `resourceId`, che è come il motore chiama la stessa
   * cosa; e il **colore**, che il motore vuole in `color` come stringa e che
   * qui si risolve nell'ordine calendario → evento → default. Il motore da
   * sé non deriva il colore dalla risorsa: legge solo `event.color`.
   * Tutto il resto — `id`, `title`, `start`, `end`, `allDay` — passa identico.
   */
  const eventiMotore = React.useMemo(
    () =>
      eventi.map(({ calendarioId, colore, ...resto }) => ({
        ...resto,
        resourceId: calendarioId,
        color:
          COLORI_EVENTO[
            ((calendarioId ? perId.get(calendarioId)?.colore : undefined) ??
              colore ??
              coloreDefault) as ColoreEvento
          ],
      })) as CalendarEvent<TData>[],
    [eventi, perId, coloreDefault]
  )

  /** Il viaggio di ritorno: si rimette il nome nostro e si toglie il token. */
  const verso = React.useCallback(
    (lista: CalendarEvent<TData>[]) =>
      lista.map((e) => {
        const { resourceId, ...resto } =
          e as CalendarEvent<TData> & { color?: string }
        delete resto.color
        return {
          ...resto,
          ...(resourceId ? { calendarioId: resourceId } : {}),
        } as unknown as EventoCalendario<TData>
      }),
    []
  )

  const apriCreazione = React.useCallback(
    (giorno: Date) => {
      setBozza({
        id: null,
        titolo: "",
        giorno: startOfDay(giorno),
        oraInizio: 8,
        durata: 60,
        tuttoIlGiorno: false,
        colore: coloreDefault,
        calendarioId: calendari[0]?.id,
        assegnatariId: [],
      })
      setDialogoAperto(true)
    },
    [coloreDefault, calendari]
  )

  const apriModifica = React.useCallback(
    (occorrenza: EventCalendarOccurrence<TData>) => {
      // **L'evento che arriva è quello del MOTORE**, non il nostro: il
      // calendario lì dentro si chiama `resourceId`, perché è così che il
      // mapping lo scrive. Leggerlo come `calendarioId` dava sempre
      // `undefined`, e il dialogo ricadeva sul **primo** calendario
      // dell'elenco — un evento «Preventiva» si apriva come «Guasto».
      const e = occorrenza.event as unknown as EventoCalendario<TData> & {
        resourceId?: string
      }
      setBozza({
        id: e.id,
        titolo: e.title,
        giorno: startOfDay(e.start),
        oraInizio: e.start.getHours(),
        durata: Math.max(30, differenceInMinutes(e.end, e.start)),
        tuttoIlGiorno: e.allDay ?? false,
        colore: e.colore ?? coloreDefault,
        calendarioId: e.resourceId ?? e.calendarioId ?? calendari[0]?.id,
        assegnatariId: e.assegnatariId ?? [],
      })
      setDialogoAperto(true)
    },
    [coloreDefault, calendari]
  )

  const salva = React.useCallback(() => {
    const api = apiRef.current
    if (!api || !bozza || !bozza.titolo.trim()) return
    const inizio = bozza.tuttoIlGiorno
      ? bozza.giorno
      : setHours(bozza.giorno, bozza.oraInizio)
    // `end` esclusivo: un evento di un giorno intero finisce alla mezzanotte
    // del giorno dopo, non alle 23:59 — o la barra si accorcia di un giorno.
    const fine = bozza.tuttoIlGiorno
      ? addDays(bozza.giorno, 1)
      : addMinutes(inizio, bozza.durata)
    const cal = bozza.calendarioId ? perId.get(bozza.calendarioId) : undefined
    const patch = {
      title: bozza.titolo.trim(),
      start: inizio,
      end: fine,
      allDay: bozza.tuttoIlGiorno,
      resourceId: bozza.calendarioId,
      assegnatariId: bozza.assegnatariId,
      color: COLORI_EVENTO[cal?.colore ?? bozza.colore],
    } as Partial<CalendarEvent<TData>>
    if (bozza.id === null) {
      api.addEvent({
        id: `evento-${Date.now()}-${progressivo.current++}`,
        ...patch,
      } as CalendarEvent<TData>)
    } else {
      api.updateEvent(bozza.id, patch)
    }
    setDialogoAperto(false)
  }, [bozza, perId])

  const elimina = React.useCallback(() => {
    const api = apiRef.current
    if (!api || !bozza?.id) return
    api.removeEvent(bozza.id)
    setDialogoAperto(false)
  }, [bozza])

  return (
    <>
      <EventCalendar<TData>
        data-slot="calendario"
        // **L'altezza della barra del mese legata alla densità.** È una
        // variabile del motore (`h-[calc(var(--ec-month-bar-h,1.75rem)…)]`),
        // e il suo default è **1.75rem in `rem`**: il chip resta 26px anche
        // in touch, mentre tutto il resto cresce. Da lì venivano due
        // difetti — l'avatar `sm` che a 36px sforava un chip da 26, e le due
        // iniziali che non ci stavano in un cerchio abbastanza piccolo da
        // starci dentro.
        //
        // Legandola a `--spacing` × 8 il chip fa **32px in normale e 48 in
        // touch**, e l'avatar `size-5` (20 e 30) ci sta con 6px di margine
        // per lato — 4 anche togliendo l'anello da 2px dell'`AvatarGroup`.
        //
        // **Il tetto lo mette l'altezza della pagina, non l'estetica.** A
        // ×9 il chip faceva 36 e l'avatar stava comodissimo, ma la riga
        // saliva a 140px e **sei righe non ci stavano più**: il mese
        // scorreva e l'ultima settimana restava fuori. Con 32 la riga sta
        // in 128, e 6 × 128 più testata e legenda entrano in uno schermo da
        // 900px — che è quello del capannone.
        // Non è un valore arbitrario e non è un ri-stile: è una variabile
        // che il motore espone apposta, e il valore è un calcolo sul token.
        //
        // **E `--ec-chip-h` è la stessa altezza per il chip con orario**.
        // La barra di tutto il giorno vale
        // `--ec-month-bar-h − 0.125rem` — la corsia meno i 2px di stacco fra
        // corsie — mentre il chip con orario non dichiara nessuna altezza e si
        // dimensiona sul contenuto: **30 contro 28 in normale, 46 contro 42 in
        // touch** senza, uno scarto che nessuno ha scelto. Si alza il chip, non si abbassa la barra: la **corsia** che il motore
        // riserva vale già `--ec-month-bar-h`, e `monthRow` conta in corsie di
        // quella misura — quindi a non riempire il proprio posto era
        // il chip. Abbassare la barra rimetterebbe invece il difetto degli
        // avatar che sforano dal chip.
        style={{
          "--ec-month-bar-h": "calc(var(--spacing) * 8)",
          "--ec-chip-h": "calc(var(--ec-month-bar-h) - 0.125rem)",
        } as React.CSSProperties}
        className={cn("min-h-0 flex-1", className)}
        apiRef={apiRef}
        events={eventiMotore}
        onEventsChange={
          onEventiChange
            ? (lista) => onEventiChange(verso(lista))
            : undefined
        }
        view={VISTA_MOTORE[vistaCorrente]}
        views={["month", "week", "agenda"]}
        date={data}
        defaultDate={dataIniziale}
        onDateChange={seguiData}
        onEventClick={(occorrenza, e) => {
          onEventoClick?.(occorrenza, e)
          if (e.defaultPrevented || !modifica) return
          // Il dialogo prende il posto della tinta di selezione di serie.
          e.preventDefault()
          apriModifica(occorrenza)
        }}
        onSlotClick={
          onGiornoClick ?? (modifica ? (slot) => apriCreazione(slot.date) : undefined)
        }
        // Il default di casa, in una riga. `selectSlot` è il trascinamento
        // *per creare*, che resta spento anche con `trascinamento`: creare si
        // fa dal dialogo, dove c'è una conferma.
        interactions={{
          drag: trascinamento,
          resize: trascinamento,
          selectSlot: false,
        }}
        // Lunedì esplicito: il motore lo dedurrebbe dal locale, e un
        // consumatore che dimentica il locale avrebbe la domenica in prima
        // colonna senza nessun errore.
        weekStartsOn={1}
        locale={it}
        timeZone={fusoOrario}
        agendaDayCount={giorniAgendaRisolti}
        i18n={ETICHETTE_IT}
        // L'appiglio da tastiera per creare. La cella del mese è un `div` con
        // `role="gridcell"` e **non prende il fuoco** (misurato in Chromium
        // vero: 42 celle, 0 con `tabindex`), quindi senza questo bottone
        // l'azione sarebbe raggiungibile solo col mouse. Si accende insieme
        // all'azione, e con l'azione spenta resta spento.
        showDayAddButton={modifica || onGiornoClick !== undefined}
        viewSettings={{
          weekends: vistaLeve.weekend,
          weekNumbers: vistaLeve.numeroSettimana,
        }}
        eventTooltip={vistaLeve.tooltip}
        // Il contenuto del tooltip è nostro: quello di serie dice titolo e
        // ora, e qui serve anche **di chi è** — è il posto in cui il nome
        // per esteso torna leggibile, visto che nel cerchio dell'avatar ci
        // sta una lettera sola.
        renderEventTooltip={({ occurrence }) => {
          const e = occurrence.event as unknown as CalendarEvent<TData>
          const cal = e.resourceId ? perId.get(e.resourceId) : undefined
          if (!cal) return undefined
          // Non si usa `label`: è già «titolo, orario» tutto insieme, e
          // messa sotto al titolo lo ripeteva due volte.
          return (
            <div className="flex flex-col gap-0.5">
              <p className="font-medium">{e.title}</p>
              <p className="opacity-80">
                {oraDi(occurrence.start, occurrence.end, occurrence.allDay)}
              </p>
              <p className="opacity-80">{cal.nome}</p>
            </div>
          )
        }}
        maxEventsPerCell={maxEventiPerCella}
        resources={calendari.map((c) => ({ id: c.id, title: c.nome }))}
        // **Il vuoto è il nostro, non quello di ReUI.** Il loro monta
        // `IconStack` con una sua illustrazione; da noi il vuoto ha uno
        // standard unico — `tassullo-empty-state` — e un calendario
        // che se ne inventasse un altro sarebbe la deriva che il design
        // system esiste per non avere. Conseguenza da sapere: `icon-stack`
        // resta nel registry perché `event-calendar-agenda-view` lo importa,
        // ma non rende più niente.
        renderNoEvents={() =>
          statoVuoto ?? (
            <EmptyState
              icona={<CalendarIcon />}
              titolo="Nessun evento"
              descrizione="In questo periodo non è programmato niente."
            />
          )
        }
        renderEvent={chip}
        classNames={{
          // **Il «+N altri» non si lascia schiacciare.** Il motore lo mette
          // come figlio flessibile della colonna degli eventi, senza altezza
          // minima: in una cella piena si riduce a quel che avanza — misurato
          // **4,78px** in densità touch. `shrink-0` gli ridà almeno la propria
          // riga di testo.
          moreIndicator: "shrink-0",
          // **Lo stesso padding verticale in tutti i chip.** Nel mese ReUI
          // gli dà `py-1`, nel popover «+N altri» `py-0.5`: quattro pixel
          // di differenza, e l'avatar — che è alto quanto il contenuto del
          // chip più grande — nel popover sbordava. Non bastava dare
          // un'altezza minima al contenuto, perché il chip del mese ha
          // un'altezza **fissa** e sarebbe stato il contenuto a uscire di
          // là. La misura giusta è il padding, ed è una classe.
          //
          // (Il popover, per giunta, sta in un **portale**: la variabile
          // `--ec-month-bar-h` che il blocco dichiara sul proprio root lì
          // non arriva — `getComputedStyle` la legge vuota — quindi il chip
          // non ha nemmeno l'altezza del mese da cui partire.)
          // `!` perché nel popover il padding arriva dal **punto di
          // chiamata** (`py-0.5` passato al chip), e nella `cn()` del
          // motore il `className` del chiamante viene dopo `classNames`:
          // senza l'important vincerebbe lui, e infatti la misura dava
          // ancora 24px.
          event: "py-1!",
          // **Il pavimento è tre eventi, e da lì in su il mese cresce**.
          // Queste due righe — il pavimento della cella e quello del
          // corpo — sono l'unica leva: sotto c'è il meccanismo del motore, che
          // fa il resto da sé.
          //
          // ── Cosa fa il motore ──────────────────────────────────────────
          //
          // `maxEventsPerCell` vale `"auto"` (il nostro default): reui misura
          // l'area utile della cella e mostra **quanti eventi ci stanno**,
          // arrotolando il resto in «+N altri». Sopra il pavimento questo
          // lavora a favore — più spazio, più corsie intere.
          //
          // ── Il conto che dà il 32 ──────────────────────────────────────
          //
          // Tre corsie da `--ec-month-bar-h` (qui `--spacing × 8`, cioè 32px)
          // fanno 96, più 6 di `pt-1.5` in cima e 26 del numero del giorno in
          // fondo: **128px**, cioè esattamente 32 unità di spaziatura. Deriva
          // da `--spacing`, quindi cresce da sé in densità touch. Tre e non
          // due perché una giornata con due interventi e un «+1 altro» dice
          // meno di una con tre interventi scritti.
          //
          // ── Perché non si scende sotto, ed è la parte misurata ─────────
          //
          // Si è provata la via opposta — pavimento a **una** corsia
          // (`min-h-16`), lasciando che l'adattamento riducesse gli eventi
          // sugli schermi bassi. Funzionava sui numeri e **non a vedersi**:
          // l'adattamento ragiona in corsie intere ma l'area della cella no,
          // quindi a metà strada fra due corsie l'ultimo elemento resta
          // **tagliato a metà** — un «+4 altri» tranciato in orizzontale, con la cella a 85px (59 di area utile,
          // cioè 1,8 corsie).
          //
          // Col pavimento a tre corsie quel caso non esiste: sotto soglia la
          // cella **non si comprime affatto** e il contenitore scorre; sopra,
          // cresce di corsie intere. È la ragione di fondo della scelta:
          // **ingrandire è sicuro, rimpicciolire no**, perché verso l'alto si
          // aggiunge spazio e verso il basso si taglia contenuto.
          //
          // ── Rimisurato, dieci altezze di contenitore ───────────────────
          //
          // | contenitore | cella | «+N altri» | scorre | sovrapp. | tagliati |
          // |---:|---:|---:|---|---:|---:|
          // | 313 | 128 | 1 | sì | 0 | 0 |
          // | 576 | 128 | 1 | sì | 0 | 0 |
          // | 797 | 128 | 1 | sì | 0 | 0 |
          // | 900 | 131 | 1 | no | 0 | 0 |
          // | 1000 | 147 | 1 | no | 0 | 0 |
          // | 1200 | 181 | 1 | no | 0 | 0 |
          // | 1400 | 214 | **0** | no | 0 | 0 |
          //
          // A 1400px di contenitore il «+N altri» sparisce del tutto: la
          // giornata più carica ci sta per intero. È il caso che la scelta
          // vuole premiare — schermi grandi, più eventi scritti.
          //
          // ── Il difetto che queste due righe hanno chiuso ───────────────
          //
          // Col solo pavimento della cella (128px) il **binario** della
          // griglia, che è `minmax(0, 1fr)`, si accorcerebbe col contenitore:
          // la riga sborderebbe dal proprio binario e i chip finirebbero
          // disegnati nella banda della settimana di sopra, sopra i numeri
          // dei giorni. Misurato a 576px: passo di riga 77 contro celle da 128, **51px di
          // invasione**, chip 20×12 sopra il numero — e il contenitore offriva
          // 51px di scorrimento contro i ~270 che servivano, cioè schiacciava
          // **e** scorreva.
          monthRow: "min-h-32",
          // `overflow-visible` perche' lo scorrimento sta sul **contenitore** —
          // un `div` nostro, che puo' prendere `tabIndex`. Una regione
          // scorrevole senza contenuto focalizzabile dentro e'
          // `scrollable-region-focusable`, *critical*, e con un mese vuoto e'
          // esattamente il caso: nessun chip, niente da mettere a fuoco.
          // Su `monthBody` via `classNames` la regola scatta proprio col mese
          // vuoto.
          //
          // `border-t-0` perche' il bordo in cima ce l'ha gia' il
          // contenitore: due tratti a 1px di distanza si leggono come un
          // **doppio bordo**, ed e' la prima cosa che si nota.
          monthView: "overflow-visible border-t-0",
          // **Il pavimento del corpo: `6 × 128`.** È questa riga a fare
          // scorrere il mese invece di lasciarlo schiacciare, e serve perché
          // il pavimento della *riga* da solo non basta — il binario resta
          // `minmax(0, 1fr)` e continua ad accorciarsi, quindi sotto
          // `N × pavimento` la riga sborda comunque. Con `min-h-192` il corpo
          // smette di comprimersi e il contenitore scorre; sopra, `flex-1`
          // cresce e l'adattamento lavora.
          //
          // **Non è `min-h-min`**, provata e scartata: min-content include i
          // chip già resi, quindi la cella non si accorcia, quindi «auto» non
          // riduce niente, quindi min-content resta grande — un cerchio che
          // non si chiude. Qui il pavimento è un **numero**.
          //
          // Il prezzo, dichiarato: un mese da **cinque** settimane tiene lo
          // stesso pavimento da sei, quindi sotto soglia offre 128px di
          // scorrimento che non gli servirebbero. Leggere il numero di
          // settimane dal motore sarebbe una dipendenza in più per un caso che
          // a quelle altezze è comunque al limite.
          monthBody: "min-h-192",
          monthHeader: "bg-card sticky top-0 z-20",
          // **I due tipi di chip alla stessa altezza**. La colonna
          // dei chip con orario contiene, in ordine: il distanziatore delle
          // corsie riservate alle barre (altezza **in linea**, quindi `*:` non
          // lo tocca), i chip con orario e il «+N altri». Dando a tutti
          // `--ec-chip-h` la colonna prende lo stesso ritmo della corsia delle
          // barre: 30 + 2 di `gap-0.5` = 32, cioè `--ec-month-bar-h`.
          monthCellContent: "*:h-(--ec-chip-h)",
          // Stessa ragione del mese: **ogni vista del motore apre con un
          // `border-t` proprio**, perché ReUI la disegna per stare sotto la
          // sua `nav` senza un contenitore attorno. Chi la monta dentro un
          // contenitore con bordo li somma, e si legge un bordo sdoppiato.
          // Sono tre, e vanno spente tutte e tre: chi aggiunge una vista
          // quarta si ricordi di questa riga.
          agendaView: "border-t-0",
          timeGrid: "border-t-0",
        }}
      >
        {testata ? (
          <CalendarioTestata
            vista={vistaCorrente}
            // Il commutatore compare solo se commutare serve a qualcosa: con
            // `vista` controllata e nessun `onVistaChange` il clic non
            // cambierebbe niente, e un interruttore che non cambia niente è
            // peggio di un interruttore assente.
            onVista={vista === undefined || onVistaChange ? cambiaVista : undefined}
            onNuovo={modifica ? () => apriCreazione(data ?? new Date()) : undefined}
            opzioni={opzioni ? vistaLeve : undefined}
            onOpzioni={opzioni ? setLeve : undefined}
            azioni={azioni}
          />
        ) : null}
        {/*
          Il contenitore della vista. ReUI ce l'ha come file a sé
          (`event-calendar-content`, che non abbiamo preso): con sei viste è un
          commutatore, con due è un ternario, e la parte che serve davvero
          sono queste classi — senza `flex-1` la griglia non riempie il
          contenitore. Il bordo e il raggio stanno qui perché la griglia ha i
          soli tratti *interni*: senza, il mese resta aperto sui quattro lati.
        */}
        <div
          data-slot="calendario-riquadro"
          className="bg-card flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border"
        >
          <div
            data-slot="calendario-contenuto"
            data-vista={vistaCorrente}
            // `tabIndex` solo in vista mese, che è la sola che scorre qui
            // dentro: l'agenda ha già il proprio `ScrollArea`, e un
            // contenitore che non scorre non deve essere un fermo di
            // tabulazione in più.
            tabIndex={vistaCorrente === "mese" ? 0 : undefined}
            className={cn(
              "focus-visible:ring-ring relative flex min-h-0 min-w-0 flex-1 flex-col outline-none focus-visible:ring-1 focus-visible:ring-inset",
              vistaCorrente === "mese" ? "overflow-y-auto" : "overflow-hidden"
            )}
          >
            {vistaCorrente === "mese" ? (
              <EventCalendarMonthView />
            ) : vistaCorrente === "settimana" ? (
              <EventCalendarWeekView />
            ) : (
              <EventCalendarAgendaView />
            )}
          </div>
          {/*
            **La legenda sta in fondo, dentro il riquadro**, come nella demo
            `c-event-calendar-4` — e fuori dall'area che scorre, o
            scorrerebbe via insieme alle settimane. È per questo che il
            riquadro col bordo è diventato un contenitore a sé: dentro, la
            vista che scorre e la legenda che resta.
          */}
          {legenda && calendari.length > 0 ? (
            <CalendarioLegenda calendari={calendari} vista={vistaCorrente} />
          ) : null}
        </div>
      </EventCalendar>
      {modifica ? (
        <CalendarioDialogoEvento
          bozza={bozza}
          setBozza={setBozza}
          calendari={calendari}
          persone={persone}
          perPersona={perPersona}
          aperto={dialogoAperto}
          setAperto={setDialogoAperto}
          onSalva={salva}
          onElimina={elimina}
        />
      ) : null}
    </>
  )
}
