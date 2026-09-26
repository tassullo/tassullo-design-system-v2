import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { expect, within } from 'storybook/test'

import { Button, buttonVariants } from '@/registry/tassullo/ui/button'
import { Spinner } from '@/registry/tassullo/ui/spinner'

/**
 * Il bottone: fa succedere qualcosa quando lo si preme — salvare, aprire,
 * confermare, eliminare.
 *
 * **Quando sì, quando no.** Per un'azione. Se si sceglie fra alternative che
 * restano premute, è `toggle` o `toggle-group`. Più azioni imparentate vanno
 * in un `button-group`.
 *
 * **Un collegamento non è un `Button`.** Ciò che porta a un'altra pagina —
 * «Torna a…», «Apri sul sito», il nome che apre la scheda — è il `Link` del
 * router o un `<a>`, con l'aspetto preso da `buttonVariants({ variant, size })`
 * (la scena «Come Collegamento»). `Button` col `render` di un collegamento
 * scrive un errore in console e mette `type="button"` sul link; con
 * `nativeButton={false}` il link diventa un bottone per la tastiera e per chi
 * cerca i collegamenti. Un collegamento non si disabilita: se la destinazione
 * non c'è, non si rende.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/button
 * ```
 *
 * **Varianti.** `variant`: `default` (l'azione principale, sul colore del
 * brand), `secondary`, `outline`, `ghost`, `destructive`, `link`.
 *
 * **Taglie.** `size`: `xs`, `sm`, `default`, `lg` per i bottoni con testo;
 * `icon-xs`, `icon-sm`, `icon`, `icon-lg` per quelli quadrati di sola icona.
 * Seguono la densità: il `default` è alto 32px in normale e 48px in touch.
 *
 * **Regole d'uso.** Un'azione `default` per zona dello schermo; le altre si
 * abbassano a `secondary`, `outline` o `ghost`. `destructive` solo per ciò che
 * non si recupera. Il caricamento non è un prop: si mette uno `Spinner` dentro
 * il bottone e lo si disabilita. Un bottone di sola icona vuole `aria-label`.
 *
 * **Tastiera e accessibilità.** Si raggiunge con `Tab`, si preme con `Invio` o
 * `Spazio`, e il fuoco da tastiera si vede come un anello attorno al bottone.
 * Tutte le varianti leggono sopra la soglia di contrasto in chiaro e in scuro.
 */
const meta = {
  title: 'Primitive/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Bottone' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {}

export const Varianti: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="default">Default</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="destructive">Destructive</Button>
      <Button {...args} variant="link">Link</Button>
    </div>
  ),
}

/**
 * Le quattro taglie con testo. Commutando la densità in barra si vede il
 * `default` passare da 32 a 48px, e il testo crescere di un gradino.
 */
export const Taglie: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="xs">xs</Button>
      <Button {...args} size="sm">sm</Button>
      <Button {...args} size="default">default</Button>
      <Button {...args} size="lg">lg</Button>
    </div>
  ),
}

/**
 * Le taglie quadrate, di sola icona: ciascuna ha la sua `aria-label`.
 */
export const TaglieIcona: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="icon-xs" aria-label="Aggiungi"><PlusIcon /></Button>
      <Button {...args} size="icon-sm" aria-label="Aggiungi"><PlusIcon /></Button>
      <Button {...args} size="icon" aria-label="Aggiungi"><PlusIcon /></Button>
      <Button {...args} size="icon-lg" aria-label="Aggiungi"><PlusIcon /></Button>
    </div>
  ),
}

/**
 * Icona e testo insieme: il bottone stringe lo spazio interno dal lato
 * dell'icona.
 */
export const ConIcona: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}><PlusIcon data-icon="inline-start" />Nuovo prodotto</Button>
      <Button {...args} variant="outline">Avanti<ArrowRightIcon data-icon="inline-end" /></Button>
      <Button {...args} variant="destructive"><TrashIcon data-icon="inline-start" />Elimina</Button>
    </div>
  ),
}

/**
 * Gli stati: normale, disabilitato e in caricamento, che è uno `Spinner`
 * dentro un bottone disabilitato. Il passaggio del mouse e il fuoco si provano
 * col mouse e col tasto `Tab`: il fuoco si vede come un anello.
 */
export const Stati: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>A riposo</Button>
      <Button {...args} disabled>Disabilitato</Button>
      <Button {...args} disabled>
        <Spinner data-icon="inline-start" aria-label="" />
        Salvataggio…
      </Button>
      <Button {...args} variant="outline" disabled>
        <Spinner data-icon="inline-start" aria-label="" />
        Caricamento…
      </Button>
    </div>
  ),
}

export const Disabilitato: Story = { args: { disabled: true } }

/**
 * Un collegamento con l'aspetto di un bottone: niente `Button`, la classe da
 * `buttonVariants` sul `Link` del router o su un `<a>`. Resta un link — si
 * apre con `Invio`, non con `Spazio`, e compare fra i collegamenti della
 * pagina — e si vede identico al bottone della stessa variante.
 *
 * ```tsx
 * <Link to="/prodotti" className={buttonVariants({ variant: "outline" })}>
 *   Torna ai prodotti
 * </Link>
 * ```
 */
export const ComeCollegamento: Story = {
  name: 'Come Collegamento',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <a href="#prodotti" className={buttonVariants({ variant: 'outline' })}>
        <ArrowLeftIcon data-icon="inline-start" />
        Torna ai prodotti
      </a>
      <a href="#scheda" className={buttonVariants({ variant: 'link' })}>
        Apri la scheda
      </a>
    </div>
  ),
}

// Scena di misura di «Come Collegamento»: né l'occhio né axe distinguono un
// link reso come `Button` da un link vero (0 pixel e 0 violazioni di
// differenza), quindi lo dice la prova. `!dev` la toglie dalla barra e da
// Docs; il gate la esegue.
export const ComeCollegamentoProva: Story = {
  ...ComeCollegamento,
  name: 'Come Collegamento, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getAllByRole('link')
    await expect(link).toHaveLength(2)
    for (const a of link) {
      await expect(a.tagName).toBe('A')
      await expect(a).not.toHaveAttribute('type')
      await expect(a).not.toHaveAttribute('role')
    }
    await expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0)
  },
}

/**
 * Tutte le varianti per tutte le taglie. È la vista da tenere aperta mentre si
 * commutano modalità e densità.
 */
export const Griglia: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4">
      {(['xs', 'sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          <span className="w-16 text-sm text-muted-foreground">{size}</span>
          {(['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const).map(
            (variant) => (
              <Button key={variant} size={size} variant={variant}>
                {variant}
              </Button>
            ),
          )}
        </div>
      ))}
    </div>
  ),
}
