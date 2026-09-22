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
 * Una griglia di giorni da cui si sceglie una data, o un intervallo fra due
 * date.
 *
 * **Quando sì, quando no.** Dentro un modulo, per scegliere una data si usa il
 * *date picker*: una composizione di `popover`, `button` e `calendar`, non un
 * componente a sé — le scene qui sotto sono il modello da copiare. Quando la
 * data si conosce già e si batte a mano, la forma migliore è il campo da
 * scrivere, con il calendario come seconda strada (`DatePickerDaScrivere`). Il
 * calendario sempre aperto in pagina serve solo dove la data è il contenuto
 * principale. Per un calendario di eventi, con mese, settimana e agenda, c'è
 * il blocco `Calendario`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/calendar
 * ```
 *
 * **Opzioni.** `mode`: `single` per una data, `range` per un intervallo.
 * `numberOfMonths` affianca più mesi. `captionLayout="dropdown"` mette mese e
 * anno in due menu, con `startMonth` ed `endMonth` a limitare gli anni
 * offerti. `disabled` toglie dei giorni dalla scelta; `modifiers` e
 * `modifiersClassNames` li segnano senza toglierli.
 *
 * **Regole d'uso.**
 *
 * - Ogni `Calendar` prende `locale={it}`, da `react-day-picker/locale`: porta
 *   i nomi italiani e la settimana che comincia di lunedì. `weekStartsOn` non
 *   serve.
 * - Per un intervallo si affiancano due mesi: inizio e fine cadono spesso in
 *   mesi diversi.
 * - Una data scritta a mano si legge con
 *   `parse(valore, 'dd/MM/yyyy', …, { locale: it })` di `date-fns`, mai con
 *   `new Date(stringa)`, che la legge all'americana e scambia giorno e mese.
 *   Il segnaposto dice `gg/mm/aaaa`.
 * - Nel date picker il `PopoverContent` ha un `aria-label`, perché contiene
 *   solo la griglia e non un titolo; l'`id` va sul bottone reso da `render`,
 *   collegato all'etichetta con `htmlFor`.
 * - Il riquadro di una data sola si chiude alla scelta, chiudendolo in
 *   `onSelect`; quello di un intervallo non si chiude da sé — il primo clic
 *   arriva già come intervallo di un giorno — e si chiude con `Esc` o col clic
 *   fuori.
 * - Un giorno segnato da `modifiers` non si distingue solo per colore: qui
 *   anche per il peso, `font-semibold`. L'arancio del testo è
 *   `text-accent-ink`, mai `text-primary`. Il giorno segnato resta cliccabile.
 * - Un giorno disabilitato è volutamente sbiadito: la soglia di contrasto non
 *   si applica ai controlli inattivi.
 *
 * **Tastiera.** Il `Tab` passa per il mese precedente, il mese successivo e un
 * solo giorno della griglia, quello selezionato o di oggi; `Invio` lo sceglie.
 * **Le frecce non spostano il fuoco fra i giorni**: con la tastiera si
 * raggiunge solo quel giorno. Per chi lavora da tastiera la data si scrive nel
 * campo. Nel date picker, `Invio` sul bottone apre il riquadro, `Esc` lo
 * chiude e il fuoco torna sul bottone; il riquadro non è modale, e un `Tab`
 * oltre l'ultimo controllo ne esce.
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
 * Italiano e lunedì in prima colonna: li porta `locale={it}`, senza altre
 * opzioni.
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
 * Lo stesso mese senza `locale` e con `locale={it}`, affiancati. Senza, le
 * intestazioni sono in inglese e la domenica sta in prima colonna: è l'errore
 * che non si nota, perché chi legge conta le colonne senza guardarle.
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
 * Un intervallo su due mesi affiancati, con `mode="range"`: si clicca
 * l'inizio, poi la fine.
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
 * Mese e anno in due menu (`captionLayout="dropdown"`), per saltare indietro
 * di anni senza scorrere mese per mese. `startMonth` ed `endMonth` limitano
 * gli anni offerti, qui dal 2015 al 2030.
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
 * Il date picker: un bottone che mostra la data in italiano, o un segnaposto,
 * e apre il calendario in un `popover`. Scelta la data, il riquadro si chiude.
 *
 * Se il riquadro si apre a destra del campo invece che sotto, è perché sotto
 * non c'è spazio: il `popover` si sposta per restare sullo schermo, come ogni
 * popup del sistema.
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
 * Il date picker a intervallo. Il riquadro non si chiude da sé: si chiude con
 * `Esc` o cliccando fuori, dopo aver scelto i due estremi.
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
 * La data si scrive nel formato `gg/mm/aaaa`, e il calendario è la seconda
 * strada: `↓` nel campo lo apre. È la forma più veloce per chi la data la sa,
 * e la più comoda da tastiera.
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
 * Il passato è disabilitato con `disabled` e non si sceglie; le scadenze già
 * fissate sono segnate con `modifiers` — colore e peso insieme — e restano
 * cliccabili.
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
 * Dentro una `Card`: il calendario toglie il proprio fondo e si posa su quello
 * della card. Fa lo stesso dentro un `popover`.
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
