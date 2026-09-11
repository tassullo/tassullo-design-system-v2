import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckIcon, ClockIcon, TriangleAlertIcon } from 'lucide-react'

import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'

/**
 * **Il badge è un'etichetta che SI LEGGE, non un filtro che si clicca.** La
 * confusione fra i due è costata riscritture ripetute nel v1, ed è la prima
 * regola del CLAUDE.md sui nomi: il filtro cliccabile è `toggle-group`, e
 * arriva in M2.6. Se un badge sembra premibile, è il componente sbagliato.
 *
 * Tre cose ri-stilate rispetto al preset, e sono le stesse trappole del
 * bottone — il preset ci era cascato due volte:
 *
 * · `destructive` era `bg-destructive/10 text-destructive`, cioè un rosso su
 *   un velo di rosso: sotto soglia. Ora usa la famiglia **tenue** del tema
 *   (`destructive-subtle` + il suo testo + il suo bordo), che è la terna per
 *   cui il tema dichiara i tre valori insieme e che `check:contrast` verifica.
 * · `link` usava `text-primary` — di nuovo l'arancio del brand come testo.
 * · la forma: `rounded-4xl` è una pillola, i badge Tassullo sono a 4px; e il
 *   corpo passa da 11 a 12px, che è il gradino che il v1 dà ai badge.
 */
const meta = {
  title: 'Primitive/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    },
  },
  args: { children: 'Etichetta' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {}

export const Varianti: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge {...args} variant="default">Default</Badge>
      <Badge {...args} variant="secondary">Secondary</Badge>
      <Badge {...args} variant="destructive">Destructive</Badge>
      <Badge {...args} variant="outline">Outline</Badge>
      <Badge {...args} variant="ghost">Ghost</Badge>
      <Badge {...args} variant="link">Link</Badge>
    </div>
  ),
}

/** Con l'icona: resta un'etichetta, l'icona è decorativa e il testo la spiega. */
export const ConIcona: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="secondary"><CheckIcon />Approvato</Badge>
      <Badge variant="outline"><ClockIcon />In attesa</Badge>
      <Badge variant="destructive"><TriangleAlertIcon />Scaduto</Badge>
    </div>
  ),
}

/**
 * Gli stati di una scheda prodotto di Anagrafe, che è il caso d'uso vero:
 * una parola, un colore, nessuna azione.
 */
export const StatiDiScheda: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="secondary">Bozza</Badge>
      <Badge variant="default">Pubblicato</Badge>
      <Badge variant="outline">Archiviato</Badge>
      <Badge variant="destructive">Revocato</Badge>
    </div>
  ),
}

/**
 * **I quattro toni semantici si fanno con `className`, non con quattro
 * varianti** — ed è la risposta di shadcn stesso, scritta nella sezione
 * *Custom Colors* della pagina del badge: «You can customize the colors of a
 * badge by adding custom classes such as `bg-green-50 dark:bg-green-800`». La
 * sua API Reference elenca sei varianti — `default`, `secondary`,
 * `destructive`, `outline`, `ghost`, `link` — e nessuna semantica. La scala
 * della regola 4bis si ferma quindi al **gradino 1**, e `badge.tsx` resta
 * identico all&apos;originale nella forma.
 *
 * La strada opposta era già stata **provata e misurata**, in M2.4 sugli alert:
 * aggiungere `info`, `success` e `warning` ai nomi di variante del `cva` manda
 * `check:registry` in rosso — «diverge dall&apos;originale FUORI dalle
 * stringhe di classi: nomi di varianti». Il gate fa il suo mestiere: un nome
 * di variante in più non si distingue da ciò che ha cambiato shadcn quando
 * esce una versione nuova, e la scelta diventa «riscrivo tutto» oppure «resto
 * indietro per sempre».
 *
 * Shadcn però si ferma un passo prima di dove serve a noi: il suo esempio
 * scrive `bg-green-50` **a mano, nel punto d&apos;uso**. Da noi i colori
 * escono dai token del tema (regola 3), e soprattutto un badge di stato si
 * scrive **dentro la definizione di colonna di ogni tabella di ogni app** —
 * una terna di classi ripetuta lì è il punto esatto da cui le app del v1 hanno
 * cominciato a divergere. Le terne stanno quindi in `lib/toni`, in un posto
 * solo:
 *
 * ```tsx
 * import { TONO } from '@/lib/toni'
 *
 * <Badge className={TONO.success}>Attivo</Badge>
 * ```
 *
 * `destructive` c&apos;è **anche** come variante, ed è la sola delle quattro:
 * chi ne usa una sola usi quella. `TONO.destructive` serve a chi mappa tutti e
 * quattro gli stati dalla stessa parte e non vuole che uno solo arrivi per
 * un&apos;altra strada.
 *
 * Il **neutro** non è una famiglia semantica e non ha token propri: è lo stato
 * che non dice niente — «archiviato», «non applicabile» — e sta nella mappa
 * perché una tabella di stati che lo lascia fuori costringe a uscire dal file
 * per un caso solo.
 *
 * I quattro **pesano uguale**, ed è costruito: nella modalità scura i tenui si
 * specchiano a gradini fissi, uguali per tutte le famiglie. Se una saltasse
 * all&apos;occhio più delle altre, quello stato sembrerebbe più grave di
 * quello che è. Da guardare commutando la modalità, che è la prova.
 */
export const ToniSemantici: Story = {
  name: 'Toni Semantici',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge className={TONO.success}>Attivo</Badge>
      <Badge className={TONO.info}>In revisione</Badge>
      <Badge className={TONO.warning}>In scadenza</Badge>
      <Badge className={TONO.destructive}>Scaduto</Badge>
      <Badge className={TONO.neutro}>Archiviato</Badge>
    </div>
  ),
}
