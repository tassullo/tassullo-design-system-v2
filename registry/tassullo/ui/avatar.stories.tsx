import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckIcon } from 'lucide-react'

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/registry/tassullo/ui/avatar'

/**
 * La faccia di una persona in un cerchio: una foto, oppure le sue iniziali.
 *
 * **Quando sì, quando no.** Per chi ha fatto, firmato o ha in carico qualcosa:
 * autori, assegnatari, revisori. Per l'immagine di un prodotto o di una cosa
 * c'è `entity-image`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/avatar
 * ```
 *
 * **Taglie e parti.** `size` su `Avatar`: `sm`, `default`, `lg`; seguono la
 * densità. `AvatarImage` è la foto, `AvatarFallback` il ripiego, `AvatarBadge`
 * il pallino di stato, `AvatarGroup` e `AvatarGroupCount` il gruppo con il
 * conteggio di chi non ci sta.
 *
 * **Regole d'uso.** Il ripiego è il caso normale, non l'eccezione: la foto
 * spesso non c'è, e allora si leggono le iniziali. Le sceglie chi usa il
 * componente — due lettere, maiuscole — perché il componente non sa dove si
 * taglia un nome composto. Il pallino di stato è decorativo: se dice qualcosa,
 * «in linea» o «verificato», quel qualcosa si scrive anche in testo.
 */
const meta = {
  title: 'Primitive/Avatar',
  component: Avatar,
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Le iniziali, che sono la forma più frequente.
 */
export const Iniziali: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>SB</AvatarFallback>
    </Avatar>
  ),
}

/**
 * Le tre taglie, `sm`, `default` e `lg`.
 */
export const Taglie: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm"><AvatarFallback>SB</AvatarFallback></Avatar>
      <Avatar><AvatarFallback>SB</AvatarFallback></Avatar>
      <Avatar size="lg"><AvatarFallback>SB</AvatarFallback></Avatar>
    </div>
  ),
}

/**
 * Con la foto, e accanto il ripiego che compare quando la foto non arriva.
 */
export const ConImmagine: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage
          src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23F4AC3D'/%3E%3Ccircle cx='32' cy='26' r='11' fill='%23141414'/%3E%3Cpath d='M8 64c0-13 11-21 24-21s24 8 24 21z' fill='%23141414'/%3E%3C/svg%3E"
          alt="Stefano Bertolini"
        />
        <AvatarFallback>SB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/questa-immagine-non-esiste.png" alt="Maria Rossi" />
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
    </div>
  ),
}

/**
 * Il pallino di stato (`AvatarBadge`). Il suo significato va scritto anche in
 * testo, altrove nella pagina.
 */
export const ConPallino: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>SB</AvatarFallback>
        <AvatarBadge />
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>MR</AvatarFallback>
        <AvatarBadge><CheckIcon /></AvatarBadge>
      </Avatar>
    </div>
  ),
}

/**
 * Un gruppo con il conteggio di chi non ci sta: firmatari, assegnatari,
 * revisori.
 */
export const Gruppo: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar><AvatarFallback>SB</AvatarFallback></Avatar>
      <Avatar><AvatarFallback>MR</AvatarFallback></Avatar>
      <Avatar><AvatarFallback>GB</AvatarFallback></Avatar>
      <AvatarGroupCount>+4</AvatarGroupCount>
    </AvatarGroup>
  ),
}
