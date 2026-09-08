import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from '@/registry/tassullo/ui/input'
import { Label } from '@/registry/tassullo/ui/label'

/**
 * **Nessun ri-stile.** Il default shadcn è già sui token del tema, e l'altezza
 * `h-8` deriva da `--spacing`: **32px in normale, 48px in touch**, cioè
 * esattamente il bersaglio del bottone. Campo e bottone si allineano nelle due
 * densità senza che nessuno dei due sappia dell'altro, ed è il motivo per cui
 * la densità sta nel tema e non nelle primitive (M1.4).
 *
 * Una cosa da non «correggere»: `text-base md:text-sm`. Sembra un refuso —
 * il corpo grande sotto la soglia, il piccolo sopra — e non lo è. Sotto i
 * 16px iOS ingrandisce la pagina da sé quando il fuoco entra in un campo, e
 * l'unico modo di impedirglielo è non scendere sotto 16px sul telefono. È il
 * comportamento del browser, non una scelta di stile.
 *
 * `aria-invalid` non è decorazione: è ciò che i lettori di schermo annunciano.
 * Il bordo rosso è la sua conseguenza visiva, non il contrario — e quindi lo
 * stato d'errore si accende su quell'attributo, mai su una classe.
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
 * I tipi che servono davvero alle app Tassullo. `type="number"` porta con sé
 * le frecce del browser e la rotellina: per una quantità va bene, per un
 * codice no — un codice è testo, anche quando è fatto di cifre.
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
        <Input id="t-email" type="email" placeholder="nome@covicostruzioni.it" />
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
 * **I numeri da confrontare in colonna vogliono `tabular-nums`** — la regola
 * fissata in `Tema/Cifre`. Vale anche dentro un campo: due quantità incolonnate
 * con le cifre proporzionali ballano, e in un modulo di conformità la colonna
 * dei decimali è il righello con cui si legge.
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
