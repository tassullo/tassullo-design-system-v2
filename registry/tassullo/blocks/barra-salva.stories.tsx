import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BoxesIcon } from 'lucide-react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { BarraSalva } from '@/registry/tassullo/blocks/barra-salva'
import { PageHeader } from '@/registry/tassullo/blocks/page-header'
import { Card, CardContent } from '@/registry/tassullo/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'

/**
 * «Salva» e «Annulla» di una scheda che si modifica, in una barra ferma in
 * fondo alla finestra. Compare alla prima modifica e resta in vista mentre la
 * pagina scorre: chi lavora in cima a una scheda lunga vede che c'è qualcosa
 * da salvare.
 *
 * **Quando sì, quando no.** In ogni scheda i cui campi sono sempre
 * modificabili per chi ha il ruolo, e si salvano tutti insieme. Non per un
 * dialogo, che ha i suoi bottoni nel piede, né per un gesto che si salva da
 * sé, come lo spostamento di una riga in una lista.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-barra-salva
 * ```
 *
 * ```tsx
 * <form onSubmit={salva}>
 *   …campi…
 *   <BarraSalva sporco={form.formState.isDirty} inCorso={salvando} onAnnulla={() => form.reset()} />
 * </form>
 * ```
 *
 * **Le prop.** `sporco`: il modulo ha modifiche non salvate, e la barra c'è.
 * `inCorso`: si sta salvando, la barra resta coi bottoni spenti e
 * l'indicatore su «Salva». `onAnnulla` scarta le modifiche. «Salva» è il
 * bottone d'invio del modulo che contiene la barra; fuori da un modulo si
 * passa `onSalva`. `testo` cambia la frase a sinistra, di serie «Modifiche non
 * salvate».
 *
 * **Regole d'uso.**
 *
 * - Va in fondo al modulo, come ultimo figlio, dentro l'area del contenuto del
 *   guscio. Sta in fondo alla finestra anche su una pagina corta, larga quanto
 *   l'area del contenuto: non copre la barra laterale né la colonna laterale.
 *   Nella pagina lascia uno spazio alto quanto lei, e a fine pagina il
 *   contenuto finisce sopra la barra.
 * - Sparisce se si torna com'era: «da salvare» è un confronto con ciò che è
 *   salvato, non un segno che resta acceso alla prima battuta.
 * - Non nella fascia: in alto a destra stanno le azioni della pagina.
 * - Niente «Modifica» che accende i campi: i campi sono sempre modificabili.
 *
 * **Tastiera e accessibilità.** I due bottoni seguono il modulo nel giro del
 * `Tab`. `Invio` in un campo del modulo salva, come ogni invio. Un campo
 * raggiunto col `Tab` non finisce sotto la barra: finché la barra c'è, la
 * pagina tiene lo spazio in fondo.
 */
const meta = {
  title: 'Blocchi/Barra di salvataggio',
  component: BarraSalva,
  parameters: { layout: 'fullscreen' },
  args: { sporco: true, onAnnulla: () => {} },
} satisfies Meta<typeof BarraSalva>

export default meta
type Story = StoryObj<typeof meta>

const SEZIONI: SezioneNav[] = [{ voci: [{ titolo: 'Famiglie', icona: BoxesIcon, href: '#', attiva: true }] }]
const UTENTE = { nome: 'Stefano', cognome: 'Bertolini', email: 'sbertolini@esempio.it', ruolo: 'Redattore' }
const CAMPI = Array.from({ length: 14 }, (_, n) => ({ nome: `campo-${n + 1}`, etichetta: `Campo ${n + 1}`, valore: `Valore ${n + 1}` }))
const SALVATI = Object.fromEntries(CAMPI.map((c) => [c.nome, c.valore]))

function Scheda({ inCorsoAllInizio = false, quanti = CAMPI.length }: { inCorsoAllInizio?: boolean; quanti?: number }) {
  const [salvati, setSalvati] = useState(SALVATI)
  const [valori, setValori] = useState(
    inCorsoAllInizio ? { ...SALVATI, 'campo-1': 'Valore cambiato' } : SALVATI
  )
  const [inCorso, setInCorso] = useState(inCorsoAllInizio)
  const sporco = CAMPI.some((c) => valori[c.nome] !== salvati[c.nome])
  return (
    <AppShell applicazione="Anagrafe" sezioni={SEZIONI} utente={UTENTE}>
      <PageHeader percorso={[{ titolo: 'Famiglie', href: '#' }, { titolo: 'Intonaco Alfa' }]} />
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(evento) => {
          evento.preventDefault()
          setInCorso(true)
          setTimeout(() => {
            setSalvati(valori)
            setInCorso(false)
          }, 400)
        }}
      >
        <Card>
          <CardContent>
            <FieldGroup>
              {CAMPI.slice(0, quanti).map((c) => (
                <Field key={c.nome}>
                  <FieldLabel htmlFor={c.nome}>{c.etichetta}</FieldLabel>
                  <Input
                    id={c.nome}
                    value={valori[c.nome]}
                    disabled={inCorso}
                    onChange={(evento) => setValori((prima) => ({ ...prima, [c.nome]: evento.target.value }))}
                  />
                </Field>
              ))}
            </FieldGroup>
          </CardContent>
        </Card>
        <BarraSalva sporco={sporco} inCorso={inCorso} onAnnulla={() => setValori(salvati)} />
      </form>
    </AppShell>
  )
}

/**
 * Una scheda più alta della finestra, coi campi sempre modificabili. Si scrive
 * in un campo: in fondo alla finestra compare la barra, e resta lì mentre la
 * pagina scorre. Tornando al valore di prima sparisce.
 */
export const Predefinito: Story = {
  render: () => <Scheda />,
}

/** Mentre si salva: la barra resta, coi bottoni spenti e l'indicatore su «Salva». */
export const InCorso: Story = {
  name: 'In Corso',
  render: () => <Scheda inCorsoAllInizio />,
}

const barra = () => document.querySelector<HTMLElement>('[data-slot="barra-salva"]')

// Compare alla modifica e sparisce tornando com'era; tocca il fondo della
// finestra in cima e in fondo alla pagina, alta uguale; salva e annulla.
export const ComportamentoProva: Story = {
  name: 'Comportamento, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  render: () => <Scheda />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const campo = await waitFor(() => tela.getByLabelText('Campo 1'))
    expect(barra()).toBeNull()
    try {
      await userEvent.type(campo, 'x')
      await waitFor(() => expect(barra()).toBeTruthy())
      expect(barra()).toHaveTextContent('Modifiche non salvate')
      // Appena la barra c'è, i due bottoni si raggiungono: nessun istante in
      // cui il testo si vede e i bottoni no.
      expect(within(barra()!).getAllByRole('button').map((b) => b.textContent?.trim())).toEqual(['Annulla', 'Salva'])
      await userEvent.keyboard('{Backspace}')
      await waitFor(() => expect(barra()).toBeNull())

      await userEvent.type(campo, 'x')
      await waitFor(() => expect(barra()).toBeTruthy())
      const misura = () => {
        const r = barra()!.getBoundingClientRect()
        return `fondo ${Math.round(r.bottom)} di ${innerHeight}, alta ${Math.round(r.height)}`
      }
      window.scrollTo({ top: 0, behavior: 'instant' })
      const inCima = misura()
      expect(inCima).toMatch(new RegExp(`^fondo ${innerHeight} di ${innerHeight}`))
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
      await waitFor(() => expect(misura()).toBe(inCima))

      // «Annulla» rimette il valore salvato, e la barra sparisce.
      await userEvent.click(within(barra()!).getByRole('button', { name: 'Annulla' }))
      await waitFor(() => expect(barra()).toBeNull())
      expect(campo).toHaveValue('Valore 1')

      // «Salva» salva: durante il salvataggio i bottoni sono spenti, poi la barra sparisce.
      await userEvent.type(campo, 'y')
      await userEvent.click(within(barra()!).getByRole('button', { name: 'Salva' }))
      await waitFor(() => expect(within(barra()!).getByRole('button', { name: 'Annulla' })).toBeDisabled())
      await waitFor(() => expect(barra()).toBeNull())
      expect(campo).toHaveValue('Valore 1y')
    } finally {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  },
}

// Su una pagina più corta della finestra la barra sta in fondo alla finestra,
// non subito sotto il contenuto; ed è larga quanto l'area del contenuto.
export const PaginaCortaProva: Story = {
  name: 'Pagina corta, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  render: () => <Scheda quanti={2} />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const campo = await waitFor(() => tela.getByLabelText('Campo 1'))
    expect(`pagina corta: ${document.documentElement.scrollHeight <= innerHeight}`).toBe('pagina corta: true')
    await userEvent.type(campo, 'x')
    await waitFor(() => expect(barra()).toBeTruthy())
    const area = canvasElement.querySelector<HTMLElement>('[data-slot="barra-salva-posto"]')!.parentElement!.closest('main') ?? document.body
    await waitFor(() => expect(`fondo ${Math.round(barra()!.getBoundingClientRect().bottom)}`).toBe(`fondo ${innerHeight}`))
    // Non copre la barra laterale: comincia dove comincia l'area del contenuto.
    const fascia = canvasElement.querySelector<HTMLElement>('[data-slot="page-header-bar"]') ?? area
    await waitFor(() =>
      expect(`sinistra ${Math.round(barra()!.getBoundingClientRect().left)}, posto ${Math.round(canvasElement.querySelector<HTMLElement>('[data-slot="barra-salva-posto"]')!.getBoundingClientRect().left)}`).toBe(
        `sinistra ${Math.round(fascia.getBoundingClientRect().left)}, posto ${Math.round(fascia.getBoundingClientRect().left) + 16}`
      )
    )
  },
}
