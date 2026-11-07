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
 * - Il valore si conferma all'uscita dal campo o con `Invio`, mai a ogni
 *   tasto: a metà digitazione `1,` o `-` non sono numeri, e un errore che
 *   lampeggia mentre si scrive è rumore.
 * - I collegamenti del `Field` sono quelli di `tassullo-form-field`, scritti
 *   qui e non presi da `Campo`: `form-field.tsx` importa react-hook-form, e il
 *   campo numerico non deve portarselo dietro.
 * - `String(numero)` dà la notazione esponenziale sotto 1e-6 e sopra 1e21:
 *   fuori dai numeri di un computo, e lasciato com'è.
 */
import {
  useId,
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
import { formattatore, leggiNumero, scriviNumero } from "@/registry/tassullo/lib/numeri"

/** Le prop di `CampoNumero`. Quelle non elencate vanno all'`input`. */
export type CampoNumeroProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "inputMode" | "children"
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
  /** Dove sta l'unità. Di serie `"dopo"` il numero; `"prima"` per `€`. */
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
}

/** Ciò che si mostra nel campo per un valore confermato. */
function testoDi(valore: number | null): string {
  return valore === null ? "" : scriviNumero(String(valore))
}

// Un limite nel messaggio d'errore, scritto come si legge: `10.000`, `0,5`.
const LIMITE = formattatore({ maximumFractionDigits: 6 })

type Esito = { valore: number | null; errore: null } | { valore: undefined; errore: string }

/** Il testo scritto, letto e confrontato coi limiti. */
function esamina(testo: string, min?: number, max?: number, unita?: ReactNode): Esito {
  const letto = leggiNumero(testo, { punto: "decimale" })
  if (letto === "") return { valore: null, errore: null }
  const numero = Number(letto)
  // `leggiNumero` restituisce il testo com'era quando non è un numero: lo si
  // riconosce perché non è la forma canonica di sé stesso (`1e3`, `Infinity`).
  if (!Number.isFinite(numero) || String(numero) !== letto) {
    return { valore: undefined, errore: "Scrivi un numero, per esempio 12,5." }
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
 * ```
 */
export function CampoNumero({
  etichetta,
  valore,
  onValore,
  unita,
  posizioneUnita = "dopo",
  min,
  max,
  descrizione,
  errore,
  id,
  onBlur,
  onKeyDown,
  className,
  ...input
}: CampoNumeroProps) {
  const base = useId()
  const idCampo = id ?? base
  const [bozza, setBozza] = useState(() => testoDi(valore))
  const [erroreCampo, setErroreCampo] = useState<string | null>(null)

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
    const esito = esamina(bozza, min, max, unita)
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
    if (erroreCampo !== null) setErroreCampo(esamina(testo, min, max, unita).errore)
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

  function alUscita(evento: FocusEvent<HTMLInputElement>) {
    conferma()
    onBlur?.(evento)
  }

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
        <InputGroupInput
          {...input}
          id={idCampo}
          className={className ? `tabular-nums ${className}` : "tabular-nums"}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={bozza}
          onChange={(e) => alCambio(e.target.value)}
          onKeyDown={alTasto}
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
