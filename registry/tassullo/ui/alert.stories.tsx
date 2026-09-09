import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CheckCircle2Icon,
  CircleAlertIcon,
  InfoIcon,
  TriangleAlertIcon,
} from 'lucide-react'

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/registry/tassullo/ui/alert'
import { Button } from '@/registry/tassullo/ui/button'

/**
 * **I quattro livelli semantici si fanno con `className`, non con quattro
 * varianti.** È la risposta di shadcn stesso, scritta nella pagina del
 * componente: «You can customize the alert colors by adding custom classes
 * such as `bg-amber-50 dark:bg-amber-950` to the `Alert` component». Quindi
 * la scala della regola 4bis si ferma al **gradino 1** — shadcn ce l'ha già
 * — e `alert.tsx` resta identico nella forma all'originale.
 *
 * Provata anche la strada opposta, e **misurata**: aggiungere `info`,
 * `success` e `warning` come nomi di variante nel `cva` manda
 * `check:registry` in rosso — «diverge dall'originale FUORI dalle stringhe
 * di classi: nomi di varianti». Il gate ha fatto esattamente il suo mestiere.
 *
 * Quello che il design system mette di suo non è una variante: è la **terna
 * di token** `X-subtle` / `X-subtle-foreground` / `X-border`, dichiarata nel
 * tema per tutte e quattro le famiglie e verificata da `check:contrast`.
 * I quattro alert **pesano uguale** perché i tenui si specchiano a gradini
 * fissi, uguali per tutte le famiglie (`PIANO.md` §525): se una saltasse
 * all'occhio più delle altre, quell'avviso sembrerebbe più grave di quello
 * che è.
 *
 * L'unica cosa ri-stilata nel file è `destructive`, che il preset dava come
 * `bg-card text-destructive` — l'arancio-rosso pieno come **testo**, che è
 * la **quinta** volta che shadcn ripete la stessa trappola (le altre quattro
 * in M2.2 e M2.3). Misurato in M2.2: **4.46:1 in chiaro, 3.53:1 su card in
 * scuro**, cioè sotto soglia in entrambe. Ora usa la stessa terna tenue
 * delle altre tre.
 */
const meta = {
  title: 'Primitive/Alert',
  component: Alert,
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive'] },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <Alert>
      <InfoIcon />
      <AlertTitle>Scheda salvata</AlertTitle>
      <AlertDescription>
        Le modifiche sono state registrate. La revisione precedente resta
        consultabile nello storico.
      </AlertDescription>
    </Alert>
  ),
}

/**
 * I quattro livelli, uno sotto l'altro, per vedere che **pesano uguale**.
 * Le tre righe di classi sono la ricetta del design system: si scrivono qui
 * una volta, e i blocchi di FASE 3 (`error-state`, `empty-state`) le
 * incorporano, così nessuna app se le reinventa in casa.
 */
export const QuattroLivelli: Story = {
  render: () => (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <Alert className="border-info-border bg-info-subtle text-info-subtle-foreground *:data-[slot=alert-description]:text-info-subtle-foreground">
        <InfoIcon />
        <AlertTitle>Revisione in corso</AlertTitle>
        <AlertDescription>
          La scheda è in attesa di approvazione da parte dell'ufficio tecnico.
        </AlertDescription>
      </Alert>

      <Alert className="border-success-border bg-success-subtle text-success-subtle-foreground *:data-[slot=alert-description]:text-success-subtle-foreground">
        <CheckCircle2Icon />
        <AlertTitle>Scheda approvata</AlertTitle>
        <AlertDescription>
          La revisione 4 è pubblicata e visibile in officina.
        </AlertDescription>
      </Alert>

      <Alert className="border-warning-border bg-warning-subtle text-warning-subtle-foreground *:data-[slot=alert-description]:text-warning-subtle-foreground">
        <TriangleAlertIcon />
        <AlertTitle>Certificato in scadenza</AlertTitle>
        <AlertDescription>
          Il certificato di conformità scade fra 14 giorni.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Scheda revocata</AlertTitle>
        <AlertDescription>
          Il prodotto non è più conforme alla norma citata. Non utilizzare.
        </AlertDescription>
      </Alert>
    </div>
  ),
}

/** Senza descrizione: una riga sola, che è la forma più usata in campo. */
export const SoloTitolo: Story = {
  render: () => (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <Alert className="border-success-border bg-success-subtle text-success-subtle-foreground">
        <CheckCircle2Icon />
        <AlertTitle>Importazione completata: 128 righe</AlertTitle>
      </Alert>
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Importazione fallita alla riga 42</AlertTitle>
      </Alert>
    </div>
  ),
}

/**
 * Con l'azione. `AlertAction` è posizionato in assoluto in alto a destra dal
 * componente: il contenuto gli fa spazio da sé (`has-data-[slot=alert-action]`),
 * senza che la pagina debba saperlo.
 */
export const ConAzione: Story = {
  render: () => (
    <Alert className="w-full max-w-2xl border-warning-border bg-warning-subtle text-warning-subtle-foreground *:data-[slot=alert-description]:text-warning-subtle-foreground">
      <TriangleAlertIcon />
      <AlertTitle>Allegato mancante</AlertTitle>
      <AlertDescription>
        La scheda non ha il disegno tecnico in allegato.
      </AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          Carica
        </Button>
      </AlertAction>
    </Alert>
  ),
}

/**
 * Senza icona: la griglia passa a una colonna sola e il testo parte a
 * sinistra. Vale la pena guardarla, perché è la forma che esce quando si
 * dimentica l'icona — e non deve sembrare rotta.
 */
export const SenzaIcona: Story = {
  render: () => (
    <Alert className="w-full max-w-2xl">
      <AlertTitle>Nessuna icona</AlertTitle>
      <AlertDescription>
        L'icona è decorativa: il livello dell'avviso deve leggersi dal testo,
        non solo dal colore.
      </AlertDescription>
    </Alert>
  ),
}
