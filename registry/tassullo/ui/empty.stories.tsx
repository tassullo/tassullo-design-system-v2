import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileSearchIcon, FolderOpenIcon, PlugZapIcon } from 'lucide-react'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/registry/tassullo/ui/empty'
import { Button } from '@/registry/tassullo/ui/button'

/**
 * La primitiva dello stato vuoto. **È il mattone, non il blocco**: il
 * blocco `empty-state` di M3.5 ci si appoggia sopra e fissa lo standard unico
 * di caricamento/errore/vuoto/successo richiesto da INTERFACCE.md §1 di
 * Anagrafe. Qui si guarda la forma nuda.
 *
 * Un ri-stile solo, e di nuovo la stessa trappola: `EmptyDescription` dava ai
 * link `hover:text-primary`, cioè l'arancio del brand come **testo**, che in
 * modalità chiara fa **1.79:1**. Ora è `text-accent-ink`, il token che esiste
 * proprio per questo e che è corretto in **entrambe** le modalità. È la sesta
 * volta che il preset ripete `text-primary`/`text-destructive` come testo:
 * conviene cercarla per prima cosa in ogni componente nuovo.
 *
 * **Una cosa del preset che non ho toccato, ma che va saputa**: la classe base
 * porta `border-dashed` senza `border`, quindi **il bordo tratteggiato non si
 * vede** finché non si passa `className="border"`. È così anche in shadcn — è
 * la loro forma, non un nostro difetto — e si vede in `ConBordo`. Aggiungere
 * `border` alla base cambierebbe la resa predefinita di ogni stato vuoto di
 * ogni app: è una scelta di sistema, non una correzione di passaggio, e
 * spetta a M3.5 che è il primo consumatore vero.
 */
const meta = {
  title: 'Primitive/Empty',
  component: Empty,
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpenIcon />
        </EmptyMedia>
        <EmptyTitle>Nessuna scheda in questa cartella</EmptyTitle>
        <EmptyDescription>
          Le schede tecniche pubblicate compariranno qui.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
}

/** Con l'azione: lo stato vuoto dice anche **cosa fare adesso**. */
export const ConAzione: Story = {
  render: () => (
    <Empty className="max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileSearchIcon />
        </EmptyMedia>
        <EmptyTitle>Nessun risultato per «guaina 40»</EmptyTitle>
        <EmptyDescription>
          Prova con un codice più corto, oppure{' '}
          <a href="#tutte">sfoglia tutte le schede</a>.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Azzera i filtri</Button>
      </EmptyContent>
    </Empty>
  ),
}

/**
 * Col bordo tratteggiato, che è la forma che quasi tutti si aspettano: si
 * ottiene aggiungendo `border`, perché la base porta solo `border-dashed`.
 */
export const ConBordo: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <Empty className="w-72">
        <EmptyHeader>
          <EmptyTitle>Senza `border`</EmptyTitle>
          <EmptyDescription>Il tratteggio non si vede.</EmptyDescription>
        </EmptyHeader>
      </Empty>
      <Empty className="w-72 border">
        <EmptyHeader>
          <EmptyTitle>Con `border`</EmptyTitle>
          <EmptyDescription>Il tratteggio si vede.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  ),
}

/** Uno stato d'errore, che è l'altro uso della stessa primitiva. */
export const Errore: Story = {
  render: () => (
    <Empty className="max-w-md border border-destructive-border bg-destructive-subtle text-destructive-subtle-foreground">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-destructive-subtle-foreground/10">
          <PlugZapIcon />
        </EmptyMedia>
        <EmptyTitle>Archivio non raggiungibile</EmptyTitle>
        <EmptyDescription className="text-destructive-subtle-foreground">
          Il servizio schede non risponde. Riprova fra qualche minuto.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="outline">
          Riprova
        </Button>
      </EmptyContent>
    </Empty>
  ),
}
