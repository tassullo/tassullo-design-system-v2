import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { apriCol } from '@/prove/apri'
import { SCHEDA_LUNGA, conta, sposta, togli, type BloccoScheda } from '@/prove/scheda-blocchi'
import {
  Albero,
  AlberoConto,
  AlberoLegenda,
  AlberoSegno,
  type AlberoRef,
  type MossaAlbero,
} from '@/registry/tassullo/blocks/albero'
import { Button } from '@/registry/tassullo/ui/button'
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '@/registry/tassullo/ui/dropdown-menu'

/**
 * Le righe annidate di una struttura, con la riga scelta: l'indice di un
 * documento fatto di parti, accanto al contenuto della parte scelta.
 *
 * **Quando sì, quando no.** Si usa quando le righe hanno un livello e
 * sceglierne una decide cosa si vede accanto: i capitoli di una scheda, le
 * voci di una procedura. Per dati in colonne con righe che si aprono c'è
 * `tassullo-data-table` con le sotto-righe. Per la navigazione
 * dell'applicazione c'è la barra di `tassullo-app-shell`. Accanto al dettaglio
 * si monta dentro `tassullo-elenco-dettaglio`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-albero
 * ```
 *
 * ```tsx
 * <Albero
 *   etichetta="Struttura della scheda tecnica"
 *   nodi={blocchi}
 *   scelto={scelto}
 *   onScegli={setScelto}
 *   segno={(blocco) =>
 *     blocco.testo ? <AlberoSegno tipo="pieno" nome="Con testo" /> : <AlberoSegno tipo="vuoto" nome="Da scrivere" />
 *   }
 *   menu={(blocco) => <DropdownMenuItem variant="destructive">Elimina</DropdownMenuItem>}
 *   onSposta={(mossa) => setBlocchi(applica(mossa))}
 * />
 * ```
 *
 * **Le prop.** `nodi`: ogni nodo ha `id`, `titolo` e i suoi `figli`. `scelto`
 * e `onScegli`: la riga scelta la tiene l'app. `segno`: ciò che sta a destra
 * del titolo, deciso dall'app riga per riga; `AlberoSegno` disegna un pallino
 * pieno, uno vuoto o un errore, `AlberoConto` un conto. `menu`: le voci del
 * menu di riga. `onSposta`: accende il riordino. `fermo`: menu e riordino
 * fermi, per esempio mentre si salva. `AlberoLegenda` è l'elenco dei segni da
 * mettere sotto.
 *
 * **Regole d'uso.**
 *
 * - I primi tre livelli hanno ognuno il suo stile: il primo in grassetto, il
 *   secondo in maiuscoletto piccolo, il terzo in tondo. Più in giù resta
 *   quello del terzo, e cambia solo il rientro.
 * - Un titolo lungo va a capo: non si tronca.
 * - Ogni segno ha un nome che si legge anche senza vederlo, e sotto l'albero
 *   c'è la legenda. Un conto si scrive per esteso: «5 blocchi».
 * - Il menu di riga si vede al passaggio, sulla riga scelta e quando la riga
 *   ha il fuoco. Le voci le dà l'app; una voce che porta il fuoco altrove,
 *   come «Aggiungi», indica con `fuocoAltrove` l'elemento che lo prende.
 * - Con `onSposta` una riga si trascina fra le righe dello stesso padre,
 *   portando con sé le sue righe interne, e il menu offre «Sposta su» e
 *   «Sposta giù». L'albero non tiene l'ordine: l'app applica la mossa ai suoi
 *   dati. Sotto un altro padre non si sposta.
 * - Se l'albero sta in un riquadro che scorre, la riga scelta resta in vista
 *   dentro il riquadro; la pagina non si muove.
 *
 * **Tastiera e accessibilità.** L'albero è una fermata sola del `Tab`: si
 * entra sulla riga scelta, le frecce su e giù passano da una riga all'altra,
 * `Inizio` e `Fine` vanno alla prima e all'ultima, `Invio` o `Spazio`
 * scelgono. Un altro `Tab` porta al menu della riga. La riga scelta è
 * annunciata come quella corrente, e il livello lo dicono le liste annidate.
 * Da tastiera si riordina dal menu.
 */
const meta = {
  title: 'Blocchi/Albero',
  component: Albero,
  parameters: { layout: 'padded' },
  args: { etichetta: 'Struttura della scheda tecnica', nodi: [] },
} satisfies Meta<typeof Albero>

export default meta
type Story = StoryObj<typeof meta>

const segnoDi = (blocco: BloccoScheda, errori: readonly string[] = []) =>
  errori.includes(blocco.id) ? (
    <AlberoSegno tipo="errore" nome="Con un errore" />
  ) : blocco.testo ? (
    <AlberoSegno tipo="pieno" nome="Con testo" />
  ) : (blocco.figli ?? []).length > 0 ? (
    <AlberoConto>{conta(blocco)} blocchi</AlberoConto>
  ) : (
    <AlberoSegno tipo="vuoto" nome="Da scrivere" />
  )

const LEGENDA = (
  <AlberoLegenda>
    <li>
      <AlberoSegno tipo="pieno" />
      con testo
    </li>
    <li>
      <AlberoSegno tipo="vuoto" />
      da scrivere
    </li>
    <li>
      <AlberoSegno tipo="errore" />
      con un errore
    </li>
    <li>«N blocchi»: senza un testo suo, ne contiene altri</li>
  </AlberoLegenda>
)

function Scheda({
  sola = false,
  fermo = false,
  onMossa,
}: {
  sola?: boolean
  fermo?: boolean
  onMossa?: (mossa: MossaAlbero) => void
}) {
  const [blocchi, setBlocchi] = useState(SCHEDA_LUNGA)
  const [scelto, setScelto] = useState('descrizione')
  const albero = useRef<AlberoRef>(null)
  const bottone = useRef<HTMLButtonElement>(null)
  return (
    <div className="flex max-w-2xs flex-col gap-3">
      <Albero
        ref={albero}
        etichetta="Struttura della scheda tecnica"
        nodi={blocchi}
        scelto={scelto}
        onScegli={setScelto}
        segno={(blocco) => segnoDi(blocco, ['bagnati'])}
        fermo={fermo}
        menu={
          sola
            ? undefined
            : (blocco, posto) => (
                <>
                  {posto.livello < 3 ? (
                    <>
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => {
                            // Nell'app il fuoco va al titolo del blocco nuovo.
                            posto.fuocoAltrove(() => bottone.current)
                          }}
                        >
                          <PlusIcon />
                          Aggiungi sotto
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                    </>
                  ) : null}
                  <DropdownMenuItem variant="destructive" onClick={() => setBlocchi((prima) => togli(prima, blocco.id))}>
                    <Trash2Icon />
                    Elimina
                  </DropdownMenuItem>
                </>
              )
        }
        onSposta={
          sola
            ? undefined
            : (mossa) => {
                onMossa?.(mossa)
                setBlocchi((prima) => sposta(prima, mossa))
              }
        }
      />
      {LEGENDA}
      <Button ref={bottone} variant="outline" size="sm" className="self-start" onClick={() => albero.current?.focus()}>
        Vai alla riga scelta
      </Button>
    </div>
  )
}

/**
 * La struttura di una scheda tecnica: venti blocchi su tre livelli. A destra
 * di ogni titolo il segno di com'è messo il blocco: con testo, da scrivere,
 * con un errore, oppure quanti blocchi contiene. Le righe si trascinano fra
 * quelle dello stesso padre, e un titolo lungo va a capo.
 */
export const Predefinito: Story = {
  render: () => <Scheda />,
}

/**
 * Il menu di una riga: le voci dell'app, e sotto «Sposta su» e «Sposta giù»,
 * che l'albero aggiunge quando il riordino è acceso.
 */
export const MenuDiRiga: Story = {
  render: () => <Scheda />,
  play: apriCol('[data-slot="albero-riga"] [data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * Senza menu e senza riordino: le righe si scelgono e basta. È l'albero di
 * chi la scheda la legge.
 */
export const SolaLettura: Story = {
  render: () => <Scheda sola />,
}

const voci = (radice: HTMLElement) => [...radice.querySelectorAll<HTMLElement>('[data-slot="albero-voce"]')]
const titoli = (radice: HTMLElement) => voci(radice).map((v) => v.dataset.id)
const voce = (radice: HTMLElement, id: string) => voci(radice).find((v) => v.dataset.id === id)!

// Una fermata sola del `Tab`, le frecce, `Inizio`, `Fine`, `Invio`; la riga
// scelta; il menu col `Tab` e il riordino dal menu; il titolo che va a capo.
export const TastieraProva: Story = {
  name: 'Tastiera, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  render: () => <Scheda />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const albero = tela.getByRole('navigation', { name: 'Struttura della scheda tecnica' })
    const fermate = () =>
      [...albero.querySelectorAll<HTMLElement>('button')].filter((b) => b.tabIndex === 0).map((b) => b.dataset.id ?? 'menu')

    // Venti righe, una sola scelta, e la fermata del `Tab` è lei col suo menu.
    expect(voci(albero)).toHaveLength(20)
    expect(albero.querySelectorAll('[aria-current="true"]')).toHaveLength(1)
    expect(voce(albero, 'descrizione')).toHaveAttribute('aria-current', 'true')
    expect(fermate()).toEqual(['descrizione', 'menu'])
    // Il livello lo dicono le liste annidate: tre, una dentro l'altra.
    expect(voce(albero, 'sporchi').closest('ul')!.parentElement!.closest('ul')!.parentElement!.closest('ul')).toBeTruthy()
    // Il segno ha un nome, e sta nel nome della riga.
    expect(voce(albero, 'gesso')).toHaveAccessibleName('Supporti a base gesso Da scrivere')
    expect(voce(albero, 'applicazione')).toHaveAccessibleName('Applicazione 10 blocchi')
    expect(voce(albero, 'bagnati')).toHaveAccessibleName('Supporti bagnati Con un errore')

    // Il titolo lungo va a capo: la sua riga è più alta di una riga sola.
    const alta = voce(albero, 'sporchi').getBoundingClientRect().height
    const bassa = voce(albero, 'assorbenti').getBoundingClientRect().height
    expect(`a capo: ${alta > bassa * 1.5}`).toBe('a capo: true')

    // Le frecce muovono il fuoco, non la scelta; `Invio` sceglie.
    await userEvent.click(tela.getByRole('button', { name: 'Vai alla riga scelta' }))
    await waitFor(() => expect(document.activeElement).toBe(voce(albero, 'descrizione')))
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(document.activeElement).toBe(voce(albero, 'campo'))
    expect(voce(albero, 'descrizione')).toHaveAttribute('aria-current', 'true')
    expect(fermate()).toEqual(['campo', 'menu'])
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(voce(albero, 'capitolato'))
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(voce(albero, 'capitolato'))
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}')
    await waitFor(() => expect(voce(albero, 'uso')).toHaveAttribute('aria-current', 'true'))
    expect(albero.querySelectorAll('[aria-current="true"]')).toHaveLength(1)

    // Un altro `Tab` porta al menu della stessa riga; da lì «Sposta giù».
    await userEvent.tab()
    expect(document.activeElement).toHaveAccessibleName("Azioni: Destinazione d'uso")
    await userEvent.keyboard('{Enter}')
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Sposta giù' }))
    await waitFor(() => expect(titoli(albero).slice(0, 3)).toEqual(['descrizione', 'campo', 'uso']))
    // La prima riga non sale, l'ultima del suo padre non scende.
    // Aperto da tastiera: Safari non dà il fuoco a un bottone cliccato, e
    // `Esc` non arriverebbe al menu.
    within(voce(albero, 'descrizione').parentElement!).getByRole('button', { name: 'Azioni: Descrizione' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(await within(document.body).findByRole('menuitem', { name: 'Sposta su' })).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(document.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull())
    // Una voce che porta il fuoco altrove: chiuso il menu, il fuoco resta lì
    // e non torna al bottone del menu.
    within(voce(albero, 'campo').parentElement!).getByRole('button', { name: 'Azioni: Campo di applicazione' }).focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Aggiungi sotto' }))
    await waitFor(() => expect(document.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(tela.getByRole('button', { name: 'Vai alla riga scelta' })))
    // Uscito il fuoco dall'albero, la fermata torna la riga scelta.
    await userEvent.click(tela.getByRole('button', { name: 'Vai alla riga scelta' }))
    await waitFor(() => expect(document.activeElement).toBe(voce(albero, 'uso')))
  },
}

// Il riordino col puntatore: fra fratelli sì, sotto un altro padre no; e il
// clic senza movimento resta un clic.
export const RiordinoProva: Story = {
  name: 'Riordino, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { onSposta: fn() },
  render: (args) => <Scheda onMossa={args.onSposta} />,
  play: async ({ canvasElement, args }) => {
    const albero = within(canvasElement).getByRole('navigation')
    const centro = (el: HTMLElement) => {
      const r = el.getBoundingClientRect()
      return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }
    }
    const topo = (bersaglio: EventTarget, tipo: string, punto: { clientX: number; clientY: number }) =>
      bersaglio.dispatchEvent(new MouseEvent(tipo, { bubbles: true, cancelable: true, button: 0, buttons: 1, ...punto }))
    const fotogramma = () => new Promise((fatto) => setTimeout(fatto, 60))
    async function trascina(da: string, a: string) {
      const parte = centro(voce(albero, da))
      const arriva = centro(voce(albero, a))
      // Di poco oltre il centro della riga d'arrivo, dalla parte opposta.
      const oltre = arriva.clientY > parte.clientY ? 4 : -4
      topo(voce(albero, da), 'mousedown', parte)
      topo(document, 'mousemove', { ...parte, clientY: parte.clientY + 10 * Math.sign(oltre) })
      await fotogramma()
      topo(document, 'mousemove', { ...arriva, clientY: arriva.clientY + oltre })
      await fotogramma()
      topo(document, 'mouseup', { ...arriva, clientY: arriva.clientY + oltre })
      await fotogramma()
    }

    // «Descrizione» sotto «Campo di applicazione»: terzo posto del primo livello.
    await trascina('descrizione', 'campo')
    await waitFor(() => expect(titoli(albero).slice(0, 3)).toEqual(['uso', 'campo', 'descrizione']))
    expect(args.onSposta).toHaveBeenLastCalledWith({ id: 'descrizione', padre: null, indice: 2 })

    // Un capitolo si porta dietro le sue righe.
    await trascina('avvertenze', 'stoccaggio')
    await waitFor(() =>
      expect(titoli(albero).slice(-6)).toEqual(['stoccaggio', 'avvertenze', 'gelo', 'caldo', 'vento', 'capitolato'])
    )

    // Fra fratelli di un altro livello.
    await trascina('bagnati', 'sporchi')
    await waitFor(() => expect(args.onSposta).toHaveBeenLastCalledWith({ id: 'bagnati', padre: 'supporto', indice: 0 }))

    // Sotto un altro padre no: l'ordine resta com'era.
    const prima = titoli(albero)
    const mosse = (args.onSposta as ReturnType<typeof fn>).mock.calls.length
    await trascina('additivi', 'spessori')
    expect(titoli(albero)).toEqual(prima)
    expect((args.onSposta as ReturnType<typeof fn>).mock.calls).toHaveLength(mosse)

    // Un clic senza movimento sceglie la riga e non sposta niente.
    await userEvent.click(voce(albero, 'campo'))
    await waitFor(() => expect(voce(albero, 'campo')).toHaveAttribute('aria-current', 'true'))
    expect(titoli(albero)).toEqual(prima)
  },
}
