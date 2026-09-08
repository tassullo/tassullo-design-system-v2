import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, ChevronDownIcon } from 'lucide-react'

import { Button } from '@/registry/tassullo/ui/button'
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@/registry/tassullo/ui/button-group'

/**
 * Bottoni saldati in un blocco solo: azioni **imparentate** — «Salva» col suo
 * menu, un campo con la sua lente.
 *
 * **Non è un filtro a scelta singola.** Sembra un `toggle-group` e non lo è:
 * qui ogni bottone fa una cosa, là si sceglie fra alternative e la scelta
 * resta premuta. È la regola del CLAUDE.md sui nomi — cosa fa l'elemento, non
 * a cosa somiglia. Il `toggle-group` arriva in M2.6.
 *
 * Ri-stilato solo nel raggio: il preset arrotondava le estremità a `lg`,
 * cioè 10px, e i bottoni dentro sono a 6px — il gruppo aveva gli angoli più
 * tondi dei suoi pezzi.
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

/** Di sole icone: ognuna vuole la sua `aria-label`, perché non c'è testo. */
export const SoloIcone: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Allinea a sinistra"><AlignLeftIcon /></Button>
      <Button variant="outline" size="icon" aria-label="Centra"><AlignCenterIcon /></Button>
      <Button variant="outline" size="icon" aria-label="Allinea a destra"><AlignRightIcon /></Button>
    </ButtonGroup>
  ),
}

/** Con un separatore, quando i due lati fanno cose diverse. */
export const ConSeparatore: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Esporta</Button>
      <ButtonGroupSeparator />
      <Button variant="outline" aria-label="Scegli il formato"><ChevronDownIcon /></Button>
    </ButtonGroup>
  ),
}

/** Con un'etichetta fissa: prefissi, unità di misura, domini. */
export const ConEtichetta: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>Revisione</ButtonGroupText>
      <Button variant="outline">4</Button>
      <Button variant="outline">Storico</Button>
    </ButtonGroup>
  ),
}

/** In verticale, per le barre laterali. */
export const Verticale: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Anagrafica</Button>
      <Button variant="outline">Documenti</Button>
      <Button variant="outline">Storico</Button>
    </ButtonGroup>
  ),
}
