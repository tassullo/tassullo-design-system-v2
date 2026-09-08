import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/registry/tassullo/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'

/**
 * **Un ri-stile solo**: `rounded-[min(var(--radius-md),10px)]` → `rounded-md`
 * sulla taglia `sm`. Il `min()` serviva a mettere un tetto a un `--radius-md`
 * grande; il nostro è 6px, quindi il risultato è identico al pixel — ma ora è
 * il gradino del tema, e segue il tema se cambia. Come per il checkbox, era
 * **invisibile al gate** fino a M2.2 (segnaposto d'icona): corretto lì.
 *
 * **`Select` vuole `items`, o il grilletto mostra il valore grezzo.** È il
 * secondo rilievo di questa fase, e si vede a occhio nudo appena si sceglie
 * una voce: senza `items`, `SelectValue` non sa risalire dall'`value` alla
 * scritta, e il campo «Famiglia» dice `deumidificanti` invece di «Intonaci
 * deumidificanti». Non è un difetto del ri-stile — è come Base UI risolve
 * l'etichetta (`resolveSelectedLabel` legge la mappa `items` sulla radice) —
 * ma è un passo che shadcn non documenta e che **ogni consumatore sbaglierà
 * una volta**. Qui si scrive perché lo sbagli zero volte.
 *
 * **Il `select` regge le liste corte.** Sopra le poche decine di voci non
 * regge più, e la risposta è il `combobox` di M2.6 — che si scrive filtrando,
 * mentre qui si può solo scorrere. Le famiglie e le norme di Anagrafe, che
 * oggi stanno in `<select>` nudi con centinaia di voci, vanno lì, non qui.
 *
 * **Da tastiera**: `Tab` porta sul grilletto, `Spazio`/`Invio`/`↓` apre,
 * le frecce scorrono, le **lettere** saltano alla voce che comincia così,
 * `Invio` sceglie, `Esc` chiude senza cambiare.
 */
const meta = {
  title: 'Primitive/Select',
  component: Select,
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="se-uno">Stato della scheda</Label>
      <Select
        items={{
          bozza: 'Bozza',
          revisione: 'In revisione',
          pubblicato: 'Pubblicato',
          archiviato: 'Archiviato',
        }}
      >
        <SelectTrigger id="se-uno" className="w-full">
          <SelectValue placeholder="Scegli uno stato" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bozza">Bozza</SelectItem>
          <SelectItem value="revisione">In revisione</SelectItem>
          <SelectItem value="pubblicato">Pubblicato</SelectItem>
          <SelectItem value="archiviato">Archiviato</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

/** Raggruppato, con etichette di gruppo e separatore: le famiglie di prodotto. */
export const ConGruppi: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="se-fam">Famiglia</Label>
      <Select
        defaultValue="deumidificanti"
        items={{
          deumidificanti: 'Deumidificanti',
          risanamento: 'Risanamento',
          fondo: 'Fondo',
          strutturali: 'Strutturali',
          allettamento: 'Da allettamento',
        }}
      >
        <SelectTrigger id="se-fam" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Intonaci</SelectLabel>
            <SelectItem value="deumidificanti">Deumidificanti</SelectItem>
            <SelectItem value="risanamento">Risanamento</SelectItem>
            <SelectItem value="fondo">Fondo</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Malte</SelectLabel>
            <SelectItem value="strutturali">Strutturali</SelectItem>
            <SelectItem value="allettamento">Da allettamento</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Taglie: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="se-def">Default</Label>
        <Select defaultValue="a" items={{ a: 'Altezza del bottone', b: 'Seconda voce' }}>
          <SelectTrigger id="se-def" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Altezza del bottone</SelectItem>
            <SelectItem value="b">Seconda voce</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="se-sm">Small</Label>
        <Select defaultValue="a" items={{ a: 'Un gradino più basso', b: 'Seconda voce' }}>
          <SelectTrigger id="se-sm" size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Un gradino più basso</SelectItem>
            <SelectItem value="b">Seconda voce</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
}

export const Stati: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="se-vuoto">Vuoto (segnaposto)</Label>
        <Select items={{ a: 'Prima voce' }}>
          <SelectTrigger id="se-vuoto" className="w-full">
            <SelectValue placeholder="Nessuna scelta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Prima voce</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="se-inv">Non valido</Label>
        <Select items={{ a: 'Prima voce' }}>
          <SelectTrigger id="se-inv" aria-invalid className="w-full">
            <SelectValue placeholder="Campo obbligatorio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Prima voce</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="group flex flex-col gap-2" data-disabled="true">
        <Label htmlFor="se-dis">Disabilitato</Label>
        <Select defaultValue="a" items={{ a: 'Non modificabile' }}>
          <SelectTrigger id="se-dis" disabled className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Non modificabile</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
}

