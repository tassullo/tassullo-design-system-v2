import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BoxesIcon, BracesIcon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon } from 'lucide-react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  SCHEDA_CORTA,
  SCHEDA_DA_QUARANTA,
  SCHEDA_LUNGA,
  cambia,
  conta,
  inOrdine,
  type BloccoScheda,
} from '@/prove/scheda-blocchi'
import { Albero, AlberoConto, AlberoLegenda, AlberoSegno } from '@/registry/tassullo/blocks/albero'
import { AppShell, ColonnaLaterale, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { ElencoDettaglio, type ElencoDettaglioProps } from '@/registry/tassullo/blocks/elenco-dettaglio'
import { PageHeader } from '@/registry/tassullo/blocks/page-header'
import { TestoSegnaposto, TestoSegnapostoElenco, type VoceSegnaposto } from '@/registry/tassullo/blocks/testo-segnaposto'
import { Button } from '@/registry/tassullo/ui/button'
import { Field, FieldLabel } from '@/registry/tassullo/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/tassullo/ui/tabs'

/**
 * Un elenco a larghezza fissa accanto al dettaglio della voce scelta, in una
 * cornice sola. L'elenco resta in vista mentre la pagina scorre.
 *
 * **Quando sì, quando no.** Si usa quando si lavora su una voce alla volta e
 * l'elenco serve a passare da una all'altra: l'albero di una scheda e il
 * blocco scelto. Per confrontare due contenuti alla pari c'è
 * `tassullo-split-view`. Per un elenco che vale per tutta la pagina, come i
 * dati da citare, c'è `ColonnaLaterale` di `tassullo-app-shell`. Non va
 * dentro una `Card`: la cornice è la sua, e una card intorno toglierebbe
 * all'elenco il modo di restare fermo.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-elenco-dettaglio
 * ```
 *
 * ```tsx
 * <ElencoDettaglio sotto="fascia-e-tab" elenco={<Albero … />}>
 *   <BloccoScelto />
 * </ElencoDettaglio>
 * ```
 *
 * **Le prop.** `elenco`, la parte a sinistra; i figli sono il dettaglio.
 * `sotto` dice cosa resta fermo in cima alla finestra sopra il blocco:
 * `fascia`, la fascia del guscio; `fascia-e-tab`, la fascia più le tab ferme
 * di una scheda; `niente`, una pagina senza guscio. `etichettaElenco` dà un
 * nome alla parte dell'elenco, se il suo contenuto non ne ha già uno.
 *
 * **Regole d'uso.**
 *
 * - L'elenco ha una larghezza sola, 288px, e il dettaglio prende il resto:
 *   quando lo spazio cala, per esempio aprendo la colonna laterale, si
 *   stringe il dettaglio.
 * - Se l'elenco è più alto della finestra scorre per conto suo, e la pagina
 *   scorre col dettaglio. La riga scelta di un `Albero` resta in vista da sé.
 * - Sotto 576px di contenitore le due parti stanno una sopra l'altra, e
 *   l'elenco scorre con la pagina. La soglia guarda il contenitore, non lo
 *   schermo.
 * - Le misure di `sotto` sono quelle della fascia del guscio e delle tab
 *   ferme della pagina scheda: una pagina con altro di fermo in cima non è
 *   coperta.
 *
 * **Tastiera e accessibilità.** Il blocco non aggiunge fermate: il `Tab`
 * attraversa l'elenco e poi il dettaglio. L'elenco che scorre si scorre da
 * tastiera portando il fuoco sulle sue righe.
 */
const meta = {
  title: 'Blocchi/Elenco e dettaglio',
  component: ElencoDettaglio,
  parameters: {
    layout: 'padded',
    // L'elenco dei suggerimenti del testo scorre con le frecce dal testo.
    a11y: { config: { rules: [{ id: 'scrollable-region-focusable', enabled: false }] } },
  },
  args: { elenco: null, children: null },
} satisfies Meta<typeof ElencoDettaglio>

export default meta
type Story = StoryObj<typeof meta>

const VOCI: VoceSegnaposto[] = [
  { gruppo: 'Famiglia', etichetta: 'Nome della famiglia', testo: '{{famiglia.nome}}', valore: 'Malta R4' },
  { gruppo: 'Qualifica', etichetta: 'Norma', testo: '{{qualifica.norma}}', valore: 'EN 1504-3' },
  { gruppo: 'Qualifica', etichetta: 'Classe', testo: '{{qualifica.classe}}', valore: 'R4' },
  { gruppo: 'Confezione', etichetta: 'Peso del sacco', testo: '{{confezione.peso}}', valore: '25 kg' },
]

function Scheda({
  iniziale,
  sotto,
  colonna = false,
}: {
  iniziale: BloccoScheda[]
  sotto: ElencoDettaglioProps['sotto']
  colonna?: boolean
}) {
  const [blocchi, setBlocchi] = useState(iniziale)
  const [scelto, setScelto] = useState(iniziale[0].id)
  const ordine = inOrdine(blocchi)
  const posto = Math.max(0, ordine.findIndex((v) => v.blocco.id === scelto))
  const { blocco, padri } = ordine[posto]
  const prima = ordine[posto - 1]?.blocco
  const dopo = ordine[posto + 1]?.blocco
  const mancano = ordine.filter((v) => !v.blocco.testo && !v.blocco.figli?.length).length
  return (
    <>
      <ElencoDettaglio
        sotto={sotto}
        elenco={
          <>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold">Scheda tecnica</h2>
              <p className="text-sm text-muted-foreground">
                {ordine.length} blocchi, {mancano} da scrivere
              </p>
            </div>
            <Albero
              etichetta="Struttura della scheda tecnica"
              nodi={blocchi}
              scelto={blocco.id}
              onScegli={setScelto}
              segno={(b) =>
                b.testo ? (
                  <AlberoSegno tipo="pieno" nome="Con testo" />
                ) : b.figli?.length ? (
                  <AlberoConto>{conta(b)} blocchi</AlberoConto>
                ) : (
                  <AlberoSegno tipo="vuoto" nome="Da scrivere" />
                )
              }
            />
            <AlberoLegenda>
              <li>
                <AlberoSegno tipo="pieno" />
                con testo
              </li>
              <li>
                <AlberoSegno tipo="vuoto" />
                da scrivere
              </li>
            </AlberoLegenda>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">{['Scheda tecnica', ...padri.map((p) => p.titolo)].join(' › ')}</p>
        <h3 className="text-lg font-semibold">{blocco.titolo}</h3>
        <Field>
          <FieldLabel id="testo-del-blocco">Testo</FieldLabel>
          <TestoSegnaposto
            aria-labelledby="testo-del-blocco"
            voci={VOCI}
            righe={8}
            ridimensionabile
            chiave={blocco.id}
            value={blocco.testo}
            onChange={(testo) => setBlocchi((b) => cambia(b, blocco.id, (questo) => ({ ...questo, testo })))}
          />
        </Field>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" disabled={!prima} onClick={() => prima && setScelto(prima.id)}>
            <ChevronLeftIcon data-icon="inline-start" />
            Precedente
          </Button>
          <Button variant="outline" disabled={!dopo} onClick={() => dopo && setScelto(dopo.id)}>
            Successivo
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </ElencoDettaglio>
      {colonna ? (
        <ColonnaLaterale etichetta="Dati da citare">
          <h2 className="text-base font-medium">Dati da citare</h2>
          <TestoSegnapostoElenco voci={VOCI} onScegli={() => {}} className="flex-1" />
        </ColonnaLaterale>
      ) : null}
    </>
  )
}

/**
 * L'albero di una scheda a sinistra, il blocco scelto a destra. Un solo campo
 * di testo per tutti i blocchi: cambia ciò che mostra, e ogni testo tiene il
 * suo annulla.
 */
export const Predefinito: Story = {
  render: () => <Scheda iniziale={SCHEDA_CORTA} sotto="niente" />,
}

const SEZIONI: SezioneNav[] = [
  {
    titolo: 'Anagrafe',
    voci: [
      { titolo: 'Famiglie', icona: BoxesIcon, href: '#', attiva: true },
      { titolo: 'Documenti', icona: FileTextIcon, href: '#' },
    ],
  },
]
const UTENTE = { nome: 'Stefano', cognome: 'Bertolini', email: 'sbertolini@esempio.it', ruolo: 'Redattore' }

function Pagina({ iniziale }: { iniziale: BloccoScheda[] }) {
  const [colonna, setColonna] = useState(false)
  return (
    <AppShell applicazione="Anagrafe" sezioni={SEZIONI} utente={UTENTE}>
      <div className="flex flex-col gap-4">
        <PageHeader
          percorso={[{ titolo: 'Famiglie', href: '#' }, { titolo: 'Malta R4' }]}
          azioni={[{ titolo: 'Dati da citare', icona: BracesIcon, ruolo: 'secondaria', onClick: () => setColonna(!colonna) }]}
        />
        <Tabs defaultValue="testi">
          <div data-slot="fascia-tab" className="sticky top-12 z-10 -mx-4 bg-background px-4 py-2 [html:has(&)]:scroll-pt-24">
            <TabsList aria-label="Sezioni">
              <TabsTrigger value="anagrafica">Anagrafica</TabsTrigger>
              <TabsTrigger value="testi">Testi</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="anagrafica">
            <p className="text-sm text-muted-foreground">I dati della famiglia.</p>
          </TabsContent>
          <TabsContent value="testi">
            <Scheda iniziale={iniziale} sotto="fascia-e-tab" colonna={colonna} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

/**
 * Dentro il guscio, nella tab di una scheda, con quaranta blocchi: l'albero è
 * più alto della finestra. Resta fermo sotto la fascia e le tab e scorre per
 * conto suo, mentre la pagina scorre col blocco. «Dati da citare» in fascia
 * apre la colonna laterale: si stringe il blocco, non l'albero.
 */
export const NelGuscio: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Pagina iniziale={SCHEDA_DA_QUARANTA} />,
}

/**
 * In un contenitore stretto le due parti stanno una sopra l'altra: prima
 * l'albero, poi il blocco scelto.
 */
export const Stretta: Story = {
  render: () => (
    <div className="max-w-md">
      <Scheda iniziale={SCHEDA_LUNGA} sotto="niente" />
    </div>
  ),
}

const px = (n: number) => Math.round(n)
const parte = (radice: HTMLElement, quale: 'elenco' | 'dettaglio') =>
  radice.querySelector<HTMLElement>(`[data-slot="elenco-dettaglio-${quale}"]`)!
const riga = (radice: HTMLElement, id: string) =>
  radice.querySelector<HTMLElement>(`[data-slot="albero-voce"][data-id="${id}"]`)!

// Dentro il guscio, a pagina scorsa: l'elenco sta sotto fascia e tab, non
// esce dalla finestra, scorre da sé e tiene in vista la riga scelta; con la
// colonna laterale aperta si stringe il dettaglio.
export const NelGuscioProva: Story = {
  ...NelGuscio,
  name: 'Nel Guscio, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  play: async ({ canvasElement }) => {
    const elenco = await waitFor(() => {
      const el = parte(canvasElement, 'elenco')
      expect(el).toBeInTheDocument()
      return el
    })
    const dettaglio = parte(canvasElement, 'dettaglio')
    const pagina = document.scrollingElement ?? document.documentElement
    try {
      // Affiancati, e l'elenco è largo 288px.
      expect(`elenco largo ${px(elenco.getBoundingClientRect().width)}`).toBe('elenco largo 288')
      expect(`accanto: ${dettaglio.getBoundingClientRect().left >= elenco.getBoundingClientRect().right}`).toBe('accanto: true')
      // È più alto della finestra: scorre per conto suo.
      expect(`scorre da sé: ${elenco.scrollHeight > elenco.clientHeight}`).toBe('scorre da sé: true')

      // Un testo lungo nel blocco scelto, per dare corsa alla pagina.
      const area = await waitFor(() => {
        const el = canvasElement.querySelector<HTMLElement & { editor: { commands: { setContent: (c: unknown) => void } } }>(
          '[data-slot="testo-segnaposto-area"]'
        )
        expect(el?.editor).toBeTruthy()
        return el!
      })
      area.editor.commands.setContent({
        type: 'doc',
        content: Array.from({ length: 70 }, (_, n) => ({ type: 'paragraph', content: [{ type: 'text', text: `Riga ${n + 1}` }] })),
      })
      await waitFor(() => expect(`corsa ${pagina.scrollHeight - pagina.clientHeight >= 500}`).toBe('corsa true'))
      window.scrollTo({ top: 500, behavior: 'instant' })

      // Fermo sotto le tab, col margine del contenuto, e dentro la finestra.
      const tab = canvasElement.querySelector<HTMLElement>('[data-slot="fascia-tab"]')!.getBoundingClientRect()
      const unita = parseFloat(getComputedStyle(elenco).paddingRight) / 4
      await waitFor(() => expect(`elenco da ${px(elenco.getBoundingClientRect().top)}`).toBe(`elenco da ${px(tab.bottom + unita * 4)}`))
      expect(`in finestra: ${elenco.getBoundingClientRect().bottom <= innerHeight}`).toBe('in finestra: true')

      // Scelta l'ultima riga da tastiera: l'elenco scorre fino a lei, la
      // pagina resta dov'è.
      riga(canvasElement, 'descrizione').focus()
      await userEvent.keyboard('{End}{Enter}')
      const ultima = riga(canvasElement, 'extra-3-d')
      await waitFor(() => expect(ultima).toHaveAttribute('aria-current', 'true'))
      await waitFor(() => {
        const r = ultima.getBoundingClientRect()
        const e = elenco.getBoundingClientRect()
        expect(`riga in vista: ${r.top >= e.top && r.bottom <= e.bottom}`).toBe('riga in vista: true')
      })
      // Tornando alla prima, l'elenco torna su.
      await userEvent.keyboard('{Home}{Enter}')
      await waitFor(() => {
        const r = riga(canvasElement, 'descrizione').getBoundingClientRect()
        expect(`prima in vista: ${r.top >= elenco.getBoundingClientRect().top}`).toBe('prima in vista: true')
      })

      // La colonna laterale stringe il dettaglio, non l'elenco.
      const largoPrima = dettaglio.getBoundingClientRect().width
      const bottone = [...canvasElement.querySelectorAll<HTMLElement>('[data-slot="page-header-bar"] button')].find(
        (b) => b.textContent?.trim() === 'Dati da citare'
      )
      await userEvent.click(bottone!)
      await waitFor(() => expect(canvasElement.querySelector('[data-slot="colonna-laterale"]')).toBeInTheDocument())
      await waitFor(() =>
        expect(`dettaglio più stretto: ${dettaglio.getBoundingClientRect().width < largoPrima - 200}`).toBe('dettaglio più stretto: true')
      )
      expect(`elenco largo ${px(elenco.getBoundingClientRect().width)}`).toBe('elenco largo 288')
      expect(`accanto: ${dettaglio.getBoundingClientRect().left >= elenco.getBoundingClientRect().right}`).toBe('accanto: true')
    } finally {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  },
}

// In un contenitore stretto: l'elenco sopra, il dettaglio sotto, e niente di
// fermo né di scorrevole per conto suo.
export const StrettaProva: Story = {
  ...Stretta,
  name: 'Stretta, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  play: async ({ canvasElement }) => {
    const elenco = await waitFor(() => {
      const el = parte(canvasElement, 'elenco')
      expect(el).toBeInTheDocument()
      return el
    })
    const dettaglio = parte(canvasElement, 'dettaglio')
    expect(`sotto: ${dettaglio.getBoundingClientRect().top >= elenco.getBoundingClientRect().bottom}`).toBe('sotto: true')
    expect(getComputedStyle(elenco).position).toBe('static')
    expect(`scorre da sé: ${elenco.scrollHeight > elenco.clientHeight}`).toBe('scorre da sé: false')
    expect(within(canvasElement).getByRole('navigation', { name: 'Struttura della scheda tecnica' })).toBeInTheDocument()
  },
}
