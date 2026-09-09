import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { addDays, format, isValid, parse } from 'date-fns'
import { it } from 'react-day-picker/locale'
import type { DateRange } from 'react-day-picker'
import { CalendarIcon } from 'lucide-react'

import { Button } from '@/registry/tassullo/ui/button'
import { Calendar } from '@/registry/tassullo/ui/calendar'
import { Card, CardContent } from '@/registry/tassullo/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/registry/tassullo/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/registry/tassullo/ui/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/tassullo/ui/popover'

/**
 * **Il calendario di shadcn non è Base UI, e non è un'eccezione: è l'unica
 * implementazione che esiste.** Vale la pena dirlo subito perché il piano
 * prevedeva qui una decisione — D9 lasciava aperta la possibilità di passare a
 * React Aria (`@internationalized/date`) «se il calendario Base UI risultasse
 * debole su locale e intervalli». La decisione **non si pone**: Base UI non ha
 * un calendario, e shadcn ne spedisce uno solo, costruito su
 * **`react-day-picker` + `date-fns`**. Non c'è un secondo candidato da
 * valutare, quindi non c'è nessuna eccezione da motivare.
 *
 * E il componente unico copre da sé tutt'e tre i criteri della sessione, senza
 * che si scriva una riga: italiano, settimana da lunedì, intervalli.
 *
 * ## Il locale porta il lunedì con sé
 *
 * Si passa `locale={it}` — importato da `react-day-picker/locale`, che
 * ri-esporta i locale di `date-fns` — e **basta quello**. Il lunedì non si
 * chiede: `it.options.weekStartsOn` vale già `1`, misurato. Scrivere anche
 * `weekStartsOn={1}` sarebbe ripetere in italiano una cosa che l'italiano dice
 * già, e la ripetizione è il punto in cui più avanti una delle due si dimentica.
 *
 * La riga da conoscere è quindi una: **`locale={it}` su ogni `Calendar`.** Non
 * è un valore predefinito del componente, e non lo abbiamo reso tale: sarebbe
 * stata una divergenza di forma dal preset (regola 4bis) per risparmiare nove
 * caratteri.
 *
 * ## `date-picker` non è un componente, ed è giusto così
 *
 * Il piano elencava due voci, `calendar` e `date-picker`. La seconda **ha una
 * sua pagina** nella documentazione shadcn, fra i componenti
 * (`/docs/components/base/date-picker`), ma **non è un item installabile**:
 * `view` e `add @shadcn/date-picker` danno 404 su `base-nova`, e
 * `shadcn docs date-picker` risponde «not found in the shadcn registry».
 *
 * Lo dice shadcn stesso, in quella pagina, con la riga che chiude la
 * questione: **«A date picker is built from Popover and Calendar (there is no
 * DatePicker root component)»**. È una *composizione* documentata, non un
 * componente.
 *
 * Avremmo potuto impacchettarla in un componente nostro. Non si è fatto, ed è
 * la stessa scelta di M2.6 sul «Grilletto» del combobox — disfatto per la
 * stessa ragione, e per indirizzo esplicito: **componenti shadcn standard,
 * senza personalizzazioni.** Un `DatePicker` nostro sarebbe il primo componente
 * in `componenti-propri.json`, cioè un file da mantenere per sempre, in cambio
 * di dodici righe che ogni app scriverebbe comunque una volta sola. Le tre
 * composizioni qui sotto — bottone, intervallo, campo da scrivere — sono il
 * modello da copiare, e sono verbale: si guarda la story, si copia il JSX.
 *
 * ## L'unico ri-stile, che è la quarta volta della stessa correzione
 *
 * `text-[0.8rem]` → `text-sm` sui nomi dei giorni e sui numeri di settimana.
 * Un valore arbitrario **non segue la densità**: in touch le celle crescono e
 * il testo resta fermo. È la stessa correzione presa su `button` (M2.1),
 * `select` (M2.2) e `toggle`/`toggle-group` (M2.6) — gradino 2 della scala,
 * solo stringhe di classi, `check:registry` resta verde.
 *
 * Il resto del preset la densità la segue già da sé, ed è la cosa fatta bene:
 * la cella è `--cell-size: --spacing(7)`, cioè **28px in normale e 42px in
 * touch**, perché deriva da `--spacing` invece di essere scritta in pixel.
 *
 * ## Il difetto grosso, che è di shadcn e non nostro: **le frecce non muovono**
 *
 * Provata la tastiera come impone il piano, e il calendario **non si naviga**.
 * Misurato in un browser vero, sul componente appena installato, senza
 * composizioni di mezzo:
 *
 * | | |
 * |---|---|
 * | giorni resi | **35** |
 * | giorni raggiungibili col `Tab` | **1** |
 * | tasti di navigazione che muovono il fuoco | **0 su 7** (`←` `→` `↑` `↓` `Home` `End` `PageDown`) |
 *
 * Il percorso di tabulazione è `mese precedente → mese successivo → il giorno
 * a fuoco → fuori`. La griglia ha un `tabindex` mobile — un solo giorno
 * tabbabile, ed è giusto così — ma le frecce, che dovrebbero spostarlo, non
 * spostano niente: **da tastiera si può scegliere una data sola**, quella già
 * selezionata. `PageDown` non viene nemmeno intercettato e scorre la pagina.
 *
 * **La causa è una riga mancante nel sorgente shadcn**, e sta nel nostro file
 * come nell'originale in `registry/.upstream/calendar.tsx` (verificato
 * identico). `CalendarDayButton` dichiara un ref e lo usa in un effetto —
 * `React.useEffect(() => { if (modifiers.focused) ref.current?.focus() },
 * [modifiers.focused])` — ma **il ref non è mai attaccato al `Button`**.
 * `ref.current` resta `null` per sempre, quindi `react-day-picker` sposta il
 * proprio giorno «a fuoco» e il fuoco del DOM non lo segue.
 *
 * Provata la correzione — **un solo attributo, `ref={ref}` sul `Button`** — e
 * misurata: tutti e sette i tasti tornano a muovere (`→` porta a giovedì 10,
 * `↓` a mercoledì 16, `Home` a lunedì 7, `End` a domenica 13, `PageDown` al
 * 13 ottobre). **Scartata**, ed è **D15, chiusa il 2026-09-09** con la stessa
 * motivazione di D14: si spedisce il preset intatto, e le personalizzazioni
 * le chiederanno le app, discusse e autorizzate prima. Scartate anche la
 * segnalazione a monte (tempi non nostri) e il rimedio in composizione — un
 * `components={{ DayButton }}` per ogni app sono trenta righe copiate, la
 * strada già disfatta sul «Grilletto» in M2.6.
 *
 * **In carico a M2.9**, insieme ai guardiani del fuoco. Da sapere prima di
 * riaprirla: il difetto si nota col mouse solo se si prova la tastiera, e
 * **axe non lo vede** — è il residuo manuale del gate a doverlo tenere a
 * registro, non la CI.
 *
 * ## E il gate non se ne accorgerebbe — nota che vale oltre il calendario
 *
 * Provato anche questo: con `ref={ref}` applicato, **`npm run check:registry`
 * resta verde**. Non è un guasto del gate, è la sua regola nota: l'originale
 * shadcn del calendario è un template a segnaposto d'icona (`◌`), e sui file
 * `◌` il confronto di forma **è saltato per costruzione**. Conseguenza da
 * sapere: sui file marcati `◌` una divergenza strutturale passa in silenzio,
 * e l'unico controllo è la rilettura a mano alla prossima versione di shadcn.
 *
 * ## Contrasto: **zero violazioni**, e le 14 *incomplete* misurate a mano
 *
 * axe dà 14 *incomplete* di `color-contrast` sulle story del calendario, tutte
 * col solito «il fondo non si può determinare perché sovrapposto». Misurate
 * sui colori risolti dal motore di resa (canvas 1×1, come impone la nota di
 * M2.1 sugli `oklch`), chiaro e scuro:
 *
 * | | chiaro | scuro |
 * |---|---|---|
 * | nome del giorno, giorno normale, fuori mese | 5.05 | 7.75 |
 * | mese e anno | 17.03 | 15.72 |
 * | giorno scelto (sull'arancio) | 9.49 | 9.49 |
 * | estremo dell'intervallo | 9.49 | 9.49 |
 * | dentro l'intervallo | 15.35 | 12.91 |
 * | scadenza marcata (`accent-ink`) | **4.77** | 9.49 |
 *
 * Minimo vero **4.77:1**, sopra soglia: tutte e 14 sono false.
 *
 * **Un'eccezione da dire, non da nascondere: il giorno disabilitato.** Il
 * preset lo fa con `opacity-50`, e l'opacità cambia il colore in composizione
 * senza che nessun token la dichiari — è la **terza volta** che sfugge a
 * `check:contrast` (M2.5 sull'etichetta della sidebar, M2.2 sul testo
 * d'errore). Composto: **2.00:1 in chiaro e 2.84:1 in scuro**. Resta com'è, e
 * non è una svista: la WCAG 1.4.3 esenta esplicitamente i controlli inattivi,
 * e un giorno disabilitato che si legge come uno attivo sarebbe il difetto
 * opposto. Scritto qui perché la prossima misura non lo riscopra come nuovo.
 *
 * ## Note per M2.9
 *
 * 1. **Il bersaglio touch.** La cella è 42px, **sotto i 44**: il secondo
 *    bersaglio più piccolo del set dopo la voce del riquadro combobox (31px).
 *    Non si chiude qui ri-stilando — `--spacing(8)` darebbe 48px in touch ma
 *    32 in normale, cioè un calendario più largo su ogni pagina desktop per un
 *    requisito che vale solo sul telefono. Va deciso con gli altri bersagli.
 * 2. **axe non vede il difetto della tastiera.** Zero violazioni su queste
 *    story, con la navigazione rotta: è il promemoria che il residuo manuale
 *    del gate — «navigazione da tastiera reale su ogni componente» — non è una
 *    formalità accanto ad axe, ed è l'unica cosa che qui ha trovato qualcosa.
 */
const meta = {
  title: 'Primitive/Calendar',
  component: Calendar,
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

/** Un mese fisso, così le immagini di riferimento non cambiano col calendario vero. */
const mese = new Date(2026, 8, 1)

/**
 * **Il criterio di accettazione, per metà: italiano e lunedì.** Le intestazioni
 * dicono `lun mar mer gio ven sab dom` e la prima colonna è il lunedì. Nessuna
 * delle due cose è stata chiesta al componente: le porta `locale={it}`.
 */
export const Predefinito: Story = {
  render: function Predefinito() {
    const [data, setData] = React.useState<Date | undefined>(new Date(2026, 8, 9))
    return (
      <Calendar
        mode="single"
        locale={it}
        defaultMonth={mese}
        selected={data}
        onSelect={setData}
      />
    )
  },
}

/**
 * **La prova che il locale sta facendo qualcosa**, affiancata. A sinistra il
 * componente senza `locale`: intestazioni inglesi e **domenica in prima
 * colonna**, che è il difetto vero — l'inglese si nota, la colonna spostata no,
 * e chi legge una data conta le colonne senza guardarle.
 *
 * A destra lo stesso componente con `locale={it}`. È la story da riaprire
 * quando qualcuno chiederà «serve anche `weekStartsOn`?»: no, e si vede.
 */
export const LocaleAConfronto: Story = {
  name: 'Il locale, a confronto',
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Senza locale — domenica in testa
        </p>
        <Card className="w-fit p-0">
          <CardContent className="p-0">
            <Calendar mode="single" defaultMonth={mese} />
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-accent-ink">
          Con <code>locale=&#123;it&#125;</code> — lunedì in testa
        </p>
        <Card className="w-fit p-0">
          <CardContent className="p-0">
            <Calendar mode="single" locale={it} defaultMonth={mese} />
          </CardContent>
        </Card>
      </div>
    </div>
  ),
}

/**
 * **L'altra metà del criterio: gli intervalli.** `mode="range"` e due mesi
 * affiancati, che è la forma giusta per una scadenza ETA — l'inizio e la fine
 * cadono quasi sempre in mesi diversi, e con un mese solo si sceglie la prima
 * data, si cambia mese, e si è perso di vista da dove si era partiti.
 *
 * Il trascinamento non serve: si clicca l'inizio, si clicca la fine. Da
 * tastiera le frecce spostano il giorno, `Invio` fissa l'estremo.
 */
export const Intervallo: Story = {
  render: function Intervallo() {
    const [intervallo, setIntervallo] = React.useState<DateRange | undefined>({
      from: new Date(2026, 8, 14),
      to: addDays(new Date(2026, 8, 14), 24),
    })
    return (
      <Calendar
        mode="range"
        locale={it}
        defaultMonth={intervallo?.from}
        selected={intervallo}
        onSelect={setIntervallo}
        numberOfMonths={2}
      />
    )
  },
}

/**
 * **Le date di revisione stanno indietro di anni**, e a frecciate non ci si
 * arriva: `captionLayout="dropdown"` mette mese e anno a menù, così si salta.
 * Con `startMonth`/`endMonth` si limita l'intervallo degli anni offerti —
 * qui dal 2015 al 2030 — o il menù degli anni parte dal 1900.
 */
export const ConMenuMeseEAnno: Story = {
  name: 'Con menù di mese e anno',
  render: function ConMenu() {
    const [data, setData] = React.useState<Date | undefined>(new Date(2019, 3, 18))
    return (
      <Calendar
        mode="single"
        locale={it}
        captionLayout="dropdown"
        startMonth={new Date(2015, 0)}
        endMonth={new Date(2030, 11)}
        defaultMonth={data}
        selected={data}
        onSelect={setData}
      />
    )
  },
}

/**
 * **Il date-picker: la composizione, non un componente.** Popover + Button +
 * Calendar. Il bottone porta la data formattata in italiano (`format(…, 'PPP',
 * { locale: it })` → `9 settembre 2026`) e un segnaposto quando non c'è scelta.
 *
 * Due dettagli che si sbagliano una volta sola:
 *
 * 1. **`id` sul bottone e `htmlFor` sull'etichetta.** Il grilletto del popover
 *    è il bottone: senza `id` l'etichetta non etichetta niente, e axe dà
 *    `label`. Si mette sul `Button` reso da `render`, non sul `PopoverTrigger`.
 * 2. **Il riquadro si chiude da sé alla scelta** solo se glielo si dice:
 *    `open` controllato e `setOpen(false)` dentro `onSelect`. Lasciato aperto
 *    dopo la scelta sembra rotto.
 * 3. **`aria-label` sul `PopoverContent`.** Il riquadro è un `role="dialog"`,
 *    e un dialogo senza nome è una violazione axe *serious* — `aria-dialog-name`,
 *    misurata qui, 4 volte su 2 story × 2 modalità. Non è un difetto del
 *    `popover`: un popover che contiene un titolo il nome ce l'ha, questo no
 *    perché contiene solo la griglia. Si chiude in composizione, con
 *    l'attributo, senza toccare nessun componente.
 *
 * ### Se il riquadro si apre **a destra del campo**, non è rotto
 *
 * È l'anti-collisione del `popover`, e conviene saperlo perché sembra un
 * difetto. Il riquadro è alto **257px**: finché sotto il campo ce n'è almeno
 * altrettanto si apre sotto, allineato a sinistra (`side=bottom align=start`).
 * Quando non ci sta né sotto né sopra — il caso tipico è il canvas di
 * Storybook col pannello degli addon aperto — Base UI ripiega sull'asse
 * perpendicolare e lo mette **a destra**. Misurato: `bottom` a 1440×640 (305px
 * sotto), `right` a 1440×560 (265px sotto).
 *
 * Non è stato vincolato: è il comportamento di ogni popup del set, `select` e
 * `dropdown-menu` compresi, e in una pagina vera — campo in cima a un form —
 * si apre sotto. Volendolo tenere sull'asse verticale c'è `collisionAvoidance`
 * di Base UI, che sta **in composizione** e non nel componente; il prezzo è
 * che quando davvero non ci sta il riquadro esce dallo schermo invece di
 * spostarsi.
 *
 * Da tastiera, misurato: `Tab` sul bottone, `Invio` apre. Il fuoco entra sul
 * **mese precedente**, non sul giorno: servono altri **due `Tab`** per
 * arrivare alla griglia. `Invio` sceglie, il riquadro si chiude e il fuoco
 * torna al grilletto; `Esc` chiude senza scegliere e il fuoco torna comunque.
 * Il popover **non intrappola il fuoco** — un terzo `Tab` esce dalla pagina —
 * ed è voluto, come già accertato in M2.3: non è un modale.
 */
export const DatePicker: Story = {
  name: 'Date picker (composizione)',
  render: function DatePicker() {
    const [data, setData] = React.useState<Date | undefined>()
    const [aperto, setAperto] = React.useState(false)
    return (
      <Field className="w-72">
        <FieldLabel htmlFor="dp-revisione">Data di revisione</FieldLabel>
        <Popover open={aperto} onOpenChange={setAperto}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                id="dp-revisione"
                className="justify-start font-normal"
              />
            }
          >
            <CalendarIcon data-icon="inline-start" />
            {data ? (
              format(data, 'PPP', { locale: it })
            ) : (
              <span className="text-muted-foreground">Scegli una data</span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" aria-label="Calendario">
            <Calendar
              mode="single"
              locale={it}
              selected={data}
              onSelect={(scelta) => {
                setData(scelta)
                setAperto(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <FieldDescription>L'ultima revisione approvata della scheda.</FieldDescription>
      </Field>
    )
  },
}

/**
 * **Lo stesso, a intervallo: è la scadenza ETA.** E qui c'è una differenza che
 * si scopre solo provandola, quindi vale la pena averla scritta.
 *
 * La regola della composizione di sopra — «chiudi il riquadro appena `onSelect`
 * dà una data» — **qui non si può applicare**, e nemmeno nella forma che sembra
 * ovvia («chiudi quando arrivano sia `from` sia `to`»). Misurato: al **primo**
 * clic `react-day-picker` chiama `onSelect` con `{ from: X, to: X }`, non con
 * `to` vuoto. Chiudere su `from && to` chiude quindi dopo un clic solo, con un
 * intervallo di un giorno che nessuno ha chiesto — è successo, e il campo
 * diceva `6 set 2026 — 6 set 2026`.
 *
 * La risposta è quella di shadcn, ed è di non fare niente: **il riquadro
 * dell'intervallo non si chiude da sé.** Si chiude con `Esc` o cliccando
 * fuori, che è il comportamento del `popover` e non va insegnato. Confrontare
 * i due estremi per decidere se chiudere sarebbe stato scrivere una regola
 * nostra sopra un componente standard, per giunta sbagliata al primo caso
 * limite (un intervallo di un giorno solo è legittimo).
 */
export const DatePickerIntervallo: Story = {
  name: 'Date picker a intervallo',
  render: function DatePickerIntervallo() {
    const [intervallo, setIntervallo] = React.useState<DateRange | undefined>()
    return (
      <Field className="w-80">
        <FieldLabel htmlFor="dp-eta">Finestra di consegna</FieldLabel>
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" id="dp-eta" className="justify-start font-normal" />
            }
          >
            <CalendarIcon data-icon="inline-start" />
            {intervallo?.from ? (
              intervallo.to ? (
                <>
                  {format(intervallo.from, 'd MMM yyyy', { locale: it })} —{' '}
                  {format(intervallo.to, 'd MMM yyyy', { locale: it })}
                </>
              ) : (
                format(intervallo.from, 'd MMM yyyy', { locale: it })
              )
            ) : (
              <span className="text-muted-foreground">Scegli un intervallo</span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" aria-label="Calendario">
            <Calendar
              mode="range"
              locale={it}
              defaultMonth={intervallo?.from ?? mese}
              selected={intervallo}
              onSelect={setIntervallo}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <FieldDescription>ETA di partenza e di arrivo previsto.</FieldDescription>
      </Field>
    )
  },
}

/**
 * **La data si scrive, e il calendario è solo la seconda strada.** È la variante
 * `Input` della pagina shadcn, e per Anagrafe è probabilmente la forma da usare
 * di default: chi carica schede a giornata la data la **batte**, e aprire un
 * riquadro per cliccare un numero è più lento di scrivere sei cifre.
 *
 * È anche il rimedio pratico a **D15** — il calendario che da tastiera non si
 * naviga — senza divergere da niente: qui la tastiera basta e avanza, il
 * riquadro non serve aprirlo. `↓` nel campo lo apre per chi lo vuole.
 *
 * **Una differenza dall'esempio shadcn, ed è obbligata.** Loro fanno
 * `new Date(e.target.value)` sulla stringa scritta. In italiano non si può:
 * `new Date('09/09/2026')` la legge **all'americana**, mese prima del giorno,
 * quindi `03/09/2026` diventerebbe 9 marzo invece del 3 settembre — un errore
 * che non dà errore, e che su una data di revisione non si scopre mai. Si usa
 * `parse(valore, 'dd/MM/yyyy', ..., { locale: it })`, che il formato lo sa.
 * Il segnaposto dice `gg/mm/aaaa`, così il formato atteso è scritto.
 */
export const DatePickerDaScrivere: Story = {
  name: 'Date picker con campo da scrivere',
  render: function DatePickerDaScrivere() {
    const formatta = (d: Date | undefined) =>
      d ? format(d, 'dd/MM/yyyy', { locale: it }) : ''
    const [data, setData] = React.useState<Date | undefined>(new Date(2026, 8, 9))
    const [meseVisto, setMeseVisto] = React.useState<Date | undefined>(data)
    const [testo, setTesto] = React.useState(formatta(data))
    const [aperto, setAperto] = React.useState(false)
    return (
      <Field className="w-64">
        <FieldLabel htmlFor="dp-scritta">Data di revisione</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="dp-scritta"
            value={testo}
            placeholder="gg/mm/aaaa"
            onChange={(e) => {
              setTesto(e.target.value)
              const letta = parse(e.target.value, 'dd/MM/yyyy', new Date(), { locale: it })
              if (isValid(letta)) {
                setData(letta)
                setMeseVisto(letta)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setAperto(true)
              }
            }}
          />
          <InputGroupAddon align="inline-end">
            <Popover open={aperto} onOpenChange={setAperto}>
              <PopoverTrigger
                render={
                  <InputGroupButton variant="ghost" size="icon-xs" aria-label="Apri il calendario" />
                }
              >
                <CalendarIcon />
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="end"
                aria-label="Calendario"
              >
                <Calendar
                  mode="single"
                  locale={it}
                  selected={data}
                  month={meseVisto}
                  onMonthChange={setMeseVisto}
                  onSelect={(scelta) => {
                    setData(scelta)
                    setTesto(formatta(scelta))
                    setAperto(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>Si scrive nel formato gg/mm/aaaa. Il tasto ↓ apre il calendario.</FieldDescription>
      </Field>
    )
  },
}

/**
 * **I giorni che non si possono scegliere, e quelli da far notare.** Due cose
 * diverse che si confondono: `disabled` toglie il giorno dalla scelta,
 * `modifiers` lo **colora senza toglierlo**.
 *
 * Qui il passato è disabilitato — una consegna non si programma indietro — e le
 * scadenze già fissate sono marcate col token del brand. Il colore non è
 * l'unico segnale: le scadenze restano cliccabili e il giorno scelto ha
 * comunque il suo fondo pieno.
 */
export const GiorniDisabilitatiEMarcati: Story = {
  name: 'Giorni disabilitati e marcati',
  render: function GiorniMarcati() {
    const [data, setData] = React.useState<Date | undefined>(new Date(2026, 8, 22))
    const scadenze = [new Date(2026, 8, 11), new Date(2026, 8, 18), new Date(2026, 8, 25)]
    return (
      <Calendar
        mode="single"
        locale={it}
        defaultMonth={mese}
        selected={data}
        onSelect={setData}
        disabled={{ before: new Date(2026, 8, 9) }}
        modifiers={{ scadenza: scadenze }}
        modifiersClassNames={{
          scadenza: 'font-semibold text-accent-ink',
        }}
      />
    )
  },
}

/**
 * **Dentro una `Card`**, che è la forma in cui sta su una pagina invece che in
 * un riquadro. Il preset se ne accorge da sé — `in-data-[slot=card-content]:bg-transparent`
 * sulla radice — e toglie il proprio fondo per non fare un rettangolo dentro
 * il rettangolo. Vale lo stesso dentro un `PopoverContent`.
 */
export const InUnaCard: Story = {
  name: 'In una card',
  render: function InUnaCard() {
    const [data, setData] = React.useState<Date | undefined>(new Date(2026, 8, 9))
    return (
      <Card className="w-fit p-0">
        <CardContent className="p-0">
          <Calendar
            mode="single"
            locale={it}
            defaultMonth={mese}
            selected={data}
            onSelect={setData}
          />
        </CardContent>
      </Card>
    )
  },
}
