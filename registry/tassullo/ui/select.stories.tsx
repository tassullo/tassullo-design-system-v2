import type { Meta, StoryObj } from '@storybook/react-vite'

import { apriCol } from '@/prove/apri'
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
 * Un campo che fa scegliere una voce da un elenco corto e fisso: si apre, si
 * sceglie, si chiude.
 *
 * **Quando sì, quando no.** Il confine con `combobox` è la lunghezza
 * dell'elenco: fino a poche decine di voci si usa `select`, sopra si usa
 * `combobox`, che filtra mentre si scrive. Il segno è uno solo: se per
 * trovare una voce bisogna scorrere, serviva un combobox. Con tre o quattro
 * opzioni sempre in vista, `radio-group`. Un elenco di azioni, non di valori,
 * è `dropdown-menu`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/select
 * ```
 *
 * **Taglie e opzioni.** `size` su `SelectTrigger`: `default` o `sm`.
 * `alignItemWithTrigger` su `SelectContent`, acceso di base, apre l'elenco
 * in modo che la voce scelta cada sopra il campo; spento, l'elenco scende
 * sotto il bordo del campo come un menu. Le parti: `Select` con `items`,
 * `value` o `defaultValue`; `SelectTrigger` con dentro `SelectValue` e il suo
 * `placeholder`; `SelectContent`, `SelectGroup`, `SelectLabel`, `SelectItem`,
 * `SelectSeparator`.
 *
 * **Regole d'uso.**
 *
 * - `items` sulla radice c'è sempre: è la mappa da valore a testo, e senza il
 *   campo mostra il valore grezzo — `deumidificanti` invece di
 *   «Deumidificanti».
 * - Le voci stanno sempre dentro un `SelectGroup`, anche quando il gruppo è
 *   uno solo e senza `SelectLabel`: è il gruppo che stacca le voci dal bordo
 *   del riquadro.
 * - In fondo alla pagina o dentro un contenitore che scorre si mette
 *   `alignItemWithTrigger={false}`: l'elenco resta sotto il campo e non ne
 *   copre la parte superiore.
 * - Lo stato non valido si scrive con `aria-invalid` sul grilletto; il campo
 *   spento con `disabled`.
 *
 * **Tastiera e accessibilità.** `Tab` porta sul campo; `Spazio`, `Invio` o
 * `↓` apre; le frecce scorrono le voci; una lettera salta alla prima voce che
 * comincia così; `Invio` sceglie; `Esc` chiude senza cambiare. Il campo prende
 * il nome dalla `Label` collegata con `htmlFor`.
 */
const meta = {
  title: 'Primitive/Select',
  component: Select,
  // Si misura **aperto**: chiuso il popup non esiste e axe non ha niente
  // da guardare. L'imbracatura dichiara qui quale popup apre (`@/prove/apri`).
  play: apriCol('[data-slot="select-trigger"]', 'select-content'),
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Un campo con segnaposto: lo stato di una scheda fra quattro.
 */
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
          <SelectGroup>
            <SelectItem value="bozza">Bozza</SelectItem>
            <SelectItem value="revisione">In revisione</SelectItem>
            <SelectItem value="pubblicato">Pubblicato</SelectItem>
            <SelectItem value="archiviato">Archiviato</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}

/**
 * Le voci divise in due gruppi, con etichetta di gruppo e separatore.
 */
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

/**
 * Le due taglie del campo, `default` e `sm`.
 */
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
            <SelectGroup>
              <SelectItem value="a">Altezza del bottone</SelectItem>
              <SelectItem value="b">Seconda voce</SelectItem>
            </SelectGroup>
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
            <SelectGroup>
              <SelectItem value="a">Un gradino più basso</SelectItem>
              <SelectItem value="b">Seconda voce</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
}

/**
 * Vuoto col segnaposto, non valido, disabilitato.
 */
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
            <SelectGroup>
              <SelectItem value="a">Prima voce</SelectItem>
            </SelectGroup>
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
            <SelectGroup>
              <SelectItem value="a">Prima voce</SelectItem>
            </SelectGroup>
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
            <SelectGroup>
              <SelectItem value="a">Non modificabile</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
}

/**
 * `alignItemWithTrigger` acceso e spento, con la terza voce già scelta:
 * aperto, a sinistra l'elenco cade con la voce scelta sopra il campo, a
 * destra scende sotto il bordo.
 */
export const AllineatoAlGrilletto: Story = {
  render: () => {
    const voci = {
      a: 'Prima voce',
      b: 'Seconda voce',
      c: 'Terza voce',
      d: 'Quarta voce',
      e: 'Quinta voce',
    }
    return (
      <div className="flex gap-8">
        <div className="flex w-64 flex-col gap-2">
          <Label htmlFor="se-align-si">true — sopra il grilletto</Label>
          <Select defaultValue="c" items={voci}>
            <SelectTrigger id="se-align-si" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(voci).map(([v, t]) => (
                  <SelectItem key={v} value={v}>
                    {t}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-64 flex-col gap-2">
          <Label htmlFor="se-align-no">false — sotto il bordo</Label>
          <Select defaultValue="c" items={voci}>
            <SelectTrigger id="se-align-no" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {Object.entries(voci).map(([v, t]) => (
                  <SelectItem key={v} value={v}>
                    {t}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  },
}
