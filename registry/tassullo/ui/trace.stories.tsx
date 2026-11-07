import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertCircleIcon, CheckIcon, CircleIcon, FileTextIcon, SearchIcon } from 'lucide-react'

import { Spinner } from '@/registry/tassullo/ui/spinner'
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from '@/registry/tassullo/ui/trace'

/**
 * Le righe di ciò che un assistente sta facendo, o ha fatto, prima di
 * rispondere: «Sto cercando nei documenti…» che diventa «Ho consultato 4
 * documenti», e la riga «Fonti usate» che si apre.
 *
 * **Quando sì, quando no.** Si usa sopra una risposta, per dire da dove
 * viene e quanto manca. Una notizia nella conversazione, come «Conversazione
 * ripresa» o la data, è `marker`; l'avanzamento di un'operazione lunga, con
 * la percentuale, è `progress`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/trace
 * ```
 *
 * ```tsx
 * <Trace>
 *   <TraceLine status="running">
 *     <TraceIcon><SearchIcon /></TraceIcon>
 *     <TraceTitle>Sto cercando nei documenti…</TraceTitle>
 *   </TraceLine>
 * </Trace>
 * ```
 *
 * **Le parti.** `Trace` impila le righe. `TraceLine` è una riga, con
 * `status`: `running` (il titolo luccica), `error`, `pending` (l'icona si
 * attenua), oppure niente per una riga finita. Dentro: `TraceIcon`,
 * `TraceTitle` e `TraceDescription` (una misura, come il tempo o il numero di
 * documenti). `TraceCollapsible` con `TraceCollapsibleTrigger` e
 * `TraceCollapsibleContent` apre il dettaglio sotto la riga.
 *
 * **Regole d'uso.**
 *
 * - Il titolo dice cosa succede, al presente mentre succede («Sto cercando
 *   nei documenti…») e al passato quando è finito («Ho consultato 4
 *   documenti»). È la stessa riga che cambia, non una riga nuova.
 * - Le fonti stanno nel dettaglio che si apre, una per riga, col punteggio di
 *   pertinenza se l'app ce l'ha: chiuso di serie, perché si legge la
 *   risposta prima delle fonti.
 * - Una riga non riuscita dice cosa non è riuscito, con le parole di chi
 *   legge: «Non ho potuto leggere capitolato.pdf».
 *
 * **Tastiera e accessibilità.** La riga che si apre è un bottone: `Invio` o
 * `Spazio` la aprono e la chiudono. Le righe senza dettaglio non sono
 * interattive. Il luccichio si ferma se il sistema chiede meno movimento.
 */
const meta = {
  title: 'Primitive/Trace',
  component: Trace,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Trace>

export default meta
type Story = StoryObj<typeof meta>

/** Le quattro forme di una riga: in corso, finita, non riuscita, in attesa. */
export const Stati: Story = {
  render: () => (
    <Trace className="max-w-md">
      <TraceLine status="running">
        <TraceIcon>
          <Spinner />
        </TraceIcon>
        <TraceTitle>Sto cercando nei documenti…</TraceTitle>
      </TraceLine>
      <TraceLine>
        <TraceIcon>
          <CheckIcon />
        </TraceIcon>
        <TraceTitle>Ho consultato 4 documenti</TraceTitle>
        <TraceDescription>1,2 s</TraceDescription>
      </TraceLine>
      <TraceLine status="error">
        <TraceIcon>
          <AlertCircleIcon />
        </TraceIcon>
        <TraceTitle>Non ho potuto leggere capitolato.pdf</TraceTitle>
      </TraceLine>
      <TraceLine status="pending">
        <TraceIcon>
          <CircleIcon />
        </TraceIcon>
        <TraceTitle>Scrivo la risposta</TraceTitle>
      </TraceLine>
    </Trace>
  ),
}

const FONTI = [
  { nome: 'Scheda tecnica, membrana armata 4 mm', pertinenza: '92%' },
  { nome: 'Capitolato, coperture piane, art. 12', pertinenza: '81%' },
  { nome: 'Manuale di posa, sovrapposizioni', pertinenza: '77%' },
  { nome: 'DoP 0457-CPR-2024', pertinenza: '54%' },
]

/**
 * La ricerca finita, con le fonti nel dettaglio che si apre: una per riga,
 * col punteggio di pertinenza.
 */
export const FontiUsate: Story = {
  render: () => (
    <Trace className="max-w-md">
      <TraceLine>
        <TraceIcon>
          <SearchIcon />
        </TraceIcon>
        <TraceTitle>Ho consultato 4 documenti</TraceTitle>
        <TraceDescription>1,2 s</TraceDescription>
      </TraceLine>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <FileTextIcon />
            </TraceIcon>
            <TraceTitle>Fonti usate</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <ul className="flex flex-col gap-1 text-sm">
            {FONTI.map((fonte) => (
              <li key={fonte.nome} className="flex justify-between gap-4">
                <span>{fonte.nome}</span>
                <span className="shrink-0 tabular-nums">{fonte.pertinenza}</span>
              </li>
            ))}
          </ul>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  ),
}

/** Le stesse fonti, chiuse come arrivano di serie sotto una risposta. */
export const FontiChiuse: Story = {
  render: () => (
    <Trace className="max-w-md">
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <FileTextIcon />
            </TraceIcon>
            <TraceTitle>Fonti usate</TraceTitle>
            <TraceDescription>4</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <ul className="flex flex-col gap-1 text-sm">
            {FONTI.map((fonte) => (
              <li key={fonte.nome}>{fonte.nome}</li>
            ))}
          </ul>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  ),
}
