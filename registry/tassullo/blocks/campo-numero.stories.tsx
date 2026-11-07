import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import * as z from 'zod'

import { CampoNumero, type CampoNumeroProps } from '@/registry/tassullo/blocks/campo-numero'
import { Button } from '@/registry/tassullo/ui/button'
import { FieldGroup } from '@/registry/tassullo/ui/field'

/**
 * Il campo in cui si scrive a mano un numero all'italiana — quantità, prezzi,
 * rese, coefficienti — uguale in tutte le app.
 *
 * **Quando sì, quando no.** Si usa per ogni numero che si digita: virgola
 * decimale, punto delle migliaia, unità di misura accanto. Non si usa per un
 * anno, un codice, un CAP o una partita IVA: sono testi scritti con delle
 * cifre, e vanno in un `Input` normale. Non si usa nemmeno dentro una tabella
 * modificabile, che ha già le sue celle numeriche.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-campo-numero
 * ```
 *
 * ```tsx
 * <CampoNumero etichetta="Superficie" valore={mq} onValore={setMq} unita="m²" />
 * ```
 *
 * **Le prop.**
 *
 * - `etichetta`; `descrizione`, l'aiuto sotto il campo.
 * - `valore` e `onValore`: il numero confermato, `null` per il campo vuoto.
 * - `unita` e `posizioneUnita`: l'unità di misura, di serie dopo il numero;
 *   `"prima"` per il simbolo dell'euro.
 * - `min` e `max`, compresi: un valore fuori dai limiti resta scritto nel
 *   campo, con l'errore sotto.
 * - `errore`: un errore deciso fuori dal campo, dallo schema del modulo o dal
 *   server.
 * - `negativiInRosso`: il valore confermato in rosso quando è negativo, per un
 *   campo che porta un risultato o un saldo. Di serie spento.
 * - Le altre prop vanno all'`input`: `name`, `disabled`, `placeholder`, `ref`.
 *
 * **Come legge.**
 *
 * - La virgola è il decimale, e con la virgola i punti sono le migliaia:
 *   `1.234,5` vale milleduecentotrentaquattro e mezzo.
 * - Un punto da solo è **sempre** il decimale: `0.125` vale zero virgola
 *   centoventicinque, e `1.500` vale uno e mezzo. Il campo lo riscrive
 *   `1,5` all'uscita, quindi il valore letto si vede subito.
 * - Più punti senza virgola sono migliaia, se a gruppi di tre: `1.234.567`.
 * - Un testo che si potrebbe leggere in due modi, o che numero non è, resta
 *   nel campo così com'è, segnato come sbagliato e con il messaggio sotto.
 *   Il valore confermato non cambia.
 *
 * **Regole d'uso.**
 *
 * - Il valore si conferma all'uscita dal campo o con `Invio`, non a ogni
 *   tasto: `onValore` riceve solo numeri validi e nei limiti.
 * - A riposo il numero si legge col punto delle migliaia: `1.234,5`. Entrando
 *   nel campo il punto sparisce e si scrive sulle cifre nude, `1234,5`: un
 *   punto lasciato fra le cifre si rileggerebbe come il decimale, e `1.234`
 *   diventerebbe 1,234. Uscendo, il punto torna.
 * - Sul telefono si apre il tastierino numerico. Quello dell'iPhone non ha il
 *   segno meno: per un campo che ammette valori negativi va detto nella
 *   `descrizione`, o il numero si scrive dalla tastiera completa.
 * - Con react-hook-form il campo si collega con un `Controller`, come nella
 *   scena «Con un modulo».
 *
 * **Tastiera e accessibilità.** `Invio` conferma; su un testo sbagliato
 * mostra l'errore e non invia il modulo. `Esc` torna all'ultimo valore
 * confermato. Mostrato un errore, il campo si ricontrolla a ogni tasto e
 * l'errore sparisce appena il testo torna giusto. Il campo dichiara
 * `aria-invalid` e collega con `aria-describedby` l'unità, l'aiuto e
 * l'errore.
 */
const meta = {
  title: 'Blocchi/Campo numerico',
  component: CampoNumero,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampoNumero>

export default meta
type Story = StoryObj<typeof meta>

/** Un campo col suo stato, e il valore confermato scritto sotto. */
function Esempio({ iniziale = null, ...prop }: Omit<CampoNumeroProps, 'valore' | 'onValore'> & { iniziale?: number | null }) {
  const [valore, setValore] = useState<number | null>(iniziale)
  return (
    <div className="flex flex-col gap-1">
      <CampoNumero {...prop} valore={valore} onValore={setValore} />
      <p className="text-sm text-muted-foreground" data-valore>
        Valore confermato: {valore === null ? 'nessuno' : String(valore)}
      </p>
    </div>
  )
}

/**
 * Tre campi con l'unità di misura: dopo il numero, e prima per l'euro. Sotto
 * ogni campo, il valore che il campo ha confermato.
 */
export const Panoramica: Story = {
  args: { etichetta: 'Superficie', valore: null, onValore: () => {} },
  render: () => (
    <FieldGroup className="max-w-xs">
      <Esempio etichetta="Superficie" unita="m²" iniziale={12.5} min={0} />
      <Esempio etichetta="Prezzo unitario" unita="€" posizioneUnita="prima" iniziale={2086.93} min={0} />
      <Esempio etichetta="Coefficiente" iniziale={0.125} min={0} max={10} />
    </FieldGroup>
  ),
}

const QUATTRO_CASI = [
  { etichetta: 'Coefficiente', scritto: '0.125', resta: '0,125', valore: '0.125' },
  { etichetta: 'Lunghezza', scritto: '1.500', resta: '1,5', valore: '1.5' },
  { etichetta: 'Quantità', scritto: '1.234,5', resta: '1.234,5', valore: '1234.5' },
  { etichetta: 'Resa', scritto: 'dodici', resta: 'dodici', valore: 'nessuno' },
] as const

/**
 * Quattro testi scritti e confermati uscendo dal campo: un decimale scritto col
 * punto, un punto solo con tre cifre, migliaia e decimali all'italiana, e un
 * testo che numero non è. Il valore confermato è scritto sotto ogni campo.
 */
export const QuattroCasi: Story = {
  name: 'Quattro casi',
  args: { etichetta: 'Coefficiente', valore: null, onValore: () => {} },
  render: () => (
    <FieldGroup className="max-w-xs">
      <Esempio etichetta="Coefficiente" />
      <Esempio etichetta="Lunghezza" unita="m" />
      <Esempio etichetta="Quantità" unita="kg" />
      <Esempio etichetta="Resa" unita="m²/sacco" />
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    for (const caso of QUATTRO_CASI) {
      const campo = tela.getByLabelText(caso.etichetta)
      await userEvent.click(campo)
      await userEvent.type(campo, caso.scritto)
      await userEvent.tab()
      await waitFor(() => expect(campo).toHaveValue(caso.resta))
      const riga = campo.closest('[data-slot="field"]')!.parentElement!
      expect(riga.querySelector('[data-valore]')).toHaveTextContent(`Valore confermato: ${caso.valore}`)
    }
    const resa = tela.getByLabelText('Resa')
    expect(resa).toHaveAttribute('aria-invalid', 'true')
    expect(tela.getByRole('alert')).toHaveTextContent('Scrivi un numero, per esempio 12,5.')
  },
}

/**
 * Il punto delle migliaia: a riposo c'è, entrando nel campo sparisce, uscendo
 * torna. Il valore non cambia.
 */
export const Migliaia: Story = {
  args: { etichetta: 'Volume', valore: null, onValore: () => {} },
  render: () => (
    <FieldGroup className="max-w-xs">
      <Esempio etichetta="Volume" unita="m³" iniziale={1234} />
      <Esempio etichetta="Importo" unita="€" posizioneUnita="prima" iniziale={1234567.5} />
    </FieldGroup>
  ),
}

// Prova del punto delle migliaia. Il caso che conta è il primo: un intero di
// quattro cifre mostrato `1.234`, se il punto restasse nel campo a fuoco,
// all'uscita si rileggerebbe 1,234.
export const MigliaiaProva: Story = {
  ...Migliaia,
  name: 'Migliaia, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const volume = tela.getByLabelText('Volume')
    const valoreVolume = volume.closest('[data-slot="field"]')!.parentElement!.querySelector('[data-valore]')
    expect(volume).toHaveValue('1.234')
    expect(tela.getByLabelText('Importo')).toHaveValue('1.234.567,5')

    // A fuoco le cifre nude; uscendo senza cambiare niente, il valore resta.
    await userEvent.click(volume)
    expect(volume).toHaveValue('1234')
    await userEvent.tab()
    expect(volume).toHaveValue('1.234')
    expect(valoreVolume).toHaveTextContent('Valore confermato: 1234')

    // Si scrive sulle cifre nude: aggiunta una cifra, il numero è 12345.
    await userEvent.click(volume)
    await userEvent.type(volume, '5')
    await userEvent.tab()
    await waitFor(() => expect(volume).toHaveValue('12.345'))
    expect(valoreVolume).toHaveTextContent('Valore confermato: 12345')
  },
}

/**
 * Con `negativiInRosso` il valore confermato è rosso quando è negativo. Il
 * rosso è del numero, non del campo: l'errore resta riconoscibile dal bordo e
 * dal messaggio. Mentre si scrive un testo diverso, il campo non è rosso.
 */
export const Negativi: Story = {
  args: { etichetta: 'Saldo', valore: null, onValore: () => {} },
  render: () => (
    <FieldGroup className="max-w-xs">
      <Esempio etichetta="Saldo" unita="m²" iniziale={-1.89} negativiInRosso />
      <Esempio etichetta="Quantità netta" unita="m²" iniziale={20.61} negativiInRosso />
    </FieldGroup>
  ),
}

// Prova dei negativi: rosso il saldo negativo, non il positivo; non mentre si
// scrive un testo diverso; di nuovo rosso confermato un altro negativo.
export const NegativiProva: Story = {
  ...Negativi,
  name: 'Negativi, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const saldo = tela.getByLabelText('Saldo')
    const netta = tela.getByLabelText('Quantità netta')
    const rosso = 'text-destructive-subtle-foreground'
    expect(saldo).toHaveClass(rosso)
    expect(netta).not.toHaveClass(rosso)

    await userEvent.click(saldo)
    await userEvent.type(saldo, '0')
    expect(saldo).not.toHaveClass(rosso)
    await userEvent.tab()
    // «-1,890» confermato è -1,89: di nuovo rosso, a riposo.
    await waitFor(() => expect(saldo).toHaveValue('-1,89'))
    expect(saldo).toHaveClass(rosso)

    // Un positivo che diventa negativo prende il rosso alla conferma.
    await userEvent.clear(netta)
    await userEvent.type(netta, '-3{Enter}')
    expect(netta).toHaveClass(rosso)
  },
}

/**
 * Un valore fuori dai limiti resta scritto nel campo, con il limite nel
 * messaggio; il valore confermato resta quello di prima.
 */
export const FuoriDaiLimiti: Story = {
  name: 'Fuori dai limiti',
  args: { etichetta: 'Pendenza', valore: null, onValore: () => {} },
  render: () => (
    <FieldGroup className="max-w-xs">
      <Esempio etichetta="Pendenza" unita="%" iniziale={2} min={0} max={10} descrizione="Da 0 a 10." />
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const campo = tela.getByLabelText('Pendenza')
    await userEvent.clear(campo)
    await userEvent.type(campo, '12,5{Enter}')
    expect(await tela.findByRole('alert')).toHaveTextContent('Il massimo è 10 %.')
    expect(campo).toHaveValue('12,5')
    expect(canvasElement.querySelector('[data-valore]')).toHaveTextContent('Valore confermato: 2')
  },
}

const schema = z.object({
  quantita: z
    .number()
    .nullable()
    .refine((v) => v !== null, 'La quantità è obbligatoria.')
    .refine((v) => v === null || v > 0, 'La quantità è maggiore di zero.'),
})

type Riga = z.input<typeof schema>

function ModuloRiga() {
  const [salvato, setSalvato] = useState<number | null>(null)
  const form = useForm<Riga, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { quantita: null },
  })
  return (
    <form className="max-w-xs" noValidate onSubmit={form.handleSubmit((dati) => setSalvato(dati.quantita))}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="quantita"
          render={({ field, fieldState }) => (
            <CampoNumero
              etichetta="Quantità"
              unita="m³"
              name={field.name}
              ref={field.ref}
              valore={field.value}
              onValore={field.onChange}
              onBlur={field.onBlur}
              errore={fieldState.error?.message}
            />
          )}
        />
        <div className="flex items-center gap-3">
          <Button type="submit">Salva</Button>
          <p className="text-sm text-muted-foreground" data-salvato>
            {salvato === null ? 'Non ancora salvato' : `Salvato: ${String(salvato)}`}
          </p>
        </div>
      </FieldGroup>
    </form>
  )
}

/**
 * Con react-hook-form e uno schema Zod: il campo si collega con un
 * `Controller`, e l'errore dello schema arriva nella prop `errore`.
 *
 * ```tsx
 * <Controller
 *   control={form.control}
 *   name="quantita"
 *   render={({ field, fieldState }) => (
 *     <CampoNumero
 *       etichetta="Quantità"
 *       unita="m³"
 *       name={field.name}
 *       ref={field.ref}
 *       valore={field.value}
 *       onValore={field.onChange}
 *       onBlur={field.onBlur}
 *       errore={fieldState.error?.message}
 *     />
 *   )}
 * />
 * ```
 */
export const ConUnModulo: Story = {
  name: 'Con un modulo',
  args: { etichetta: 'Quantità', valore: null, onValore: () => {} },
  render: () => <ModuloRiga />,
}

// Prova della tastiera e del modulo, fuori dalla barra e da Docs: la scena
// «Con un modulo» si apre a riposo, il controllo automatico esegue questa.
export const ConUnModuloProva: Story = {
  ...ConUnModulo,
  name: 'Con un modulo, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const campo = tela.getByLabelText('Quantità')
    const esito = canvasElement.querySelector('[data-salvato]')!

    // L'unità è collegata al campo.
    const descritto = campo.getAttribute('aria-describedby')!.split(' ')
    expect(descritto.map((id) => document.getElementById(id)?.textContent)).toContain('m³')

    // Un testo sbagliato e Invio: errore del campo, e il modulo non parte.
    await userEvent.click(campo)
    await userEvent.type(campo, '3,2,1{Enter}')
    expect(await tela.findByRole('alert')).toHaveTextContent('Scrivi un numero, per esempio 12,5.')
    expect(esito).toHaveTextContent('Non ancora salvato')

    // L'errore sparisce appena il testo torna giusto, prima dell'uscita.
    await userEvent.type(campo, '{Backspace}{Backspace}')
    await waitFor(() => expect(tela.queryByRole('alert')).toBeNull())
    expect(campo).toHaveValue('3,2')

    // Esc torna all'ultimo valore confermato, cioè il campo vuoto.
    await userEvent.keyboard('{Escape}')
    expect(campo).toHaveValue('')

    // Vuoto e Salva: l'errore dello schema arriva nel campo.
    await userEvent.click(tela.getByRole('button', { name: 'Salva' }))
    expect(await tela.findByRole('alert')).toHaveTextContent('La quantità è obbligatoria.')
    expect(campo).toHaveAttribute('aria-invalid', 'true')

    // Un valore giusto, Invio: conferma e invia con il numero letto.
    await userEvent.click(campo)
    await userEvent.type(campo, '0.75{Enter}')
    await waitFor(() => expect(esito).toHaveTextContent('Salvato: 0.75'))
    expect(campo).toHaveValue('0,75')
    expect(tela.queryByRole('alert')).toBeNull()
  },
}
