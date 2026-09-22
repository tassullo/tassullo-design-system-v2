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
 * Lo stato vuoto: ciò che si vede al posto di un contenuto che non c'è — un
 * elenco senza righe, una ricerca senza risultati — con cosa fare adesso.
 *
 * **Quando sì, quando no.** È la primitiva da comporre. Per una pagina o una
 * sezione vuota, o in errore, con testi e azioni già pronti, ci sono i blocchi
 * `Stato vuoto` e `Stato di errore`, che la usano. Un avviso dentro una pagina
 * che ha contenuto è un `alert`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/empty
 * ```
 *
 * **Parti e varianti.** `EmptyHeader` con `EmptyMedia`, `EmptyTitle` ed
 * `EmptyDescription`; `EmptyContent` per le azioni. `EmptyMedia` ha `variant`:
 * `default` (l'icona nuda) o `icon` (l'icona in un riquadro tenue).
 *
 * **Regole d'uso.** Lo stato vuoto dice anche cosa fare: se c'è un'azione
 * possibile, la mostra. Il bordo tratteggiato non c'è di base: si ottiene
 * aggiungendo `className="border"`.
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

/**
 * Con l'azione: lo stato vuoto dice cosa fare adesso.
 */
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
 * Col bordo tratteggiato, che si accende aggiungendo `border`.
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

/**
 * Uno stato d'errore, l'altro uso della stessa primitiva.
 */
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
