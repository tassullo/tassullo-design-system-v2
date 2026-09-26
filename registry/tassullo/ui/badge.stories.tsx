import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckIcon, ClockIcon, TriangleAlertIcon } from 'lucide-react'

import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'

/**
 * Un'etichetta che si legge: una parola breve che dice lo stato o la categoria
 * di qualcosa — «Pubblicata», «In revisione», «Bozza».
 *
 * **Quando sì, quando no.** Il badge non si clicca. Se l'elemento serve a
 * scegliere o filtrare, è un filtro che si clicca e si usa `toggle-group`; se
 * porta a un'altra pagina, è un collegamento o un `button`. Un badge che
 * sembra da premere è il componente sbagliato. Per un conteggio accanto a una
 * voce di menu, `SidebarMenuBadge`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/badge
 * ```
 *
 * **Varianti.** `variant`: `default`, `secondary`, `destructive`, `outline`,
 * `ghost`, `link`. I toni semantici — successo, informazione, avviso, errore,
 * più il neutro per ciò che non dice niente, come «Archiviato» — si applicano
 * con `className`, prendendo la stringa pronta da `TONO` dell'item `toni`.
 *
 * **Regole d'uso.** Una parola o due, mai una frase. In una colonna di tabella
 * gli stati si mappano tutti dalla stessa `TONO`, così nessuno arriva per
 * un'altra strada. Un'icona è ammessa, ma il testo la spiega: il colore da
 * solo non basta.
 *
 * In una cella stretta il badge non si restringe da sé: si allarga quanto il
 * suo testo, esce dal bordo della cella ed è tagliato di netto. Il badge
 * prende al massimo la larghezza della cella, e il testo va in uno `span` che
 * finisce coi puntini:
 *
 * ```tsx
 * <Badge variant="outline" className="max-w-full">
 *   <span className="truncate">{norma}</span>
 * </Badge>
 * ```
 *
 * `truncate` sul badge stesso non basta, perché il badge centra il contenuto
 * e il testo verrebbe tagliato ai due lati. La tabella di dati lo mostra
 * nella scena «Badge In Cella Stretta».
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

/**
 * Con l'icona: resta un'etichetta, e il testo dice cosa l'icona significa.
 */
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
 * Gli stati di una scheda prodotto: una parola, un colore, nessuna azione.
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
 * I toni semantici, dall'item `toni`: le classi arrivano da una mappa sola e
 * il badge resta quello.
 *
 * ```tsx
 * import { TONO } from '@/lib/toni'
 *
 * <Badge className={TONO.success}>Attivo</Badge>
 * ```
 *
 * Tutti i toni pesano uguale, in chiaro e in scuro: commutando la modalità
 * nessuno stato sembra più grave degli altri.
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
