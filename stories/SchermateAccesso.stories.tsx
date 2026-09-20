import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckIcon, MailIcon, ShieldCheckIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/registry/tassullo/ui/alert'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/registry/tassullo/ui/card'
import { Checkbox } from '@/registry/tassullo/ui/checkbox'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/registry/tassullo/ui/empty'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/registry/tassullo/ui/input-group'
import { RadioGroup, RadioGroupItem } from '@/registry/tassullo/ui/radio-group'
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
} from '@/registry/tassullo/ui/stepper'

/**
 * # Le schermate d'accesso, composte
 *
 * `Pagine/Login` mostra il **componente** `pagina-login` e le sue tre vie.
 * Queste sette scene mostrano le **altre cinque schermate** che stanno intorno
 * a quella — registrazione in tre passi, esito, password dimenticata,
 * reimposta, verifica email — e la ragione per cui esistono è una sola:
 * **non c'è niente da installare**, e senza vederlo nessuno lo saprebbe.
 *
 * Stanno qui e non in `Pagine/Login` perché **non sono scene di
 * `PaginaLogin`**: non ne usano una prop, non ne esercitano un ramo. Sono
 * composizione, scritta con le primitive che il registry ha già, e metterle
 * sotto il titolo del componente direbbe il falso.
 *
 * ## Il guscio si ricompone, non si riusa — ed è un fatto da sapere
 *
 * `docs/SPEC-AUTH.md` §1.3 dice «il guscio resta di `pagina-login` e non
 * cambia». È vero come **forma** — schermo centrato, `Card`, marchio, titolo,
 * descrizione, contenuto — e falso come **codice**: `PaginaLogin` non accetta
 * `children` e non esporta il guscio, quindi una pagina che non sia il login
 * lo riscrive. Sono le dieci righe di `GuscioAccesso` qui sotto, che è codice
 * di pagina come lo sarebbe in Studio.
 *
 * Non si è aggiunto `children` a `PaginaLogin` perché sarebbe un cambio d'API
 * in un task che dichiara **zero componenti nuovi**: è una decisione da
 * prendere apposta, non di passaggio.
 *
 * ## Quello che resta alla pagina, e non al design system
 *
 * - **Il gating** — «non passare al passo 2 finché non valida». Dipende da
 *   quali campi ha quel passo, e nessun blocco può saperlo: qui è scritto
 *   come codice di pagina, in `Registrazione`, ed è vero — «Avanti» valida e
 *   non avanza, i passi non ancora raggiunti sono schede disabilitate.
 * - **Il misuratore di robustezza della password**. Somiglia alla barra dei
 *   passi e non lo è: lo stepper è un `tablist` di schede che si cliccano, il
 *   misuratore non si naviga e non si seleziona. Deciso il 2026-09-19 che
 *   resta dell'app, e qui non è in scena apposta.
 * - **Il campo nascosto anti-bot** delle schermate pubbliche
 *   (`docs/SPEC-AUTH.md` §3.4). Non è reso in nessuna di queste scene, ed è
 *   una scelta: un honeypot è utile finché il suo nome non è prevedibile, e
 *   questo repo è pubblico. Dirlo serve, mostrarlo lo indebolisce.
 *
 * ## La soglia che decide se i campi si affiancano
 *
 * `Field orientation="responsive"` guarda il **contenitore**, non la finestra:
 * è `@md/field-group`, cioè **448px** di `FieldGroup`. Dentro `Card max-w-sm`
 * il `FieldGroup` misura **352px** e non ci arriva mai — misurato in Chromium
 * il 2026-09-20. La prima larghezza che lo fa scattare è `max-w-lg` (card
 * 512px → contenuto 480px); `max-w-md` non basta (448 → 416).
 */
const meta = {
  title: "Pagine/Schermate d'accesso",
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Il guscio: schermo centrato, `Card`, marchio, titolo, descrizione,
 * contenuto. È la stessa forma di `pagina-login.tsx:118-135`, riscritta
 * perché quel componente non la esporta.
 *
 * `justify-self-center` sul marchio non è decorazione: `CardHeader` è una
 * **griglia**, e `items-center` allinea sull'asse sbagliato — senza, il
 * marchio resta incollato a sinistra sotto un titolo centrato.
 */
function GuscioAccesso({
  applicazione = 'Studio',
  titolo,
  descrizione,
  larghezza = 'max-w-sm',
  children,
}: {
  applicazione?: string
  titolo?: string
  descrizione?: React.ReactNode
  larghezza?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-4">
      <Card className={`w-full ${larghezza}`}>
        <CardHeader className="items-center gap-2 text-center">
          <span aria-hidden className="marchio-t size-10 justify-self-center" />
          <CardTitle className="text-2xl">{titolo ?? applicazione}</CardTitle>
          {descrizione ? <CardDescription>{descrizione}</CardDescription> : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
    </div>
  )
}

/**
 * La larghezza della card di registrazione. Sta in una costante sola perché è
 * **la** variabile di queste tre scene: con `max-w-sm` i campi si impilano
 * sempre, con `max-w-lg` `orientation="responsive"` scatta e Nome+Cognome e
 * Città/Provincia/CAP si affiancano. Il codice dei campi non cambia.
 */
const LARGHEZZA_REGISTRAZIONE = 'max-w-lg'

const PASSI = [
  { titolo: 'Accesso', descrizione: 'Codice invito, email e password' },
  { titolo: 'Profilo', descrizione: 'Chi sei e dove hai sede' },
  { titolo: 'Consensi', descrizione: 'Privacy e condizioni d’uso' },
]

/**
 * La barra dei passi è `@reui/stepper` composto, non riscritto — `Primitive/Stepper`
 * ne mostra cinque forme e questa è `BarraConTitoli`, che è quella che dice
 * «sono al secondo di tre» senza doverlo leggere.
 *
 * I passi **oltre** quello più avanzato raggiunto sono `disabled`: è il gating
 * visto dalla barra. Cliccare indietro si può — i dati sono già validati.
 */
function BarraPassi({
  passo,
  raggiunto,
  onPasso,
}: {
  passo: number
  raggiunto: number
  onPasso: (n: number) => void
}) {
  return (
    <>
      <div
        role="tablist"
        aria-label="Passi della registrazione"
        className="grid w-full grid-flow-col auto-cols-fr gap-3"
      >
        {PASSI.map((p, i) => (
          <StepperItem
            key={p.titolo}
            step={i + 1}
            disabled={i + 1 > raggiunto}
            className="flex-col items-stretch"
          >
            <StepperTrigger
              className="w-full flex-col items-start gap-2"
              onClick={() => onPasso(i + 1)}
            >
              <StepperIndicator className="h-1 w-full rounded-full">
                <span className="sr-only">{`Passo ${i + 1} di ${PASSI.length}`}</span>
              </StepperIndicator>
              <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-start text-sm font-semibold">
                {p.titolo}
              </StepperTitle>
            </StepperTrigger>
          </StepperItem>
        ))}
      </div>
      {/*
       * L'annuncio sta **fuori** dal `tablist`, e non è pignoleria: un figlio
       * diretto di `role="tablist"` che non sia un `tab` è una violazione
       * `aria-required-children`, e il gate l'ha presa (3 story × 4 passate).
       */}
      <span className="sr-only" aria-live="polite">
        {`Passo ${passo} di ${PASSI.length}: ${PASSI[passo - 1].titolo}`}
      </span>
    </>
  )
}

type Errori = Record<string, string>

/**
 * ## Il gating, scritto come codice di pagina
 *
 * `Avanti` **valida e non avanza** se manca qualcosa: gli errori escono nei
 * `FieldError`, i campi prendono `aria-invalid`, e il passo resta quello.
 * Non c'è nessun blocco che lo faccia, e non potrebbe esserci — quali campi
 * siano obbligatori è una cosa che sa la pagina.
 *
 * Il form è **non controllato**: i valori li legge `FormData` all'invio, come
 * in `pagina-login`. Lo stato tenuto qui è solo il passo, il massimo passo
 * raggiunto, gli errori e la categoria scelta — quest'ultima perché la scelta
 * a schede cambia l'etichetta del campo sotto.
 */
function Registrazione({ passoIniziale = 1 }: { passoIniziale?: number }) {
  const [passo, setPasso] = useState(passoIniziale)
  const [raggiunto, setRaggiunto] = useState(passoIniziale)
  const [errori, setErrori] = useState<Errori>({})
  const [categoria, setCategoria] = useState('impresa')
  const [mostraPassword, setMostraPassword] = useState(false)
  const [consensi, setConsensi] = useState({ uso: false, privacy: false, novita: false })

  function vaiA(n: number) {
    setPasso(n)
    setRaggiunto((r) => Math.max(r, n))
    setErrori({})
  }

  function valida(dati: FormData): Errori {
    const nuovi: Errori = {}
    const testo = (n: string) => String(dati.get(n) ?? '').trim()

    if (passo === 1) {
      if (!testo('invito')) nuovi.invito = 'Serve il codice ricevuto da Tassullo.'
      if (!testo('email').includes('@')) nuovi.email = 'Scrivi un indirizzo email valido.'
      if (testo('password').length < 10)
        nuovi.password = 'La password deve essere di almeno 10 caratteri.'
      else if (testo('password') !== testo('ripeti'))
        nuovi.ripeti = 'Le due password non coincidono.'
    }

    if (passo === 2) {
      if (!testo('nome')) nuovi.nome = 'Manca il nome.'
      if (!testo('cognome')) nuovi.cognome = 'Manca il cognome.'
      if (!/^\d{11}$/.test(testo('piva')))
        nuovi.piva = 'La partita IVA è di 11 cifre, senza spazi.'
      if (!/^\d{5}$/.test(testo('cap'))) nuovi.cap = 'Il CAP è di 5 cifre.'
    }

    if (passo === 3) {
      if (!consensi.uso) nuovi.uso = 'Per proseguire devi accettare le condizioni d’uso.'
      if (!consensi.privacy) nuovi.privacy = 'Conferma di aver letto l’informativa.'
    }

    return nuovi
  }

  function avanti(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const nuovi = valida(new FormData(evento.currentTarget))
    setErrori(nuovi)
    if (Object.keys(nuovi).length > 0) return
    if (passo < PASSI.length) vaiA(passo + 1)
  }

  const titoli = ['Crea il tuo accesso', 'Il tuo profilo', 'Privacy e consensi']
  const sottotitoli = [
    'Studio è in prova su invito: serve il codice che ti ha dato Tassullo.',
    'Questi dati finiscono nelle relazioni e nei computi che esporti.',
    'Due consensi servono per usare Studio, il terzo no.',
  ]

  return (
    <GuscioAccesso
      titolo={titoli[passo - 1]}
      descrizione={sottotitoli[passo - 1]}
      larghezza={LARGHEZZA_REGISTRAZIONE}
    >
      <Stepper
        role="group"
        aria-orientation={undefined}
        value={passo}
        onValueChange={setPasso}
        className="flex flex-col gap-4"
      >
        <BarraPassi passo={passo} raggiunto={raggiunto} onPasso={vaiA} />

        <form onSubmit={avanti} noValidate>
          <StepperPanel>
            <div id="stepper-panel-1" role="tabpanel" aria-labelledby="stepper-tab-1">
              <StepperContent value={1}>
                <FieldGroup>
                  <Field data-invalid={!!errori.invito}>
                    <FieldLabel htmlFor="reg-invito">Codice invito</FieldLabel>
                    <Input
                      id="reg-invito"
                      name="invito"
                      defaultValue="TAS-2026-0418"
                      aria-invalid={!!errori.invito || undefined}
                    />
                    <FieldDescription>
                      Otto o più caratteri, com’è scritto nella mail di invito.
                    </FieldDescription>
                    <FieldError>{errori.invito}</FieldError>
                  </Field>
                  <Field data-invalid={!!errori.email}>
                    <FieldLabel htmlFor="reg-email">Email</FieldLabel>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      placeholder="nome@studio.it"
                      aria-invalid={!!errori.email || undefined}
                    />
                    <FieldDescription>
                      È l’indirizzo con cui entrerai, e quello a cui mandiamo il link di
                      conferma.
                    </FieldDescription>
                    <FieldError>{errori.email}</FieldError>
                  </Field>
                  <Field data-invalid={!!errori.password}>
                    <FieldLabel htmlFor="reg-password">Password</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="reg-password"
                        name="password"
                        type={mostraPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        aria-invalid={!!errori.password || undefined}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          onClick={() => setMostraPassword((m) => !m)}
                          aria-pressed={mostraPassword}
                        >
                          {mostraPassword ? 'Nascondi' : 'Mostra'}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>Almeno 10 caratteri.</FieldDescription>
                    <FieldError>{errori.password}</FieldError>
                  </Field>
                  <Field data-invalid={!!errori.ripeti}>
                    <FieldLabel htmlFor="reg-ripeti">Ripeti la password</FieldLabel>
                    <Input
                      id="reg-ripeti"
                      name="ripeti"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={!!errori.ripeti || undefined}
                    />
                    <FieldError>{errori.ripeti}</FieldError>
                  </Field>
                </FieldGroup>
              </StepperContent>
            </div>

            <div id="stepper-panel-2" role="tabpanel" aria-labelledby="stepper-tab-2">
              <StepperContent value={2}>
                <FieldGroup>
                  <FieldSet>
                    <FieldLegend variant="label">Come lavori</FieldLegend>
                    <RadioGroup value={categoria} onValueChange={(v) => setCategoria(String(v))}>
                      <FieldLabel htmlFor="reg-cat-impresa">
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Impresa</FieldTitle>
                            <FieldDescription>
                              Esegui lavori in cantiere e compri materiale.
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value="impresa" id="reg-cat-impresa" />
                        </Field>
                      </FieldLabel>
                      <FieldLabel htmlFor="reg-cat-studio">
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Studio di progettazione</FieldTitle>
                            <FieldDescription>
                              Firmi progetti e capitolati per conto di terzi.
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value="studio" id="reg-cat-studio" />
                        </Field>
                      </FieldLabel>
                      <FieldLabel htmlFor="reg-cat-libero">
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Libero professionista</FieldTitle>
                            <FieldDescription>
                              Lavori da solo, con partita IVA tua.
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value="libero" id="reg-cat-libero" />
                        </Field>
                      </FieldLabel>
                    </RadioGroup>
                  </FieldSet>

                  {/*
                   * `orientation="responsive"` guarda il **contenitore**
                   * (`@md/field-group`, 448px), non la finestra: dentro una
                   * card stretta i due campi restano impilati, e non è un
                   * guasto — è la soglia che non viene raggiunta.
                   */}
                  <Field orientation="responsive" data-invalid={!!errori.nome || !!errori.cognome}>
                    <Field>
                      <FieldLabel htmlFor="reg-nome">Nome</FieldLabel>
                      <Input id="reg-nome" name="nome" autoComplete="given-name" />
                      <FieldError>{errori.nome}</FieldError>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="reg-cognome">Cognome</FieldLabel>
                      <Input id="reg-cognome" name="cognome" autoComplete="family-name" />
                      <FieldError>{errori.cognome}</FieldError>
                    </Field>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="reg-ragione">
                      {categoria === 'libero' ? 'Denominazione' : 'Ragione sociale'}
                    </FieldLabel>
                    <Input
                      id="reg-ragione"
                      name="ragione"
                      autoComplete="organization"
                      placeholder={
                        categoria === 'libero' ? 'Ing. Mario Rossi' : 'Rossi Costruzioni S.r.l.'
                      }
                    />
                  </Field>

                  {/*
                   * `items-start`: l'orientamento `responsive` centra i figli
                   * sull'asse verticale, e qui il secondo campo ha una riga di
                   * descrizione in più — centrandoli, l'etichetta «Partita IVA»
                   * scende sotto quella accanto. Si vede solo quando la soglia
                   * scatta, che è la ragione per cui era passata inosservata.
                   */}
                  <Field orientation="responsive" className="@md/field-group:items-start">
                    <Field data-invalid={!!errori.piva}>
                      <FieldLabel htmlFor="reg-piva">Partita IVA</FieldLabel>
                      <Input
                        id="reg-piva"
                        name="piva"
                        inputMode="numeric"
                        className="tabular-nums"
                        aria-invalid={!!errori.piva || undefined}
                      />
                      <FieldError>{errori.piva}</FieldError>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="reg-albo">Iscrizione all’ordine</FieldLabel>
                      <Input id="reg-albo" name="albo" placeholder="TN 1234" />
                      <FieldDescription>Se non sei iscritto, lascia vuoto.</FieldDescription>
                    </Field>
                  </Field>

                  <Field
                    orientation="responsive"
                    data-invalid={!!errori.cap}
                    className="@md/field-group:items-start"
                  >
                    <Field className="@md/field-group:flex-1">
                      <FieldLabel htmlFor="reg-citta">Città</FieldLabel>
                      <Input id="reg-citta" name="citta" autoComplete="address-level2" />
                    </Field>
                    <Field className="@md/field-group:w-20!">
                      <FieldLabel htmlFor="reg-prov">Prov.</FieldLabel>
                      <Input
                        id="reg-prov"
                        name="prov"
                        maxLength={2}
                        autoComplete="address-level1"
                        className="uppercase"
                      />
                    </Field>
                    <Field className="@md/field-group:w-28!">
                      <FieldLabel htmlFor="reg-cap">CAP</FieldLabel>
                      <Input
                        id="reg-cap"
                        name="cap"
                        inputMode="numeric"
                        maxLength={5}
                        autoComplete="postal-code"
                        className="tabular-nums"
                        aria-invalid={!!errori.cap || undefined}
                      />
                    </Field>
                    <FieldError className="w-full">{errori.cap}</FieldError>
                  </Field>
                </FieldGroup>
              </StepperContent>
            </div>

            <div id="stepper-panel-3" role="tabpanel" aria-labelledby="stepper-tab-3">
              <StepperContent value={3}>
                <FieldGroup>
                  <Field orientation="horizontal" data-invalid={!!errori.uso}>
                    <Checkbox
                      id="reg-uso"
                      checked={consensi.uso}
                      onCheckedChange={(v: boolean) =>
                        setConsensi((c) => ({ ...c, uso: v }))
                      }
                      aria-invalid={!!errori.uso || undefined}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="reg-uso">
                        Accetto le condizioni d’uso di Studio
                      </FieldLabel>
                      <FieldDescription>
                        Obbligatorio. Le trovi per esteso in fondo a ogni pagina.
                      </FieldDescription>
                      <FieldError>{errori.uso}</FieldError>
                    </FieldContent>
                  </Field>
                  <Field orientation="horizontal" data-invalid={!!errori.privacy}>
                    <Checkbox
                      id="reg-privacy"
                      checked={consensi.privacy}
                      onCheckedChange={(v: boolean) =>
                        setConsensi((c) => ({ ...c, privacy: v }))
                      }
                      aria-invalid={!!errori.privacy || undefined}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="reg-privacy">
                        Ho letto l’informativa sul trattamento dei dati
                      </FieldLabel>
                      <FieldDescription>
                        Obbligatorio. Dice quali dati teniamo e per quanto.
                      </FieldDescription>
                      <FieldError>{errori.privacy}</FieldError>
                    </FieldContent>
                  </Field>
                  <Field orientation="horizontal">
                    <Checkbox
                      id="reg-novita"
                      checked={consensi.novita}
                      onCheckedChange={(v: boolean) =>
                        setConsensi((c) => ({ ...c, novita: v }))
                      }
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="reg-novita">
                        Avvisatemi quando escono listini e schede nuove
                      </FieldLabel>
                      <FieldDescription>
                        Facoltativo. Qualche mail l’anno, e si disdice da sola.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </StepperContent>
            </div>
          </StepperPanel>

          <div className="mt-6 flex gap-2">
            {passo > 1 ? (
              <Button type="button" variant="outline" onClick={() => vaiA(passo - 1)}>
                Indietro
              </Button>
            ) : null}
            <Button type="submit" className="flex-1">
              {passo < PASSI.length ? 'Avanti' : 'Crea l’accesso'}
            </Button>
          </div>
        </form>
      </Stepper>

      <FieldDescription className="text-center">
        Hai già un accesso?{' '}
        <Button type="button" variant="link" className="h-auto p-0">
          Accedi
        </Button>
      </FieldDescription>
    </GuscioAccesso>
  )
}

/**
 * **Passo 1 — Crea il tuo accesso.** `Field`+`Input` per il codice invito,
 * l'email e le due password, `InputGroup`+`InputGroupButton` per il «Mostra»
 * dentro il campo, `FieldDescription` per la riga di spiegazione e
 * `FieldError` per il rifiuto.
 *
 * **Il gating si prova**: lasciare l'email vuota e premere «Avanti» non porta
 * al passo 2 — escono gli errori e il passo resta questo.
 */
export const RegistrazionePasso1: Story = {
  name: 'Registrati — 1. Accesso',
  render: () => <Registrazione passoIniziale={1} />,
}

/**
 * **Passo 2 — Il tuo profilo.** Le tre schede di scelta sono `FieldLabel` che
 * avvolge un `Field` con dentro un `RadioGroupItem`: il riquadro, il bordo e
 * il fondo acceso sulla voce scelta **sono già nella primitiva**
 * (`has-data-checked:border-primary/30 has-data-checked:bg-primary/5`), e non
 * c'è una riga di JavaScript che li metta.
 *
 * Lo stato «scelta» si legge dal DOM, non dall'aspetto: il
 * `[data-slot=radio-group-item]` acceso porta `data-checked`.
 *
 * I campi accoppiati — Nome+Cognome, Partita IVA+Albo, Città/Prov./CAP — sono
 * `Field orientation="responsive"`, che **guarda il contenitore**: sotto i
 * 448px di `FieldGroup` restano impilati. Vedi la nota in testa.
 */
export const RegistrazionePasso2: Story = {
  name: 'Registrati — 2. Profilo',
  render: () => <Registrazione passoIniziale={2} />,
}

/**
 * **Passo 3 — Privacy e consensi.** `Field orientation="horizontal"` +
 * `Checkbox` + `FieldContent`: `field.tsx:58` allinea la casella **in cima**
 * quando il testo va a capo, che è la ragione per cui i consensi non hanno
 * bisogno di niente di scritto a mano.
 *
 * Le parole dicono **cosa comporta**, non «accetto i termini»: obbligatorio o
 * facoltativo sta scritto, e il terzo dice quante mail sono.
 */
export const RegistrazionePasso3: Story = {
  name: 'Registrati — 3. Consensi',
  render: () => <Registrazione passoIniziale={3} />,
}

/**
 * **L'esito della registrazione.** È `Empty`: icona, titolo, descrizione,
 * azione — corrispondenza esatta, niente da scrivere.
 *
 * Le parole descrivono **un'azione che esiste**: «rispedisci» rimanda la
 * stessa mail, «cambia indirizzo» torna al passo 1. Non c'è nessun «torna
 * indietro», perché da qui non c'è un indietro.
 */
export const EsitoRegistrazione: Story = {
  name: 'Registrati — esito',
  render: () => (
    <GuscioAccesso titolo="Controlla la posta">
      <Empty className="border-0 p-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MailIcon />
          </EmptyMedia>
          {/*
           * Niente `EmptyTitle` qui: il titolo della schermata lo dà già il
           * guscio. Con tutti e due, «Controlla la posta» e «Ti abbiamo
           * mandato un link» si leggevano come due intestazioni che dicono la
           * stessa cosa — visto a video, nessuna misura lo prende.
           */}
          <EmptyDescription>
            Abbiamo mandato un link di conferma a{' '}
            <span className="font-medium text-foreground">mario.rossi@studio.it</span>.
            Aprilo per attivare l’accesso.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="w-full gap-2">
          <Button className="w-full">Rispedisci il link</Button>
          <Button variant="link">Ho sbagliato indirizzo</Button>
        </EmptyContent>
      </Empty>
      <FieldDescription className="text-center">
        Se non arriva, guarda nella posta indesiderata.
      </FieldDescription>
    </GuscioAccesso>
  ),
}

/**
 * **Password dimenticata.** Il guscio, un campo e un bottone: la schermata
 * più piccola delle cinque, ed è la prova che il guscio regge anche quando
 * dentro non c'è quasi niente.
 *
 * «Se l'indirizzo è registrato» non è cautela retorica: la risposta è la
 * stessa per un indirizzo che esiste e per uno che no, o la pagina direbbe a
 * chiunque chi è iscritto. Il testo lo dichiara invece di far credere il
 * contrario.
 */
export const PasswordDimenticata: Story = {
  name: 'Password dimenticata',
  render: () => (
    <GuscioAccesso
      titolo="Password dimenticata"
      descrizione="Scrivi l’indirizzo con cui entri: ti mandiamo un link per sceglierne una nuova."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        noValidate
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="pd-email">Email</FieldLabel>
            <Input
              id="pd-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="nome@studio.it"
            />
            <FieldDescription>
              Se l’indirizzo è registrato, il link arriva entro pochi minuti.
            </FieldDescription>
          </Field>
          <Button type="submit" className="w-full">
            Manda il link
          </Button>
        </FieldGroup>
      </form>
      <FieldDescription className="text-center">
        <Button type="button" variant="link" className="h-auto p-0">
          Torna all’accesso
        </Button>
      </FieldDescription>
    </GuscioAccesso>
  ),
}

/**
 * **Reimposta la password.** Si arriva qui dal link della mail, quindi
 * l'indirizzo è già noto e non si richiede: due campi e un bottone.
 *
 * `Alert` per il caso in cui il link sia vecchio — ed è **un avviso, non un
 * testo tinto**: `text-destructive` su fondo di card dà 3.52:1 (la seconda
 * trappola del `CLAUDE.md`).
 *
 * Il **misuratore di robustezza** andrebbe sotto il primo campo e **non è
 * qui**: resta dell'app (deciso il 2026-09-19). Somiglia alla barra dei passi
 * e non lo è — quella è un `tablist` di schede che si cliccano.
 */
export const ReimpostaPassword: Story = {
  name: 'Reimposta la password',
  render: () => (
    <GuscioAccesso
      titolo="Scegli una password nuova"
      descrizione="Vale da subito: al prossimo accesso userai questa."
    >
      <Alert>
        <ShieldCheckIcon />
        <AlertTitle>Il link vale un’ora sola</AlertTitle>
        <AlertDescription>
          Se scade prima che tu abbia finito, chiedine un altro dalla pagina di accesso.
        </AlertDescription>
      </Alert>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        noValidate
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="rp-nuova">Nuova password</FieldLabel>
            <Input id="rp-nuova" name="nuova" type="password" autoComplete="new-password" />
            <FieldDescription>Almeno 10 caratteri.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="rp-ripeti">Ripetila</FieldLabel>
            <Input id="rp-ripeti" name="ripeti" type="password" autoComplete="new-password" />
          </Field>
          <Button type="submit" className="w-full">
            Salva la password
          </Button>
        </FieldGroup>
      </form>
    </GuscioAccesso>
  ),
}

/**
 * **Verifica dell'email.** È l'approdo del link di conferma, ed è di nuovo
 * `Empty` — ma dice un'altra cosa dall'esito della registrazione: lì si
 * aspetta, qui è fatto.
 *
 * L'azione è una sola e porta avanti: «Vai all'accesso». Un «torna indietro»
 * qui sarebbe falso — si arriva da una mail, non da una pagina.
 */
export const VerificaEmail: Story = {
  name: 'Verifica email',
  render: () => (
    <GuscioAccesso titolo="Indirizzo confermato">
      <Empty className="border-0 p-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckIcon />
          </EmptyMedia>
          <EmptyDescription>
            Il tuo accesso a Studio è attivo. Entra con{' '}
            <span className="font-medium text-foreground">mario.rossi@studio.it</span> e
            la password che hai scelto.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="w-full">
          <Button className="w-full">Vai all’accesso</Button>
        </EmptyContent>
      </Empty>
    </GuscioAccesso>
  ),
}
