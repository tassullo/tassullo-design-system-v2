/**
 * `tassullo-campo-numero` — il campo in cui si scrive a mano un numero
 * all'italiana: quantità, prezzi, rese, coefficienti. Proposta #195 di Studio,
 * approvata da Francesco il 2026-11-07 (`docs/DECISIONI.md` §92).
 *
 * ── Perché un blocco, e non la primitiva di Base UI ─────────────────────
 *
 * shadcn non ha un campo numerico: ha `input`, `input-group` e `field`.
 * ReUI ne ha uno (`@reui/number-field`), costruito sul `NumberField` di
 * Base UI, ed è stato provato per primo. Non regge, per tre ragioni misurate
 * su Base UI 1.8 con `locale: "it-IT"`:
 *
 *   1. il suo lettore è interno e non si sostituisce, e legge `0.125` come
 *      125, `1.500` come 1500 e `20.78` come **2078**: lo stesso difetto della
 *      proposta, anzi peggio;
 *   2. blocca i caratteri non numerici mentre si scrive, quindi un testo
 *      sbagliato non può restare nel campo segnato come errore;
 *   3. un valore fuori da `min`/`max` lo riporta dentro i limiti senza dirlo.
 *
 * Il blocco compone `input-group` e `field` così come sono, senza varianti:
 * per questo non ha una riga in `registry/componenti-propri.json`, come gli
 * altri blocchi.
 *
 * ── Le scelte ───────────────────────────────────────────────────────────
 *
 * - Si legge con `leggiNumero(testo, { punto: "decimale" })`: un punto solo è
 *   il decimale. `1.500` diventa 1,5, e all'uscita il campo lo **riscrive**
 *   `1,5`: il valore cambia sotto gli occhi di chi scrive, non dopo.
 * - A riposo il numero porta il punto delle migliaia (`1.234,5`), chiesto da
 *   Francesco il 2026-11-07; a fuoco no (`1234,5`), perché un punto rimasto
 *   fra le cifre si rileggerebbe come il decimale.
 * - Il valore si conferma all'uscita dal campo o con `Invio`, mai a ogni
 *   tasto: a metà digitazione `1,` o `-` non sono numeri, e un errore che
 *   lampeggia mentre si scrive è rumore.
 * - I collegamenti del `Field` sono quelli di `tassullo-form-field`, scritti
 *   qui e non presi da `Campo`: `form-field.tsx` importa react-hook-form, e il
 *   campo numerico non deve portarselo dietro.
 * - `importo` (proposta #219 di Studio, accettata da Francesco il
 *   2026-11-08, `docs/DECISIONI.md` §97): legge con `punto: "importo"`, cioè
 *   il punto delle migliaia all'italiana, pulisce ciò che un testo incollato
 *   si porta dietro, e a riposo scrive almeno due decimali (`1.500,00`).
 *   L'unità di serie diventa `€`, prima del numero.
 * - `decimali` (proposta #222 di Studio, accettata da Francesco il
 *   2026-11-08, `docs/DECISIONI.md` §98): da 2 a 4, di serie 2. Le cifre in
 *   più si arrotondano in silenzio, la metà per eccesso, invece di fermare il
 *   campo con un errore; il numero riscritto all'uscita mostra l'arrotondamento.
 * - `onErrore` (proposta #225 di Studio): dice al modulo che il campo ha un
 *   testo sbagliato, che `onValore` per costruzione non riceve. Parte quando
 *   l'errore del campo compare, cambia testo o sparisce; non per l'errore che
 *   arriva da fuori con `errore`, e non a ogni tasto con lo stesso messaggio.
 * - `inputMode` si passa come le altre prop dell'`input`. Di serie è `decimal`,
 *   e diventa `text` con un `min` negativo: il tastierino decimale di iPhone
 *   non ha il segno meno.
 * - `String(numero)` dà la notazione esponenziale sotto 1e-6 e sopra 1e21:
 *   fuori dai numeri di un computo, e lasciato com'è.
 * - `puntoMigliaia`, `decimaliMinimi` e `prima` (proposta #250 di Anagrafe,
 *   accettata da Francesco il 2026-11-16, `docs/DECISIONI.md` §103). Le due
 *   regole di `importo` — come si legge il punto e quanti decimali si vedono
 *   a riposo — diventano due opzioni separate, perché un campo di quantità ne
 *   vuole a volte una sola: un limite in kg/m³ scritto `1.700` vuole il punto
 *   delle migliaia, una resa in kg/m² vuole `1,50`. Il punto delle migliaia
 *   non è il default per i numeri: `1.125` scritto per uno virgola
 *   centoventicinque diventerebbe 1125, e a riposo si leggerebbe `1.125`,
 *   uguale al testo scritto, senza che nessuno se ne accorga. In un importo
 *   il rischio non c'è perché a riposo esce `1.125,00`.
 * - `prima` sta nel DOM **prima** dell'`input`, non solo a vista: `Tab`
 *   segue il DOM, e un controllo disegnato a sinistra del numero ma
 *   raggiunto dopo confonderebbe chi va da tastiera. L'unità prima del numero,
 *   se c'è, resta fra il controllo e il numero.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/tassullo/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/tassullo/ui/input-group"
import {
  formattatore,
  leggiNumero,
  type OpzioniLettura,
  scriviNumero,
  scriviNumeroConMigliaia,
  ROSSO_NEGATIVO,
  type DecimaliImporto,
} from "@/registry/tassullo/lib/numeri"

/** Le prop di `CampoNumero`. Quelle non elencate vanno all'`input`. */
export type CampoNumeroProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "children"
> & {
  /** L'etichetta. Sempre visibile. */
  etichetta: ReactNode
  /** Il valore confermato. `null` è il campo vuoto. */
  valore: number | null
  /**
   * Chiamata quando un valore nuovo è confermato: all'uscita dal campo o con
   * `Invio`, e solo se è un numero nei limiti. Non a ogni tasto.
   */
  onValore: (valore: number | null) => void
  /** L'unità di misura, accanto al numero: `"m²"`, `"€"`, `"%"`. */
  unita?: ReactNode
  /**
   * Dove sta l'unità. Di serie `"dopo"` il numero; `"prima"` per `€`, ed è
   * il default di un `importo`.
   */
  posizioneUnita?: "prima" | "dopo"
  /** Il valore più piccolo ammesso, compreso. */
  min?: number
  /** Il valore più grande ammesso, compreso. */
  max?: number
  /**
   * L'aiuto sotto il campo. Si scrive solo per un vincolo che il campo non
   * mostra da sé.
   */
  descrizione?: ReactNode
  /**
   * Un errore deciso fuori dal campo: lo schema del modulo, la risposta di un
   * server. Si vede quando il testo scritto è un numero valido; se non lo è,
   * vince l'errore del campo.
   */
  errore?: string | null
  /**
   * Chiamata quando l'errore del campo compare, cambia o sparisce: riceve il
   * messaggio, o `null` quando il testo torna valido. Serve a un modulo che
   * deve sapere che il campo è sbagliato anche se `onValore` non è partito.
   */
  onErrore?: (errore: string | null) => void
  /**
   * Il numero confermato in rosso quando è negativo: per un campo che porta
   * un risultato o un saldo. Di serie spento. Il rosso vale per il valore
   * confermato, non per il testo che si sta scrivendo.
   */
  negativiInRosso?: boolean
  /**
   * Il campo è un importo in euro. Il punto è delle migliaia (`1.500` vale
   * millecinquecento), un punto che migliaia non può essere è il decimale
   * (`15.00`, `0.125`). I decimali sono quanti ne dice `decimali`: quelli in
   * più si arrotondano, la metà per eccesso. Un importo incollato da un
   * documento si pulisce da spazi, `€`, `EUR` e `euro`. A riposo si leggono
   * sempre almeno due decimali: `1.500,00`. L'unità di serie è `€`, prima
   * del numero. Di serie spento.
   */
  importo?: boolean
  /**
   * Con `importo`, quanti decimali tiene il campo: da 2 a 4, di serie 2. Per
   * un prezzo unitario, `decimali={4}`: `0,1234` resta com'è scritto. A
   * riposo l'importo ne mostra almeno due e al massimo questi.
   */
  decimali?: DecimaliImporto
  /**
   * Il punto è delle migliaia anche fuori da un importo: `1.700` vale
   * millesettecento, e `1.50` o `0.125`, che migliaia non possono essere,
   * restano decimali. Per un campo di numeri grandi senza tre decimali: un
   * limite in kg/m³, una portata. Non per un campo che ha spesso tre
   * decimali: `1.125` diventerebbe 1125. Di serie spento, e un punto solo è
   * il decimale. Con `importo` non serve: l'importo legge già così.
   */
  puntoMigliaia?: boolean
  /**
   * Quanti decimali si leggono almeno a riposo: con `2`, `1,5` si legge
   * `1,50` e `3` si legge `3,00`. Il valore non cambia, i decimali in più
   * restano, e a fuoco si scrivono le cifre nude. Di serie nessuno; con
   * `importo` di serie 2, e al massimo quanti ne dice `decimali`.
   */
  decimaliMinimi?: 1 | 2 | 3 | 4
  /**
   * Un controllo prima del numero, dentro il bordo del campo e sotto la sua
   * etichetta: per esempio il menu che sceglie se un limite è compreso (`≥`)
   * o escluso (`>`). Si compone con `InputGroupButton`, e porta il proprio
   * nome con `aria-label`, perché l'etichetta del campo è quella del numero.
   */
  prima?: ReactNode
}

/** Ciò che si scrive nel campo per un valore confermato: cifre senza punti. */
function testoDi(valore: number | null): string {
  return valore === null ? "" : scriviNumero(String(valore))
}

/**
 * Ciò che si legge nel campo a riposo: col punto delle migliaia e almeno
 * `minimi` decimali. Un importo ne ha di serie due, e al massimo quelli
 * ammessi.
 */
function testoARiposo(
  valore: number | null,
  importo: boolean,
  decimali: DecimaliImporto,
  minimi: number | undefined,
): string {
  if (valore === null) return ""
  if (importo) {
    const almeno = Math.min(minimi ?? 2, decimali)
    return formattatore({ minimumFractionDigits: almeno, maximumFractionDigits: decimali }).format(valore)
  }
  return completaDecimali(scriviNumeroConMigliaia(String(valore)), minimi ?? 0)
}

/**
 * Aggiunge gli zeri fino a `minimi` decimali, sul testo e non con `Intl`, che
 * scriverebbe il valore esatto in virgola mobile: `0.1` a venti cifre. La
 * notazione esponenziale resta com'è.
 */
function completaDecimali(testo: string, minimi: number): string {
  if (minimi === 0 || !/^-?[\d.]+(,\d*)?$/.test(testo)) return testo
  const [interi, decimali = ""] = testo.split(",")
  return decimali.length >= minimi ? testo : `${interi},${decimali.padEnd(minimi, "0")}`
}

// Un limite nel messaggio d'errore, scritto come si legge: `10.000`, `0,5`.
const LIMITE = formattatore({ maximumFractionDigits: 6 })

type Esito = { valore: number | null; errore: null } | { valore: undefined; errore: string }

// Il messaggio per un testo che numero non è: l'esempio mostra come legge il
// campo.
const NON_NUMERO = {
  decimale: "Scrivi un numero, per esempio 12,5.",
  migliaia: "Scrivi un numero, per esempio 1.500 o 12,5.",
  importo: "Scrivi un importo, per esempio 1.500,00.",
} as const

/** Il testo scritto, letto e confrontato coi limiti. */
function esamina(
  testo: string,
  lettura: OpzioniLettura & { punto: keyof typeof NON_NUMERO },
  min?: number,
  max?: number,
  unita?: ReactNode,
): Esito {
  const letto = leggiNumero(testo, lettura)
  if (letto === "") return { valore: null, errore: null }
  const numero = Number(letto)
  // `leggiNumero` restituisce il testo com'era quando non è un numero: lo si
  // riconosce perché non è la forma canonica di sé stesso (`1e3`, `Infinity`).
  // Vale anche per un importo: ogni numero scritto in forma canonica è un
  // importo leggibile, e i decimali in più si arrotondano invece di fermarlo.
  if (!Number.isFinite(numero) || String(numero) !== letto) {
    return { valore: undefined, errore: NON_NUMERO[lettura.punto] }
  }
  const coda = typeof unita === "string" ? ` ${unita}` : ""
  if (min !== undefined && numero < min) {
    return { valore: undefined, errore: `Il minimo è ${LIMITE.format(min)}${coda}.` }
  }
  if (max !== undefined && numero > max) {
    return { valore: undefined, errore: `Il massimo è ${LIMITE.format(max)}${coda}.` }
  }
  return { valore: numero, errore: null }
}

/**
 * Un campo numerico all'italiana: virgola decimale, punto delle migliaia, e
 * un punto da solo che resta un decimale.
 *
 * ```tsx
 * <CampoNumero etichetta="Coefficiente" valore={k} onValore={setK} min={0} max={10} />
 * <CampoNumero etichetta="Superficie" valore={mq} onValore={setMq} unita="m²" />
 * <CampoNumero etichetta="Importo lavori" valore={euro} onValore={setEuro} importo />
 * <CampoNumero etichetta="Quota" valore={q} onValore={setQ} min={-10} onErrore={setErroreQ} />
 * <CampoNumero etichetta="Resa" valore={r} onValore={setR} unita="kg/m²" decimaliMinimi={2} />
 * <CampoNumero etichetta="Massa volumica" valore={m} onValore={setM} unita="kg/m³" puntoMigliaia prima={<Estremo />} />
 * ```
 */
export function CampoNumero({
  etichetta,
  valore,
  onValore,
  importo = false,
  decimali = 2,
  puntoMigliaia = false,
  decimaliMinimi,
  prima,
  unita = importo ? "€" : undefined,
  posizioneUnita = importo ? "prima" : "dopo",
  min,
  max,
  descrizione,
  errore,
  negativiInRosso = false,
  onErrore,
  inputMode,
  id,
  onBlur,
  onFocus,
  onKeyDown,
  className,
  ...input
}: CampoNumeroProps) {
  const base = useId()
  const idCampo = id ?? base
  const [bozza, setBozza] = useState(() => testoDi(valore))
  const [erroreCampo, setErroreCampo] = useState<string | null>(null)
  const [aFuoco, setAFuoco] = useState(false)
  const lettura = importo
    ? ({ punto: "importo", decimali } as const)
    : ({ punto: puntoMigliaia ? "migliaia" : "decimale" } as const)

  // `onErrore` parte quando cambia l'errore del campo, non a ogni render: la
  // dipendenza è il messaggio (una stringa), e la funzione si legge da un
  // riferimento, così una callback nuova a ogni render non rilancia l'effetto.
  const alErrore = useRef(onErrore)
  const erroreDichiarato = useRef<string | null>(null)
  useEffect(() => {
    alErrore.current = onErrore
  })
  useEffect(() => {
    if (erroreDichiarato.current === erroreCampo) return
    erroreDichiarato.current = erroreCampo
    alErrore.current?.(erroreCampo)
  }, [erroreCampo])

  // Il valore cambiato da fuori riscrive il campo e toglie l'errore: è la
  // forma che React indica per uno stato che segue una prop, senza effetti.
  const [visto, setVisto] = useState(valore)
  if (!Object.is(valore, visto)) {
    setVisto(valore)
    setBozza(testoDi(valore))
    setErroreCampo(null)
  }

  /** Conferma il testo scritto. Restituisce `false` se non è valido. */
  function conferma(): boolean {
    const esito = esamina(bozza, lettura, min, max, unita)
    if (esito.errore !== null) {
      setErroreCampo(esito.errore)
      return false
    }
    setErroreCampo(null)
    setBozza(testoDi(esito.valore))
    if (!Object.is(esito.valore, valore)) onValore(esito.valore)
    return true
  }

  function alCambio(testo: string) {
    setBozza(testo)
    // Mostrato un errore, il campo lo ricontrolla a ogni tasto: sparisce
    // appena il testo torna valido, senza aspettare l'uscita.
    if (erroreCampo !== null) setErroreCampo(esamina(testo, lettura, min, max, unita).errore)
  }

  function alTasto(evento: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(evento)
    if (evento.defaultPrevented) return
    if (evento.key === "Enter") {
      // Un testo non valido non invia il modulo che contiene il campo.
      if (!conferma()) evento.preventDefault()
    } else if (evento.key === "Escape" && (bozza !== testoDi(valore) || erroreCampo !== null)) {
      // `Esc` torna all'ultimo valore confermato. Solo se c'è qualcosa da
      // disfare: altrimenti il tasto arriva a chi lo aspetta, come un dialogo.
      evento.preventDefault()
      evento.stopPropagation()
      setBozza(testoDi(valore))
      setErroreCampo(null)
      }
  }

  function alFuoco(evento: FocusEvent<HTMLInputElement>) {
    setAFuoco(true)
    onFocus?.(evento)
  }

  function alUscita(evento: FocusEvent<HTMLInputElement>) {
    setAFuoco(false)
    conferma()
    onBlur?.(evento)
  }

  // A riposo il numero confermato si legge col punto delle migliaia; entrando
  // nel campo il punto sparisce, e si scrive sulle cifre nude. Lasciarlo lì
  // sarebbe un errore e non solo un intralcio: `1.234` riletto all'uscita, con
  // un punto solo che è il decimale, diventerebbe 1,234. Un testo sbagliato
  // resta com'è scritto anche a riposo.
  const mostrato = !aFuoco && erroreCampo === null && bozza === testoDi(valore) ? testoARiposo(valore, importo, decimali, decimaliMinimi) : bozza

  // Il rosso del negativo segue il valore confermato: mentre si scrive un
  // testo diverso, o con un errore, il campo non lo prende.
  const rosso = negativiInRosso && valore !== null && valore < 0 && erroreCampo === null && bozza === testoDi(valore)

  const messaggio = erroreCampo ?? errore ?? null
  const nonValido = messaggio !== null && messaggio !== ""
  const idUnita = unita !== undefined ? `${idCampo}-unita` : undefined
  const idDescrizione = descrizione ? `${idCampo}-descrizione` : undefined
  const idErrore = nonValido ? `${idCampo}-errore` : undefined
  const descritto = [idUnita, idDescrizione, idErrore].filter(Boolean).join(" ")

  return (
    <Field data-invalid={nonValido}>
      <FieldLabel htmlFor={idCampo}>{etichetta}</FieldLabel>
      <InputGroup>
        {prima !== undefined ? <InputGroupAddon align="inline-start">{prima}</InputGroupAddon> : null}
        <InputGroupInput
          {...input}
          id={idCampo}
          className={["tabular-nums", rosso ? ROSSO_NEGATIVO : null, className].filter(Boolean).join(" ")}
          type="text"
          inputMode={inputMode ?? (min !== undefined && min < 0 ? "text" : "decimal")}
          autoComplete="off"
          value={mostrato}
          onChange={(e) => alCambio(e.target.value)}
          onKeyDown={alTasto}
          onFocus={alFuoco}
          onBlur={alUscita}
          aria-invalid={nonValido}
          aria-describedby={descritto || undefined}
        />
        {unita !== undefined ? (
          <InputGroupAddon align={posizioneUnita === "prima" ? "inline-start" : "inline-end"}>
            <InputGroupText id={idUnita}>{unita}</InputGroupText>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      {descrizione ? <FieldDescription id={idDescrizione}>{descrizione}</FieldDescription> : null}
      {nonValido ? <FieldError id={idErrore}>{messaggio}</FieldError> : null}
    </Field>
  )
}
