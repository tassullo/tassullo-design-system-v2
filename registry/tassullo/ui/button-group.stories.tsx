import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, ChevronDownIcon } from 'lucide-react'

import { Button } from '@/registry/tassullo/ui/button'
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@/registry/tassullo/ui/button-group'

/**
 * Bottoni saldati in un blocco solo, per azioni imparentate: «Salva» col suo
 * menu, un campo con la sua lente, un'unità di misura accanto al valore.
 *
 * **Quando sì, quando no.** Ogni bottone del gruppo fa una cosa. Se invece si
 * sceglie fra alternative e la scelta resta premuta, è un filtro che si clicca
 * e si usa `toggle-group`: si somigliano, ma fanno cose diverse.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/button-group
 * ```
 *
 * **Opzioni e parti.** `orientation`: `horizontal` (di base) o `vertical`, per
 * le barre laterali. `ButtonGroupSeparator` divide due lati che fanno cose
 * diverse; `ButtonGroupText` è un'etichetta fissa — un prefisso, un'unità, un
 * dominio. Dentro vanno `button`, `input` o `input-group`.
 *
 * **Accessibilità.** Un bottone di sola icona vuole la sua `aria-label`,
 * perché non c'è testo da leggere.
 */
const meta = {
  title: 'Primitive/ButtonGroup',
  component: ButtonGroup,
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Salva</Button>
      <Button variant="outline" aria-label="Altre opzioni di salvataggio">
        <ChevronDownIcon />
      </Button>
    </ButtonGroup>
  ),
}

/**
 * Di sole icone: ciascuna ha la sua `aria-label`.
 */
export const SoloIcone: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Allinea a sinistra"><AlignLeftIcon /></Button>
      <Button variant="outline" size="icon" aria-label="Centra"><AlignCenterIcon /></Button>
      <Button variant="outline" size="icon" aria-label="Allinea a destra"><AlignRightIcon /></Button>
    </ButtonGroup>
  ),
}

/**
 * Con un separatore, quando i due lati fanno cose diverse.
 */
export const ConSeparatore: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Esporta</Button>
      <ButtonGroupSeparator />
      <Button variant="outline" aria-label="Scegli il formato"><ChevronDownIcon /></Button>
    </ButtonGroup>
  ),
}

/**
 * Con un'etichetta fissa: prefissi, unità di misura, domini.
 */
export const ConEtichetta: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>Revisione</ButtonGroupText>
      <Button variant="outline">4</Button>
      <Button variant="outline">Storico</Button>
    </ButtonGroup>
  ),
}

/**
 * In verticale, per le barre laterali.
 */
export const Verticale: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Anagrafica</Button>
      <Button variant="outline">Documenti</Button>
      <Button variant="outline">Storico</Button>
    </ButtonGroup>
  ),
}
