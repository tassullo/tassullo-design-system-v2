import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileTextIcon, ImageIcon, ListChecksIcon } from 'lucide-react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/tassullo/ui/tabs'

/**
 * Schede che dividono il contenuto di una pagina in parti, e ne mostrano una
 * alla volta: i dati, gli allegati, le revisioni di una scheda.
 *
 * **Quando sì, quando no.** Le schede cambiano il pannello sotto, non la
 * pagina: se un'etichetta porta a un altro indirizzo è un collegamento, e il
 * tasto indietro del browser deve funzionare. I passi di una procedura, da
 * fare in ordine, sono `stepper`. Una scelta che filtra o cambia la vista di
 * un elenco è `toggle-group`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tabs
 * ```
 *
 * **Varianti e opzioni.** `variant` su `TabsList`: `default` (a pillole, su
 * fondo grigio) o `line` (un filo sotto la scheda attiva). `orientation` su
 * `Tabs`: `horizontal` o `vertical`. `value` o `defaultValue` su `Tabs`,
 * `value` e `disabled` su `TabsTrigger` e `TabsContent`.
 *
 * **Regole d'uso.**
 *
 * - Il contenitore delle schede ha una larghezza definita — una classe della
 *   scala, come `w-96`, o la colonna della pagina. In un contenitore che si
 *   stringe sul contenuto, ogni pannello porta la sua larghezza e la lista
 *   delle schede si sposta a ogni clic; `w-full` lì non basta.
 * - Le icone nelle schede sono decorative: il nome resta il testo.
 * - Quando le schede non stanno in una riga, sotto una larghezza del
 *   contenitore la lista si spegne e al suo posto compare una `Select`
 *   «Sezione: …» che guida le stesse schede: la ricetta è nella scena «Molte
 *   Tab». La lista non si fa scorrere di lato né andare a capo.
 *
 * **Tastiera e accessibilità.** La lista è un solo fermo di tabulazione:
 * `Tab` entra sulla scheda attiva, le frecce spostano il fuoco fra le schede
 * e ricominciano dall'inizio in fondo alla lista, `Invio` o `Spazio` aprono
 * quella col fuoco, e il `Tab` seguente scende nel pannello. Le schede
 * disattivate si saltano. Con `activateOnFocus` su `TabsList` la scheda si apre
 * già spostandoci sopra il fuoco.
 */
const meta = {
  title: 'Primitive/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

function Pannelli() {
  return (
    <>
      <TabsContent value="dati" className="pt-2 text-sm text-muted-foreground">
        Membrana impermeabilizzante armata in poliestere, spessore 4 mm.
      </TabsContent>
      <TabsContent value="allegati" className="pt-2 text-sm text-muted-foreground">
        Disegno tecnico, certificato di conformità, scheda di sicurezza.
      </TabsContent>
      <TabsContent value="revisioni" className="pt-2 text-sm text-muted-foreground">
        Quattro revisioni, l'ultima pubblicata il 14 maggio.
      </TabsContent>
    </>
  )
}

/*
 * La prova che il filo della scheda attiva resta dentro la lista, eseguita a
 * ogni giro del controllo di accessibilità. Il filo è un `::after` sotto la
 * scheda; se sporge anche di un pixel, la lista ha un contenuto più alto di
 * sé, e appena le si dà `overflow-x-auto` — il modo ovvio di non far
 * sbordare molte schede — il browser le calcola anche lo scorrimento
 * verticale e compare una barra accanto alle schede.
 *
 * Si misura in tutte e due le densità, mettendo `data-density` sulla radice
 * delle schede, e con e senza `overflow-x-auto`: altezza del contenuto
 * uguale all'altezza della lista; e con `overflow-x-auto` la lista non
 * scorre in verticale (`scrollTop` resta a zero). La larghezza della barra
 * non è una misura: dove le barre sono sovrapposte vale zero anche quando
 * la barra c'è. Alla fine la scena torna com'era, perché la scansione la
 * guardi a riposo.
 */
function provaFiloDentroLaLista({ canvasElement }: { canvasElement: HTMLElement }) {
  const lista = canvasElement.querySelector<HTMLElement>('[data-slot="tabs-list"]')
  const radice = canvasElement.querySelector<HTMLElement>('[data-slot="tabs"]')
  if (!lista || !radice) throw new Error('Nessuna lista di schede in questa scena')
  try {
    for (const densita of ['normale', 'touch']) {
      radice.setAttribute('data-density', densita)
      for (const scorrimento of ['', 'auto']) {
        lista.style.overflowX = scorrimento
        const misura = `${densita}, overflow-x ${scorrimento || 'visible'}`
        expect(`${misura}: ${lista.scrollHeight}/${lista.clientHeight}`).toBe(
          `${misura}: ${lista.clientHeight}/${lista.clientHeight}`,
        )
        if (scorrimento) {
          lista.scrollTop = 10
          expect(`${misura}: scrollTop ${lista.scrollTop}`).toBe(`${misura}: scrollTop 0`)
          lista.scrollTop = 0
        }
      }
    }
  } finally {
    radice.removeAttribute('data-density')
    lista.style.overflowX = ''
  }
}

/**
 * Tre schede a pillole su una larghezza fissa: cambiando scheda la lista non
 * si sposta.
 */
export const Predefinito: Story = {
  render: () => (
    <Tabs defaultValue="dati" className="w-96">
      <TabsList>
        <TabsTrigger value="dati">Dati</TabsTrigger>
        <TabsTrigger value="allegati">Allegati</TabsTrigger>
        <TabsTrigger value="revisioni">Revisioni</TabsTrigger>
      </TabsList>
      <Pannelli />
    </Tabs>
  ),
}

// Scena di misura di «Predefinito»: la stessa resa, con la prova. `!dev` la
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo;
// il controllo automatico la esegue lo stesso.
export const PredefinitoProva: Story = {
  ...Predefinito,
  name: 'Predefinito, prova',
  tags: ['!dev', '!autodocs'],
  play: provaFiloDentroLaLista,
}

/**
 * La variante `line`: un filo sotto la scheda attiva, senza pillola.
 */
export const Filo: Story = {
  render: () => (
    <Tabs defaultValue="dati" className="w-96">
      <TabsList variant="line">
        <TabsTrigger value="dati">Dati</TabsTrigger>
        <TabsTrigger value="allegati">Allegati</TabsTrigger>
        <TabsTrigger value="revisioni">Revisioni</TabsTrigger>
      </TabsList>
      <Pannelli />
    </Tabs>
  ),
}

// Scena di misura di «Filo»: la stessa resa, con la prova. `!dev` la
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo;
// il controllo automatico la esegue lo stesso.
export const FiloProva: Story = {
  ...Filo,
  name: 'Filo, prova',
  tags: ['!dev', '!autodocs'],
  play: provaFiloDentroLaLista,
}

/**
 * Con le icone accanto ai nomi.
 */
export const ConIcone: Story = {
  render: () => (
    <Tabs defaultValue="dati" className="w-96">
      <TabsList>
        <TabsTrigger value="dati"><FileTextIcon />Dati</TabsTrigger>
        <TabsTrigger value="allegati"><ImageIcon />Allegati</TabsTrigger>
        <TabsTrigger value="revisioni"><ListChecksIcon />Revisioni</TabsTrigger>
      </TabsList>
      <Pannelli />
    </Tabs>
  ),
}

/**
 * In verticale: la lista a sinistra, il pannello a destra.
 */
export const Verticale: Story = {
  render: () => (
    <Tabs orientation="vertical" defaultValue="dati" className="w-96">
      <TabsList className="w-40">
        <TabsTrigger value="dati">Dati</TabsTrigger>
        <TabsTrigger value="allegati">Allegati</TabsTrigger>
        <TabsTrigger value="revisioni">Revisioni</TabsTrigger>
      </TabsList>
      <Pannelli />
    </Tabs>
  ),
}

/**
 * Una scheda disattivata: non prende il fuoco e le frecce la saltano.
 */
export const Disattivata: Story = {
  render: () => (
    <Tabs defaultValue="dati" className="w-96">
      <TabsList>
        <TabsTrigger value="dati">Dati</TabsTrigger>
        <TabsTrigger value="allegati" disabled>
          Allegati
        </TabsTrigger>
        <TabsTrigger value="revisioni">Revisioni</TabsTrigger>
      </TabsList>
      <Pannelli />
    </Tabs>
  ),
}

const SEZIONI = [
  { value: 'anagrafica', titolo: 'Anagrafica' },
  { value: 'composizione', titolo: 'Composizione' },
  { value: 'qualifiche', titolo: 'Qualifiche (12)' },
  { value: 'documenti', titolo: 'Documenti' },
  { value: 'traduzioni', titolo: 'Traduzioni' },
  { value: 'storico', titolo: 'Storico' },
]

function MolteSchede() {
  const [sezione, setSezione] = useState('anagrafica')
  return (
    <Tabs
      value={sezione}
      onValueChange={(v) => setSezione(String(v))}
      className="@container/sezioni w-full"
    >
      <TabsList aria-label="Sezioni" className="hidden @2xl/sezioni:inline-flex">
        {SEZIONI.map((s) => (
          <TabsTrigger key={s.value} value={s.value}>
            {s.titolo}
          </TabsTrigger>
        ))}
      </TabsList>
      <Select
        items={SEZIONI.map((s) => ({ value: s.value, label: s.titolo }))}
        value={sezione}
        onValueChange={(v) => setSezione(String(v))}
      >
        <SelectTrigger aria-label="Sezione" className="w-full @2xl/sezioni:hidden">
          <span className="text-muted-foreground">Sezione:</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {SEZIONI.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.titolo}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {SEZIONI.map((s) => (
        <TabsContent key={s.value} value={s.value} className="pt-2 text-sm text-muted-foreground">
          Il pannello «{s.titolo}» della scheda di un prodotto.
        </TabsContent>
      ))}
    </Tabs>
  )
}

/**
 * Sei schede, più di quante ne stiano in riga su un telefono: sei nomi
 * chiedono circa 510px, 580 in densità touch. La ricetta usa due primitive
 * così come sono, `Tabs` e `Select`:
 *
 * - la radice delle schede è un contenitore, `@container/sezioni`;
 * - sopra la soglia del contenitore si vede la lista, `hidden
 *   @2xl/sezioni:inline-flex`;
 * - sotto, al suo posto, una `Select` larga quanto il contenitore, `w-full
 *   @2xl/sezioni:hidden`, con davanti «Sezione:»;
 * - lista e `Select` leggono e scrivono lo stesso valore: le schede sono
 *   controllate, con `value` e `onValueChange`.
 *
 * La soglia si sceglie per ogni scheda, a mano: è la larghezza della lista in
 * densità touch, più un margine. Qui `@2xl` (672px) per sei schede. Si
 * guarda il contenitore e non la finestra, così la forma segue la colonna di
 * navigazione aperta o chiusa. In questa pagina la scena si vede alla
 * larghezza della pagina; con la Viewport del telefono compare la `Select`.
 */
export const MolteTab: Story = {
  name: 'Molte Tab',
  parameters: { layout: 'padded' },
  render: () => <MolteSchede />,
}

/*
 * La prova della ricetta, con il contenitore stretto: la radice delle schede
 * si porta a 20rem (320px), la larghezza utile di un telefono. La lista delle
 * schede non si vede, la `Select` sì, e niente sborda dal contenitore; poi si
 * sceglie «Storico» nella `Select`, e si deve vedere il pannello di Storico.
 * Alla fine si torna ad «Anagrafica» e alla larghezza di prima, perché la
 * scansione guardi la scena a riposo.
 */
async function provaMolteTab({ canvasElement }: { canvasElement: HTMLElement }) {
  const radice = canvasElement.querySelector<HTMLElement>('[data-slot="tabs"]')
  if (!radice) throw new Error('Nessuna scheda in questa scena')
  const lista = radice.querySelector<HTMLElement>('[data-slot="tabs-list"]')!
  const scelta = radice.querySelector<HTMLElement>('[data-slot="select-trigger"]')!
  const visibile = (el: Element) => getComputedStyle(el).display !== 'none'
  const pannello = () => radice.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])')
  const sceglie = async (nome: string) => {
    await userEvent.click(scelta)
    await userEvent.click(await screen.findByRole('option', { name: nome }))
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  }
  const larghezza = radice.style.width
  radice.style.width = '20rem'
  try {
    expect(`lista visibile: ${visibile(lista)}`).toBe('lista visibile: false')
    expect(`scelta visibile: ${visibile(scelta)}`).toBe('scelta visibile: true')
    expect(`sborda di ${radice.scrollWidth - radice.clientWidth}px`).toBe('sborda di 0px')
    await sceglie('Storico')
    await waitFor(() => expect(within(pannello()!).getByText(/Storico/)).toBeVisible())
  } finally {
    if (!within(pannello()!).queryByText(/Anagrafica/)) await sceglie('Anagrafica')
    radice.style.width = larghezza
  }
}

// Scena di misura di «Molte Tab»: la stessa resa, con la prova. `!dev` la
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo; il
// controllo automatico la esegue lo stesso.
export const MolteTabProva: Story = {
  ...MolteTab,
  name: 'Molte Tab, prova',
  tags: ['!dev', '!autodocs'],
  play: provaMolteTab,
}
