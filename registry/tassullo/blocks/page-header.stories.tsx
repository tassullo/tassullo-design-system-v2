import type { Meta, StoryObj } from '@storybook/react-vite'
import { ExternalLinkIcon, PlusIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'

import { apriCol } from '@/prove/apri'
import {
  FasciaIntestazione,
  IntestazioneProvider,
  PageHeader,
  type AzionePagina,
  type LivelloPercorso,
  type PageHeaderProps,
} from '@/registry/tassullo/blocks/page-header'
import { Badge } from '@/registry/tassullo/ui/badge'

/**
 * L'intestazione di pagina: il percorso a sinistra, le azioni della pagina a
 * destra, nella fascia in alto del guscio. Una forma sola per tutte le pagine.
 *
 * **Quando sì, quando no.** Ogni pagina dentro `tassullo-app-shell` dichiara
 * qui il suo percorso e le sue azioni: la fascia la disegna il guscio, il
 * contenuto lo scrive la pagina. Non è una barra da mettere dentro la pagina,
 * e non c'è un titolo di pagina visibile: il nome della pagina è l'ultimo
 * livello del percorso. Il contesto su cui si lavora — una commessa, un
 * cantiere — è `tassullo-barra-contesto`; le azioni su righe scelte stanno
 * nella `barra` di `tassullo-data-table`, non qui.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-page-header
 * ```
 *
 * ```tsx
 * export function Famiglie() {
 *   return (
 *     <>
 *       <PageHeader
 *         percorso={[{ titolo: 'Prodotti', href: '/prodotti' }, { titolo: 'Famiglie' }]}
 *         azioni={[{ titolo: 'Nuovo prodotto', icona: PlusIcon, ruolo: 'primaria', onClick: apri }]}
 *       />
 *       <TabellaFamiglie />
 *     </>
 *   )
 * }
 * ```
 *
 * **Le prop.**
 *
 * - `percorso`: i livelli dal più alto alla pagina corrente. Un livello ha
 *   `titolo`, e `href` o `render` per il collegamento del router; l'ultimo
 *   non è un collegamento.
 * - `azioni`: ogni azione ha `titolo`, `icona`, `ruolo` (`"primaria"`,
 *   `"secondaria"`, `"distruttiva"`), `onClick` o `href`, `disabilitata`.
 *   Con `href` l'azione è un collegamento con l'aspetto di un bottone, nella
 *   fascia larga e nel menu «⋮», e come ogni collegamento si può aprire in
 *   una scheda nuova.
 * - `titolo`: il titolo della pagina per chi non vede lo schermo, un `h1`
 *   nascosto alla vista. Se non si passa, è l'ultimo livello del percorso.
 * - Fuori dal guscio, `IntestazioneProvider` e `FasciaIntestazione` montano la
 *   fascia a mano: il provider avvolge fascia e pagina, e la fascia riceve il
 *   grilletto della colonna, se c'è.
 *
 * **Regole d'uso.**
 *
 * - `PageHeader` non rende niente dove sta scritto: consegna percorso e
 *   azioni alla fascia del guscio, che può stare molto più in alto. Si scrive
 *   in cima alla pagina, una volta sola.
 * - Le azioni si dichiarano, non si disegnano: la fascia le rende come
 *   bottoni o come righe di un menu, a seconda dello spazio.
 * - Una sola azione `primaria` per pagina: due bottoni arancioni nella stessa
 *   fascia non sono due azioni importanti, sono zero. Una distruttiva ha
 *   `ruolo: "distruttiva"`, e non è mai la primaria.
 * - `icona` è obbligatoria: quando la fascia è stretta l'azione diventa una
 *   riga di menu, e una riga senza icona resta disallineata.
 * - Le soglie guardano la larghezza della fascia, non dello schermo. Sotto
 *   `@md` (448px) i livelli intermedi del percorso si raccolgono nell'ellissi
 *   «…», che apre un menu per raggiungerli; sotto `@2xl` (672px) le azioni
 *   entrano tutte nel menu «⋮». La fascia resta sempre su una riga.
 * - Un conteggio accanto al nome della pagina — «Segnalazioni da smistare 4»
 *   — va nel titolo dell'ultimo livello, in un `Badge variant="secondary"` con
 *   `tabular-nums`. Solo sull'ultimo livello: su uno intermedio finirebbe
 *   dentro il nome del collegamento.
 *
 * **Tastiera e accessibilità.** Il percorso è un `nav` con i suoi
 * collegamenti; l'ellissi e il «⋮» sono bottoni che aprono un menu, con le
 * frecce per scorrere le voci ed `Esc` per chiudere. La pagina ha sempre un
 * titolo `h1` per i lettori di schermo, anche se non si vede.
 */
const meta = {
  title: 'Blocchi/Intestazione di pagina',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Il banco: la fascia da sola, senza il guscio attorno.
 *
 * **Perché un banco e non il guscio intero.** Le soglie di questo blocco
 * guardano la larghezza della **fascia**, non quella dello schermo, quindi la
 * forma compatta si può mettere in scena a qualunque viewport — basta stringere
 * il contenitore. È il vantaggio pratico di `@container` su `md:`/`lg:`, e vale
 * anche per il gate: il runner di `addon-vitest` non ha un modo affidabile di
 * cambiare viewport, e un popup che comparisse solo sotto una media query
 * sarebbe un popup che il gate non apre mai.
 *
 * La larghezza del riquadro è **dichiarata sopra la barra**, perché una fascia
 * stretta dentro uno schermo largo, senza didascalia, si legge come un errore
 * invece che come una dimostrazione.
 *
 * Nel guscio il grilletto è `<SidebarTrigger />`; qui non c'è, e con lui non
 * c'è il filo verticale che lo separa dal contenuto — è del guscio, non della
 * pagina.
 */
function Banco({
  larghezza = 'w-full',
  didascalia,
  children,
}: {
  larghezza?: string
  didascalia: string
  children: ReactNode
}) {
  return (
    <IntestazioneProvider>
      <div className="flex flex-col gap-2 p-4">
        <p className="text-xs text-muted-foreground">{didascalia}</p>
        <div className={`overflow-hidden rounded-lg border ${larghezza}`}>
          <FasciaIntestazione />
          {children}
        </div>
      </div>
    </IntestazioneProvider>
  )
}

const PERCORSO: LivelloPercorso[] = [
  { titolo: 'Prodotti', href: '#' },
  { titolo: 'Famiglie' },
]

const PERCORSO_LUNGO: LivelloPercorso[] = [
  { titolo: 'Prodotti', href: '#' },
  { titolo: 'Famiglie', href: '#' },
  { titolo: 'Malte strutturali', href: '#' },
  { titolo: 'Malta strutturale R4 fibrorinforzata' },
]

const AZIONI: AzionePagina[] = [
  { titolo: 'Sistema da BC', icona: RefreshCwIcon, ruolo: 'secondaria' },
  { titolo: 'Nuovo prodotto', icona: PlusIcon, ruolo: 'primaria' },
]

/**
 * La forma piena: tutto il percorso a sinistra e i bottoni interi a destra,
 * quando la fascia supera i 672px.
 */
export const Predefinito: Story = {
  args: { percorso: PERCORSO, azioni: AZIONI },
  render: (args) => (
    <Banco didascalia="Fascia larga — la forma piena.">
      <PageHeader {...args} />
    </Banco>
  ),
}

/**
 * Un percorso di quattro livelli, intero sulla fascia larga. L'ultimo livello
 * è il nome della pagina, e si tronca per ultimo.
 */
export const PercorsoProfondo: Story = {
  args: { percorso: PERCORSO_LUNGO, azioni: AZIONI },
  render: (args) => (
    <Banco didascalia="Fascia larga — quattro livelli, tutti visibili.">
      <PageHeader {...args} />
    </Banco>
  ),
}

/**
 * **La fascia stretta** e i suoi due menu.
 *
 * 320px in densità normale (`w-80`), cioè sotto tutte e due le soglie: la
 * stessa forma che si ha su uno schermo da 375px, dove la colonna non c&apos;è.
 * Il percorso raccoglie gli intermedi nel `…` e le azioni entrano nel `⋮`.
 *
 * Non serve cambiare viewport per vederlo: le soglie guardano la fascia, e qui
 * la fascia è stretta perché sta in un contenitore stretto. È la ragione
 * pratica per cui `@container` batte `md:`/`lg:` — un blocco che si misura da
 * sé si può anche **provare** da sé.
 *
 * **Le due story che seguono sono la stessa scena**, con gli stessi identici
 * `args`: cambia solo **quale dei due menu è aperto**. Non è una duplicazione
 * per distrazione, ed è il motivo per cui non sono una sola: `apri.ts` apre
 * **un** popup per story, e un popup che il gate non apre è un popup di cui non
 * sa niente — «un popup non aperto non è un popup senza violazioni» è la
 * lezione che la FASE 2 ha pagato due volte (M2.3, M2.6). Da quando i menu in
 * barra sono due, servono due story per misurarli tutti e due aperti.
 */
const STRETTA = {
  percorso: PERCORSO_LUNGO,
  azioni: [...AZIONI, { titolo: 'Elimina', icona: Trash2Icon, ruolo: 'distruttiva' }],
} satisfies Partial<PageHeaderProps>

const bancoStretto = (didascalia: string) => (args: PageHeaderProps) => (
  <Banco larghezza="w-80" didascalia={`Fascia da 320px — ${didascalia}`}>
    <PageHeader {...args} />
  </Banco>
)

/**
 * Una fascia da 320px con il menu del percorso aperto: i livelli intermedi non
 * spariscono, si raccolgono nell'ellissi.
 */
export const StrettaMenuDelPercorso: Story = {
  args: STRETTA,
  render: bancoStretto('aperto il menu del percorso, che contiene i livelli intermedi.'),
  play: apriCol('button:has([data-slot="breadcrumb-ellipsis"])', 'dropdown-menu-content'),
}

/**
 * La stessa fascia con il menu delle azioni aperto: dentro ci sono tutte le
 * azioni, anche la distruttiva. L'ellissi orizzontale naviga, il «⋮» verticale
 * agisce.
 */
export const StrettaMenuDelleAzioni: Story = {
  args: STRETTA,
  render: bancoStretto('aperto il menu delle azioni.'),
  play: apriCol('[aria-label="Altre azioni"]', 'dropdown-menu-content'),
}

/**
 * Senza azioni resta il solo percorso: una pagina di sola lettura, un
 * cruscotto.
 */
export const SenzaAzioni: Story = {
  args: { percorso: PERCORSO },
  render: (args) => (
    <Banco didascalia="Fascia larga — nessuna azione dichiarata.">
      <PageHeader {...args} />
    </Banco>
  ),
}

/**
 * Una pagina di primo livello: un livello solo, senza separatori né
 * collegamenti.
 */
export const LivelloUnico: Story = {
  args: { percorso: [{ titolo: 'Cruscotto' }], azioni: [AZIONI[1]!] },
  render: (args) => (
    <Banco didascalia="Fascia larga — un livello solo, che è la pagina.">
      <PageHeader {...args} />
    </Banco>
  ),
}

/**
 * Il conteggio accanto al nome della pagina, in un `Badge` sull'ultimo livello
 * del percorso.
 */
export const Contatore: Story = {
  name: 'Contatore',
  args: {
    percorso: [
      { titolo: 'Officina', href: '#' },
      {
        titolo: (
          <>
            Segnalazioni da smistare{' '}
            <Badge variant="secondary" className="tabular-nums">
              4
            </Badge>
          </>
        ),
      },
    ],
    azioni: [AZIONI[1]!],
  },
  render: (args) => (
    <Banco didascalia="Il conteggio dentro un <Badge variant=&quot;secondary&quot;>, sull'ultimo livello del percorso.">
      <PageHeader {...args} />
    </Banco>
  ),
}

/**
 * Un'azione che porta a un indirizzo invece di fare qualcosa: con `href`, «Apri
 * sul sito» è un collegamento con l'aspetto di un bottone. Resta un
 * collegamento in tutte e due le forme: nella fascia larga, e come voce del
 * menu «⋮» nella fascia stretta.
 */
export const AzioneCollegamento: Story = {
  name: 'Azione con collegamento',
  args: {
    percorso: PERCORSO,
    azioni: [
      { titolo: 'Apri sul sito', icona: ExternalLinkIcon, ruolo: 'secondaria', href: 'https://www.esempio.it/prodotti' },
      AZIONI[1]!,
    ],
  },
  render: (args) => (
    <Banco didascalia="Fascia larga — «Apri sul sito» è un collegamento.">
      <PageHeader {...args} />
    </Banco>
  ),
}

/*
 * La prova che un'azione con `href` resta un collegamento. Nella fascia larga
 * è un link (il ruolo e l'indirizzo), senza l'attributo `type` di un bottone;
 * poi il riquadro si stringe a 20rem, le azioni entrano nel menu «⋮», e la
 * voce «Apri sul sito» deve avere lo stesso indirizzo. Alla fine il menu si
 * chiude e il riquadro torna com'era, perché la scansione guardi la scena a
 * riposo.
 */
async function provaAzioneCollegamento({ canvasElement }: { canvasElement: HTMLElement }) {
  const indirizzo = 'https://www.esempio.it/prodotti'
  const fascia = await waitFor(() => {
    const f = canvasElement.querySelector<HTMLElement>('[data-slot="page-header-bar"]')
    expect(f).toBeTruthy()
    return f!
  })
  const link = await within(fascia).findByRole('link', { name: 'Apri sul sito' })
  expect(link).toHaveAttribute('href', indirizzo)
  expect(`type: ${link.getAttribute('type')}`).toBe('type: null')

  const riquadro = fascia.parentElement!
  riquadro.style.width = '20rem'
  try {
    const altre = await within(fascia).findByRole('button', { name: 'Altre azioni' })
    await waitFor(() => expect(altre).toBeVisible())
    await userEvent.click(altre)
    const voce = await screen.findByRole('menuitem', { name: 'Apri sul sito' })
    expect(`href della voce: ${voce.closest('a')?.getAttribute('href') ?? null}`).toBe(
      `href della voce: ${indirizzo}`,
    )
  } finally {
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    riquadro.style.width = ''
  }
}

// Scena di misura di «Azione con collegamento»: la stessa resa, con la prova.
// `!dev` la toglie dalla barra e da Docs, così la scena qui sopra si apre a
// riposo; il controllo automatico la esegue lo stesso.
export const AzioneCollegamentoProva: Story = {
  ...AzioneCollegamento,
  name: 'Azione con collegamento, prova',
  tags: ['!dev', '!autodocs'],
  play: provaAzioneCollegamento,
}
