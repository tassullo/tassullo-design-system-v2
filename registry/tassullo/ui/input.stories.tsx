import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from '@/registry/tassullo/ui/input'
import { Label } from '@/registry/tassullo/ui/label'

/**
 * Il campo di testo di una riga: dove si scrive un valore.
 *
 * **Quando sì, quando no.** Per testo breve, numeri, date scritte, indirizzi
 * di posta. Per più righe c'è `textarea`; per un valore da scegliere in un
 * elenco, `select` o `combobox`; per un'icona o un'unità dentro il bordo,
 * `input-group`. Etichetta ed errore li mette `field`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/input
 * ```
 *
 * **Regole d'uso.** Il campo è alto quanto il bottone in entrambe le densità,
 * quindi i due si allineano in riga senza aggiustamenti. Sul telefono il testo
 * del campo resta a 16px: sotto quel corpo iOS ingrandisce la pagina quando il
 * fuoco entra nel campo. Lo stato d'errore si accende con `aria-invalid`, non
 * con una classe. `type="number"` è per le quantità; un codice fatto di cifre
 * è testo. Le quantità da confrontare in colonna prendono `tabular-nums`.
 */
const meta = {
  title: 'Primitive/Input',
  component: Input,
  args: { placeholder: 'Tassullo Intonaco Deumidificante' },
  render: (args) => <Input {...args} className="w-80" />,
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {}

export const Stati: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="i-riposo">A riposo</Label>
        <Input {...args} id="i-riposo" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="i-compilato">Compilato</Label>
        <Input {...args} id="i-compilato" defaultValue="Antisale Tassullo" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="i-invalido">Non valido (<code>aria-invalid</code>)</Label>
        <Input {...args} id="i-invalido" aria-invalid defaultValue="—" />
      </div>
      <div className="group flex flex-col gap-2" data-disabled="true">
        <Label htmlFor="i-disabilitato">Disabilitato</Label>
        <Input {...args} id="i-disabilitato" disabled defaultValue="Non modificabile" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="i-sola-lettura">Sola lettura</Label>
        <Input {...args} id="i-sola-lettura" readOnly defaultValue="TAS-0041" />
      </div>
    </div>
  ),
}

/**
 * I tipi d'uso più comuni. `type="number"` porta le frecce e la rotellina: va
 * bene per una quantità, non per un codice.
 */
export const Tipi: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="t-testo">Denominazione</Label>
        <Input id="t-testo" type="text" placeholder="Intonaco deumidificante" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="t-email">Posta elettronica</Label>
        <Input id="t-email" type="email" placeholder="nome@esempio.it" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="t-numero">Resa (kg/m²)</Label>
        <Input id="t-numero" type="number" step="0.1" defaultValue="12.5" className="tabular-nums" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="t-ricerca">Cerca</Label>
        <Input id="t-ricerca" type="search" placeholder="Codice, nome o norma" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="t-file">Scheda tecnica</Label>
        <Input id="t-file" type="file" />
      </div>
    </div>
  ),
}

/**
 * Quantità incolonnate con `tabular-nums`: le cifre hanno tutte la stessa
 * larghezza, e i decimali si allineano anche dentro un campo.
 */
export const CifreInColonna: Story = {
  render: () => (
    <div className="flex w-56 flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">
          Senza <code>tabular-nums</code>
        </legend>
        <Input readOnly aria-label="Primo importo, cifre proporzionali" defaultValue="1.111,11" />
        <Input readOnly aria-label="Secondo importo, cifre proporzionali" defaultValue="8.888,88" />
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">
          Con <code>tabular-nums</code>
        </legend>
        <Input readOnly className="tabular-nums" aria-label="Primo importo, cifre tabellari" defaultValue="1.111,11" />
        <Input readOnly className="tabular-nums" aria-label="Secondo importo, cifre tabellari" defaultValue="8.888,88" />
      </fieldset>
    </div>
  ),
}
