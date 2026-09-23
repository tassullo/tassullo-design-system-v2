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
 * La riga di un modulo: etichetta, campo, aiuto ed errore, collegati fra loro
 * e con react-hook-form in una chiamata sola.
 *
 * **Quando sì, quando no.** Si usa per ogni campo di un modulo gestito con
 * react-hook-form. Per comporre a mano, senza react-hook-form, resta la
 * primitiva `field` (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`,
 * `FieldGroup`), su cui questo blocco è costruito.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-form-field
 * ```
 *
 * ```tsx
 * <FormField control={form.control} nome="codice" etichetta="Codice">
 *   {(campo) => <Input {...campo} autoComplete="off" />}
 * </FormField>
 * ```
 *
 * **Le prop.**
 *
 * - `control` e `nome`: il modulo di react-hook-form e il nome del dato.
 * - `etichetta`; `descrizione`, l'aiuto sotto il campo.
 * - `orientamento`: `"verticale"`, etichetta sopra; `"orizzontale"`,
 *   etichetta accanto; `"adattiva"`, accanto quando il gruppo è largo e sopra
 *   quando è stretto.
 * - `etichettaInCoda` mette l'etichetta dopo il controllo, per caselle e
 *   interruttori.
 * - Il figlio è una funzione che riceve il campo già collegato — valore,
 *   gestori, `id`, `aria-invalid`, `aria-describedby` — e rende il controllo.
 *
 * **Regole d'uso.**
 *
 * - Il controllo lo sceglie la pagina: `Input`, `Textarea`, `Select`,
 *   `Checkbox`, `Switch`. `Checkbox` e `Switch` parlano `checked` e
 *   `onCheckedChange`, non `value` e `onChange`: il campo si collega a mano,
 *   come nella scena «Scelte».
 * - La descrizione è l'eccezione: si scrive solo per un vincolo che il campo
 *   non mostra da sé — un limite di lunghezza, un formato obbligato, una
 *   conseguenza che non si disfa. Un campo che ha bisogno di spiegazioni ha
 *   quasi sempre l'etichetta sbagliata.
 * - L'`id` del campo è unico per ogni istanza: due moduli nella stessa pagina
 *   non si rubano le etichette.
 * - Con `orientamento="adattiva"` la soglia è `@md` del `FieldGroup` che
 *   contiene i campi: guarda il gruppo, non lo schermo.
 * - La validazione con `mode: 'onTouched'` parte quando si lascia il campo, e
 *   poi a ogni battuta.
 *
 * **Tastiera e accessibilità.** Il clic sull'etichetta porta il fuoco nel
 * campo. Il campo dichiara `aria-invalid` quando è sbagliato e
 * `aria-describedby` verso l'aiuto e l'errore, quindi chi arriva col fuoco
 * sente prima cosa scrivere e poi cosa non va. L'errore compare solo quando
 * c'è, con `role="alert"`.
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
 * Il modulo vuoto: la validazione parte quando si lascia un campo.
 */
export const Predefinito: Story = {
  args: {} as never,
  render: () => <ModuloScheda />,
}

/**
 * Lo stesso modulo compilato, a riposo.
 */
export const Compilato: Story = {
  args: {} as never,
  render: () => <ModuloScheda precompila />,
}

/**
 * I campi sbagliati: la riga tinta, il messaggio sotto, il controllo marcato
 * `aria-invalid` e collegato all'aiuto e all'errore.
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
 * Casella e interruttore, con l'etichetta dopo il controllo
 * (`etichettaInCoda`) e l'aiuto sotto l'etichetta.
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
 * `orientamento="adattiva"` in due gruppi di larghezza diversa: etichetta
 * accanto al campo nel gruppo largo, sopra in quello stretto.
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
