import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRightIcon, PlusIcon, TrashIcon } from 'lucide-react'

import { Button } from '@/registry/tassullo/ui/button'
import { Spinner } from '@/registry/tassullo/ui/spinner'

/**
 * Il bottone, ri-stilato in M2.1 sopra il preset `base-nova`. Quattro rilievi
 * chiusi qui, tutti misurati e non stimati:
 *
 * · `link` usava `text-primary` — l'arancio del brand come colore di testo,
 *   1.79:1 in chiaro. È la trappola che il CLAUDE.md mette per iscritto, e ci
 *   era cascato il preset ufficiale. Ora `text-accent-ink`, che è arancione
 *   leggibile in ENTRAMBE le modalità con una classe sola.
 * · `destructive` era tenue (`bg-destructive/10 text-destructive`): 3.82:1 in
 *   chiaro e 3.57:1 in scuro, sotto soglia in tutte e due. Ora è il rosso
 *   pieno del v1.
 * · il raggio era `rounded-lg`, cioè 10px: i bottoni del v1 sono a 6px.
 * · `xs` e `sm` avevano valori arbitrari, e `text-[0.8rem]` stando fuori dai
 *   token non seguiva nemmeno la densità — restava 12,8px anche in touch.
 *
 * Ogni story va guardata nelle QUATTRO combinazioni della barra: modalità ×
 * densità. Una misura fatta in una sola modalità non è una misura — `link`
 * lo dimostra, perché in scuro dava 9.49:1 e sembrava a posto.
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
 * Le quattro taglie testuali. È qui che si legge a colpo d'occhio l'effetto
 * dell'interruttore di densità: `default` passa da 32 a 48px, e da M2.1 anche
 * il testo scatta di un gradino su tutte e quattro — prima `sm` restava fermo.
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

/** Le taglie quadrate. L'icona dentro non porta testo: serve `aria-label`. */
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

/** Icona e testo insieme: il bottone stringe il padding dal lato dell'icona. */
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
 * I quattro stati che l'accettazione di M2.1 chiede. `hover` e `focus` non si
 * possono mettere in una story: si provano col mouse e col tasto Tab, ed è
 * quello il punto — il focus da tastiera dev'essere visibile, e lo è come
 * anello `ring-3` sul token `--ring`.
 *
 * Il **caricamento** non è un prop del bottone e non deve diventarlo: è la
 * composizione con `Spinner`, disabilitando il bottone. Aggiungere un prop
 * `loading` sarebbe una modifica di forma, cioè esattamente ciò che il gate
 * di aggiornabilità impedisce (regola 4bis).
 */
export const Stati: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>A riposo</Button>
      <Button {...args} disabled>Disabilitato</Button>
      <Button {...args} disabled>
        <Spinner data-icon="inline-start" />
        Salvataggio…
      </Button>
      <Button {...args} variant="outline" disabled>
        <Spinner data-icon="inline-start" />
        Caricamento…
      </Button>
    </div>
  ),
}

export const Disabilitato: Story = { args: { disabled: true } }

/**
 * Tutte le varianti per tutte le taglie, in una griglia sola: è la vista da
 * tenere aperta mentre si gira l'interruttore di modalità e quello di
 * densità, e quella su cui si legge il pannello Accessibility.
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
