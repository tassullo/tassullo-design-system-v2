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
 * sono i cinque `--chart-*` del tema, e si scelgono per nome.
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
 * dentro un genitore `flex flex-col` con altezza nota riempie lo spazio e le
 * viste scorrono al proprio interno.
 */
import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react"
import {
  addDays,
  addMinutes,
  differenceInMinutes,
  format,
  isSameMonth,
  isSameYear,
  setHours,
  startOfDay,
  subMilliseconds,
} from "date-fns"
import { it } from "date-fns/locale"

import { cn } from "cn"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/tassullo/ui/avatar"
import { Button } from "@/registry/tassullo/ui/button"
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
import { Field, FieldGroup, FieldLabel } from "@/registry/tassullo/ui/field"
import { Input } from "@/registry/tassullo/ui/input"
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
import type { EventCalendarI18nOverrides } from "@/registry/tassullo/ui/event-calendar-i18n"
import type {
  CalendarEvent,
  EventCalendarOccurrence,
  EventCalendarSlotInfo,
} from "@/registry/tassullo/ui/event-calendar-types"

/* ─────────────────────────── I colori ─────────────────────────── */

/**
 * **I cinque colori del calendario sono i `--chart-*` del tema**, scelti per
 * nome e mai per valore. Un evento non porta un colore: porta il *nome* di un
 * colore, e la traduzione in token la fa questo file. È il modo in cui la
 * regola 3 si fa rispettare per costruzione invece che a memoria — `color` del
 * motore è una `string`, quindi accetterebbe `#F4AC3D` senza che nessun gate
 * se ne accorga (i valori nelle prop non sono classi di Tailwind).
 *
 * Perché proprio i `--chart-*`: sono l'unica famiglia del tema pensata per
 * **distinguere serie fra loro**, ed è lo stesso mestiere. `chart-4` e
 * `chart-5` sono due grigi vicini, ed è voluto: servono a dire «questo non è
 * una categoria», per esempio un fermo chiuso o annullato.
 */
export const COLORI_EVENTO = {
  arancio: "var(--chart-1)",
  verde: "var(--chart-2)",
  blu: "var(--chart-3)",
  grigio: "var(--chart-4)",
  ardesia: "var(--chart-5)",
} as const

export type ColoreEvento = keyof typeof COLORI_EVENTO

const ETICHETTE_COLORE: Record<ColoreEvento, string> = {
  arancio: "Arancio",
  verde: "Verde",
  blu: "Blu",
  grigio: "Grigio",
  ardesia: "Ardesia",
}

/* ─────────────────────────── I tipi ─────────────────────────── */

/**
 * **Un calendario**, cioè il raggruppamento a cui un evento appartiene: ha un
 * nome, un colore e — quando il calendario *è* una persona — un'immagine.
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
  /** «Francesco Sartori», oppure «Manutenzione», oppure «Linea B». */
  nome: string
  colore: ColoreEvento
  /** L'immagine, quando il calendario è una persona. Senza, le iniziali. */
  immagine?: string
  /** Le iniziali del ripiego. Senza, si ricavano dal nome. */
  iniziali?: string
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
   * `calendari`. Da lì vengono il **colore** del chip e l'**avatar**.
   */
  calendarioId?: string
  /**
   * Il colore, per un evento che non appartiene a nessun calendario. Con
   * `calendarioId` valorizzato vince il calendario: un evento colorato
   * diversamente dal proprio calendario direbbe il falso.
   */
  colore?: ColoreEvento
}

export type VistaCalendario = "mese" | "agenda"

function iniziali(a: CalendarioSorgente): string {
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
function creaChip<TData>(perId: Map<string, CalendarioSorgente>) {
  return function chipCalendario({
    occurrence,
    view,
  }: EventCalendarRenderEventProps<TData>) {
    const evento = occurrence.event as unknown as CalendarEvent<TData>
    const cal = evento.resourceId ? perId.get(evento.resourceId) : undefined
    // L'agenda ha una riga sua, con l'ora in colonna a parte: lì il chip di
    // serie va bene, e sostituirlo toglierebbe l'allineamento.
    if (view === "agenda" && !cal) return undefined
    return (
      <span className="text-foreground flex w-full min-w-0 items-center gap-1.5">
        {cal ? (
          <Avatar className="size-5 shrink-0">
            {cal.immagine ? (
              <AvatarImage src={cal.immagine} alt={cal.nome} />
            ) : null}
            <AvatarFallback className="bg-(--ec-event-color)/20 text-foreground text-xs leading-none font-semibold tracking-tight">
              {iniziali(cal)}
            </AvatarFallback>
          </Avatar>
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

/* ─────────────────────────── La testata ─────────────────────────── */

/**
 * La testata: titolo del periodo, «‹ Oggi ›» e il commutatore mese/agenda.
 * Sta dentro `<EventCalendar>` perché legge la navigazione dallo store.
 *
 * **Non è `event-calendar-nav`**, e la scelta è a verbale in
 * `docs/DECISIONI.md` §44: la loro sono 648 righe con un commutatore a sei
 * viste e noi ne spediamo due, e Officina la testata la compone già così.
 */
function CalendarioTestata({
  vista,
  onVista,
  onNuovo,
  azioni,
}: {
  vista: VistaCalendario
  onVista?: (vista: VistaCalendario) => void
  onNuovo?: () => void
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
  aperto,
  setAperto,
  onSalva,
  onElimina,
}: {
  bozza: BozzaEvento | null
  setBozza: (b: BozzaEvento) => void
  calendari: CalendarioSorgente[]
  aperto: boolean
  setAperto: (v: boolean) => void
  onSalva: () => void
  onElimina: () => void
}) {
  const modifica = bozza?.id != null
  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      {bozza ? (
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {modifica ? "Modifica evento" : "Nuovo evento"}
            </DialogTitle>
            <DialogDescription className="first-letter:uppercase">
              {format(bozza.giorno, "EEEE d MMMM yyyy", { locale: it })}
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
              **Il campo è «Calendario», non «Colore»** — rilievo di Francesco,
              ed è il modello giusto: non si sceglie una tinta, si sceglie *a
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
                  <SelectContent>
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
                    <SelectContent>
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
                    <SelectContent>
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
              // il colore dei **fondi** e come testo dà 3.52:1 (CLAUDE.md,
              // §Le due trappole). La demo di ReUI usa proprio la classe
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
  /** Quanti giorni mostra l'agenda. @default 7 */
  giorniAgenda?: number
  /** Quante barre per cella prima del «+N altri». @default "auto" */
  maxEventiPerCella?: number | "auto"
  /** La testata con «‹ Oggi ›» e il commutatore. @default true */
  testata?: boolean
  /** Nodi in fondo alla testata, prima di «Nuovo» (filtri, una legenda). */
  azioni?: React.ReactNode
  /** Fuso orario di visualizzazione. @default quello del browser */
  fusoOrario?: string
  /**
   * I calendari a cui gli eventi possono appartenere: da qui vengono il
   * **colore** del chip e l'**avatar**. Nel caso di Officina un calendario è
   * una persona, e il colore dice a chi il fermo è affidato.
   */
  calendari?: CalendarioSorgente[]
  /** Il colore di un evento senza calendario e senza colore. @default "arancio" */
  coloreDefault?: ColoreEvento
  className?: string
}

const VISTA_MOTORE = { mese: "month", agenda: "agenda" } as const

/** Un array letterale come default sarebbe nuovo a ogni render. */
const VUOTI: CalendarioSorgente[] = []

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
  giorniAgenda = 7,
  maxEventiPerCella = "auto",
  testata = true,
  azioni,
  fusoOrario,
  calendari = VUOTI,
  coloreDefault = "arancio",
  className,
}: CalendarioProps<TData>) {
  const [vistaInterna, setVistaInterna] =
    React.useState<VistaCalendario>(vistaIniziale)
  const vistaCorrente = vista ?? vistaInterna
  const apiRef = React.useRef<EventCalendarApi<TData> | null>(null)
  const progressivo = React.useRef(0)
  const [dialogoAperto, setDialogoAperto] = React.useState(false)
  const [bozza, setBozza] = React.useState<BozzaEvento | null>(null)

  const cambiaVista = React.useCallback(
    (scelta: VistaCalendario) => {
      if (vista === undefined) setVistaInterna(scelta)
      onVistaChange?.(scelta)
    },
    [vista, onVistaChange]
  )

  const perId = React.useMemo(
    () => new Map(calendari.map((c) => [c.id, c])),
    [calendari]
  )
  // `renderEvent` legge la mappa: si rifà solo quando i calendari cambiano,
  // o ogni render rimonterebbe tutti i chip.
  const chip = React.useMemo(() => creaChip<TData>(perId), [perId])

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
        const { color: _token, resourceId, ...resto } =
          e as CalendarEvent<TData> & { color?: string }
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
      })
      setDialogoAperto(true)
    },
    [coloreDefault, calendari]
  )

  const apriModifica = React.useCallback(
    (occorrenza: EventCalendarOccurrence<TData>) => {
      const e = occorrenza.event as unknown as EventoCalendario<TData>
      setBozza({
        id: e.id,
        titolo: e.title,
        giorno: startOfDay(e.start),
        oraInizio: e.start.getHours(),
        durata: Math.max(30, differenceInMinutes(e.end, e.start)),
        tuttoIlGiorno: e.allDay ?? false,
        colore: e.colore ?? coloreDefault,
        calendarioId: e.calendarioId ?? calendari[0]?.id,
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
        className={cn("min-h-0 flex-1", className)}
        apiRef={apiRef}
        events={eventiMotore}
        onEventsChange={
          onEventiChange
            ? (lista) => onEventiChange(verso(lista))
            : undefined
        }
        view={VISTA_MOTORE[vistaCorrente]}
        views={["month", "agenda"]}
        date={data}
        defaultDate={dataIniziale}
        onDateChange={onDataChange}
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
        agendaDayCount={giorniAgenda}
        i18n={ETICHETTE_IT}
        // L'appiglio da tastiera per creare. La cella del mese è un `div` con
        // `role="gridcell"` e **non prende il fuoco** (misurato in Chromium
        // vero: 42 celle, 0 con `tabindex`), quindi senza questo bottone
        // l'azione sarebbe raggiungibile solo col mouse. Si accende insieme
        // all'azione, e con l'azione spenta resta spento.
        showDayAddButton={modifica || onGiornoClick !== undefined}
        maxEventsPerCell={maxEventiPerCella}
        resources={calendari.map((c) => ({ id: c.id, title: c.nome }))}
        renderEvent={chip}
        classNames={{
          // **Il «+N altri» non si lascia schiacciare.** Il motore lo mette
          // come figlio flessibile della colonna degli eventi, senza altezza
          // minima: in una cella piena si riduce a quel che avanza — misurato
          // **4,78px** in densità touch. `shrink-0` gli ridà almeno la propria
          // riga di testo.
          moreIndicator: "shrink-0",
          // **Tre eventi per cella, non uno.** La riga del mese è `min-h-0`,
          // quindi in un contenitore corto le celle si schiacciano e
          // `maxEventsPerCell: "auto"` ne mostra una sola. Il conto che dà
          // il 30: tre corsie da `--ec-month-bar-h` (1,75rem = 28px) fanno
          // 84, più 6 di `pt-1.5` in cima e 26 di numero del giorno in
          // fondo = **116px**, cioè 30 unità di spaziatura arrotondando in
          // su. Siccome deriva da `--spacing` cresce da sé in touch (120px
          // in normale, 180 in touch). Meno di così non si può: sotto i 28px
          // la corsia non è più un bersaglio.
          monthRow: "min-h-30",
          // **E il mese scorre quando non ci sta**, invece di tagliare.
          // Sei righe da 120px sono 720px, che su uno schermo con un guscio
          // sopra non ci stanno quasi mai; `month-view` ha `overflow-hidden`,
          // quindi senza queste due righe l'ultima settimana **spariva senza
          // scrollbar** — il modo peggiore di non starci.
          //
          // Lo scorrimento però **non** sta qui: sta sul nostro contenitore,
          // che è un `div` nostro e può prendere `tabIndex`. Una regione
          // scorrevole senza contenuto focalizzabile dentro è
          // `scrollable-region-focusable`, *critical* — e con un mese vuoto è
          // esattamente il caso: nessun chip, niente da mettere a fuoco.
          // Provato prima su `monthBody` via `classNames`, e il gate l'ha
          // preso sulla scena `Vuoto`.
          // `overflow-visible` perche' lo scorrimento sta sul contenitore.
          // `border-t-0` perche' il bordo in cima ce l'ha gia' il
          // contenitore: due tratti a 1px di distanza si leggono come un
          // **doppio bordo**, ed e' il primo rilievo che si vede a video.
          monthView: "overflow-visible border-t-0",
          // L'intestazione dei giorni resta ferma mentre le settimane
          // scorrono sotto. `bg-card` perché una riga trasparente lascerebbe
          // vedere le celle passarci dietro.
          monthHeader: "bg-card sticky top-0 z-20",
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
          data-slot="calendario-contenuto"
          data-vista={vistaCorrente}
          // `tabIndex` solo in vista mese, che è la sola che scorre qui
          // dentro: l'agenda ha già il proprio `ScrollArea`, e un contenitore
          // che non scorre non deve essere un fermo di tabulazione in più.
          tabIndex={vistaCorrente === "mese" ? 0 : undefined}
          className={cn(
            "bg-card focus-visible:ring-ring relative flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border outline-none focus-visible:ring-2",
            vistaCorrente === "mese" ? "overflow-y-auto" : "overflow-hidden"
          )}
        >
          {vistaCorrente === "mese" ? (
            <EventCalendarMonthView />
          ) : (
            <EventCalendarAgendaView />
          )}
        </div>
      </EventCalendar>
      {modifica ? (
        <CalendarioDialogoEvento
          bozza={bozza}
          setBozza={setBozza}
          calendari={calendari}
          aperto={dialogoAperto}
          setAperto={setDialogoAperto}
          onSalva={salva}
          onElimina={elimina}
        />
      ) : null}
    </>
  )
}
