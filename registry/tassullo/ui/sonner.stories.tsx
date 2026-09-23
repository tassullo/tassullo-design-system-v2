import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'

import { Button } from '@/registry/tassullo/ui/button'
import { ButtonGroup } from '@/registry/tassullo/ui/button-group'
import { Toaster } from '@/registry/tassullo/ui/sonner'

/**
 * Un avviso breve che compare in un angolo dello schermo dopo un'azione, e
 * sparisce da solo: «Scheda salvata», «Esportazione in corso».
 *
 * **Quando sì, quando no.** Conferma ciò che è andato bene, o segnala ciò che
 * si può ignorare. Ciò che va letto e riletto non va in un avviso che sparisce:
 * un errore che blocca il lavoro sta nella pagina, in un `alert` o nel
 * messaggio d'errore del `field`. Per un'azione che si può annullare c'è il
 * blocco `tassullo-toast-con-annullo`, che ha già il tempo e il bottone.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/sonner
 * ```
 *
 * **Forme.** Si chiamano con la funzione `toast` di `sonner`: `toast(…)`,
 * `toast.success`, `toast.info`, `toast.warning`, `toast.error`, e
 * `toast.promise` per un'operazione che finisce bene o male. Le opzioni
 * `description` e `action` aggiungono una riga e un bottone.
 *
 * **Regole d'uso.**
 *
 * - `<Toaster />` si mette una volta sola, alla radice dell'app. Le scene di
 *   questa pagina ce l'hanno ciascuna perché ognuna è un'app a sé.
 * - I colori arrivano dai token del tema e seguono la modalità da soli. Il
 *   componente importa `next-themes`, ma non serve il suo provider. Per
 *   forzare una modalità si passa `theme` al `Toaster`.
 * - Un'azione dentro l'avviso è una comodità, mai l'unica via: l'avviso
 *   sparisce, e la stessa cosa si deve poter fare dalla pagina.
 * - Il titolo è una frase breve; la descrizione, se c'è, dice di che cosa si
 *   parla.
 *
 * **Tastiera e accessibilità.** Gli avvisi arrivano in una regione che il
 * lettore di schermo legge senza interrompere ciò che sta dicendo. `Alt`+`T`
 * porta il fuoco sugli avvisi; mentre il puntatore o il fuoco ci stanno sopra,
 * restano aperti.
 */
const meta = {
  title: 'Primitive/Sonner',
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
 * Un avviso con titolo e descrizione.
 */
export const Predefinito: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast('Scheda salvata', { description: 'Revisione 04 — 2 settembre 2026' })}
    >
      Salva la scheda
    </Button>
  ),
}

/**
 * Le cinque forme: successo, informazione, avviso, errore e un'operazione in
 * corso che finisce con successo. Icone e colori sono già dentro.
 */
export const Semantici: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" onClick={() => toast.success('Revisione pubblicata')}>
        Successo
      </Button>
      <Button variant="outline" onClick={() => toast.info('Tre schede in attesa di revisione')}>
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning('Il lotto 24-0417 scade fra 30 giorni')}
      >
        Avviso
      </Button>
      <Button variant="outline" onClick={() => toast.error('Salvataggio non riuscito')}>
        Errore
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(new Promise((r) => setTimeout(r, 2000)), {
            loading: 'Esportazione in corso…',
            success: 'PDF pronto',
            error: 'Esportazione non riuscita',
          })
        }
      >
        In corso
      </Button>
    </ButtonGroup>
  ),
}

/**
 * Un avviso con «Annulla»: una comodità, perché la stessa azione resta nella
 * pagina.
 */
export const ConAzione: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast('Scheda archiviata', {
          description: 'Tassullo T30 non compare più nell’elenco attivo.',
          action: { label: 'Annulla', onClick: () => toast.success('Ripristinata') },
        })
      }
    >
      Archivia la scheda
    </Button>
  ),
}

/**
 * Tre avvisi di fila: si impilano, il più recente davanti.
 */
export const InCoda: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        toast.success('Scheda T30 salvata')
        toast.success('Scheda T42 salvata')
        toast.warning('Scheda C15: campo granulometria vuoto')
      }}
    >
      Salva tre schede
    </Button>
  ),
}
