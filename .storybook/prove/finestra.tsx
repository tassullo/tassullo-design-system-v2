import { useEffect, useRef, useState } from 'react'
import type { Decorator } from '@storybook/react-vite'

// Nella pagina Docs le scene rendono dentro la pagina, e la finestra che
// vedono è quella della pagina: una media query, `useIsMobile` o `useSoglia`
// scelgono la forma della scrivania anche col telefono scelto nella barra. Il
// selettore Viewport ridimensiona l'iframe solo nella vista della scena da
// sola, e la pagina Docs lo ignora.
//
// Questo decoratore, **solo nella pagina Docs**, legge la Viewport — quella
// della barra, o quella che una scena dichiara coi propri `globals` — e se è
// più stretta della scrivania mostra la scena dentro un riquadro di quella
// larghezza: per la scena interna quella è la finestra vera. Fuori dalla
// pagina Docs non fa niente, quindi i controlli che aprono le scene per URL
// (accessibilità, bersagli) le misurano come prima.

const SCRIVANIA = 1440

type Misura = { larghezza: number; altezza: number }

type OpzioniViewport = Record<string, { styles?: { width?: string; height?: string } }>

function misuraDi(valore: unknown, opzioni: OpzioniViewport | undefined): Misura | null {
  if (typeof valore !== 'string' || !valore) return null
  const stili = opzioni?.[valore]?.styles
  if (stili?.width && stili.height) {
    return { larghezza: Number.parseInt(stili.width, 10), altezza: Number.parseInt(stili.height, 10) }
  }
  // Una misura scritta a mano nell'indirizzo, `larghezza-altezza`.
  const libera = /^(\d+)-(\d+)$/.exec(valore)
  return libera ? { larghezza: Number(libera[1]), altezza: Number(libera[2]) } : null
}

function Finestra({
  indirizzo,
  titolo,
  misura,
  adattaAltezza,
}: {
  indirizzo: string
  titolo: string
  misura: Misura
  adattaAltezza: boolean
}) {
  const riquadro = useRef<HTMLIFrameElement>(null)
  const [altezza, setAltezza] = useState(misura.altezza)

  // Una scena che non riempie lo schermo (un bottone, un modulo) prende
  // l'altezza del suo contenuto, invece di lasciare un telefono vuoto sotto.
  // La pagina interna ha la stessa origine, quindi si può misurare.
  useEffect(() => {
    const elemento = riquadro.current
    if (!elemento || !adattaAltezza) return
    let osservatore: ResizeObserver | undefined
    const aggancia = () => {
      const documento = elemento.contentDocument
      if (!documento) return
      osservatore?.disconnect()
      // Il corpo, non il documento: l'altezza del documento non scende mai
      // sotto quella della finestra, e il riquadro non si accorcerebbe.
      const misura = () => {
        const stile = getComputedStyle(documento.body)
        setAltezza(
          Math.ceil(
            documento.body.getBoundingClientRect().height +
              Number.parseFloat(stile.marginTop) +
              Number.parseFloat(stile.marginBottom),
          ),
        )
      }
      osservatore = new ResizeObserver(misura)
      osservatore.observe(documento.body)
    }
    elemento.addEventListener('load', aggancia)
    return () => {
      elemento.removeEventListener('load', aggancia)
      osservatore?.disconnect()
    }
  }, [adattaAltezza, indirizzo])

  return (
    <iframe
      ref={riquadro}
      key={indirizzo}
      src={indirizzo}
      title={titolo}
      // Il bordo sta dentro la larghezza dell'elemento: due pixel in più
      // perché la finestra interna sia larga proprio quanto la misura.
      width={misura.larghezza + 2}
      height={altezza + 2}
      className="block rounded-lg border border-border"
    />
  )
}

export const withFinestraDocs: Decorator = (Story, context) => {
  if (context.viewMode !== 'docs') return <Story />
  const viewport = context.globals.viewport as { value?: unknown } | undefined
  const misura = misuraDi(
    viewport?.value,
    (context.parameters.viewport as { options?: OpzioniViewport } | undefined)?.options,
  )
  if (!misura || misura.larghezza >= SCRIVANIA) return <Story />

  // Modalità, densità e superficie passano nell'indirizzo, così il riquadro
  // segue gli interruttori della barra.
  const globali = ['modalita', 'density', 'superficie']
    .filter((chiave) => typeof context.globals[chiave] === 'string')
    .map((chiave) => `${chiave}:${context.globals[chiave] as string}`)
    .join(';')
  const indirizzo =
    `iframe.html?id=${context.id}&viewMode=story` + (globali ? `&globals=${globali}` : '')
  return (
    <Finestra
      indirizzo={indirizzo}
      titolo={`${context.name}, a ${misura.larghezza}px`}
      misura={misura}
      // Un guscio riempie lo schermo, e un popup aperto dalla scena sta in un
      // portale a posizione fissa, fuori dal corpo della pagina: in tutti e
      // due i casi il riquadro tiene l'altezza del telefono.
      adattaAltezza={context.parameters.layout !== 'fullscreen' && !context.playFunction}
    />
  )
}
