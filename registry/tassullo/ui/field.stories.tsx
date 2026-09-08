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
 * **`Field` è la riga etichetta + campo + descrizione + errore, e non si
 * reinventa.** È la primitiva ufficiale shadcn per il compito, il blocco
 * `form-field` di M3.4 ci si appoggerà sopra, e la regola 4bis dice di partire
 * da qui invece di scrivere l'ennesimo wrapper.
 *
 * **Due ri-stili, ed erano tutt'e due trappole scritte nel CLAUDE.md.**
 * Misurate, non stimate:
 *
 * | | prima | rapporto | ora | rapporto |
 * |---|---|---|---|---|
 * | testo d'errore, chiaro | `text-destructive` | **4,46:1** su pagina, 4,75 su card | `text-destructive-subtle-foreground` | **7,68:1** / 8,17 |
 * | testo d'errore, scuro | `text-destructive` | **3,81:1** su pagina, **3,53** su card | idem | **11,29:1** / 10,45 |
 * | link in hover | `text-primary` | **1,79:1** | `text-accent-ink` | **4,77:1** / 5,07 |
 *
 * `--destructive` è un colore da **fondo** — è il rosso pieno del bottone
 * distruttivo — e come testo non arriva a 4,5:1 in **nessuna** delle quattro
 * combinazioni. Il testo rosso ha già il suo token, `--destructive-subtle-foreground`,
 * che nel v1 si chiamava `--color-danger-text` e fa esattamente questo mestiere.
 * È la stessa correzione fatta al `badge` in M2.1, sullo stesso errore del preset.
 *
 * Il link in hover è la prima delle «due trappole che costano riscritture»:
 * `--primary` è l'arancio del brand, e come **testo** dà 1,79:1 in chiaro.
 * `text-accent-ink` è corretto in entrambe le modalità — sul fondo scuro
 * coincide col brand, ed è proprio per questo che si scrive così e non
 * `text-primary`.
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
 * Con l'errore. `FieldError` ha `role="alert"`: il lettore di schermo lo
 * annuncia quando compare, senza che il fuoco ci vada sopra. E il campo porta
 * `aria-invalid` — è quello a dire che è sbagliato, il rosso è la conseguenza.
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

/** Più errori insieme: `errors` li deduplica e li impagina in elenco. */
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

/** I tre orientamenti. `responsive` passa da colonna a riga sul contenitore, non sulla finestra. */
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
 * La scelta a schede: `FieldLabel` che contiene un `Field` diventa un
 * riquadro premibile, e si accende sulla voce scelta. È il pattern per cui
 * `has-data-checked` esiste — nessun JavaScript, nessuna classe condizionale.
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
 * ## Il form di prova — criterio di accettazione di M2.2
 *
 * Tutte e dieci le primitive della fase in una pagina sola, **navigabile
 * interamente da tastiera** e con **ogni campo etichettato** (INTERFACCE.md §1).
 *
 * Il percorso da provare, `Tab` dopo `Tab`, senza mai toccare il mouse:
 *
 * 1. `Cerca` → 2. `Denominazione` → 3. `Codice` (in errore) → 4. `Famiglia`
 * (`Spazio` apre, frecce e lettere scelgono, `Esc` chiude) → 5. `Resa` →
 * 6. `Range di conformità` (due maniglie, frecce per muoverle) →
 * 7. i tre `Ambito` (**un solo fermo**: dentro si va con le frecce) →
 * 8. le due caselle `Norme` → 9. l'interruttore `Pubblica` →
 * 10. `Note` → 11. `Annulla` → 12. `Salva`.
 *
 * Due cose da guardare mentre si tabula, perché sono quelle che si rompono:
 * l'anello di fuoco dev'essere **sempre visibile** (anche sulle caselle e sulle
 * maniglie del cursore, che sono i due punti dove di solito sparisce), e da
 * nessuna parte il fuoco deve **saltare all'indietro** o uscire dal modulo
 * prima di `Salva`.
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
