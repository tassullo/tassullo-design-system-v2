import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchIcon } from 'lucide-react'

import { Button } from '@/registry/tassullo/ui/button'
import { Checkbox } from '@/registry/tassullo/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/registry/tassullo/ui/input-group'
import { RadioGroup, RadioGroupItem } from '@/registry/tassullo/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'
import { Slider } from '@/registry/tassullo/ui/slider'
import { Switch } from '@/registry/tassullo/ui/switch'
import { Textarea } from '@/registry/tassullo/ui/textarea'

/**
 * La riga di un modulo: etichetta, campo, descrizione ed errore tenuti
 * insieme, con i collegamenti che servono a chi usa un lettore di schermo.
 *
 * **Quando sì, quando no.** Attorno a ogni campo di un modulo, invece di
 * scrivere un contenitore proprio. Per un campo già cablato con la
 * validazione, c'è il blocco `Campo di modulo`, che lo usa. Ciò che sta
 * *dentro* il bordo del campo — un'icona, un'unità, un bottone — è
 * `input-group`, e sta dentro il `Field`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/field
 * ```
 *
 * **Parti e orientamenti.** `Field` è la riga, con `orientation`: `vertical`
 * (di base, etichetta sopra), `horizontal` (etichetta accanto, per caselle e
 * interruttori), `responsive` (passa da colonna a riga secondo la larghezza
 * del contenitore, non della finestra). `FieldLabel`, `FieldDescription`,
 * `FieldError`; `FieldContent` raggruppa etichetta e descrizione accanto a un
 * controllo; `FieldSet`, `FieldLegend` e `FieldGroup` raccolgono più righe;
 * `FieldSeparator` le divide; `FieldTitle` è un titolo che non è un'etichetta.
 *
 * **Regole d'uso.** Ogni campo ha un'etichetta. Lo stato d'errore si accende
 * con `aria-invalid` sul campo e `data-invalid` sul `Field`: il bordo rosso è
 * la conseguenza, non il segnale. Il testo d'errore è già nel colore giusto, e
 * non si ricolora con `text-destructive`. Un `FieldLabel` che contiene un
 * `Field` diventa una scheda da scegliere, che si accende sulla voce
 * selezionata.
 *
 * **Tastiera e accessibilità.** `FieldError` ha `role="alert"`: quando compare
 * viene letto, senza che il fuoco ci vada sopra. Un modulo fatto di `Field` si
 * percorre tutto con `Tab`, in ordine, e l'anello di fuoco si vede su ogni
 * controllo.
 */
const meta = {
  title: 'Primitive/Field',
  component: Field,
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <div className="w-96">
      <Field>
        <FieldLabel htmlFor="f-nome">Denominazione commerciale</FieldLabel>
        <Input id="f-nome" placeholder="Tassullo Intonaco Deumidificante" />
        <FieldDescription>
          Il nome con cui il prodotto compare in listino e in etichetta.
        </FieldDescription>
      </Field>
    </div>
  ),
}

/**
 * Con l'errore: il campo porta `aria-invalid`, e `FieldError` viene letto
 * appena compare.
 */
export const ConErrore: Story = {
  render: () => (
    <div className="w-96">
      <Field data-invalid="true">
        <FieldLabel htmlFor="f-cod">Codice FileMaker</FieldLabel>
        <Input id="f-cod" aria-invalid defaultValue="TAS-41" />
        <FieldError>Il codice deve avere quattro cifre: TAS-0041.</FieldError>
      </Field>
    </div>
  ),
}

/**
 * Più errori insieme: la prop `errors` di `FieldError` li deduplica e li mette
 * in elenco.
 */
export const PiuErrori: Story = {
  render: () => (
    <div className="w-96">
      <Field data-invalid="true">
        <FieldLabel htmlFor="f-multi">Password del portale fornitori</FieldLabel>
        <Input id="f-multi" type="password" aria-invalid defaultValue="abc" />
        <FieldError
          errors={[
            { message: 'Almeno 12 caratteri.' },
            { message: 'Almeno una cifra.' },
            { message: 'Almeno una cifra.' },
          ]}
        />
      </Field>
    </div>
  ),
}

/**
 * I tre orientamenti. `responsive` passa da colonna a riga secondo la
 * larghezza del contenitore, non della finestra.
 */
export const Orientamenti: Story = {
  render: () => (
    <FieldGroup className="w-[36rem]">
      <Field orientation="vertical">
        <FieldLabel htmlFor="o-vert">Verticale</FieldLabel>
        <Input id="o-vert" placeholder="Etichetta sopra, campo sotto" />
      </Field>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="o-oriz">Orizzontale</FieldLabel>
          <FieldDescription>L'interruttore sta in coda alla riga.</FieldDescription>
        </FieldContent>
        <Switch id="o-oriz" defaultChecked />
      </Field>
      <Field orientation="responsive">
        <FieldLabel htmlFor="o-resp">Responsive</FieldLabel>
        <Input id="o-resp" placeholder="Riga se il contenitore è largo" />
      </Field>
    </FieldGroup>
  ),
}

/**
 * La scelta a schede: un `FieldLabel` che contiene un `Field` diventa un
 * riquadro da premere, e si accende sulla voce scelta.
 */
export const ScelteASchede: Story = {
  render: () => (
    <FieldSet className="w-96">
      <FieldLegend variant="label">Destinazione d'uso</FieldLegend>
      <RadioGroup defaultValue="interno">
        <FieldLabel htmlFor="sc-int">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Interno</FieldTitle>
              <FieldDescription>Locali chiusi, non soggetti a gelo.</FieldDescription>
            </FieldContent>
            <RadioGroupItem value="interno" id="sc-int" />
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="sc-est">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Esterno</FieldTitle>
              <FieldDescription>Esposto a pioggia e cicli di gelo/disgelo.</FieldDescription>
            </FieldContent>
            <RadioGroupItem value="esterno" id="sc-est" />
          </Field>
        </FieldLabel>
      </RadioGroup>
    </FieldSet>
  ),
}

/**
 * Un modulo completo, da percorrere solo con la tastiera: ogni campo ha
 * un'etichetta, e `Tab` passa in ordine da `Cerca` a `Salva`.
 *
 * Dentro `Famiglia`, `Spazio` apre e le frecce scelgono; nel cursore della
 * resa le frecce muovono le maniglie; i tre `Ambito` sono un fermo solo, e fra
 * loro ci si muove con le frecce. L'anello di fuoco deve vedersi sempre, anche
 * su caselle e maniglie, e il fuoco non deve mai tornare indietro o uscire dal
 * modulo prima di `Salva`.
 */
export const FormDiProva: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <form
      className="w-full max-w-2xl"
      onSubmit={(e) => e.preventDefault()}
      aria-labelledby="fp-titolo"
    >
      <FieldGroup>
        <h2 id="fp-titolo" className="text-lg font-semibold">Scheda prodotto</h2>

        <Field>
          <FieldLabel htmlFor="fp-cerca">Cerca un prodotto da cui partire</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start"><SearchIcon /></InputGroupAddon>
            <InputGroupInput id="fp-cerca" placeholder="Codice, nome o norma" />
          </InputGroup>
          <FieldDescription>
            Facoltativo: precompila i campi da una scheda esistente.
          </FieldDescription>
        </Field>

        <FieldSeparator />

        <Field>
          <FieldLabel htmlFor="fp-nome">Denominazione commerciale</FieldLabel>
          <Input id="fp-nome" defaultValue="Tassullo Intonaco Deumidificante" />
        </Field>

        <Field data-invalid="true">
          <FieldLabel htmlFor="fp-codice">Codice FileMaker</FieldLabel>
          <Input id="fp-codice" aria-invalid defaultValue="TAS-41" className="tabular-nums" />
          <FieldError>Il codice deve avere quattro cifre: TAS-0041.</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="fp-famiglia">Famiglia</FieldLabel>
          <Select
            defaultValue="deumidificanti"
            items={{
              deumidificanti: 'Intonaci deumidificanti',
              risanamento: 'Intonaci da risanamento',
              strutturali: 'Malte strutturali',
            }}
          >
            <SelectTrigger id="fp-famiglia" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deumidificanti">Intonaci deumidificanti</SelectItem>
              <SelectItem value="risanamento">Intonaci da risanamento</SelectItem>
              <SelectItem value="strutturali">Malte strutturali</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="fp-resa">Resa</FieldLabel>
          <InputGroup>
            <InputGroupInput id="fp-resa" className="tabular-nums" defaultValue="12,5" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>kg/m²</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Field>
          <FieldLabel id="fp-range-lab">Range di conformità (°C)</FieldLabel>
          <Slider aria-labelledby="fp-range-lab" defaultValue={[5, 35]} min={-10} max={50} />
          <FieldDescription>
            Due maniglie: <kbd>Tab</kbd> passa dall'una all'altra, le frecce le spostano.
            L'etichetta le raggiunge con <code>aria-labelledby</code>, non con{' '}
            <code>htmlFor</code> — vedi <code>Primitive/Slider</code>.
          </FieldDescription>
        </Field>

        <FieldSet>
          <FieldLegend variant="label">Ambito di applicazione</FieldLegend>
          <RadioGroup defaultValue="interno">
            <Field orientation="horizontal">
              <RadioGroupItem value="interno" id="fp-a-int" />
              <FieldLabel htmlFor="fp-a-int" className="font-normal">Interno</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="esterno" id="fp-a-est" />
              <FieldLabel htmlFor="fp-a-est" className="font-normal">Esterno</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="entrambi" id="fp-a-ent" />
              <FieldLabel htmlFor="fp-a-ent" className="font-normal">Interno ed esterno</FieldLabel>
            </Field>
          </RadioGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">Norme dichiarate</FieldLegend>
          <Field orientation="horizontal">
            <Checkbox id="fp-n1" defaultChecked />
            <FieldLabel htmlFor="fp-n1" className="font-normal">EN 998-1</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="fp-n2" />
            <FieldLabel htmlFor="fp-n2" className="font-normal">EN 1504-3</FieldLabel>
          </Field>
        </FieldSet>

        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="fp-pubblica">Pubblica nel catalogo</FieldLabel>
            <FieldDescription>Visibile subito sul sito pubblico.</FieldDescription>
          </FieldContent>
          <Switch id="fp-pubblica" />
        </Field>

        <Field>
          <FieldLabel htmlFor="fp-note">Note di revisione</FieldLabel>
          <Textarea id="fp-note" placeholder="Che cosa è cambiato in questa revisione…" />
        </Field>

        <Field orientation="horizontal" className="justify-end">
          <Button type="button" variant="outline">Annulla</Button>
          <Button type="submit">Salva</Button>
        </Field>
      </FieldGroup>
    </form>
  ),
}
