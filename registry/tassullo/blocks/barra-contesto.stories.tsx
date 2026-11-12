import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  CalculatorIcon,
  ExternalLinkIcon,
  FileTextIcon,
  HardHatIcon,
  LayoutDashboardIcon,
  PackageIcon,
  PlusIcon,
} from 'lucide-react'

import { apriCol } from '@/prove/apri'
import { AppShell } from '@/registry/tassullo/blocks/app-shell'
import { BarraContesto, SelettoreContesto, type VoceContesto } from '@/registry/tassullo/blocks/barra-contesto'
import { PageHeader } from '@/registry/tassullo/blocks/page-header'
import { Button } from '@/registry/tassullo/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/tassullo/ui/card'
import { Sidebar, SidebarHeader, SidebarProvider } from '@/registry/tassullo/ui/sidebar'

/**
 * La fascia che dice su quale entità si sta lavorando — una commessa, un
 * cantiere, un calcolo — e, quando ce n'è più d'una, la lascia cambiare da un
 * menu.
 *
 * **Quando sì, quando no.** Si usa quando una pagina lavora dentro un
 * contesto che va tenuto sotto gli occhi, perché sbagliarlo vuol dire
 * scrivere nel posto sbagliato. Se il contesto attraversa tutte le pagine
 * dell'applicativo, le cose da dire sono due e stanno in due posti: nella
 * colonna del guscio `SelettoreContesto`, che dice **quale** entità e la
 * cambia, passato ad `AppShell` in `contesto`; in pagina `BarraContesto`
 * senza `voci`, che dice **cosa comporta** — indirizzo, consegna, stato — e
 * non si cambia da lì. Il percorso della pagina è `tassullo-page-header`, non
 * questa fascia.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-barra-contesto
 * ```
 *
 * **Le prop.**
 *
 * - `etichetta`, il tipo di cosa — «Commessa», «Cantiere» — e `titolo`, il
 *   nome dell'entità attiva; `descrizione`, sotto il nome, ciò che serve a non
 *   sbagliare entità.
 * - `icona`, un'icona Lucide; senza, è `MapPinIcon`.
 * - `voci` (`{ id, titolo, descrizione }`), `attiva` e `onCambia`: le entità
 *   fra cui scegliere, quella in uso e il cambio. Con meno di due voci il
 *   grilletto non si monta, e la fascia è in sola lettura.
 * - `cambia`, il testo del grilletto, «Cambia» se non si passa;
 *   `etichettaMenu`, il titolo del menu.
 * - `azioni`, un'azione di pagina accanto al grilletto.
 * - `stato`, `messaggioErrore` e `onRiprova`: se l'elenco è già arrivato
 *   (`pronto`, di serie), sta arrivando (`caricamento`) o non è arrivato
 *   (`errore`). In caricamento il grilletto resta ma non si apre; in errore si
 *   apre anche senza voci su un messaggio e, se c'è `onRiprova`, su «Riprova».
 * - `SelettoreContesto` prende le stesse prop, tranne `cambia` e `azioni`.
 *
 * **Regole d'uso.**
 *
 * - L'icona è sempre un'icona Lucide, mai un'emoji: un'emoji la disegna il
 *   sistema operativo, e cambia da una macchina all'altra.
 * - Il grilletto è solo il bottone «Cambia», non la fascia intera: una fascia
 *   che è tutta un bottone ruba la scena alla pagina, e non può contenere
 *   `azioni`.
 * - Quando lo spazio manca, l'etichetta resta intera e si accorcia il nome;
 *   la descrizione va a capo una volta e poi si ferma.
 * - Sotto i 384px di larghezza *della barra* — non della finestra — il
 *   grilletto mostra solo l'icona e il nome ha più spazio; il nome accessibile
 *   resta «Cambia: » seguito dal nome del contesto.
 * - L'elenco che arriva da una richiesta si racconta con `stato`: non si
 *   nasconde il grilletto mentre carica e non si lascia sparire se fallisce.
 *
 * **Tastiera e accessibilità.** Il grilletto si apre con `Invio` o `Spazio`,
 * e il fuoco va sulla prima voce; le frecce scorrono le voci, e l'entità
 * attiva porta il segno di spunta (`role="menuitemradio"`, `aria-checked`).
 * `Esc` e il clic fuori chiudono il menu, e il fuoco torna al grilletto. In
 * errore il menu si apre allo stesso modo: «Riprova» si raggiunge con le
 * frecce e si attiva con `Invio`.
 */
const meta = {
  title: 'Blocchi/Barra di contesto',
  component: BarraContesto,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BarraContesto>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Il **nome** della commessa, senza il codice: è quello che sta in colonna.
 * Nelle app vere codice e nome sono già due campi — qui si separano a mano
 * perché la story parte da una stringa sola.
 */
const nomeDi = (titolo: string) => titolo.split(' — ')[1] ?? titolo

const COMMESSE: VoceContesto[] = [
  {
    id: '2026-114',
    titolo: '2026-114 — Palazzo Roccabruna',
    descrizione: 'Trento, via Santa Trinità · consegna 12/2026',
  },
  {
    id: '2026-092',
    titolo: '2026-092 — Scuola media Bolghera',
    descrizione: 'Trento, via Volta · consegna 06/2027',
  },
  {
    id: '2025-233',
    titolo: '2025-233 — Capannone Pergine lotto B',
    descrizione: 'Pergine Valsugana · in collaudo',
  },
]

/** Il contesto è di chi lo mostra: la story lo tiene per far vedere che cambia. */
function ConStato(props: Partial<React.ComponentProps<typeof BarraContesto>>) {
  const [attiva, setAttiva] = useState(COMMESSE[0].id)
  const voce = COMMESSE.find((c) => c.id === attiva) ?? COMMESSE[0]
  return (
    <BarraContesto
      etichetta="Commessa"
      titolo={voce.titolo}
      descrizione={voce.descrizione}
      icona={HardHatIcon}
      voci={COMMESSE}
      attiva={attiva}
      onCambia={setAttiva}
      etichettaMenu="Commesse aperte"
      {...props}
    />
  )
}

/**
 * Una commessa attiva, con il menu per cambiarla, aperto.
 */
export const Predefinita: Story = {
  args: { titolo: '' },
  render: () => <ConStato />,
  play: apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * Una voce sola, o nessuna: il grilletto non c'è. Senza `descrizione` la
 * fascia sta su una riga.
 */
export const SolaLettura: Story = {
  args: {
    etichetta: 'Prodotto',
    titolo: 'Termo Adesivi TA-200',
    icona: PackageIcon,
  },
}

/**
 * Un'azione di pagina accanto al grilletto, fuori dal menu.
 */
export const ConAzioni: Story = {
  args: { titolo: '' },
  render: () => (
    <ConStato
      azioni={
        <Button variant="ghost">
          <ExternalLinkIcon />
          Apri la scheda
        </Button>
      }
    />
  ),
}

/**
 * Il nome lungo, in un contenitore stretto e a piena larghezza: l'etichetta
 * «Commessa» resta intera e il nome si accorcia.
 */
export const NomeLungo: Story = {
  args: {
    etichetta: 'Commessa',
    titolo:
      '2026-114 — Ristrutturazione e adeguamento sismico di Palazzo Roccabruna, corpo A e corpo B',
    descrizione:
      'Trento, via Santa Trinità 24 · committente Provincia autonoma di Trento · consegna prevista 12/2026',
    icona: HardHatIcon,
    voci: COMMESSE,
    attiva: '2026-114',
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        La fascia dentro un contenitore da 448px (<code>max-w-md</code>): l'etichetta resta,
        il nome si accorcia.
      </p>
      <div className="max-w-md">
        <BarraContesto {...args} />
      </div>
      <p className="text-xs text-muted-foreground">
        La stessa a piena larghezza, dove ci sta quasi tutto.
      </p>
      <BarraContesto {...args} />
    </div>
  ),
}

/**
 * I due posti insieme: nella colonna `SelettoreContesto` dice quale commessa
 * e la cambia; in pagina `BarraContesto`, senza `voci`, dice cosa comporta.
 */
export const NelGuscio: Story = {
  args: { titolo: '' },
  parameters: { layout: 'fullscreen' },
  render: function Render() {
    const [attiva, setAttiva] = useState(COMMESSE[0]!.id)
    const voce = COMMESSE.find((c) => c.id === attiva) ?? COMMESSE[0]!
    return (
      <AppShell
        applicazione="Studio"
        collassa="icona"
        contesto={
          <SelettoreContesto
            etichetta="Commessa attiva"
            // **Solo il nome**, senza il codice: sta su una riga sola e
            // resta quello che si riconosce a colpo d'occhio. Il codice non sparisce — è nella
            // fascia della pagina, quaranta pixel più a destra, e nel menu.
            titolo={nomeDi(voce.titolo)}
            icona={HardHatIcon}
            voci={COMMESSE}
            attiva={attiva}
            onCambia={setAttiva}
            etichettaMenu="Commesse aperte"
          />
        }
        sezioni={[
          {
            titolo: 'Lavoro',
            voci: [
              { titolo: 'Cruscotto', icona: LayoutDashboardIcon, href: '#' },
              { titolo: 'Computo', icona: CalculatorIcon, href: '#', attiva: true },
              { titolo: 'Capitolati', icona: FileTextIcon, href: '#' },
            ],
          },
        ]}
        utente={{ nome: 'Stefano', cognome: 'Bertolini', ruolo: 'Progettista' }}
      >
        <div className="flex flex-col gap-4">
          <PageHeader
            percorso={[{ titolo: 'Commesse', href: '#' }, { titolo: 'Computo' }]}
            azioni={[{ titolo: 'Nuova voce', icona: PlusIcon, ruolo: 'primaria' }]}
          />
          {/*
            Niente `voci`: in pagina la fascia **non** si cambia. Il nome resta
            perché la riga dei dettagli da sola non direbbe di chi sono.
          */}
          <BarraContesto
            etichetta="Commessa"
            titolo={voce.titolo}
            descrizione={voce.descrizione}
            icona={HardHatIcon}
          />
          <Card>
            <CardHeader>
              <CardTitle>Computo metrico estimativo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              212 voci su 14 sistemi. È questo che deve tenere lo sguardo: la colonna dice
              <em> quale</em> commessa, la fascia <em>cosa comporta</em>, e poi si fanno
              tutte e due da parte.
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  },
}

/**
 * Un contesto che non è una commessa: un calcolo, con la sua icona e la sua
 * etichetta.
 */
export const AltroContesto: Story = {
  args: {
    etichetta: 'Calcolo',
    titolo: 'CS-2026-41 — Solaio piano primo',
    descrizione: 'Ultima revisione il 18/09/2026 · verificato',
    icona: CalculatorIcon,
    voci: [
      { id: 'CS-2026-41', titolo: 'CS-2026-41 — Solaio piano primo', descrizione: 'verificato' },
      { id: 'CS-2026-38', titolo: 'CS-2026-38 — Travi di copertura', descrizione: 'in revisione' },
    ],
    attiva: 'CS-2026-41',
    etichettaMenu: 'Calcoli della commessa',
  },
}

/** Il pannello del menu, nel portale: fuori dal canvas, si cerca nel documento. */
const menu = () => within(document.body)

/**
 * La colonna di navigazione con dentro il selettore, sul fondo della sidebar:
 * è dove il selettore sta davvero, e dove i colori vanno guardati.
 */
function InColonna(props: React.ComponentProps<typeof SelettoreContesto>) {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar collapsible="none" className="h-auto rounded-lg border">
        <SidebarHeader>
          <SelettoreContesto icona={HardHatIcon} etichetta="Commessa attiva" {...props} />
        </SidebarHeader>
      </Sidebar>
    </SidebarProvider>
  )
}

/** Apre il menu come fa il gate; a menu chiuso (passata `chiuso`) non fa niente. */
const apriMenu = apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content')
const soloChiuso = import.meta.env.VITE_POPUP === 'chiuso'

/**
 * L'elenco delle commesse sta arrivando: il grilletto c'è, con un indicatore
 * al posto del chevron, ma non si apre. Il nome della commessa attiva resta
 * leggibile.
 */
export const Caricamento: Story = {
  args: { titolo: '' },
  render: () => <ConStato stato="caricamento" voci={[]} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    const grilletto = c.getByRole('button', { name: /Elenco in caricamento/ })
    await expect(grilletto).toBeDisabled()
    await expect(grilletto).toHaveAttribute('aria-busy', 'true')
    await expect(canvasElement.querySelector('[data-slot="dropdown-menu-trigger"]')).toBeNull()
    await expect(c.getByText(/Palazzo Roccabruna/)).toBeVisible()
  },
}

/**
 * L'elenco non è arrivato: il grilletto resta apribile anche senza voci e
 * porta un triangolo d'avviso. Il menu dice che cosa è successo e offre
 * «Riprova». Si raggiunge con le frecce e si attiva con `Invio`; `Esc` chiude.
 */
export const Errore: Story = {
  args: { titolo: '' },
  render: function Render() {
    const [tentativi, setTentativi] = useState(0)
    return (
      <div className="flex flex-col gap-2">
        <ConStato
          stato="errore"
          voci={[]}
          messaggioErrore="Non riesco a leggere l'elenco delle commesse."
          onRiprova={() => setTentativi((n) => n + 1)}
        />
        <p className="text-xs text-muted-foreground" data-testid="tentativi">
          Tentativi: {tentativi}
        </p>
      </div>
    )
  },
  play: async (ctx) => {
    await apriMenu(ctx)
    if (soloChiuso) return
    const { canvasElement } = ctx
    await waitFor(() => expect(menu().getByText("Non riesco a leggere l'elenco delle commesse.")).toBeVisible())
    const riprova = menu().getByRole('menuitem', { name: 'Riprova' })
    await waitFor(() => expect(riprova).toBeVisible())

    // Da tastiera: freccia giù, Invio. Il menu si chiude e il tentativo è contato.
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(riprova).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(within(canvasElement).getByTestId('tentativi')).toHaveTextContent('Tentativi: 1'))
    await waitFor(() => expect(document.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull())

    // Esc chiude un menu aperto in errore.
    await apriMenu(ctx)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(document.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull())

    // E lo si lascia aperto, così lo si vede anche nella pagina.
    await apriMenu(ctx)
  },
}

/**
 * Senza `onRiprova` il menu in errore ha solo il messaggio: l'app non offre
 * un modo di riprovare, e la barra non ne inventa uno.
 */
export const ErroreSenzaRiprova: Story = {
  args: { titolo: '' },
  render: () => <ConStato stato="errore" voci={[]} />,
  play: async (ctx) => {
    await apriMenu(ctx)
    if (soloChiuso) return
    await waitFor(() => expect(menu().getByText("Non è stato possibile caricare l'elenco.")).toBeVisible())
    await expect(menu().queryByRole('menuitem', { name: 'Riprova' })).toBeNull()
  },
}

/**
 * Nella colonna, mentre l'elenco arriva: la targhetta mostra un indicatore al
 * posto del chevron e non si apre.
 */
export const SelettoreCaricamento: Story = {
  args: { titolo: '' },
  parameters: { layout: 'centered' },
  render: () => <InColonna titolo="Palazzo Roccabruna" stato="caricamento" />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="dropdown-menu-trigger"]')).toBeNull()
    await expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull()
    await expect(within(canvasElement).getByText('Palazzo Roccabruna')).toBeVisible()
  },
}

/**
 * Nella colonna, con l'elenco non arrivato: la targhetta si apre anche senza
 * voci, col triangolo d'avviso, e il menu offre «Riprova».
 */
export const SelettoreErrore: Story = {
  args: { titolo: '' },
  parameters: { layout: 'centered' },
  render: function Render() {
    const [tentativi, setTentativi] = useState(0)
    return (
      <div className="flex flex-col gap-2">
        <InColonna
          titolo="Palazzo Roccabruna"
          stato="errore"
          onRiprova={() => setTentativi((n) => n + 1)}
        />
        <p className="text-xs text-muted-foreground" data-testid="tentativi">
          Tentativi: {tentativi}
        </p>
      </div>
    )
  },
  play: async (ctx) => {
    await apriMenu(ctx)
    if (soloChiuso) return
    await waitFor(() => expect(menu().getByText("Non è stato possibile caricare l'elenco.")).toBeVisible())
    await userEvent.keyboard('{ArrowDown}')
    const riprova = menu().getByRole('menuitem', { name: 'Riprova' })
    await waitFor(() => expect(riprova).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(within(ctx.canvasElement).getByTestId('tentativi')).toHaveTextContent('Tentativi: 1'))
    await waitFor(() => expect(document.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull())
    await apriMenu(ctx)
  },
}

/**
 * La barra in un contenitore da 340px — la larghezza di un telefono con i
 * margini — con un'azione accanto: il grilletto mostra solo l'icona e il nome
 * ha più spazio. Sotto, la stessa barra larga, dove il testo «Cambia» c'è. Il
 * passaggio dipende dalla larghezza della barra, non da quella della finestra.
 */
export const Stretta: Story = {
  args: { titolo: '' },
  render: () => (
    <div className="flex flex-col gap-4">
      <div style={{ width: 340 }} data-testid="stretta">
        <ConStato
          azioni={
            <Button variant="ghost" aria-label="Apri la scheda">
              <ExternalLinkIcon />
            </Button>
          }
        />
      </div>
      <div className="max-w-3xl" data-testid="larga">
        <ConStato />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const nomeGrilletto = /^Cambia: 2026-114/
    const misura = (id: string) => {
      const riga = within(canvasElement.querySelector<HTMLElement>(`[data-testid="${id}"]`)!)
      const grilletto = riga.getByRole('button', { name: nomeGrilletto })
      const testo = grilletto.querySelector<HTMLElement>('span')!
      const nome = Array.from(
        grilletto.closest<HTMLElement>('[data-slot="barra-contesto"]')!.querySelectorAll<HTMLElement>('span.truncate'),
      ).find((e) => e.textContent?.includes('Palazzo'))!
      return { grilletto, testo, nome }
    }

    const stretta = misura('stretta')
    await expect(stretta.testo).toHaveTextContent('Cambia')
    await expect(getComputedStyle(stretta.testo).display).toBe('none')
    await expect(stretta.grilletto).toHaveAccessibleName(/^Cambia: 2026-114 — Palazzo Roccabruna/)
    const dopo = stretta.nome.getBoundingClientRect().width
    // Quanto spazio avrebbe il nome con il testo ancora visibile.
    stretta.testo.style.display = 'inline'
    const prima = stretta.nome.getBoundingClientRect().width
    stretta.testo.style.display = ''
    console.log(`larghezza del nome a 340px: ${prima.toFixed(1)} con il testo, ${dopo.toFixed(1)} senza`)
    await expect(dopo).toBeGreaterThan(prima)
    const r = stretta.grilletto.getBoundingClientRect()
    await expect(Math.abs(r.width - r.height)).toBeLessThan(0.5)

    // In densità touch il grilletto a sola icona resta un bersaglio da dito.
    const radice = document.documentElement
    const densita = radice.getAttribute('data-density')
    radice.setAttribute('data-density', 'touch')
    try {
      // Il bottone ha `transition-all`: si aspetta che la misura arrivi.
      await waitFor(() => expect(stretta.grilletto.getBoundingClientRect().height).toBeGreaterThanOrEqual(44))
      const t = stretta.grilletto.getBoundingClientRect()
      console.log(`grilletto a sola icona in touch: ${t.width.toFixed(1)} x ${t.height.toFixed(1)}`)
      await expect(t.width).toBeGreaterThanOrEqual(44)
      await expect(t.height).toBeGreaterThanOrEqual(44)
      await expect(Math.abs(t.width - t.height)).toBeLessThan(0.5)
    } finally {
      if (densita === null) radice.removeAttribute('data-density')
      else radice.setAttribute('data-density', densita)
    }

    const larga = misura('larga')
    await expect(getComputedStyle(larga.testo).display).not.toBe('none')
    await expect(larga.testo).toBeVisible()
  },
}
