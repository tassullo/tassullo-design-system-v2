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
 * Non ri-stilato: usa `bg-muted` / `text-muted-foreground`, che è una coppia
 * verificata da `check:contrast`, e `after:border-border` per il filo attorno.
 * Il default shadcn ci sta dentro — primo gradino della scala, e ci si ferma.
 *
 * **Il ripiego è la regola, non l'eccezione.** Nelle app dello studio la foto
 * non c'è quasi mai: quello che si vede sono le iniziali. Vanno scelte da chi
 * chiama — due lettere, maiuscole — perché il componente non sa come si taglia
 * un nome, e in italiano un cognome composto non si taglia come un nome inglese.
 */
const meta = {
  title: 'Primitive/Avatar',
  component: Avatar,
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Iniziali: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>FS</AvatarFallback>
    </Avatar>
  ),
}

/** Le tre taglie. Come tutto il resto, seguono la densità: `size-*` viene da `--spacing`. */
export const Taglie: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm"><AvatarFallback>FS</AvatarFallback></Avatar>
      <Avatar><AvatarFallback>FS</AvatarFallback></Avatar>
      <Avatar size="lg"><AvatarFallback>FS</AvatarFallback></Avatar>
    </div>
  ),
}

/**
 * Con l'immagine, e col ripiego che si vede se l'immagine non arriva. Il
 * secondo `src` non esiste di proposito: è il caso da guardare, perché è
 * quello che capita in produzione.
 */
export const ConImmagine: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage
          src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23F4AC3D'/%3E%3Ccircle cx='32' cy='26' r='11' fill='%23141414'/%3E%3Cpath d='M8 64c0-13 11-21 24-21s24 8 24 21z' fill='%23141414'/%3E%3C/svg%3E"
          alt="Francesco Sartori"
        />
        <AvatarFallback>FS</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/questa-immagine-non-esiste.png" alt="Maria Rossi" />
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
    </div>
  ),
}

/**
 * Il pallino di stato. È decorativo: se vuol dire qualcosa — «in linea»,
 * «verificato» — quel qualcosa va scritto anche in testo, da qualche parte
 * nella pagina. Un colore da solo non è un'informazione accessibile.
 */
export const ConPallino: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>FS</AvatarFallback>
        <AvatarBadge />
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>MR</AvatarFallback>
        <AvatarBadge><CheckIcon /></AvatarBadge>
      </Avatar>
    </div>
  ),
}

/** Il gruppo, col conteggio di chi non ci sta: firmatari, assegnatari, revisori. */
export const Gruppo: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar><AvatarFallback>FS</AvatarFallback></Avatar>
      <Avatar><AvatarFallback>MR</AvatarFallback></Avatar>
      <Avatar><AvatarFallback>GB</AvatarFallback></Avatar>
      <AvatarGroupCount>+4</AvatarGroupCount>
    </AvatarGroup>
  ),
}
