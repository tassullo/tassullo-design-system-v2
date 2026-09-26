import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileTextIcon, ImageIcon, ListChecksIcon } from 'lucide-react'
import { expect } from 'storybook/test'

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
