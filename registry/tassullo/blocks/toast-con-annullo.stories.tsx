import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { toastConAnnullo } from '@/registry/tassullo/blocks/toast-con-annullo'
import { Button } from '@/registry/tassullo/ui/button'
import { Toaster } from '@/registry/tassullo/ui/sonner'

/**
 * Il «successo annullabile», verdetto di D18 (`docs/DECISIONI.md` §35,
 * chiusa il 2026-09-15): per i passaggi di stato reversibili — archiviare,
 * ritirare una pubblicazione — **non** un dialogo di conferma **e** un
 * annullo insieme, che sarebbero due interruzioni per un'azione sola e
 * svuoterebbero la conferma. Uno dei due, ed è questo per tutto ciò che
 * Anagrafe non cancella mai davvero, solo supera.
 *
 * ```tsx
 * toastConAnnullo(() => api.archivia(id), {
 *   messaggio: 'Scheda archiviata',
 *   descrizione: 'Tassullo T30 non compare più nell’elenco attivo.',
 * })
 * ```
 *
 * **Differita lato client, non ripristino via API** (provvisorio: da
 * rivedere con Roberto a design system finito). `azione` non parte finché il
 * toast non si chiude da sé o l'utente non lo scarta senza cliccare
 * «Annulla» — cliccarlo cancella `azione` senza mai eseguirla. Nessun
 * contratto di soft-delete richiesto al backend: l'annullo funziona sempre,
 * al costo dei cinque secondi di attesa prima che l'azione sia effettiva.
 *
 * `<Toaster />` va una volta sola in cima all'app — qui c'è in ogni story
 * perché ognuna è un'app a sé, come in `Primitive/Sonner`.
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
 * **Provato col dito.** Il pannello conta quante volte `azione` è stata
 * chiamata davvero e quante volte è stata annullata: cliccando «Annulla»
 * entro cinque secondi il contatore delle azioni resta a zero; aspettando, o
 * chiudendo il toast con la X, l'azione parte.
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
