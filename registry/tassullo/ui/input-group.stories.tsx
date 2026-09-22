import type { Meta, StoryObj } from '@storybook/react-vite'
import { EuroIcon, SearchIcon, XIcon } from 'lucide-react'

import { Kbd } from '@/registry/tassullo/ui/kbd'
import { Label } from '@/registry/tassullo/ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/registry/tassullo/ui/input-group'

/**
 * Un campo con qualcosa dentro il bordo: un'icona, un'unità di misura, un
 * bottone, una scorciatoia.
 *
 * **Quando sì, quando no.** Quando ciò che accompagna il valore fa parte del
 * campo: la lente della ricerca, «mm» dopo uno spessore, il bottone che copia.
 * Etichetta, descrizione ed errore stanno fuori, in `field`. Un campo nudo è
 * `input`; bottoni accostati a un campo, ma fuori dal suo bordo, sono
 * `button-group`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/input-group
 * ```
 *
 * **Parti.** `InputGroupInput` o `InputGroupTextarea` è il campo.
 * `InputGroupAddon` è ciò che gli sta accanto, con `align`: `inline-start` (di
 * base, a sinistra), `inline-end` (a destra), `block-start` e `block-end`
 * (sopra e sotto, per le barre di un campo lungo). Dentro l'addon vanno
 * `InputGroupText`, `InputGroupButton` — `size`: `xs`, `sm`, `icon-xs`,
 * `icon-sm` — o un `Kbd`.
 *
 * **Regole d'uso.** L'unità di misura va nell'addon e non nel valore: il
 * numero resta un numero, e l'unità non si cancella per sbaglio. Un bottone di
 * sola icona ha la sua `aria-label`.
 */
const meta = {
  title: 'Primitive/InputGroup',
  component: InputGroup,
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

/**
 * La barra di ricerca: la lente a sinistra, la scorciatoia a destra.
 */
export const Ricerca: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <Label htmlFor="ig-cerca">Cerca nel catalogo</Label>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput id="ig-cerca" placeholder="Codice, nome o norma" />
        <InputGroupAddon align="inline-end">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

/**
 * L'unità di misura in coda: il numero resta un numero, l'unità non si
 * cancella.
 */
export const ConUnita: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ig-resa">Resa</Label>
        <InputGroup>
          <InputGroupInput id="ig-resa" className="tabular-nums" defaultValue="12,5" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>kg/m²</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ig-prezzo">Prezzo di listino</Label>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <EuroIcon />
          </InputGroupAddon>
          <InputGroupInput id="ig-prezzo" className="tabular-nums" defaultValue="18,40" />
        </InputGroup>
      </div>
    </div>
  ),
}

/**
 * Con un bottone dentro, attaccato al bordo del campo.
 */
export const ConBottone: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <Label htmlFor="ig-btn">Filtro attivo</Label>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput id="ig-btn" defaultValue="intonaco deumidificante" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Svuota il campo">
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

/**
 * L'addon sopra e sotto un campo lungo, con l'azione in fondo.
 */
export const InBlocco: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <Label htmlFor="ig-nota">Nota di revisione</Label>
      <InputGroup>
        <InputGroupTextarea id="ig-nota" placeholder="Che cosa è cambiato in questa revisione…" />
        <InputGroupAddon align="block-end" className="border-t">
          <InputGroupText className="text-xs">Visibile nello storico</InputGroupText>
          <InputGroupButton size="xs" className="ml-auto">Allega</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

export const Stati: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <InputGroup>
        <InputGroupAddon align="inline-start"><SearchIcon /></InputGroupAddon>
        <InputGroupInput aria-invalid placeholder="Non valido" aria-label="Non valido" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon align="inline-start"><SearchIcon /></InputGroupAddon>
        <InputGroupInput disabled defaultValue="Disabilitato" aria-label="Disabilitato" />
      </InputGroup>
    </div>
  ),
}
