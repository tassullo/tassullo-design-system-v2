/**
 * `tassullo-pagina-login` — la schermata d'accesso, la prima delle pagine
 * modello (FASE 4, M4.1; le tre vie sono M4ter.4).
 *
 * `Login.tsx` di Anagrafe (letto in sola lettura, `frontend/src/pages/`) è
 * 24 righe: logo, titolo, un bottone «Accedi con Microsoft» che chiama
 * `instance.loginRedirect()` di MSAL, e un avviso quando l'app registration
 * non è ancora configurata. Ogni app dello studio ne ha una, leggermente
 * diversa — questo blocco è quella forma, **predisposta** per MSAL/Entra ID
 * e non legata a esso: non importa `@azure/msal-react`, perché farlo
 * obbligherebbe ogni consumatore del registry a quella libreria anche se non
 * fa autenticazione, o ne facesse una diversa. `onAccedi` è la sola cucitura:
 * l'app ci passa `() => instance.loginRedirect(loginRequest)`, o qualunque
 * altro flusso — il blocco non lo sa e non deve saperlo.
 *
 * ── `modo`: le tre vie (D23, chiusa il 2026-09-19) ──────────────────────
 *
 * `pagina-login` **non è «la pagina di login»**: è il **guscio**
 * dell'autenticazione — schermo centrato, `Card max-w-sm`, marchio, titolo,
 * descrizione — e il guscio è identico, elemento per elemento, su tutte e
 * cinque le schermate d'accesso di Studio. Cambia cosa ci sta dentro, e
 * questo lo dice `modo`:
 *
 * - `"microsoft"` (**di default**) — solo SSO. È Anagrafe e Officina, ed è
 *   il default proprio perché quelle due non passano niente e ottengono
 *   esattamente la pagina di prima.
 * - `"credenziali"` — solo email e password. Non ha consumatori oggi e si fa
 *   lo stesso: è il *valore di una prop*, non un componente, e senza il caso
 *   puro «entrambi» non si capisce che è la somma di due vie.
 * - `"entrambi"` — è Studio, che ha utenti **fuori dall'azienda**: i
 *   professionisti entrano con email e password, i dipendenti col bottone
 *   Microsoft in fondo. L'ordine sulla pagina — credenziali, separatore
 *   «oppure», SSO — dice che **l'SSO è la via secondaria**, ed è la ragione
 *   per cui `modo` è un insieme chiuso e non una sezione facoltativa: con
 *   una prop facoltativa le credenziali sarebbero un accessorio dell'SSO.
 *
 * ── I tre stati, e a **quale via** si riferiscono ───────────────────────
 *
 * **I tre stati che Anagrafe già distingue**, resi come un solo prop invece
 * che tre booleani indipendenti che potrebbero contraddirsi: `inattivo` (il
 * bottone aspetta un clic), `in-corso` (il redirect è partito: bottone
 * disabilitato, indicatore al posto dell'icona — MSAL lascia la pagina, ma
 * l'app può tenerlo acceso nella finestra fra il clic e il redirect vero, o
 * per il ritorno da `loginRedirect` mentre valida il token), `errore` (il
 * provider ha rifiutato, o il redirect è tornato senza sessione).
 *
 * Con due vie sulla stessa pagina, `stato` da solo non basta più:
 * **`statoDi` dice a quale via si riferisce**. In Studio l'errore del
 * ritorno da Microsoft è catturato in `main.tsx` e mostrato in cima, mentre
 * quello di credenziali sbagliate sta sul form — e tenerli indistinti
 * colorerebbe di rosso il campo password a chi ha sbagliato tutt'altro, che
 * è la cosa sbagliata da dire. Vale anche per `in-corso`: l'indicatore va
 * sul bottone che è stato premuto, non sull'altro. Il default è **la via
 * principale del modo** — `microsoft` per `"microsoft"`, `credenziali` per
 * `"credenziali"` e per `"entrambi"`, dove le credenziali sono la via
 * principale.
 *
 * ── La disponibilità è **per via, non per pagina** ──────────────────────
 *
 * **`configurato` non è un quarto stato**: è ortogonale, com'è in Anagrafe —
 * un'app senza app registration può trovarsi in `inattivo` o in `errore`
 * indipendentemente. A `configurato={false}` il bottone Microsoft resta
 * disabilitato e compare l'avviso, esattamente come `isAuthConfigured`
 * nell'originale. **Il significato non cambia** con `modo`, o Anagrafe e
 * Officina cambierebbero: `configurato` governa la **sola via Microsoft**.
 *
 * La via delle credenziali ha il **suo** interruttore, `credenzialiAbilitate`
 * — in Studio è `accessoLocale = stato?.abilitata !== false`
 * (`Login.tsx:44`), spento finché il backend non ha il segreto. Spenta, la
 * via si mostra **disabilitata con un avviso**, non nascosta: è lo stesso
 * trattamento che `configurato={false}` dà da sempre all'altra, e una via
 * che sparisce senza dirlo si legge come un guasto.
 *
 * ── Il logo Microsoft **lo passa l'app** ────────────────────────────────
 *
 * Il marchio Microsoft è di terzi e ha quattro colori fissi: come SVG nel
 * registry violerebbe la regola 3 (niente esadecimali, niente valori
 * arbitrari) e ci metterebbe dentro un marchio che non è nostro. Entra
 * quindi come **nodo**, `logoMicrosoft`, e senza di esso resta il `LogInIcon`
 * di Lucide che la pagina ha sempre avuto.
 *
 * **Un trattamento solo per il comando, e lo decide il ruolo — non la via.**
 * Studio usa un bottone nero, questa pagina il bottone primario: erano due
 * trattamenti dello stesso comando. Pareggiati così: la via **principale**
 * prende il `Button` primario, la **secondaria** l'`outline`. In
 * `"microsoft"` e in `"credenziali"` c'è una via sola, e quella è primaria;
 * in `"entrambi"` il primario è «Accedi» e Microsoft è `outline`. Il nero
 * cade: non è un token del tema, e sarebbe stato un terzo trattamento.
 *
 * Il messaggio d'errore è **già tradotto quando arriva qui** — stessa regola
 * di `tassullo-error-state`: mai un codice del provider, mai uno stack. Lo
 * stato lo mostra con `Alert variant="destructive"`, non un testo tinto
 * `text-destructive` — la prima delle due trappole del `CLAUDE.md`.
 *
 * **Quello che questa pagina non fa**, e che resta all'app: il campo nascosto
 * anti-bot (honeypot) delle schermate pubbliche di registrazione, e la
 * validazione dei campi. Il primo è una contromisura che vive col backend
 * che la legge — il design system non sa, e non deve sapere, come quel
 * backend decide che un invio è di un bot; e un campo che il registry
 * spedisse a tutti sarebbe un campo riconoscibile a tutti, cioè un honeypot
 * inutile.
 */
import { useId, useState, type FormEvent, type ReactNode } from "react"
import { LogInIcon } from "lucide-react"

import { cn } from "cn"
import { Alert, AlertDescription, AlertTitle } from "@/registry/tassullo/ui/alert"
import { Button } from "@/registry/tassullo/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/tassullo/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/registry/tassullo/ui/field"
import { Input } from "@/registry/tassullo/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/tassullo/ui/input-group"
import { Spinner } from "@/registry/tassullo/ui/spinner"

/** Le tre vie d'accesso. Insieme chiuso: una quarta si aggiunge qui, non in un'app. */
export type ModoAccesso = "microsoft" | "credenziali" | "entrambi"

/** Quello che il form consegna all'app. Non validato: la validazione è della pagina. */
export type CredenzialiAccesso = { email: string; password: string }

type ProprietaComuni = {
  /** Il nome dell'app, sotto il marchio: «Anagrafe», «Studio», «Officina». */
  applicazione: string
  /** Sottotitolo facoltativo — a cosa serve l'app, in una riga. */
  descrizione?: ReactNode
  /** Uno dei tre stati che Anagrafe già distingue. `inattivo` di default. */
  stato?: "inattivo" | "in-corso" | "errore"
  /**
   * A quale **via** si riferisce `stato`: l'indicatore va sul bottone
   * premuto e l'errore accanto ai campi che l'hanno prodotto. Di default è
   * la via principale del `modo` — `credenziali` in `"entrambi"`.
   */
  statoDi?: "microsoft" | "credenziali"
  /** Il messaggio d'errore, già tradotto: mai un codice del provider. */
  messaggioErrore?: ReactNode
  /**
   * `false` quando l'app registration Entra ID non è ancora pronta — il
   * bottone Microsoft resta disabilitato e compare l'avviso,
   * indipendentemente da `stato`. Governa la **sola via Microsoft**.
   * `true` di default.
   */
  configurato?: boolean
  /**
   * `false` quando l'accesso con email e password non è ancora attivo — in
   * Studio è `accessoLocale`, spento finché il backend non ha il segreto. I
   * campi restano disabilitati e compare l'avviso. `true` di default.
   */
  credenzialiAbilitate?: boolean
  /**
   * Il marchio Microsoft, **passato dall'app**: è di terzi e a colori fissi,
   * quindi non sta nel registry. Senza, resta l'icona di Lucide.
   */
  logoMicrosoft?: ReactNode
  etichettaAccedi?: string
  /** Sopra il bottone SSO in `"entrambi"`: chi entra di lì. */
  intestazioneSso?: ReactNode
  /** Mostrato solo se passato: il collegamento sotto il campo password. */
  onPasswordDimenticata?: () => void
  /** Mostrato solo se passato: il collegamento in fondo alla card. */
  onRegistrati?: () => void
  className?: string
}

/**
 * La firma è un'**unione discriminata su `modo`**, non tre gestori
 * facoltativi: così una via dichiarata senza il suo gestore non compila. È
 * la lezione di M4ter.3 — quando una prop deve esserci, il solo controllo
 * che la vede è il **tipo** (`docs/DECISIONI.md` §45c), e da allora
 * `npm run build` gira in CI apposta.
 */
type ViaMicrosoft = {
  modo?: "microsoft"
  onAccedi: () => void
  onAccediConCredenziali?: never
}
type ViaCredenziali = {
  modo: "credenziali"
  onAccedi?: never
  onAccediConCredenziali: (credenziali: CredenzialiAccesso) => void
}
type ViaEntrambi = {
  modo: "entrambi"
  onAccedi: () => void
  onAccediConCredenziali: (credenziali: CredenzialiAccesso) => void
}

export type PaginaLoginProps = ProprietaComuni &
  (ViaMicrosoft | ViaCredenziali | ViaEntrambi)

export function PaginaLogin({
  applicazione,
  descrizione,
  modo = "microsoft",
  stato = "inattivo",
  statoDi,
  messaggioErrore,
  configurato = true,
  credenzialiAbilitate = true,
  logoMicrosoft,
  onAccedi,
  onAccediConCredenziali,
  onPasswordDimenticata,
  onRegistrati,
  etichettaAccedi = "Accedi con Microsoft",
  intestazioneSso = "Team Tassullo",
  className,
}: PaginaLoginProps) {
  const id = useId()
  const [mostraPassword, setMostraPassword] = useState(false)

  const conCredenziali = modo === "credenziali" || modo === "entrambi"
  const conMicrosoft = modo === "microsoft" || modo === "entrambi"
  /** In «entrambi» le credenziali sono la via principale: l'SSO sta in fondo. */
  const viaPrincipale = modo === "microsoft" ? "microsoft" : "credenziali"
  const via = statoDi ?? viaPrincipale

  const inCorso = stato === "in-corso"
  const inCorsoMicrosoft = inCorso && via === "microsoft"
  const inCorsoCredenziali = inCorso && via === "credenziali"
  const erroreMicrosoft = stato === "errore" && via === "microsoft"
  const erroreCredenziali = stato === "errore" && via === "credenziali"

  function inviaCredenziali(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dati = new FormData(evento.currentTarget)
    onAccediConCredenziali?.({
      email: String(dati.get("email") ?? ""),
      password: String(dati.get("password") ?? ""),
    })
  }

  /*
   * **L'avviso dell'SSO sta accanto all'SSO**, e non in cima alla card.
   *
   * Rilievo di Francesco, a video, il 2026-09-20: in cima quell'avviso
   * finisce **sopra il campo Email**, e la posizione si legge prima delle
   * parole — chi lo vede lì capisce «email sbagliata», che è la confusione
   * che `statoDi` doveva togliere. Messo sopra il bottone Microsoft, invece,
   * è la posizione stessa a dire quale via ha fallito, e il titolo non deve
   * più reggere il peso da solo. (Studio lo mostra in cima, perché lo cattura
   * in `main.tsx` a pagina che si carica: qui si diverge apposta, ed è il
   * design system ad avere ragione — quella era una conseguenza di dove lo
   * si intercettava, non una scelta di composizione.)
   *
   * Con una via sola resta **dov'era**, in cima, perché lì non c'è niente da
   * cui distinguerlo: è la pagina intera ad aver fallito. Ed è anche ciò che
   * tiene Anagrafe e Officina a DOM invariato.
   *
   * Il `?? in cima` dell'ultimo caso non è teorico: `modo="credenziali"` con
   * `statoDi="microsoft"` è una combinazione dichiarabile, e senza questa
   * ricaduta l'errore **sparirebbe in silenzio** — che è il difetto peggiore
   * dei tre, perché non si vede.
   */
  const avvisoMicrosoft = erroreMicrosoft ? (
    <Alert variant="destructive">
      <AlertTitle>
        {conCredenziali ? "Accesso con Microsoft non riuscito" : "Accesso non riuscito"}
      </AlertTitle>
      <AlertDescription>
        {messaggioErrore ?? "Accesso non riuscito. Riprova."}
      </AlertDescription>
    </Alert>
  ) : null
  const avvisoAccantoAlBottone = conCredenziali && conMicrosoft

  return (
    <div
      data-slot="pagina-login"
      className={cn(
        "flex min-h-svh w-full items-center justify-center bg-background p-4",
        className
      )}
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center gap-2 text-center">
          {/*
           * `justify-self-center`, e non `items-center` sul `CardHeader`:
           * quello è una **griglia**, e `items-center` allinea sull'asse
           * verticale. Senza, il marchio resta incollato a sinistra sotto un
           * titolo centrato — si vedeva su tutte e dieci le scene, e non è un
           * difetto di M4ter.4: c'era dal primo giorno della pagina. Toccarlo
           * lì avrebbe rotto la non-regressione di quella sessione, quindi è
           * stato rimandato qui (M4ter.5), che è la sessione che rifà il
           * guscio su altre cinque schermate e non poteva copiarlo storto.
           */}
          <span aria-hidden className="marchio-t size-10 justify-self-center" />
          <CardTitle className="text-2xl">{applicazione}</CardTitle>
          {descrizione ? <CardDescription>{descrizione}</CardDescription> : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {avvisoAccantoAlBottone ? null : avvisoMicrosoft}
          {conCredenziali ? (
            <form onSubmit={inviaCredenziali} noValidate>
              <FieldGroup>
                {erroreCredenziali ? (
                  <Alert variant="destructive">
                    <AlertTitle>Email o password non corretti</AlertTitle>
                    <AlertDescription>
                      {messaggioErrore ??
                        "Controlla l’indirizzo e la password, poi riprova."}
                    </AlertDescription>
                  </Alert>
                ) : null}
                <Field>
                  <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
                  <Input
                    id={`${id}-email`}
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="nome@esempio.it"
                    aria-invalid={erroreCredenziali || undefined}
                    disabled={!credenzialiAbilitate || inCorsoCredenziali}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={`${id}-password`}
                      name="password"
                      type={mostraPassword ? "text" : "password"}
                      autoComplete="current-password"
                      aria-invalid={erroreCredenziali || undefined}
                      disabled={!credenzialiAbilitate || inCorsoCredenziali}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        onClick={() => setMostraPassword((m) => !m)}
                        disabled={!credenzialiAbilitate || inCorsoCredenziali}
                        aria-pressed={mostraPassword}
                      >
                        {mostraPassword ? "Nascondi" : "Mostra"}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {onPasswordDimenticata ? (
                    /*
                     * L'involucro non è decorazione. `Field` verticale
                     * impone `*:w-full` ai figli, e `.*:w-full > *` batte
                     * per specificità qualunque `w-fit` scritto sul bottone:
                     * misurato a video, il collegamento restava largo 336px
                     * e quindi centrato. Un bersaglio largo quanto la card
                     * **sopra** il bottone «Accedi» è anche un rischio di
                     * clic sbagliato. L'involucro prende lui il `w-full` e
                     * il bottone torna della sua misura.
                     */
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        // Niente `h-auto`: il collegamento sta su una riga
                        // sua, quindi è un **bersaglio**, non un link in
                        // prosa. Con `h-auto` misurava 21.95px in densità
                        // touch (`misura:bersagli`); l'altezza propria del
                        // bottone lo porta a 48px senza cambiarne l'aspetto,
                        // perché il riempimento orizzontale resta a zero.
                        className="p-0"
                        disabled={!credenzialiAbilitate || inCorsoCredenziali}
                        onClick={onPasswordDimenticata}
                      >
                        Password dimenticata?
                      </Button>
                    </div>
                  ) : null}
                </Field>
                <Button
                  type="submit"
                  className="w-full"
                  variant={viaPrincipale === "credenziali" ? "default" : "outline"}
                  disabled={!credenzialiAbilitate || inCorsoCredenziali}
                >
                  {inCorsoCredenziali ? <Spinner /> : null}
                  {inCorsoCredenziali ? "Accesso in corso…" : "Accedi"}
                </Button>
                {!credenzialiAbilitate ? (
                  <FieldDescription className="text-center">
                    Accesso con email e password non ancora disponibile.
                  </FieldDescription>
                ) : null}
              </FieldGroup>
            </form>
          ) : null}
          {conCredenziali && conMicrosoft ? (
            <FieldSeparator className="[&>[data-slot=field-separator-content]]:bg-card">
              oppure
            </FieldSeparator>
          ) : null}
          {conMicrosoft ? (
            <>
              {modo === "entrambi" && intestazioneSso ? (
                <FieldDescription className="text-center">
                  {intestazioneSso}
                </FieldDescription>
              ) : null}
              {avvisoAccantoAlBottone ? avvisoMicrosoft : null}
              <Button
                className="w-full"
                variant={viaPrincipale === "microsoft" ? "default" : "outline"}
                disabled={!configurato || inCorsoMicrosoft}
                onClick={onAccedi}
              >
                {inCorsoMicrosoft ? (
                  <Spinner />
                ) : (
                  (logoMicrosoft ?? <LogInIcon />)
                )}
                {inCorsoMicrosoft ? "Accesso in corso…" : etichettaAccedi}
              </Button>
              {!configurato ? (
                <p className="text-center text-sm text-muted-foreground">
                  Login non ancora configurato (app registration Entra ID).
                </p>
              ) : null}
            </>
          ) : null}
          {onRegistrati ? (
            <FieldDescription className="text-center">
              Non hai un accesso?{" "}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0"
                onClick={onRegistrati}
              >
                Registrati
              </Button>
            </FieldDescription>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
