import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import * as z from 'zod'

import { CampoNumero, type CampoNumeroProps } from '@/registry/tassullo/blocks/campo-numero'
import { Button } from '@/registry/tassullo/ui/button'
import { FieldGroup } from '@/registry/tassullo/ui/field'
import { scriviNumeroConMigliaia } from '@/registry/tassullo/lib/numeri'

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
 * - `onErrore`: chiamata quando l'errore del campo compare, cambia o sparisce,
 *   con il messaggio o `null`. Serve a un modulo con un solo «Salva», che
 *   altrimenti non sa che un testo è sbagliato: `onValore` per quel testo non
 *   parte. Non riguarda l'errore che arriva da fuori con `errore`.
 * - `inputMode`: il tastierino che si apre sul telefono. Di serie `decimal`;
 *   diventa `text` da solo quando `min` è negativo, perché il tastierino
 *   decimale dell'iPhone non ha il segno meno. Un valore passato vince sempre.
 * - `importo`: il campo è un importo in euro, e legge come scritto sotto in
 *   «Come legge un importo». L'unità diventa `€`, prima del numero.
 * - `decimali`: con `importo`, quanti decimali tiene il campo, da 2 a 4; di
 *   serie 2. Per un prezzo unitario, `decimali={4}`.
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
 * **Come legge un importo.** Con `importo` il punto torna a essere quello
 * delle migliaia, perché in un importo scritto all'italiana lo è quasi
 * sempre.
 *
 * - Il punto è delle migliaia quando raggruppa bene, a gruppi di tre:
 *   `1.500` vale millecinquecento euro, `1.500.000` un milione e mezzo,
 *   qualunque sia `decimali`.
 * - Un punto solo che non può essere delle migliaia è il decimale del
 *   tastierino: seguito da una o due cifre (`15.00` vale quindici euro),
 *   dopo uno zero (`0.125`) o dopo quattro cifre o più (`1234.567`).
 * - La virgola è il decimale: `1.500,5` vale millecinquecento euro e
 *   cinquanta centesimi.
 * - I decimali in più di quelli ammessi si **arrotondano**, la metà per
 *   eccesso: con due decimali `0,125` diventa 0,13 e `-0,125` diventa
 *   -0,13; con quattro `1.500,12345` diventa 1.500,1235. Il campo riscrive
 *   il numero arrotondato all'uscita, e quello è il valore confermato.
 * - Un importo copiato da un documento o da una pagina si pulisce da sé:
 *   spazi, `€`, `EUR`, `euro`, il segno meno tipografico. `EUR 2.086,93` e
 *   `1 500,00 €` si leggono.
 * - Tutto il resto resta nel campo segnato come sbagliato, invece di essere
 *   indovinato: gruppi sbagliati (`12.5,3`), il formato inglese
 *   (`1,500.50`), un'altra moneta.
 * - A riposo l'importo si legge con almeno due decimali e al massimo quelli
 *   ammessi: `1.500,00`, `0,1234`.
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
 *   segno meno: con un `min` negativo il campo apre da solo la tastiera
 *   completa. Per un caso diverso si passa `inputMode`.
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

/** Il valore confermato come si legge: virgola decimale, punto delle migliaia. */
function scritto(valore: number | null): string {
  return valore === null ? 'nessuno' : scriviNumeroConMigliaia(String(valore))
}

// Il testo esatto, non contenuto: «1.500» è contenuto anche in «1.500.000».
function esatto(testo: string): RegExp {
  const protetto = testo.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&')
  return new RegExp(`^${protetto}$`)
}

/** Un campo col suo stato, e il valore confermato scritto sotto. */
function Esempio({ iniziale = null, ...prop }: Omit<CampoNumeroProps, 'valore' | 'onValore'> & { iniziale?: number | null }) {
  const [valore, setValore] = useState<number | null>(iniziale)
  return (
    <div className="flex flex-col gap-1">
      <CampoNumero {...prop} valore={valore} onValore={setValore} />
      <p className="text-sm text-muted-foreground" data-valore>
        Valore confermato: {scritto(valore)}
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
  { etichetta: 'Coefficiente', scritto: '0.125', resta: '0,125', valore: '0,125' },
  { etichetta: 'Lunghezza', scritto: '1.500', resta: '1,5', valore: '1,5' },
  { etichetta: 'Quantità', scritto: '1.234,5', resta: '1.234,5', valore: '1.234,5' },
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
      expect(riga.querySelector('[data-valore]')).toHaveTextContent(esatto(`Valore confermato: ${caso.valore}`))
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
    expect(valoreVolume).toHaveTextContent(esatto('Valore confermato: 1.234'))

    // Si scrive sulle cifre nude: aggiunta una cifra, il numero è 12345.
    await userEvent.click(volume)
    await userEvent.type(volume, '5')
    await userEvent.tab()
    await waitFor(() => expect(volume).toHaveValue('12.345'))
    expect(valoreVolume).toHaveTextContent(esatto('Valore confermato: 12.345'))
  },
}

/**
 * Con `importo` il campo legge gli importi in euro: il punto è delle migliaia,
 * i decimali in più si arrotondano, e a riposo se ne leggono almeno due. Il
 * prezzo unitario tiene quattro decimali, con `decimali={4}`.
 */
export const Importo: Story = {
  args: { etichetta: 'Importo lavori', valore: null, onValore: () => {} },
  render: () => (
    <FieldGroup className="max-w-xs">
      <Esempio etichetta="Importo lavori" importo iniziale={1500} min={0} />
      <Esempio etichetta="Prezzo unitario" importo decimali={4} iniziale={0.1234} min={0} />
      <Esempio etichetta="Ribasso" importo iniziale={-2086.9} negativiInRosso />
    </FieldGroup>
  ),
}

// Scritti e incollati: i testi che un importo deve leggere, compresi quelli
// copiati da un documento (spazi che non vanno a capo, il nome della moneta,
// il meno tipografico), e quelli che deve rifiutare invece di indovinare.
const IMPORTI = [
  { scritto: '1.500', resta: '1.500,00', valore: '1.500' },
  { scritto: '15.00', resta: '15,00', valore: '15' },
  { scritto: '1.500,5', resta: '1.500,50', valore: '1.500,5' },
  { scritto: '1.500.000', resta: '1.500.000,00', valore: '1.500.000' },
  { scritto: '€ 1.500', resta: '1.500,00', valore: '1.500' },
  { scritto: '1 500,00 €', resta: '1.500,00', valore: '1.500' },
  { scritto: 'EUR 2.086,93', resta: '2.086,93', valore: '2.086,93' },
  { scritto: '−1.500', resta: '-1.500,00', valore: '-1.500' },
  { scritto: '0,125', resta: '0,13', valore: '0,13' },
  { scritto: '-0,125', resta: '-0,13', valore: '-0,13' },
  { scritto: '1,005', resta: '1,01', valore: '1,01' },
  { scritto: '0.125', resta: '0,13', valore: '0,13' },
  { scritto: '1.500,999', resta: '1.501,00', valore: '1.501' },
  { scritto: '12.5,3', resta: '12.5,3', valore: '1.501', errore: true },
  { scritto: '1,500.50', resta: '1,500.50', valore: '1.501', errore: true },
] as const

// Lo stesso con quattro decimali: il punto delle migliaia non cambia, e si
// arrotonda alla quarta cifra.
const IMPORTI_QUATTRO = [
  { scritto: '0,1234', resta: '0,1234', valore: '0,1234' },
  { scritto: '0,125', resta: '0,125', valore: '0,125' },
  { scritto: '0.125', resta: '0,125', valore: '0,125' },
  { scritto: '1,500', resta: '1,50', valore: '1,5' },
  { scritto: '1.500', resta: '1.500,00', valore: '1.500' },
  { scritto: '1.500,12345', resta: '1.500,1235', valore: '1.500,1235' },
  { scritto: '12.1234', resta: '12,1234', valore: '12,1234' },
  { scritto: '0,99995', resta: '1,00', valore: '1' },
] as const

export const ImportoProva: Story = {
  name: 'Importo, prova',
  tags: ['!dev', '!autodocs'],
  args: { etichetta: 'Importo lavori', valore: null, onValore: () => {} },
  render: () => (
    <FieldGroup className="max-w-xs">
      <Esempio etichetta="Importo lavori" importo />
      <Esempio etichetta="Prezzo unitario" importo decimali={4} />
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const campo = tela.getByLabelText('Importo lavori')
    const valore = canvasElement.querySelector('[data-valore]')!

    // L'unità è l'euro, prima del numero.
    const unita = canvasElement.querySelector('[data-slot="input-group-addon"]')!
    expect(unita).toHaveTextContent('€')
    expect(unita).toHaveAttribute('data-align', 'inline-start')

    for (const caso of IMPORTI) {
      await userEvent.clear(campo)
      await userEvent.paste(caso.scritto)
      await userEvent.tab()
      await waitFor(() => expect(campo).toHaveValue(caso.resta))
      expect(valore).toHaveTextContent(esatto(`Valore confermato: ${caso.valore}`))
      if ('errore' in caso) {
        expect(campo).toHaveAttribute('aria-invalid', 'true')
        expect(tela.getByRole('alert')).toHaveTextContent(esatto('Scrivi un importo, per esempio 1.500,00.'))
      } else {
        expect(campo).toHaveAttribute('aria-invalid', 'false')
      }
    }

    const prezzo = tela.getByLabelText('Prezzo unitario')
    const valorePrezzo = prezzo.closest('[data-slot="field"]')!.parentElement!.querySelector('[data-valore]')
    for (const caso of IMPORTI_QUATTRO) {
      await userEvent.clear(prezzo)
      await userEvent.paste(caso.scritto)
      await userEvent.tab()
      await waitFor(() => expect(prezzo).toHaveValue(caso.resta))
      expect(valorePrezzo).toHaveTextContent(esatto(`Valore confermato: ${caso.valore}`))
      expect(prezzo).toHaveAttribute('aria-invalid', 'false')
    }
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
    expect(canvasElement.querySelector('[data-valore]')).toHaveTextContent(esatto('Valore confermato: 2'))
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
            {salvato === null ? 'Non ancora salvato' : `Salvato: ${scritto(salvato)}`}
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
    await waitFor(() => expect(esito).toHaveTextContent(esatto('Salvato: 0,75')))
    expect(campo).toHaveValue('0,75')
    expect(tela.queryByRole('alert')).toBeNull()
  },
}

/** Un modulo con due campi e un «Salva» che aspetta che nessuno sia sbagliato. */
function ModuloDueCampi() {
  const [lunghezza, setLunghezza] = useState<number | null>(4)
  const [larghezza, setLarghezza] = useState<number | null>(3)
  const [errori, setErrori] = useState<{ lunghezza: string | null; larghezza: string | null }>({
    lunghezza: null,
    larghezza: null,
  })
  const sbagliato = errori.lunghezza !== null || errori.larghezza !== null
  return (
    <form className="max-w-xs" noValidate onSubmit={(e) => e.preventDefault()}>
      <FieldGroup>
        <CampoNumero
          etichetta="Lunghezza"
          unita="m"
          valore={lunghezza}
          onValore={setLunghezza}
          onErrore={(errore) => setErrori((prima) => ({ ...prima, lunghezza: errore }))}
          min={0}
        />
        <CampoNumero
          etichetta="Larghezza"
          unita="m"
          valore={larghezza}
          onValore={setLarghezza}
          onErrore={(errore) => setErrori((prima) => ({ ...prima, larghezza: errore }))}
          min={0}
        />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={sbagliato}>
            Salva
          </Button>
          <Button type="button" variant="outline" onClick={() => setLunghezza(10)}>
            Imposta 10
          </Button>
          <p className="text-sm text-muted-foreground" data-errori>
            {sbagliato ? `Da correggere: ${[errori.lunghezza, errori.larghezza].filter(Boolean).length}` : 'Tutto a posto'}
          </p>
        </div>
      </FieldGroup>
    </form>
  )
}

/**
 * Due campi e un «Salva» nello stesso modulo. `onErrore` dice al modulo che un
 * testo è sbagliato anche se `onValore` non è partito, e il bottone resta
 * spento finché ce n'è uno.
 *
 * ```tsx
 * <CampoNumero
 *   etichetta="Lunghezza"
 *   valore={lunghezza}
 *   onValore={setLunghezza}
 *   onErrore={(errore) => setErrori((prima) => ({ ...prima, lunghezza: errore }))}
 * />
 * ```
 */
export const ConErrore: Story = {
  name: 'Con onErrore',
  args: { etichetta: 'Lunghezza', valore: null, onValore: () => {} },
  render: () => <ModuloDueCampi />,
}

// Prova di `onErrore`: compare, sparisce correggendo, sparisce con Esc, sparisce
// quando il valore cambia da fuori; il testo scritto da un tasto non cambia
// niente finché il messaggio è lo stesso.
export const ConErroreProva: Story = {
  ...ConErrore,
  name: 'Con onErrore, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const lunghezza = tela.getByLabelText('Lunghezza')
    const larghezza = tela.getByLabelText('Larghezza')
    const salva = tela.getByRole('button', { name: 'Salva' })
    const stato = canvasElement.querySelector('[data-errori]')!
    expect(salva).toBeEnabled()
    expect(stato).toHaveTextContent('Tutto a posto')

    // Un testo sbagliato, uscendo dal campo: l'errore compare e il bottone si spegne.
    await userEvent.click(lunghezza)
    await userEvent.type(lunghezza, '{Control>}a{/Control}dodici')
    await userEvent.tab()
    await waitFor(() => expect(stato).toHaveTextContent('Da correggere: 1'))
    expect(salva).toBeDisabled()

    // Corretto il testo, l'errore sparisce e il bottone torna acceso.
    await userEvent.clear(lunghezza)
    await userEvent.type(lunghezza, '5')
    await waitFor(() => expect(stato).toHaveTextContent('Tutto a posto'))
    expect(salva).toBeEnabled()
    await userEvent.tab()

    // Fuori dai limiti: un altro messaggio, e due errori insieme.
    await userEvent.click(larghezza)
    await userEvent.type(larghezza, '{Control>}a{/Control}-2')
    await userEvent.tab()
    await waitFor(() => expect(stato).toHaveTextContent('Da correggere: 1'))
    expect(salva).toBeDisabled()
    await userEvent.click(lunghezza)
    await userEvent.type(lunghezza, '{Control>}a{/Control}abc')
    await userEvent.tab()
    await waitFor(() => expect(stato).toHaveTextContent('Da correggere: 2'))

    // Esc torna all'ultimo valore confermato e toglie l'errore.
    await userEvent.click(larghezza)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(stato).toHaveTextContent('Da correggere: 1'))
    expect(larghezza).toHaveValue('3')

    // Il valore cambiato da fuori riscrive il campo e toglie l'errore.
    await userEvent.click(tela.getByRole('button', { name: 'Imposta 10' }))
    await waitFor(() => expect(stato).toHaveTextContent('Tutto a posto'))
    expect(lunghezza).toHaveValue('10')
    expect(salva).toBeEnabled()
  },
}

/**
 * Il tastierino che il campo chiede al telefono. Di serie `decimal`; con un
 * `min` negativo `text`, perché il tastierino decimale dell'iPhone non ha il
 * segno meno; un `inputMode` passato dall'app vince sempre.
 */
export const TastieraTelefono: Story = {
  name: 'Tastiera sul telefono',
  args: { etichetta: 'Superficie', valore: null, onValore: () => {} },
  render: () => (
    <FieldGroup className="max-w-xs">
      <Esempio etichetta="Superficie" unita="m²" min={0} />
      <Esempio etichetta="Temperatura" unita="°C" min={-10} />
      <Esempio etichetta="Quota" unita="m" min={-10} inputMode="decimal" />
      <Esempio etichetta="Indice" inputMode="numeric" />
    </FieldGroup>
  ),
}

export const TastieraTelefonoProva: Story = {
  ...TastieraTelefono,
  name: 'Tastiera sul telefono, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    expect(tela.getByLabelText('Superficie')).toHaveAttribute('inputmode', 'decimal')
    expect(tela.getByLabelText('Temperatura')).toHaveAttribute('inputmode', 'text')
    expect(tela.getByLabelText('Quota')).toHaveAttribute('inputmode', 'decimal')
    expect(tela.getByLabelText('Indice')).toHaveAttribute('inputmode', 'numeric')
  },
}
