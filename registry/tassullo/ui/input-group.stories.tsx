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
 * Il campo con qualcosa **dentro il bordo**: un'icona, un'unità di misura, un
 * bottone, una scorciatoia. **Anagrafe lo ha già fatto a mano** in `.prd-cerca`,
 * ed è esattamente il caso per cui la regola permanente esiste: da qui in poi
 * quel pattern si installa, non si riscrive.
 *
 * **Sei ri-stili, tutti dello stesso tipo**: misure crude al posto dei token.
 *
 * | prima | ora | perché |
 * |---|---|---|
 * | `[&>kbd]:rounded-[calc(var(--radius)-5px)]` | `[&>kbd]:rounded-sm` | 5px inventati → il gradino `sm` del tema |
 * | `rounded-[calc(var(--radius)-3px)]` (×2) | `rounded-md` | 7px inventati → il gradino `md`, che è già quello del bottone `xs` |
 * | `ml-[-0.3rem]` / `mr-[-0.3rem]` | `-ml-1` / `-mr-1` | un rientro in rem non segue la densità; in unità di `--spacing` sì |
 * | `ml-[-0.15rem]` / `mr-[-0.15rem]` | `-ml-0.5` / `-mr-0.5` | idem |
 *
 * I rientri negativi non sono decorazione: **tolgono il doppio margine** fra il
 * bordo del gruppo e il bottone che ci sta dentro. Se non seguissero la densità,
 * in touch il bottone si staccherebbe dal bordo di qualche pixel — il tipo di
 * difetto che non si nota su una story e si nota su una pagina intera.
 *
 * **L'`InputGroup` non è un `Field`.** Qui dentro sta il *campo*; l'etichetta,
 * la descrizione e l'errore stanno fuori, e li mette `Field`.
 */
const meta = {
  title: 'Primitive/InputGroup',
  component: InputGroup,
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

/** La barra di ricerca di Anagrafe: icona a sinistra, scorciatoia a destra. */
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

/** Unità di misura in coda: il numero resta un numero, l'unità non si può cancellare. */
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

/** Con un bottone dentro: è il rientro negativo a farlo stare attaccato al bordo. */
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

/** In blocco sopra e sotto: la barra di un campo lungo, con l'azione in fondo. */
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
