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
import { Button } from '@/registry/tassullo/ui/button'

/**
 * **Nessun ri-stile.** Come per il `dialog`, il preset poggia già sui token.
 * I due `grid-rows-[auto_1fr]` restano ereditati: un elenco di tracce di
 * griglia non è una lunghezza né un colore, e Tailwind non ha un gradino per
 * dirlo — stessa famiglia del `transition-[color,box-shadow]` accertata in
 * M2.2.
 *
 * **Perché esiste separato da `Dialog`, che sembra identico.** Perché la
 * differenza non si vede: `AlertDialog` **non si chiude cliccando fuori**. È
 * l'unica cosa che lo distingue, ed è tutto il suo scopo. Si usa dove la fuga
 * accidentale cancella lavoro — eliminare una scheda, revocare un ruolo,
 * scartare una revisione — e in nessun altro posto. Un `AlertDialog` usato
 * per una notifica è solo un dialog che non si riesce a chiudere.
 *
 * `Esc` invece chiude: è una via d'uscita da tastiera, e toglierla sarebbe
 * WCAG 2.1.2. La protezione è contro il clic distratto, non contro l'intento.
 *
 * **La regola delle due trappole vale anche qui.** L'azione distruttiva è un
 * bottone `variant="destructive"` — arancione mai, rosso come **fondo** e non
 * come testo. Il `text-destructive` come colore di testo è il difetto già
 * chiuso su `badge` (M2.1), `field` (M2.2) e sui menu di questa sessione.
 */
const meta = {
  title: 'Primitive/Alert Dialog',
  component: AlertDialog,
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
 * il testo si allinea a bandiera; su schermo stretto va sopra e tutto si
 * centra. È il preset, e non c'è un `if` da scrivere.
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
 * La revoca di un ruolo: distruttiva ma non irreversibile, quindi l'azione
 * non è rossa. **Il rosso è per ciò che non si recupera**; qui il ruolo si
 * riassegna. Distinguere le due cose è ciò che tiene al rosso il suo peso.
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
 * La taglia `sm`: il piè di pagina diventa due colonne uguali, e le azioni
 * hanno la stessa larghezza. Serve alle conferme brevissime, dove leggere due
 * bottoni di larghezza diversa è più lento che leggerne due uguali.
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
