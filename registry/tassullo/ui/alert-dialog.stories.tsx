import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrashIcon, ShieldOffIcon, TriangleAlertIcon } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/registry/tassullo/ui/alert-dialog'
import { apriCol } from '@/prove/apri'
import { Button } from '@/registry/tassullo/ui/button'

/**
 * Una conferma che non si chiude per sbaglio: chiede di decidere prima di
 * un'azione che non si può annullare, e non si chiude cliccando fuori.
 *
 * **Quando sì, quando no.** Solo dove una chiusura distratta costerebbe lavoro
 * — eliminare una scheda, revocare un ruolo, scartare le modifiche. Per tutto
 * il resto che si apre sopra la pagina — un modulo, un dettaglio, un avviso da
 * leggere — c'è `dialog`, che si chiude anche col clic fuori. Su telefono, per
 * gli stessi contenuti, c'è `drawer`, che si apre dal basso e si trascina; un
 * pannello di lavoro che resta accostato a un lato dello schermo è `sheet`.
 * Per una conferma pronta, testo e bottoni inclusi, c'è il blocco
 * `Dialogo di conferma`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/alert-dialog
 * ```
 *
 * **Varianti e taglie.** `size` su `AlertDialogContent`: `default`, oppure
 * `sm` per le conferme brevissime, dove le due azioni diventano due colonne
 * della stessa larghezza. `AlertDialogMedia` aggiunge un'icona in testa.
 * `AlertDialogAction` prende le varianti di `button`.
 *
 * **Regole d'uso.** L'azione che distrugge qualcosa di irrecuperabile è
 * `variant="destructive"`; quella che si può rifare — un ruolo che si
 * riassegna — resta nella variante di base. Il rosso vale solo se è raro.
 * `AlertDialogTitle` è obbligatorio: è il nome con cui la finestra si
 * annuncia.
 *
 * **Tastiera e accessibilità.** All'apertura il fuoco entra nella finestra e
 * `Tab` gira al suo interno senza uscire; `Esc` chiude, perché una via
 * d'uscita da tastiera c'è sempre; alla chiusura il fuoco torna sul bottone
 * che l'aveva aperta. Il clic fuori, invece, non chiude.
 */
const meta = {
  title: 'Primitive/Alert Dialog',
  component: AlertDialog,
  // Si misura **aperto**: chiuso il popup non esiste e axe non ha niente
  // da guardare. L'imbracatura dichiara qui quale popup apre (`@/prove/apri`).
  play: apriCol('[data-slot="alert-dialog-trigger"]', 'alert-dialog-content'),
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Elimina scheda
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminare la scheda T30?</AlertDialogTitle>
          <AlertDialogDescription>
            La scheda e le sue quattro revisioni vengono rimosse
            dall'anagrafe. L'operazione non si può annullare.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Elimina</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/**
 * Con l'icona (`AlertDialogMedia`). Su schermo largo l'icona sta a sinistra e
 * il testo a bandiera; su schermo stretto va sopra e tutto si centra, senza
 * nulla da scrivere nella pagina.
 */
export const ConIcona: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        <TrashIcon />
        Elimina revisione
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Eliminare la revisione 03?</AlertDialogTitle>
          <AlertDialogDescription>
            È l'ultima revisione pubblicata. Eliminandola, la scheda torna a
            mostrare la revisione 02 del 14 marzo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Elimina</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/**
 * Un'azione distruttiva ma recuperabile: il ruolo si riassegna, quindi il
 * bottone di conferma non è rosso.
 */
export const RevocaRuolo: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        <ShieldOffIcon />
        Revoca accesso
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revocare il ruolo Redattore?</AlertDialogTitle>
          <AlertDialogDescription>
            L'utente conserva la lettura dell'anagrafe ma non potrà più
            modificare le schede. Il ruolo si può riassegnare in qualsiasi
            momento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction>Revoca</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/**
 * La taglia `sm`: le due azioni hanno la stessa larghezza e si leggono come
 * una scelta secca.
 */
export const Compatto: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Scarta le modifiche
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Scartare le modifiche?</AlertDialogTitle>
          <AlertDialogDescription>
            Le modifiche non salvate andranno perse.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continua</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Scarta</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}
