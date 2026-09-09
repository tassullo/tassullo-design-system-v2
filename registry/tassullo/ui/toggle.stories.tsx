import type { Meta, StoryObj } from '@storybook/react-vite'
import { BoldIcon, ItalicIcon, PinIcon, StarIcon, UnderlineIcon } from 'lucide-react'

import { Toggle } from '@/registry/tassullo/ui/toggle'

/**
 * **Il nome dice la funzione, non l'aspetto.** `Toggle` è un bottone che
 * **resta premuto**: ha due stati e li ricorda. Non è un `badge` (etichetta
 * che si legge), non è un `checkbox` (casella dentro un modulo, che si invia),
 * non è un `switch` (interruttore che accende qualcosa subito e non torna
 * indietro da solo). È il grassetto della barra strumenti, il «solo i miei»
 * sopra una lista, il puntina che tiene aperta una colonna.
 *
 * Da tastiera: `Tab` lo raggiunge, `Spazio` e `Invio` lo commutano. Porta
 * `aria-pressed`, quindi il lettore di schermo annuncia «premuto / non
 * premuto» senza che si aggiunga nulla.
 *
 * ## Un ri-stile, ed è il terzo della stessa famiglia
 *
 * Taglia `sm`: `rounded-[min(var(--radius-md),12px)] text-[0.8rem]` →
 * `rounded-md text-sm`. È la stessa correzione fatta al `button` in M2.1 e al
 * `select` in M2.2, e per la stessa ragione: **`text-[0.8rem]` è un valore
 * arbitrario, quindi non segue la densità**. In touch il resto del componente
 * cresce di un terzo e il testo resta fermo a 12.8px. Il `min()` sul raggio
 * metteva un tetto a un `--radius-md` grande; il nostro è 6px, quindi il
 * risultato è identico al pixel, ma ora è il gradino del tema e segue il tema
 * se cambia.
 *
 * ## Un difetto noto e **accettato**: premuto e sorvolato sono lo stesso grigio
 *
 * Il preset scrive `hover:bg-muted` e `aria-pressed:bg-muted`: la stessa
 * classe per due stati diversi. Misurato — un `Toggle` spento con il puntatore
 * sopra e un `Toggle` acceso rendono **lo stesso fondo**, quindi mentre si
 * passa sopra una fila di filtri non si sa più quali erano accesi. Con la
 * variante `outline` il bordo non aiuta: è lo stesso in tutti e due i casi.
 *
 * **Non si corregge, per decisione di Francesco del 2026-09-09**: l'arancio
 * del brand resta ai bottoni d'azione e alle cose importanti, e tingere ogni
 * filtro acceso lo farebbe smettere di segnalare. Si riprende in **FASE 4**,
 * sulle pagine modello, dove si vedrà quanti filtri accesi stanno davvero su
 * una barra vera. Il confronto completo — arancio pieno del v1 e arancio
 * tenue, in chiaro e in scuro — è il verbale in `Primitive/ToggleGroup` →
 * `Acceso: la scelta del grigio`; qui sotto resta la misura del difetto.
 */
const meta = {
  title: 'Primitive/Toggle',
  component: Toggle,
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <Toggle aria-label="Metti in evidenza">
      <StarIcon />
      In evidenza
    </Toggle>
  ),
}

/**
 * Le due varianti. `default` non ha contorno e vive dentro una barra
 * strumenti, dove il vicino di casa fa da riquadro; `outline` ha il proprio
 * bordo e regge da sola, sopra una lista.
 */
export const Varianti: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle aria-label="Predefinito, spento">Predefinito</Toggle>
      <Toggle defaultPressed aria-label="Predefinito, acceso">
        Predefinito acceso
      </Toggle>
      <Toggle variant="outline" aria-label="Contornato, spento">
        Contornato
      </Toggle>
      <Toggle variant="outline" defaultPressed aria-label="Contornato, acceso">
        Contornato acceso
      </Toggle>
    </div>
  ),
}

/**
 * Le tre taglie. In densità normale sono 28, 32 e 36px; in touch
 * diventano 42, 48 e 54 — **testo compreso**, che è ciò che il ri-stile ha
 * comprato.
 */
export const Taglie: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle size="sm" variant="outline">
        Piccolo
      </Toggle>
      <Toggle size="default" variant="outline">
        Normale
      </Toggle>
      <Toggle size="lg" variant="outline">
        Grande
      </Toggle>
    </div>
  ),
}

/**
 * Con la sola icona il nome accessibile non c'è più: **serve `aria-label`**,
 * o il lettore di schermo annuncia un bottone senza nome (axe `button-name`,
 * la stessa trappola trovata sul rail della sidebar in M2.5).
 */
export const SoloIcona: Story = {
  render: () => (
    <div className="flex items-center gap-1 rounded-lg border border-border p-1">
      <Toggle aria-label="Grassetto">
        <BoldIcon />
      </Toggle>
      <Toggle aria-label="Corsivo">
        <ItalicIcon />
      </Toggle>
      <Toggle aria-label="Sottolineato">
        <UnderlineIcon />
      </Toggle>
    </div>
  ),
}

export const Disabilitato: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle variant="outline" disabled>
        <PinIcon />
        Spento e disabilitato
      </Toggle>
      <Toggle variant="outline" defaultPressed disabled>
        <PinIcon />
        Acceso e disabilitato
      </Toggle>
    </div>
  ),
}

/**
 * **Il rilievo, messo in fila.** Da sinistra: spento, spento **con il
 * puntatore sopra** (qui simulato con la classe che il sorvolo applica), e
 * acceso. I due a destra sono identici — stesso fondo, stesso bordo, stesso
 * testo — e non c'è modo di sapere quale dei due è il filtro attivo.
 *
 * L'ultima coppia mostra il rimedio proposto a M2.9, scritto solo con token
 * del tema: fondo `primary-subtle`, bordo `primary-border`, testo
 * `accent-ink` — l'arancio leggibile, mai `text-primary`. Lì la differenza si
 * vede senza doverla cercare, in chiaro e in scuro.
 */
export const SpentoSorvolatoAcceso: Story = {
  name: 'Spento, sorvolato, acceso',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Toggle variant="outline">Spento</Toggle>
        <Toggle variant="outline" className="bg-muted text-foreground">
          Spento, sorvolato
        </Toggle>
        <Toggle variant="outline" defaultPressed>
          Acceso
        </Toggle>
      </div>
      <div className="flex items-center gap-4">
        <Toggle variant="outline">Spento</Toggle>
        <Toggle variant="outline" className="bg-muted text-foreground">
          Spento, sorvolato
        </Toggle>
        <Toggle
          variant="outline"
          defaultPressed
          className="aria-pressed:border-primary-border aria-pressed:bg-primary-subtle aria-pressed:text-accent-ink"
        >
          Acceso, rimedio proposto
        </Toggle>
      </div>
    </div>
  ),
}
