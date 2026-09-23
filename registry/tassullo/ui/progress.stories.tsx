import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from '@/registry/tassullo/ui/progress'

/**
 * Una barra che dice a che punto è un'operazione in corso: un caricamento,
 * un'importazione, un calcolo.
 *
 * **Quando sì, quando no.** Dice «a che punto siamo», non «com'è andata»:
 * l'esito si comunica con un `alert`, un `badge` o un avviso di `sonner`, che
 * hanno un testo. Per un'attesa breve senza avanzamento da mostrare basta
 * `spinner`; per una pagina che sta caricando i dati, `skeleton`. I passi di
 * una procedura con un nome ciascuno sono `stepper`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/progress
 * ```
 *
 * **Parti e opzioni.** `Progress` con `value` da 0 a 100, oppure
 * `value={null}` quando non si sa quanto manca; `ProgressLabel` il nome
 * dell'operazione; `ProgressValue` la percentuale.
 *
 * **Regole d'uso.**
 *
 * - La barra è arancio perché è un fondo: `--primary` riempie, non scrive.
 * - La percentuale ha le cifre tabellari già dentro `ProgressValue`: mentre
 *   sale da 9 a 10 a 100 non sposta niente.
 * - Il colore della barra non cambia con l'esito. Una barra che diventa rossa
 *   dice il fallimento solo a chi distingue i colori.
 * - Se non si sa quanto manca, `value={null}` e nessuna percentuale: un numero
 *   inventato è peggio di nessun numero.
 *
 * **Tastiera e accessibilità.** Non riceve il fuoco. Si annuncia come barra
 * di avanzamento col suo nome, preso da `ProgressLabel`, e col valore; con
 * `value={null}` il valore non c'è e l'operazione risulta in corso.
 */
const meta = {
  title: 'Primitive/Progress',
  component: Progress,
  args: { value: 62 },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Un'operazione a metà, col nome a sinistra e la percentuale a destra.
 */
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

/**
 * Una barra che sale da sola: la percentuale cambia senza spostarsi, perché
 * le cifre sono tabellari.
 */
export const Determinato: Story = { render: () => <BarraCheSale /> }

/**
 * Quando non si sa quanto manca: `value={null}`, nessuna percentuale.
 */
export const Indeterminato: Story = {
  render: () => (
    <Progress value={null} className="w-96">
      <ProgressLabel>Interrogazione dell'archivio…</ProgressLabel>
    </Progress>
  ),
}

/**
 * La barra a cinque riempimenti, da vuota a piena.
 */
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
