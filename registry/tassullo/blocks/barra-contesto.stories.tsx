import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
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
 *
 * **Tastiera e accessibilità.** Il grilletto si apre con `Invio` o `Spazio`,
 * e il fuoco va sulla prima voce; le frecce scorrono le voci, e l'entità
 * attiva porta il segno di spunta (`role="menuitemradio"`, `aria-checked`).
 * `Esc` e il clic fuori chiudono il menu, e il fuoco torna al grilletto.
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
            // **Solo il nome**, senza il codice (scelta di Francesco il
            // 2026-09-21): sta su una riga sola e resta quello che si
            // riconosce a colpo d'occhio. Il codice non sparisce — è nella
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
        utente={{ nome: 'Francesco', cognome: 'Sartori', ruolo: 'Progettista' }}
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
