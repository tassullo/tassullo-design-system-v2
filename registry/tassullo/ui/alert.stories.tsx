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
 * Un avviso dentro la pagina: dice qualcosa che chi legge deve sapere adesso,
 * senza interrompere quello che sta facendo.
 *
 * **Quando sì, quando no.** Per un messaggio che resta dov'è finché la
 * condizione dura — un documento in scadenza, un dato mancante, un errore di
 * caricamento. Un messaggio che passa e se ne va è un toast (`sonner`); una
 * decisione da prendere prima di andare avanti è un `alert-dialog`. Per la
 * pagina intera vuota o in errore ci sono i blocchi `Stato vuoto` e
 * `Stato di errore`, che già lo usano.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/alert
 * ```
 *
 * **Varianti.** `variant`: `default` (neutro, sul fondo della card) e
 * `destructive`. I livelli `info`, `success` e `warning` non sono varianti: si
 * applicano con `className`, prendendo la stringa pronta da `TONO_ALERT`
 * dell'item `toni`, che tiene i quattro livelli in un posto solo.
 *
 * ```tsx
 * import { TONO_ALERT } from '@/lib/toni'
 *
 * <Alert className={TONO_ALERT.warning}>…</Alert>
 * ```
 *
 * **Regole d'uso.** I quattro livelli pesano uguale, in chiaro e in scuro: la
 * gravità la dice il testo, non un colore più acceso degli altri. L'icona va
 * messa: è ciò che distingue i livelli per chi non distingue i colori.
 * `AlertAction` si mette in alto a destra da sé, e il testo gli fa spazio.
 *
 * **Accessibilità.** L'alert ha `role="alert"`: comparendo, viene letto subito
 * dal lettore di schermo. Per un contenuto già presente al caricamento che non
 * è un avviso, non si usa.
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
 * I quattro livelli uno sotto l'altro: nessuno salta all'occhio più degli
 * altri. Da guardare anche in scuro.
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

/**
 * Senza descrizione: una riga sola, la forma più usata.
 */
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
 * Con un'azione (`AlertAction`), che sta in alto a destra; il contenuto le fa
 * spazio da sé.
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
 * Senza icona: il testo parte a sinistra su una colonna sola, e l'avviso resta
 * composto.
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
