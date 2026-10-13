/**
 * `tassullo-scelta-con-aggiunta` — una tendina in cui si sceglie una voce o
 * si aggiunge quella che si è scritta. Proposta #125 (Anagrafe), 13 ottobre
 * 2026, punto 3: la tendina dei titoli di una scheda, dove «Aggiungi «…»» era
 * una voce finta con un filtro e uno stato di attesa scritti nell'app.
 *
 * ── La scala ─────────────────────────────────────────────────────────────
 *
 * `combobox` di shadcn non ha la voce che crea, e aggiungerla alla primitiva
 * sarebbe una divergenza di forma. Base UI la prevede come composizione: un
 * elenco di voci più una voce in coda, e il suo `useFilter` per confrontare
 * senza contare maiuscole e accenti. Il blocco è quella composizione, fatta
 * una volta: importa `useFilter` da Base UI, che la primitiva non riesporta.
 */
"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { PlusIcon } from "lucide-react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/tassullo/ui/combobox"

export type SceltaConAggiuntaProps<TVoce> = {
  /** Le voci fra cui scegliere, già nell'ordine in cui si mostrano. */
  voci: readonly TVoce[]
  /** La voce scelta. Resta nell'elenco anche se non è più fra le `voci`. */
  valore: TVoce | null
  /** La voce scelta, o `null` se il campo è stato svuotato. */
  onValore: (voce: TVoce | null) => void
  /** Il testo di una voce: si legge nell'elenco e si cerca. */
  etichettaDi: (voce: TVoce) => string
  /** Ciò che distingue una voce dalle altre. */
  chiaveDi: (voce: TVoce) => string | number
  /**
   * Aggiunge ciò che si è scritto, quando nessuna voce ha quel testo. Riceve
   * il testo ripulito dagli spazi in più. Se restituisce una promessa, il
   * campo resta fermo col testo scritto finché non si chiude; la voce nuova
   * la mette l'app, in `voci` e in `valore`. Senza, non si aggiunge niente.
   */
  onAggiungi?: (testo: string) => void | Promise<unknown>
  placeholder?: string
  /** Il testo dell'elenco quando nessuna voce corrisponde e non si può aggiungere. */
  vuoto?: React.ReactNode
  disabled?: boolean
  id?: string
  ref?: React.Ref<HTMLInputElement>
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  className?: string
}

// Una riga dell'elenco: una voce, o il testo scritto che ancora non c'è.
type Riga<TVoce> = { voce: TVoce } | { nuova: string }

/**
 * Una tendina in cui si sceglie una voce o si aggiunge quella che si è
 * scritta.
 */
export function SceltaConAggiunta<TVoce>({
  voci,
  valore,
  onValore,
  etichettaDi,
  chiaveDi,
  onAggiungi,
  placeholder,
  vuoto = "Nessuna voce.",
  disabled = false,
  id,
  ref,
  "aria-invalid": nonValido,
  "aria-describedby": descrittoDa,
  className,
}: SceltaConAggiuntaProps<TVoce>) {
  const [scritto, setScritto] = React.useState("")
  // Il testo che si sta aggiungendo: resta nel campo finché l'app non ha finito.
  const [inArrivo, setInArrivo] = React.useState<string | null>(null)
  // Senza contare maiuscole e accenti: «qualita» trova «Qualità».
  const filtro = ComboboxPrimitive.useFilter({ sensitivity: "base" })

  const testo = scritto.trim().replace(/\s+/g, " ")
  const siAggiunge = Boolean(onAggiungi)
  const righe = React.useMemo<Riga<TVoce>[]>(() => {
    const tutte = valore !== null && !voci.some((voce) => chiaveDi(voce) === chiaveDi(valore)) ? [valore, ...voci] : [...voci]
    const cEGia = tutte.some((voce) => filtro.contains(etichettaDi(voce), testo) && filtro.contains(testo, etichettaDi(voce)))
    return [
      ...tutte.map((voce) => ({ voce })),
      ...(siAggiunge && testo !== "" && !cEGia ? [{ nuova: testo }] : []),
    ]
    // `etichettaDi` e `chiaveDi` leggono la voce: contano le voci e il testo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voci, valore, testo, filtro, siAggiunge])

  // La riga scelta tiene la sua identità finché la scelta è la stessa: un
  // oggetto nuovo a ogni resa direbbe al campo che la scelta è cambiata, e
  // il campo rimetterebbe il suo testo al posto di ciò che si sta scrivendo.
  const chiaveScelta = valore === null ? null : chiaveDi(valore)
  const testoScelta = valore === null ? null : etichettaDi(valore)
  const scelta = React.useMemo<Riga<TVoce> | null>(
    () => (inArrivo !== null ? { nuova: inArrivo } : valore === null ? null : { voce: valore }),
    // Conta quale voce è e cosa c'è scritto, non l'oggetto: l'app può
    // passarne uno nuovo a ogni resa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inArrivo, chiaveScelta, testoScelta]
  )

  const fermo = disabled || inArrivo !== null

  return (
    <Combobox<Riga<TVoce>>
      items={righe}
      value={scelta}
      onValueChange={(riga) => {
        if (!riga) return onValore(null)
        if ("voce" in riga) return onValore(riga.voce)
        const esito = onAggiungi?.(riga.nuova)
        if (esito instanceof Promise) {
          setInArrivo(riga.nuova)
          void esito.finally(() => setInArrivo(null)).catch(() => {})
        }
      }}
      onInputValueChange={setScritto}
      itemToStringLabel={(riga) => ("voce" in riga ? etichettaDi(riga.voce) : riga.nuova)}
      isItemEqualToValue={(una, altra) =>
        "voce" in una ? "voce" in altra && chiaveDi(una.voce) === chiaveDi(altra.voce) : "nuova" in altra && una.nuova === altra.nuova
      }
      // La voce da aggiungere resta sempre: è ciò che si è scritto.
      filter={(riga, cercato) => "nuova" in riga || filtro.contains(etichettaDi(riga.voce), cercato)}
      autoHighlight
      disabled={fermo}
    >
      <ComboboxInput
        id={id}
        ref={ref}
        data-slot="scelta-con-aggiunta"
        aria-invalid={nonValido}
        aria-describedby={descrittoDa}
        aria-busy={inArrivo !== null ? true : undefined}
        placeholder={placeholder}
        className={className}
        disabled={fermo}
      />
      <ComboboxContent>
        <ComboboxEmpty>{vuoto}</ComboboxEmpty>
        <ComboboxList>
          {(riga: Riga<TVoce>) =>
            "voce" in riga ? (
              <ComboboxItem key={chiaveDi(riga.voce)} value={riga}>
                {etichettaDi(riga.voce)}
              </ComboboxItem>
            ) : (
              <ComboboxItem key="nuova" value={riga} data-nuova="">
                <PlusIcon />
                Aggiungi «{riga.nuova}»
              </ComboboxItem>
            )
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
