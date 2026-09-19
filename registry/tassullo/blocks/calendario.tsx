/**
 * `tassullo-calendario` — il calendario a eventi coi default di casa Tassullo,
 * montato sopra il motore `@reui/event-calendar` adottato in M4ter.1.
 *
 * **È un blocco, non un componente nostro.** Il motore e le due viste sono
 * primitive adottate, con originale in `registry/.upstream/` e riga in
 * `registry/.upstream/provenienze.json`; qui sopra non c'è niente di
 * riscritto, solo composizione e configurazione. Per questo
 * `registry/componenti-propri.json` non lo riguarda e resta vuoto
 * (CLAUDE.md, regola 4bis — quel registro serve solo a ciò che sta al posto
 * di una primitiva).
 *
 * **I quattro default di casa**, presi dal `Calendario.tsx` di Officina:
 *
 * 1. **La settimana comincia di lunedì** (`weekStartsOn: 1`), in tutte le
 *    viste. Non basta passare il `locale` italiano: il motore legge
 *    `options.weekStartsOn ?? locale?.options?.weekStartsOn ?? 0`, quindi un
 *    consumatore che dimentica il locale si ritroverebbe la domenica in
 *    prima colonna senza nessun errore. Lo scriviamo esplicito.
 * 2. **Niente creazione dell'evento dal clic sulla griglia.** Non passiamo
 *    `onSlotClick` a meno che l'app non dia `onGiornoClick`, e
 *    `showDayAddButton` resta `false`: una cella cliccata non fa niente.
 * 3. **Trascinamento spento** — ed è una **prop che si spegne**, non un
 *    comportamento imposto: `trascinamento` lo riaccende. La ragione la
 *    scrive il commento di testa di quella pagina di Officina: «la
 *    riprogrammazione è un date-picker nel pannello, non un drag&drop;
 *    trascinare su una griglia da 42 celle è preciso col mouse e impossibile
 *    col pollice, e sarebbe l'unica azione dell'app senza una conferma».
 * 4. **L'evento prende `start` e `end`, non un istante solo.** Un fermo
 *    macchina può durare giorni, e le barre pluri-giorno — cioè il calcolo
 *    delle corsie — sono la parte cara che il motore ci dà già fatta.
 *
 * **Perché `EventoCalendario` è `CalendarEvent` e non un tipo tradotto.**
 * Tradurre i campi vorrebbe dire mantenere uno strato di rimappatura contro
 * un motore di 7 000 righe, che a ogni aggiornamento di ReUI va riletto, in
 * cambio di due nomi italiani. `start`/`end` sono già esattamente ciò che il
 * mandato chiede che l'API prenda: l'alias italiano dà il nome nostro al
 * tipo senza duplicarne la forma. Le prop **del blocco** restano in
 * italiano, come in ogni altro blocco del registry.
 *
 * **Il bivio mese/agenda lo dichiara la pagina, non il blocco.** L'agenda è
 * la faccia stretta — è la vista che Officina si è scritta a mano — ma
 * quale delle due mostrare dipende da quanto spazio ha *quella* pagina, e
 * da M4ter.6 si scriverà con `useSoglia`. Qui `vista` è una prop, con la
 * testata che la commuta quando nessuno la controlla.
 *
 * **La testata è nostra, non quella di ReUI** (`event-calendar-nav`, 648
 * righe / 19,6 KB). Tre ragioni misurate, a verbale in `WORKLOG.md`: il loro
 * commutatore offre le sei viste del motore e noi ne spediamo due; il loro
 * date-picker e le loro scorciatoie sono codice che nessuna app Tassullo ha
 * chiesto; e §6.8 dell'analisi dice che Officina la testata ce l'ha già,
 * composta con `button-group` per «‹ Oggi ›» e `toggle-group` per le viste —
 * cioè esattamente questa. Una testata composta da noi è nostra e la
 * governiamo; la loro sarebbero 19,6 KB in più di codice di terzi da
 * riportare a ogni aggiornamento.
 */
import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { format, isSameMonth, isSameYear, subMilliseconds } from "date-fns"
import { it } from "date-fns/locale"

import { cn } from "cn"
import { Button } from "@/registry/tassullo/ui/button"
import { ButtonGroup } from "@/registry/tassullo/ui/button-group"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/tassullo/ui/toggle-group"
import {
  EventCalendar,
  useEventCalendarNavigation,
} from "@/registry/tassullo/ui/event-calendar"
import { EventCalendarAgendaView } from "@/registry/tassullo/ui/event-calendar-agenda-view"
import { EventCalendarMonthView } from "@/registry/tassullo/ui/event-calendar-month-view"
import type { EventCalendarI18nOverrides } from "@/registry/tassullo/ui/event-calendar-i18n"
import type {
  CalendarEvent,
  EventCalendarOccurrence,
  EventCalendarSlotInfo,
} from "@/registry/tassullo/ui/event-calendar-types"

/** L'evento è quello del motore: `start` e `end`, non un istante solo. */
export type EventoCalendario<TData = unknown> = CalendarEvent<TData>

export type VistaCalendario = "mese" | "agenda"

/**
 * Le etichette del motore, in italiano. I nomi dei mesi e dei giorni li dà
 * il `locale` di date-fns; qui stanno solo le stringhe che ReUI scrive da sé.
 */
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
  viewNames: { month: "Mese", agenda: "Agenda" },
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
      if (isSameMonth(primo, ultimo))
        return `${format(primo, "d", opts)}–${format(ultimo, "d MMMM yyyy", opts)}`
      if (isSameYear(primo, ultimo))
        return `${format(primo, "d MMM", opts)} – ${format(ultimo, "d MMM yyyy", opts)}`
      return `${format(primo, "d MMM yyyy", opts)} – ${format(ultimo, "d MMM yyyy", opts)}`
    },
    formatDayRange: (intervallo, opts) =>
      `${format(intervallo.start, "d MMM", opts)} – ${format(subMilliseconds(intervallo.end, 1), "d MMM", opts)}`,
    formatEventTime: (inizio, fine, tuttoIlGiorno, opts) => {
      if (tuttoIlGiorno) return "Tutto il giorno"
      // `end` è esclusivo: l'ultimo istante reso è un millisecondo prima,
      // o un evento che finisce a mezzanotte sembrerebbe durare un giorno
      // in più.
      const ultimo =
        fine.getTime() - 1 >= inizio.getTime() ? subMilliseconds(fine, 1) : inizio
      if (format(inizio, "yyyy-MM-dd") !== format(ultimo, "yyyy-MM-dd"))
        return `${format(inizio, "d MMM HH:mm", opts)} – ${format(fine, "d MMM HH:mm", opts)}`
      return `${format(inizio, "HH:mm", opts)}–${format(fine, "HH:mm", opts)}`
    },
  },
}

export interface CalendarioProps<TData = unknown> {
  /** Gli eventi, con inizio **e** fine. `end` è esclusivo. */
  eventi: EventoCalendario<TData>[]
  /** Vista controllata. Senza, la testata commuta da sé. */
  vista?: VistaCalendario
  /** @default "mese" */
  vistaIniziale?: VistaCalendario
  onVistaChange?: (vista: VistaCalendario) => void
  /** Data d'ancoraggio controllata (il mese o la finestra d'agenda mostrati). */
  data?: Date
  dataIniziale?: Date
  onDataChange?: (data: Date) => void
  onEventoClick?: (
    occorrenza: EventCalendarOccurrence<TData>,
    e: React.MouseEvent
  ) => void
  /**
   * Il clic su una cella del mese. **Assente per default**: senza questa
   * prop una cella cliccata non fa niente, che è il default di casa.
   * Passarla è la sola strada per creare un evento dalla griglia, e chi la
   * passa si prende la conferma.
   */
  onGiornoClick?: (slot: EventCalendarSlotInfo, e: React.MouseEvent) => void
  /**
   * Riaccende trascinamento e ridimensionamento. **Spento per default**:
   * su una griglia da 42 celle il pollice sbaglia cella, e sarebbe l'unica
   * azione senza conferma. @default false
   */
  trascinamento?: boolean
  /** Quanti giorni mostra l'agenda. @default 7 */
  giorniAgenda?: number
  /** Quante barre per cella prima del «+N altri». @default "auto" */
  maxEventiPerCella?: number | "auto"
  /** La testata con «‹ Oggi ›» e il commutatore. @default true */
  testata?: boolean
  /** Nodi in fondo alla testata, a destra (un bottone «Nuovo fermo», filtri). */
  azioni?: React.ReactNode
  /** Fuso orario di visualizzazione. @default quello del browser */
  fusoOrario?: string
  className?: string
}

const VISTA_MOTORE = { mese: "month", agenda: "agenda" } as const

/**
 * La testata: titolo del periodo, «‹ Oggi ›» e il commutatore mese/agenda.
 * Sta dentro `<EventCalendar>` perché legge la navigazione dallo store.
 */
function CalendarioTestata({
  vista,
  onVista,
  azioni,
}: {
  vista: VistaCalendario
  onVista?: (vista: VistaCalendario) => void
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
            <ToggleGroupItem value="agenda">Agenda</ToggleGroupItem>
          </ToggleGroup>
        ) : null}
        {azioni}
      </div>
    </div>
  )
}

export function Calendario<TData = unknown>({
  eventi,
  vista,
  vistaIniziale = "mese",
  onVistaChange,
  data,
  dataIniziale,
  onDataChange,
  onEventoClick,
  onGiornoClick,
  trascinamento = false,
  giorniAgenda = 7,
  maxEventiPerCella = "auto",
  testata = true,
  azioni,
  fusoOrario,
  className,
}: CalendarioProps<TData>) {
  const [vistaInterna, setVistaInterna] =
    React.useState<VistaCalendario>(vistaIniziale)
  const vistaCorrente = vista ?? vistaInterna

  const cambiaVista = React.useCallback(
    (scelta: VistaCalendario) => {
      if (vista === undefined) setVistaInterna(scelta)
      onVistaChange?.(scelta)
    },
    [vista, onVistaChange]
  )

  return (
    <EventCalendar<TData>
      data-slot="calendario"
      className={cn("min-h-0 flex-1", className)}
      events={eventi}
      view={VISTA_MOTORE[vistaCorrente]}
      views={["month", "agenda"]}
      date={data}
      defaultDate={dataIniziale}
      onDateChange={onDataChange}
      onEventClick={onEventoClick}
      onSlotClick={onGiornoClick}
      // Il default di casa, in una riga: niente trascinamento, niente
      // ridimensionamento, niente selezione di fascia col trascinamento.
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
      agendaDayCount={giorniAgenda}
      i18n={ETICHETTE_IT}
      // L'unico appiglio da tastiera per creare. La cella del mese è un
      // `div` con `role="gridcell"` e **non prende il fuoco** (misurato in
      // Chromium vero: 42 celle, 0 con `tabindex`), quindi un'app che passa
      // `onGiornoClick` senza questo bottone avrebbe un'azione raggiungibile
      // solo col mouse. Lo accendiamo insieme all'azione, e con l'azione
      // spenta resta spento.
      showDayAddButton={onGiornoClick !== undefined}
      // **Il «+N altri» non si lascia schiacciare.** Il motore lo mette come
      // figlio flessibile della colonna degli eventi, senza altezza minima:
      // in una cella piena si riduce a quel che avanza — misurato **4,78px**
      // in densità touch, cioè un filo intoccabile col guanto. `shrink-0` gli
      // ridà almeno la propria riga di testo (16px in normale, 17 in touch),
      // che è la stessa fascia di `breadcrumb-link` e `switch`, già accettata
      // a verbale. Provato anche `min-h-7`, e **scartato**: l'altezza in più
      // se la prendeva dalle barre, e in una cella affollata il motore ne
      // mostrava una invece di tre — si guadagnava un bersaglio e si perdeva
      // il contenuto. Sono classi passate per **configurazione**
      // (`classNames.moreIndicator`), non un ri-stile del file di ReUI.
      classNames={{ moreIndicator: "shrink-0" }}
      maxEventsPerCell={maxEventiPerCella}
    >
      {testata ? (
        <CalendarioTestata
          vista={vistaCorrente}
          // Il commutatore compare solo se commutare serve a qualcosa: con
          // `vista` controllata e nessun `onVistaChange` il clic non
          // cambierebbe niente, e un interruttore che non interruttore
          // niente è peggio di un interruttore assente.
          onVista={vista === undefined || onVistaChange ? cambiaVista : undefined}
          azioni={azioni}
        />
      ) : null}
      {/*
        Il contenitore della vista. ReUI ce l'ha come file a sé
        (`event-calendar-content`, che non abbiamo preso): con sei viste è un
        commutatore, con due è un ternario, e la parte che serve davvero
        sono queste classi — senza `flex-1` la griglia non riempie il
        contenitore e resta alta quanto il suo contenuto.
      */}
      <div
        data-slot="calendario-contenuto"
        data-vista={vistaCorrente}
        className="relative flex min-h-0 min-w-0 flex-1 flex-col"
      >
        {vistaCorrente === "mese" ? (
          <EventCalendarMonthView />
        ) : (
          <EventCalendarAgendaView />
        )}
      </div>
    </EventCalendar>
  )
}
