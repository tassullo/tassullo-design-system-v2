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
 * **La stranezza di questo file, e come è finita.** Il componente importa
 * `useTheme` da **`next-themes`**, la libreria di temi di Next.js. Noi non la
 * usiamo: la nostra modalità è una classe sulla radice (`.light`/`.dark`),
 * messa dall'app — o, qui, dall'interruttore della style guide. Senza il suo
 * provider `useTheme()` non rompe niente e ricade su `"system"`, cioè sul
 * tema del **sistema operativo**, e `data-sonner-theme` non viene scritto
 * affatto. Fondo, bordo e titolo del toast restano giusti — arrivano dai
 * `var()` qui sopra; a divergere è la palette interna di `sonner`.
 *
 * **Il sintomo era grave e ora è chiuso**: la descrizione del toast ha il
 * colore `#3f3f3f` cablato dentro il CSS di `sonner`, sollevato solo da
 * `[data-sonner-theme='dark']` — che senza `next-themes` non viene mai
 * scritto. Su fondo scuro faceva **1.62:1**. Fissata sul token con una
 * stringa di classi, `**:data-[description]:text-muted-foreground!`: ora
 * **7.17:1** in scuro e 5.37 in chiaro. L'importante serve perché il CSS di
 * `sonner` non sta in un layer e batterebbe l'utility a prescindere dalla
 * specificità.
 *
 * **E `next-themes` si lascia dov'è** (D12, chiusa il 2026-09-09). Dopo quella
 * correzione il toast reso **con e senza** il tema forzato è **identico**:
 * zero differenze su fondo, testo, bordo, raggio, ombra, titolo, descrizione,
 * icona, bottone d'azione e bottone di chiusura, in **entrambe** le modalità.
 * Il preset mappa già `--normal-*` sui nostri token e non accende
 * `richColors`, quindi la palette interna di `sonner` non viene mai usata.
 * Costa **3,4 KB** nel bundle, e nulla sul server: è una dipendenza di
 * compilazione. Si tiene perché toglierlo sarebbe la **prima divergenza
 * strutturale** del progetto — e su un file che `check:registry` non
 * confronta, essendo a segnaposto d'icona: il gate non ci proteggerebbe.
 *
 * **Se un'app volesse comunque forzare il tema del toast**, non serve toccare
 * niente: `{...props}` è l'ultima prop, quindi `<Toaster theme="dark" />`
 * vince su `next-themes`. Verificato — `data-sonner-theme` passa da `light` a
 * `dark`.
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
