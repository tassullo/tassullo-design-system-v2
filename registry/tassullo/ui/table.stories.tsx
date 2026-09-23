import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/tassullo/ui/table'
import { Badge } from '@/registry/tassullo/ui/badge'

/**
 * Una tabella di dati in righe e colonne, con intestazione, corpo e piede.
 *
 * **Quando sì, quando no.** La primitiva basta quando le righe sono poche e
 * fisse e si leggono e basta: un computo in una scheda, un riepilogo, un
 * confronto. Appena servono ordinamento, filtri, paginazione, selezione delle
 * righe o un menu di riga, si usa il blocco `tassullo-data-table`, che è
 * costruito sopra questa tabella e ha già tutto; per righe da modificare cella
 * per cella, `tassullo-data-grid`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/table
 * ```
 *
 * **Parti.** `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`,
 * `TableHead`, `TableCell`, `TableCaption`. Una riga selezionata porta
 * `data-state="selected"`.
 *
 * **Regole d'uso.**
 *
 * - Le cifre sono tabellari su tutta la tabella: `tabular-nums` sta già sulla
 *   radice e lo ereditano intestazione, corpo e piede. Il totale in grassetto
 *   si incolonna col corpo in tondo, senza cambiare carattere.
 * - I numeri si allineano a destra (`text-right` sulla cella e sulla sua
 *   intestazione), e si formattano con le funzioni dell'item `numeri` —
 *   `intero()`, `decimale()`, `valuta()` — che scrivono sempre il separatore
 *   delle migliaia: `4.128`, mai `4128` accanto a `12.345`.
 * - Un codice, un anno, un identificativo non si formattano: sono stringhe
 *   scritte con delle cifre. I codici si scrivono nel carattere del testo,
 *   attenuati con `text-sm text-muted-foreground`.
 * - Uno stato in una colonna è un `badge`, coi toni dell'item `toni`.
 * - Una cella di testo lungo va a capo con `whitespace-normal`; le altre
 *   restano su una riga. Su schermo stretto la tabella scorre in orizzontale
 *   invece di stringere le colonne.
 *
 * **Tastiera e accessibilità.** È una `<table>` nativa: il lettore di schermo
 * annuncia righe, colonne e intestazioni. `TableCaption` le dà il titolo. La
 * tabella non riceve il fuoco; lo ricevono i controlli dentro le celle.
 */
const meta = {
  title: 'Primitive/Table',
  component: Table,
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const righe = [
  { cod: 'MAT-4021', voce: 'Guaina bituminosa TS-40', um: 'm²', qta: '1.284,50', prezzo: '12,40' },
  { cod: 'MAT-1107', voce: 'Primer bituminoso', um: 'kg', qta: '96,00', prezzo: '4,05' },
  { cod: 'MAT-3390', voce: 'Profilo di bordo in alluminio', um: 'm', qta: '312,75', prezzo: '9,80' },
  { cod: 'MAT-0088', voce: 'Fissaggi meccanici', um: 'pz', qta: '4.960,00', prezzo: '0,37' },
]

/**
 * Un computo con didascalia, quantità e prezzi allineati a destra e un totale
 * nel piede.
 */
export const Predefinito: Story = {
  render: () => (
    <Table className="max-w-3xl">
      <TableCaption>Computo materiali — commessa 2026-114</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Codice</TableHead>
          <TableHead>Voce</TableHead>
          <TableHead>UM</TableHead>
          <TableHead className="text-right">Quantità</TableHead>
          <TableHead className="text-right">Prezzo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {righe.map((r) => (
          <TableRow key={r.cod}>
            <TableCell className="text-sm text-muted-foreground">{r.cod}</TableCell>
            <TableCell className="whitespace-normal">{r.voce}</TableCell>
            <TableCell>{r.um}</TableCell>
            <TableCell className="text-right">{r.qta}</TableCell>
            <TableCell className="text-right">{r.prezzo}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Totale</TableCell>
          <TableCell className="text-right">6.653,25</TableCell>
          <TableCell className="text-right">26,62</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

/**
 * Lo stato di ogni scheda come `badge`, e una riga selezionata.
 */
export const ConStati: Story = {
  render: () => (
    <Table className="max-w-3xl">
      <TableHeader>
        <TableRow>
          <TableHead>Codice</TableHead>
          <TableHead>Scheda</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead className="text-right">Revisione</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-sm text-muted-foreground">SCH-4021-A</TableCell>
          <TableCell>Guaina bituminosa TS-40</TableCell>
          <TableCell><Badge variant="default">Pubblicata</Badge></TableCell>
          <TableCell className="text-right">4</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell className="text-sm text-muted-foreground">SCH-1107-C</TableCell>
          <TableCell>Primer bituminoso</TableCell>
          <TableCell><Badge variant="secondary">Bozza</Badge></TableCell>
          <TableCell className="text-right">11</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="text-sm text-muted-foreground">SCH-0088-A</TableCell>
          <TableCell>Fissaggi meccanici</TableCell>
          <TableCell><Badge variant="destructive">Revocata</Badge></TableCell>
          <TableCell className="text-right">2</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

/**
 * **Il righello: il bordo sinistro dei decimali.** Due tabelle identiche, la
 * seconda con `tabular-nums` spento (`normal-nums`) per
 * mostrare il difetto che la classe chiude. Il numero sotto ciascuna è lo
 * scarto fra il decimale più a sinistra e quello più a destra, letto dal DOM
 * a font caricati.
 *
 * La chiave dell'effetto è `righe.length`, un valore primitivo: un `.map()`
 * scritto inline fra le dipendenze sarebbe un array nuovo a ogni render, e
 * React entrerebbe in un ciclo che **non stampa niente**. È costato una
 * sessione l'8 settembre (`DECISIONI.md` §17).
 */
function useScartoDecimali(rif: React.RefObject<HTMLTableElement | null>, chiave: number) {
  const [scarto, setScarto] = useState<number | null>(null)
  useEffect(() => {
    document.fonts.ready.then(() => {
      const el = rif.current
      if (!el) return
      const x: number[] = []
      for (const cella of el.querySelectorAll('tbody td:last-child')) {
        const nodo = cella.firstChild
        if (!nodo || nodo.nodeType !== Node.TEXT_NODE) continue
        const testo = nodo.textContent ?? ''
        if (testo.length < 3) continue
        const r = document.createRange()
        r.setStart(nodo, testo.length - 2)
        r.setEnd(nodo, testo.length)
        x.push(r.getBoundingClientRect().left)
      }
      if (x.length > 1) setScarto(Math.round((Math.max(...x) - Math.min(...x)) * 100) / 100)
    })
  }, [rif, chiave])
  return scarto
}

function Colonna({ titolo, classe }: { titolo: string; classe: string }) {
  const rif = useRef<HTMLTableElement>(null)
  const scarto = useScartoDecimali(rif, righe.length)
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">{titolo}</h3>
      <Table ref={rif} className={`w-80 ${classe}`}>
        <TableHeader>
          <TableRow>
            <TableHead>Voce</TableHead>
            <TableHead className="text-right">Quantità</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {righe.map((r) => (
            <TableRow key={r.cod}>
              <TableCell className="text-sm text-muted-foreground">{r.cod}</TableCell>
              <TableCell className="text-right">{r.qta}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Totale</TableCell>
            <TableCell className="text-right">6.653,25</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <p className="text-sm text-muted-foreground">
        scarto dei decimali:{' '}
        <span className="font-semibold text-foreground tabular-nums">
          {scarto === null ? '…' : `${scarto}px`}
        </span>
      </p>
    </div>
  )
}

/**
 * Le stesse quantità con e senza `tabular-nums`. Sotto ogni tabella lo scarto
 * fra il decimale più a sinistra e quello più a destra, letto dalla pagina:
 * con le cifre tabellari è praticamente zero.
 */
export const MisuraDelleCifre: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      <Colonna titolo="Con tabular-nums" classe="" />
      <Colonna titolo="Senza, con normal-nums" classe="normal-nums" />
    </div>
  ),
}
