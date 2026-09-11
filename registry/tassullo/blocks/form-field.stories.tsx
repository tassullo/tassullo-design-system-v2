import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { FormField } from '@/registry/tassullo/blocks/form-field'
import { Button } from '@/registry/tassullo/ui/button'
import { Checkbox } from '@/registry/tassullo/ui/checkbox'
import {
  Field,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'
import { Switch } from '@/registry/tassullo/ui/switch'
import { Textarea } from '@/registry/tassullo/ui/textarea'

/**
 * La **riga di un modulo**: etichetta, campo, aiuto, errore — e i cinque
 * collegamenti fatti da sé.
 *
 * ```tsx
 * <FormField control={form.control} nome="codice" etichetta="Codice">
 *   {(campo) => <Input {...campo} autoComplete="off" />}
 * </FormField>
 * ```
 *
 * ## Non sostituisce `field`, lo compone
 *
 * La primitiva `field` di shadcn è installata e non si tocca: `Field`,
 * `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`. Chi
 * vuole comporre a mano continua a importare quella. Qui non c&apos;è niente
 * che la primitiva non sappia fare — c&apos;è solo ciò che la guida di shadcn
 * lascia intero a chi la segue.
 *
 * ## Cosa lascia intero, di preciso
 *
 * Nell&apos;esempio ufficiale (`docs/forms/react-hook-form`) ogni campo è
 * quindici righe, di cui dodici identiche al campo precedente. Dentro quelle
 * dodici stanno cinque cose che vanno scritte a mano e che, se si dimenticano,
 * **non danno errore**:
 *
 * 1. `data-invalid` sul `Field` — è ciò che tinge la riga;
 * 2. `aria-invalid` sul controllo — è ciò che lo dice a chi non la vede;
 * 3. `htmlFor` e `id` appaiati — è ciò che fa sì che il clic sull&apos;etichetta
 *    porti il fuoco nel campo;
 * 4. `<FieldError>` reso **solo** quando c&apos;è un errore;
 * 5. e la quinta, che l&apos;esempio di shadcn **non fa affatto**:
 *    `aria-describedby`. Una `<FieldDescription>` non collegata è testo che sta
 *    lì accanto e che un lettore di schermo non legge quando il fuoco entra nel
 *    campo — cioè esattamente nel momento in cui serviva. Qui descrizione ed
 *    errore hanno un `id` derivato da quello del campo, e il controllo li
 *    dichiara entrambi.
 *
 * ## La descrizione è l&apos;eccezione, non la regola
 *
 * `descrizione` c&apos;è, e quasi sempre **non si usa**. Una riga d&apos;aiuto
 * sotto ogni campo raddoppia l&apos;altezza del modulo e lo fa leggere come
 * documentazione invece che come una cosa da compilare: chi lo usa tutti i
 * giorni la salta dopo la seconda volta, e allora tanto vale che non ci sia. Un
 * campo che ha bisogno di essere spiegato ha quasi sempre **l&apos;etichetta
 * sbagliata**, e l&apos;etichetta costa zero pixel.
 *
 * Resta per il caso in cui c&apos;è un **vincolo che il campo non mostra da
 * sé** — il limite di 2048 caratteri che impone BC, un formato obbligato, una
 * conseguenza non reversibile. In questa vetrina ne è rimasta **una**, sulle
 * note tecniche, ed è quella.
 *
 * ## L&apos;`id` non è il nome del campo
 *
 * Due moduli nella stessa pagina — la scheda e il dialogo che la modifica —
 * avrebbero due `id="nome"`, e il secondo `htmlFor` punterebbe al primo campo.
 * Nel DOM è legale; nel browser il clic sull&apos;etichetta mette il fuoco nel
 * campo sbagliato, e non lo segnala nessuno. `useId()` dà un prefisso unico per
 * istanza. Il `name` resta il nome del **dato**, ed è di react-hook-form.
 *
 * ## Il controllo resta dell&apos;app
 *
 * I figli sono una **funzione**, non del JSX: il blocco non sa se dentro c&apos;è
 * un `<Input>`, un `<Textarea>`, un `<Select>` o una `<Checkbox>`, e non deve
 * saperlo. Un prop `tipo="testo" | "select" | …` dovrebbe crescere di un ramo a
 * ogni controllo nuovo, e ogni ramo diventerebbe una prop in più da inoltrare:
 * è la strada per cui un blocco finisce per reimplementare, peggio, le prop dei
 * componenti che avvolge.
 *
 * Un dettaglio che la funzione tiene onesto: i controlli acceso/spento di Base
 * UI — `Checkbox`, `Switch` — non parlano `value`/`onChange` ma
 * `checked`/`onCheckedChange`, quindi `{...campo}` sputato dentro non
 * funzionerebbe. Si vede nella story **Scelte**.
 */
const meta = {
  title: 'Blocchi/Campo di modulo',
  component: FormField,
  /*
   * `padded`, non `centered`, ed è una correzione presa **misurando**.
   * Con `layout: 'centered'` Storybook rende `#storybook-root` un **flex
   * item** (`flex: 0 1 auto`), quindi la sua larghezza la decide il
   * contenuto: un `w-full` lì dentro è circolare, `max-w-md` fa da tetto e
   * non da larghezza, e il modulo collassa sulla larghezza intrinseca dei
   * campi. Misurato a 1440px: root 193px, modulo **129px**. Il blocco era
   * sano, la vetrina no — e i dialoghi non lo mostravano perché stanno in
   * un portale, fuori da quella catena.
   */
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

const schema = z.object({
  codice: z
    .string()
    .min(3, 'Il codice ha almeno 3 caratteri.')
    .max(16, 'Il codice ha al massimo 16 caratteri.'),
  nome: z.string().min(1, 'Il nome è obbligatorio.'),
  famiglia: z.string().min(1, 'Scegli una famiglia.'),
  note: z.string().max(2048, 'Al massimo 2048 caratteri.').optional(),
})

type Scheda = z.infer<typeof schema>

const FAMIGLIE = [
  'Malte strutturali',
  'Intonaci',
  'Adesivi per piastrelle',
  'Impermeabilizzanti',
]

function ModuloScheda({ precompila = false }: { precompila?: boolean }) {
  const form = useForm<Scheda>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: precompila
      ? { codice: 'MS-R4-01', nome: 'Malta R4 fibrorinforzata', famiglia: FAMIGLIE[0], note: '' }
      : { codice: '', nome: '', famiglia: '', note: '' },
  })

  return (
    <form
      className="max-w-md"
      onSubmit={form.handleSubmit(() => {})}
      noValidate
    >
      <FieldSet>
        <FieldLegend>Scheda prodotto</FieldLegend>
        <FieldGroup>
          <FormField
            control={form.control}
            nome="codice"
            etichetta="Codice"
          >
            {(campo) => <Input {...campo} autoComplete="off" />}
          </FormField>

          <FormField control={form.control} nome="nome" etichetta="Denominazione">
            {(campo) => <Input {...campo} autoComplete="off" />}
          </FormField>

          {/*
            Il `Select` di Base UI non ha `onChange`: si scompone il campo e si
            rimappa. È esattamente il motivo per cui i figli sono una funzione —
            un blocco che avesse provato a inoltrare `{...campo}` da sé avrebbe
            dovuto conoscere l'API di ogni controllo.
          */}
          <FormField
            control={form.control}
            nome="famiglia"
            etichetta="Famiglia"
          >
            {({ onChange, value, ...campo }) => (
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger {...campo}>
                  <SelectValue placeholder="Scegli una famiglia" />
                </SelectTrigger>
                <SelectContent>
                  {FAMIGLIE.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField
            control={form.control}
            nome="note"
            etichetta="Note tecniche"
            descrizione="Massimo 2048 caratteri, come impone BC."
          >
            {(campo) => <Textarea {...campo} rows={4} className="resize-none" />}
          </FormField>
        </FieldGroup>
      </FieldSet>

      <Field orientation="horizontal" className="mt-6">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Azzera
        </Button>
        <Button type="submit">Salva</Button>
      </Field>
    </form>
  )
}

/**
 * Il modulo vuoto. `mode: 'onTouched'` — la validazione parte al primo abbandono
 * del campo e poi a ogni battuta: non si viene corretti mentre si sta ancora
 * scrivendo la prima lettera, e non si scopre tutto insieme al momento di
 * salvare.
 */
export const Predefinito: Story = {
  args: {} as never,
  render: () => <ModuloScheda />,
}

/**
 * Lo stesso modulo già compilato. Utile per guardare la riga a riposo — che è
 * lo stato in cui un modulo passa il 95% del tempo, e quello che si finisce per
 * non guardare mai.
 */
export const Compilato: Story = {
  args: {} as never,
  render: () => <ModuloScheda precompila />,
}

/**
 * **Gli errori.** Il modulo parte con dei valori che lo schema rifiuta e con la
 * validazione già eseguita, così i tre stati si vedono insieme: la riga tinta
 * (`data-invalid`), il messaggio sotto (`FieldError`, con `role="alert"`) e il
 * controllo marcato (`aria-invalid`).
 *
 * Da guardare col pannello Accessibility aperto: il campo dichiara
 * `aria-describedby` verso **entrambi** — l&apos;aiuto e l&apos;errore — quindi
 * chi arriva col fuoco sente prima cosa deve scrivere e poi cosa non va. È la
 * parte che l&apos;esempio di shadcn non fa.
 */
export const ConErrori: Story = {
  args: {} as never,
  render: function Render() {
    const form = useForm<Scheda>({
      resolver: zodResolver(schema),
      defaultValues: { codice: 'AB', nome: '', famiglia: '', note: '' },
    })
    /*
     * Una volta sola, al montaggio. La dipendenza è `form`, che react-hook-form
     * garantisce stabile fra i render: è un **riferimento stabile**, non un
     * oggetto scritto inline, che è la condizione posta da `CLAUDE.md` — un
     * array o un oggetto inline qui avvierebbe il ciclo che React non
     * interrompe e non stampa.
     */
    useEffect(() => {
      void form.trigger()
    }, [form])
    return (
      <form className="max-w-md" noValidate>
        <FieldGroup>
          <FormField
            control={form.control}
            nome="codice"
            etichetta="Codice"
          >
            {(campo) => <Input {...campo} autoComplete="off" />}
          </FormField>
          <FormField control={form.control} nome="nome" etichetta="Denominazione">
            {(campo) => <Input {...campo} autoComplete="off" />}
          </FormField>
        </FieldGroup>
      </form>
    )
  },
}

/**
 * **Le scelte**: casella e interruttore, con l&apos;etichetta **in coda**.
 *
 * È la sola forma in cui l&apos;etichetta sta dopo il controllo, e non è un
 * capriccio: lì il controllo è piccolo e l&apos;etichetta lo *descrive*, invece
 * di intestare una riga. `etichettaInCoda` mette anche l&apos;aiuto dentro un
 * `FieldContent` insieme all&apos;etichetta, o resterebbe allineato al bordo
 * sinistro della riga invece che sotto la propria etichetta.
 *
 * Qui si vede perché i figli sono una funzione: `Checkbox` e `Switch` parlano
 * `checked`/`onCheckedChange`, non `value`/`onChange`.
 */
export const Scelte: Story = {
  args: {} as never,
  render: function Render() {
    const form = useForm<{ obsoleto: boolean; pubblicato: boolean }>({
      defaultValues: { obsoleto: false, pubblicato: true },
    })
    return (
      <form className="max-w-md" noValidate>
        <FieldGroup>
          <FormField
            control={form.control}
            nome="obsoleto"
            etichetta="Prodotto obsoleto"
            orientamento="orizzontale"
            etichettaInCoda
          >
            {({ value, onChange, ...campo }) => (
              <Checkbox
                {...campo}
                checked={value}
                onCheckedChange={(v) => onChange(v === true)}
              />
            )}
          </FormField>
          <FormField
            control={form.control}
            nome="pubblicato"
            etichetta="Visibile sul sito"
            orientamento="orizzontale"
            etichettaInCoda
          >
            {({ value, onChange, ...campo }) => (
              <Switch
                {...campo}
                checked={value}
                onCheckedChange={(v) => onChange(v)}
              />
            )}
          </FormField>
        </FieldGroup>
      </form>
    )
  },
}

/**
 * `orientamento="adattiva"`: etichetta accanto al campo quando il **gruppo** è
 * largo, sopra quando è stretto. La soglia è `@md` del `FieldGroup` che la
 * contiene, cioè una **container query** — guarda il gruppo e non lo schermo,
 * che è la regola di `docs/DECISIONI.md` §31 e il motivo per cui questa story
 * si può mettere in scena a qualunque viewport.
 *
 * I due riquadri qui sotto hanno gli stessi identici campi: cambia solo la
 * larghezza del contenitore, dichiarata sopra ciascuno.
 */
export const Adattiva: Story = {
  args: {} as never,
  render: function Render() {
    const form = useForm<Scheda>({
      defaultValues: { codice: 'MS-R4-01', nome: 'Malta R4', famiglia: '', note: '' },
    })
    const campi = (
      <FieldGroup>
        <FormField
          control={form.control}
          nome="codice"
          etichetta="Codice"
          orientamento="adattiva"
        >
          {(campo) => <Input {...campo} autoComplete="off" />}
        </FormField>
        <FormField
          control={form.control}
          nome="nome"
          etichetta="Denominazione"
          orientamento="adattiva"
        >
          {(campo) => <Input {...campo} autoComplete="off" />}
        </FormField>
      </FieldGroup>
    )
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            Gruppo largo (32rem) — etichetta accanto al campo.
          </p>
          <div className="max-w-lg rounded-lg border p-4">{campi}</div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            Gruppo stretto (18rem) — etichetta sopra. Stessi campi, stessa
            larghezza di schermo.
          </p>
          <div className="w-72 rounded-lg border p-4">{campi}</div>
        </div>
      </div>
    )
  },
}
