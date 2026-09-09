import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'

import { Button } from '@/registry/tassullo/ui/button'
import { ButtonGroup } from '@/registry/tassullo/ui/button-group'
import { Toaster } from '@/registry/tassullo/ui/sonner'

/**
 * **Nessun ri-stile: qui non ci sono classi da toccare.** Il `Toaster` del
 * preset non stila i toast con Tailwind — li stila passando i **token del
 * tema** alle variabili di `sonner`: `--normal-bg: var(--popover)`,
 * `--normal-text: var(--popover-foreground)`, `--normal-border:
 * var(--border)`, `--border-radius: var(--radius)`. È un `var()`, quindi
 * resta vivo e segue la modalità e la superficie da sé — la stessa ragione
 * per cui la superficie della style guide sta nel CSS e non nell'addon
 * `backgrounds` (M0.3).
 *
 * **Un rilievo aperto, e non è mio da chiudere.** Il componente importa
 * `useTheme` da **`next-themes`**, che è la libreria di temi di Next.js. Noi
 * non la usiamo: la nostra modalità è una classe sulla radice
 * (`.light`/`.dark`), messa dall'app — o, qui, dall'interruttore della style
 * guide. Senza il suo provider `useTheme()` non rompe niente e ricade su
 * `"system"`, cioè sul tema del **sistema operativo**: se il computer è in
 * chiaro e l'app in scuro, il toast prende il chiaro. I colori restano
 * giusti, perché arrivano dai `var()` qui sopra; è la palette interna di
 * `sonner` a divergere.
 *
 * Toglierlo sarebbe una modifica **strutturale** — una chiamata e una prop in
 * meno — cioè fuori dal gradino 2 della regola 4bis, che ammette solo le
 * stringhe di classi. Quindi non si tocca di iniziativa: la misura è scritta
 * in `WORKLOG.md`, la decisione è di Francesco. Nel frattempo `next-themes`
 * resta dichiarato fra le dipendenze dell'item, o l'app consumer non compila.
 *
 * **`<Toaster />` va una volta sola**, in cima all'app. Queste story ce
 * l'hanno dentro perché ognuna è un'app a sé.
 *
 * **Il toast non è il posto degli errori che vanno letti.** Sparisce da solo:
 * quello che si deve poter rileggere sta nella pagina — `alert` (M2.4) o il
 * messaggio d'errore del `field`. Il toast conferma ciò che è andato bene, o
 * segnala ciò che si può ignorare.
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
 * Le cinque forme semantiche. Le icone le mette il preset (Lucide), i colori
 * arrivano dai token: nessun colore è scritto qui dentro.
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
 * Con un'azione. **L'azione dentro un toast è sempre ridondante**: il toast
 * sparisce, e chi non fa in tempo dev'essere in grado di fare la stessa cosa
 * dalla pagina. «Annulla» qui è una comodità, non l'unica via.
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

/** Più toast in coda: si impilano, il più recente in cima. */
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
