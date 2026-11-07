import { useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertCircleIcon, FileTextIcon, XIcon } from 'lucide-react'

import { disegnaSchermata } from '@/prove/schermate'

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '@/registry/tassullo/ui/attachment'
import { Spinner } from '@/registry/tassullo/ui/spinner'

/**
 * Un file allegato, con il suo stato: in attesa, in caricamento, in lettura,
 * non riuscito, pronto. Si usa nel campo della domanda di una chat, prima di
 * inviarla, e sotto un messaggio che ha degli allegati.
 *
 * **Quando sì, quando no.** Si usa per pochi file legati a un messaggio,
 * ognuno col suo stato. Per scegliere e caricare file in un modulo, con la
 * zona in cui trascinarli, c'è `tassullo-file-upload`; per sfogliare delle
 * immagini già caricate, `tassullo-galleria-immagini`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/attachment
 * ```
 *
 * ```tsx
 * <Attachment state="uploading">
 *   <AttachmentMedia><Spinner /></AttachmentMedia>
 *   <AttachmentContent>
 *     <AttachmentTitle>scheda-tecnica.pdf</AttachmentTitle>
 *     <AttachmentDescription>Caricamento…</AttachmentDescription>
 *   </AttachmentContent>
 *   <AttachmentActions>
 *     <AttachmentAction aria-label="Togli scheda-tecnica.pdf"><XIcon /></AttachmentAction>
 *   </AttachmentActions>
 * </Attachment>
 * ```
 *
 * **Varianti.** `state`: `idle` (bordo tratteggiato, non ancora inviato),
 * `uploading` e `processing` (il nome luccica), `error`, `done` (di serie).
 * `size`: `default`, `sm`, `xs`. `orientation`: `horizontal` (di serie) o
 * `vertical`, con l'anteprima sopra. `AttachmentMedia` ha `variant`: `icon`
 * (di serie) o `image`, che sbiadisce l'anteprima finché il file non è
 * pronto. `AttachmentGroup` mette gli allegati in fila e li fa scorrere di
 * lato; `AttachmentTrigger` rende tutto l'allegato un bottone, per aprirlo.
 *
 * **Regole d'uso.**
 *
 * - La descrizione dice lo stato a parole: «Caricamento…», «In lettura…»,
 *   «Non riuscito: file oltre 10 MB». Il luccichio da solo non si legge.
 * - «Togli» è un `AttachmentAction` col nome del file nell'etichetta:
 *   «Togli scheda-tecnica.pdf», non «Togli» ripetuto per ogni allegato.
 * - Un allegato non riuscito resta in vista con la ragione, finché chi scrive
 *   non lo toglie.
 *
 * **Tastiera e accessibilità.** Le azioni si raggiungono col `Tab`. Con
 * `AttachmentTrigger` l'allegato intero è un bottone, e le azioni restano
 * sopra e raggiungibili: il bottone ha bisogno di un nome, per esempio
 * «Apri scheda-tecnica.pdf».
 */
const meta = {
  title: 'Primitive/Attachment',
  component: Attachment,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Attachment>

export default meta
type Story = StoryObj<typeof meta>

const STATI = [
  { state: 'idle', nome: 'computo-metrico.xlsx', descrizione: 'Pronto da inviare' },
  { state: 'uploading', nome: 'scheda-tecnica.pdf', descrizione: 'Caricamento…' },
  { state: 'processing', nome: 'capitolato.pdf', descrizione: 'In lettura…' },
  { state: 'error', nome: 'tavole-esecutive.pdf', descrizione: 'Non riuscito: file oltre 10 MB' },
  { state: 'done', nome: 'dop-membrana.pdf', descrizione: '1,2 MB' },
] as const

function Icona({ state }: { state: (typeof STATI)[number]['state'] }) {
  if (state === 'uploading' || state === 'processing') return <Spinner />
  if (state === 'error') return <AlertCircleIcon />
  return <FileTextIcon />
}

/** I cinque stati, ognuno con la sua descrizione a parole e «Togli». */
export const Stati: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      {STATI.map(({ state, nome, descrizione }) => (
        <Attachment key={state} state={state}>
          <AttachmentMedia>
            <Icona state={state} />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{nome}</AttachmentTitle>
            <AttachmentDescription>{descrizione}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label={`Togli ${nome}`}>
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </div>
  ),
}

/** Le tre taglie, per un campo della domanda più o meno fitto. */
export const Taglie: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['default', 'sm', 'xs'] as const).map((size) => (
        <Attachment key={size} size={size}>
          <AttachmentMedia>
            <FileTextIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>dop-membrana.pdf</AttachmentTitle>
            <AttachmentDescription>{size}</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </div>
  ),
}

function ImmaginiScena() {
  const anteprime = useMemo(
    () => [
      { nome: 'risvolto-nord.png', src: disegnaSchermata('Risvolto nord', 400, 400).toDataURL(), state: 'done' as const },
      { nome: 'bocchettone.png', src: disegnaSchermata('Bocchettone', 400, 400).toDataURL(), state: 'uploading' as const },
    ],
    [],
  )
  return (
    <AttachmentGroup className="max-w-md">
      {anteprime.map(({ nome, src, state }) => (
        <Attachment key={nome} orientation="vertical" state={state}>
          <AttachmentMedia variant="image">
            <img src={src} alt="" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{nome}</AttachmentTitle>
            <AttachmentDescription>{state === 'done' ? '240 KB' : 'Caricamento…'}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label={`Togli ${nome}`}>
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </AttachmentGroup>
  )
}

/**
 * Due foto in verticale, con l'anteprima sopra: quella ancora in caricamento
 * è sbiadita finché non è pronta.
 */
export const Immagini: Story = {
  render: () => <ImmaginiScena />,
}

/**
 * Più allegati in fila con `AttachmentGroup`, come nel campo della domanda:
 * quando non ci stanno scorrono di lato.
 */
export const Gruppo: Story = {
  render: () => (
    <AttachmentGroup className="max-w-md">
      {STATI.map(({ state, nome, descrizione }) => (
        <Attachment key={state} state={state} size="sm">
          <AttachmentMedia>
            <Icona state={state} />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{nome}</AttachmentTitle>
            <AttachmentDescription>{descrizione}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label={`Togli ${nome}`}>
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </AttachmentGroup>
  ),
}

/**
 * Un allegato che si apre: `AttachmentTrigger` rende tutto l'allegato un
 * bottone, col suo nome, e «Togli» resta sopra.
 */
export const DaAprire: Story = {
  render: () => (
    <Attachment className="max-w-md">
      <AttachmentTrigger aria-label="Apri dop-membrana.pdf" />
      <AttachmentMedia>
        <FileTextIcon />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>dop-membrana.pdf</AttachmentTitle>
        <AttachmentDescription>1,2 MB</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Togli dop-membrana.pdf">
          <XIcon />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  ),
}
