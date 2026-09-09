import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from '@/registry/tassullo/ui/progress'

/**
 * `progress.tsx` è identico all'originale: nessuna stringa ri-stilata. Il
 * preset è già sui token — traccia `bg-muted`, indicatore `bg-primary`, cioè
 * l'arancio del brand come **fondo**, che è l'uso corretto: `--primary` non si
 * usa mai per il testo, ma per una barra piena va benissimo.
 *
 * E porta già `tabular-nums` su `ProgressValue`, che è la regola delle cifre
 * fissata in M2.1: **la percentuale non deve ballare** mentre sale da 9 a 10 a
 * 100. Si vede in `Determinato`, dove il numero cresce senza spostare niente.
 *
 * **Il colore non è l'informazione.** La barra dice «a che punto siamo», non
 * «com'è andata»: per l'esito ci sono gli alert e i badge, che hanno un testo.
 * Una barra che diventa rossa comunica il fallimento solo a chi distingue i
 * colori.
 *
 * `Progress` di Base UI vuole `value={null}` per lo stato **indeterminato** —
 * quando non si sa quanto manca. La differenza è vera e non estetica: con
 * `null` sparisce `aria-valuenow`, e chi legge lo schermo sente «in corso»
 * invece di un numero inventato.
 */
const meta = {
  title: 'Primitive/Progress',
  component: Progress,
  args: { value: 62 },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <Progress value={62} className="w-96">
      <ProgressLabel>Caricamento allegati</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
}

/**
 * Che sale davvero, per vedere che la percentuale **non balla**: le cifre sono
 * tabellari, quindi 9%, 10% e 100% occupano posizioni stabili.
 */
function BarraCheSale() {
  const [v, setV] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setV((x) => (x >= 100 ? 0 : x + 1)), 60)
    return () => clearInterval(t)
  }, [])
  return (
    <Progress value={v} className="w-96">
      <ProgressLabel>Importazione schede</ProgressLabel>
      <ProgressValue />
    </Progress>
  )
}

export const Determinato: Story = { render: () => <BarraCheSale /> }

/**
 * Indeterminato: `value={null}`. Non c'è `aria-valuenow`, e la percentuale non
 * si mostra perché non esiste — inventarne una sarebbe peggio che non darla.
 */
export const Indeterminato: Story = {
  render: () => (
    <Progress value={null} className="w-96">
      <ProgressLabel>Interrogazione dell'archivio…</ProgressLabel>
    </Progress>
  ),
}

/** I gradini, per guardare la barra a più riempimenti in una volta. */
export const Gradini: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-5">
      {[0, 25, 50, 75, 100].map((v) => (
        <Progress key={v} value={v}>
          <ProgressLabel>Fase {v / 25 + 1}</ProgressLabel>
          <ProgressValue />
        </Progress>
      ))}
    </div>
  ),
}
