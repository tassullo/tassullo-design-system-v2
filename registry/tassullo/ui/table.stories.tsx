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
 * **L'unico ri-stile del file è `tabular-nums` sull'elemento `<table>`**, ed è
 * il criterio d'accettazione di M2.4. Una classe sola, sulla radice: le cifre
 * tabellari sono ereditate, quindi coprono intestazioni, corpo e piede senza
 * che chi scrive una tabella debba ricordarsene colonna per colonna — che è
 * esattamente il modo in cui la regola si perde.
 *
 * Non serve un altro carattere. La style guide del v1 diceva «monospace per
 * codici di sistema *e dati tabellari*», e la seconda metà è caduta in M2.1:
 * Inter porta la feature OpenType `tnum` e le sue cifre tabellari sono stabili
 * fra i pesi, quindi **il totale in grassetto si incolonna col corpo in
 * tondo**. Il `font-mono` resta ai soli codici di sistema, dove si *vuole* che
 * stonino.
 *
 * `MisuraDelleCifre` lo verifica dal DOM, con lo stesso righello di
 * `Tema/Cifre` — il **bordo sinistro dei decimali**, non la virgola, che resta
 * proporzionale e si sposta anche quando le cifre sono perfettamente
 * incolonnate.
 *
 * Due cose che **non** sono state toccate, e vale la pena dirle. `TableRow`
 * porta `hover:bg-muted/50` su ogni riga: a differenza della card non è una
 * promessa falsa, perché una riga di tabella è un bersaglio vero quasi
 * ovunque (selezione, menu contestuale, apertura della scheda) e il `data-table`
 * di M3.3 la userà. E il contenitore ha `overflow-x-auto`: sotto una certa
 * larghezza la tabella scorre invece di stritolare le colonne.
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
            <TableCell className="font-mono text-xs">{r.cod}</TableCell>
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
 * Il codice di sistema in `font-mono`, lo stato come badge, i numeri in
 * colonna. È la forma che il `data-table` di M3.3 erediterà.
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
          <TableCell className="font-mono text-xs">SCH-4021-A</TableCell>
          <TableCell>Guaina bituminosa TS-40</TableCell>
          <TableCell><Badge variant="default">Pubblicata</Badge></TableCell>
          <TableCell className="text-right">4</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell className="font-mono text-xs">SCH-1107-C</TableCell>
          <TableCell>Primer bituminoso</TableCell>
          <TableCell><Badge variant="secondary">Bozza</Badge></TableCell>
          <TableCell className="text-right">11</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-mono text-xs">SCH-0088-A</TableCell>
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
              <TableCell className="font-mono text-xs">{r.cod}</TableCell>
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

export const MisuraDelleCifre: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      <Colonna titolo="Con tabular-nums (il nostro)" classe="" />
      <Colonna titolo="Senza (il preset)" classe="normal-nums" />
    </div>
  ),
}
