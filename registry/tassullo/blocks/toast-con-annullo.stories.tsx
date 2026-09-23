import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { toastConAnnullo } from '@/registry/tassullo/blocks/toast-con-annullo'
import { Button } from '@/registry/tassullo/ui/button'
import { Toaster } from '@/registry/tassullo/ui/sonner'

/**
 * L'avviso che un'azione è fatta, con il bottone «Annulla» per qualche
 * secondo: l'azione parte davvero solo quando l'avviso se ne va.
 *
 * **Quando sì, quando no.** Si usa per le azioni che si possono disfare —
 * archiviare, ritirare una pubblicazione, togliere un elemento da un gruppo —
 * al posto di una domanda di conferma. Per ciò che non si disfa si chiede
 * prima, con `tassullo-confirm-dialog`; mai tutti e due per la stessa azione.
 * Un avviso senza annullo è `toast` della primitiva `sonner`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-toast-con-annullo
 * ```
 *
 * ```tsx
 * toastConAnnullo(() => api.archivia(id), {
 *   messaggio: 'Scheda archiviata',
 *   descrizione: 'La scheda non compare più nell’elenco attivo.',
 * })
 * ```
 *
 * **Le opzioni.** `toastConAnnullo(azione, opzioni)`: `messaggio`, al
 * passato, perché agli occhi di chi guarda è già successo; `descrizione`;
 * `durata` in millisecondi, 5000 se non si passa; `etichettaAnnulla`,
 * «Annulla» se non si passa; `onAnnulla`, chiamata quando si annulla.
 *
 * **Regole d'uso.**
 *
 * - L'azione è differita: parte quando l'avviso scade o viene chiuso senza
 *   annullare, e con «Annulla» non parte mai. Il backend non deve saper
 *   ripristinare niente, ma l'effetto arriva dopo la durata.
 * - `<Toaster />` va una volta sola, alla radice dell'applicativo.
 *
 * **Tastiera e accessibilità.** L'avviso si annuncia ai lettori di schermo
 * senza prendere il fuoco. `Alt`+`T` porta il fuoco sugli avvisi, e da lì
 * «Annulla» si raggiunge col `Tab`.
 */
const meta = {
  title: 'Blocchi/Toast con annullo',
  component: Toaster,
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Il bottone archivia la scheda e mostra l'avviso con «Annulla».
 */
export const Predefinito: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toastConAnnullo(() => {}, {
          messaggio: 'Scheda archiviata',
          descrizione: 'Tassullo T30 non compare più nell’elenco attivo.',
        })
      }
    >
      Archivia la scheda
    </Button>
  ),
}

/**
 * Il contatore mostra quante azioni sono partite e quante sono state
 * annullate: con «Annulla» entro cinque secondi l'azione non parte; aspettando,
 * o chiudendo l'avviso, parte.
 */
export const Verificabile: Story = {
  render: function Render() {
    const [eseguite, setEseguite] = useState(0)
    const [annullate, setAnnullate] = useState(0)
    return (
      <div className="flex flex-col items-start gap-3">
        <Button
          variant="outline"
          onClick={() =>
            toastConAnnullo(() => setEseguite((n) => n + 1), {
              messaggio: 'Prodotto rimosso dalla famiglia',
              onAnnulla: () => setAnnullate((n) => n + 1),
            })
          }
        >
          Rimuovi dalla famiglia
        </Button>
        <p className="text-sm text-muted-foreground" data-testid="conteggio">
          Eseguite: {eseguite} · Annullate: {annullate}
        </p>
      </div>
    )
  },
}
