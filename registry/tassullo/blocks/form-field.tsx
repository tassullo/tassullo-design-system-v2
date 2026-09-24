/**
 * `tassullo-form-field` — la riga di un modulo: etichetta, campo, aiuto,
 * errore. Una forma sola, e i quattro collegamenti fatti da sé.
 *
 * ── Cosa c'era già, e perché non basta ──────────────────────────────────
 *
 * La primitiva è `field` di shadcn, ed è installata: `Field`, `FieldLabel`,
 * `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`. Questo blocco
 * **non la sostituisce e non la ri-stila** — la compone. Chi vuole la
 * composizione a mano continua a importare la primitiva, ed è giusto così:
 * qui sotto non c'è niente che la primitiva non sappia fare.
 *
 * Ciò che il blocco aggiunge è l'unica cosa che la guida di shadcn lascia
 * intera a chi la segue: **i collegamenti**. Nell'esempio ufficiale
 * (`docs/forms/react-hook-form`) ogni campo è quindici righe, di cui dodici
 * identiche al campo precedente, e dentro quelle dodici stanno quattro cose
 * che vanno scritte a mano e che, se si dimenticano, **non danno errore**:
 *
 *   1. `data-invalid` sul `Field`   — è ciò che tinge la riga di rosso;
 *   2. `aria-invalid` sul controllo — è ciò che lo dice a chi non la vede;
 *   3. `htmlFor` / `id` appaiati    — è ciò che fa sì che il clic
 *      sull'etichetta porti il fuoco nel campo;
 *   4. `<FieldError>` reso solo quando c'è un errore.
 *
 * E ce n'è una quinta che l'esempio di shadcn **non fa affatto**: la
 * descrizione d'aiuto non è collegata al controllo. Un `<FieldDescription>`
 * senza `aria-describedby` è testo che sta lì accanto e che un lettore di
 * schermo non legge quando il fuoco entra nel campo — cioè esattamente nel
 * momento in cui serviva. Qui la descrizione e l'errore hanno un `id`
 * derivato da quello del campo, e il controllo li dichiara entrambi.
 *
 * ── Perché l'`id` non è il nome del campo ───────────────────────────────
 *
 * Perché due moduli nella stessa pagina — la scheda e il dialogo che la
 * modifica, per dire — avrebbero due `id="nome"`, e il secondo `htmlFor`
 * punterebbe al primo campo. Nel DOM è legale, nel browser il clic
 * sull'etichetta sbagliata mette il fuoco nel campo sbagliato, e non lo
 * segnala nessuno. `useId()` dà un prefisso unico per istanza; il `name`
 * resta il nome del dato, che è un'altra cosa e va lasciata a react-hook-form.
 *
 * ── Il controllo resta dell'app ─────────────────────────────────────────
 *
 * I figli sono una **funzione**, non del JSX: il blocco non sa se il
 * controllo è un `<Input>`, un `<Textarea>`, un `<Select>`, un `<Combobox>` o
 * una `<Checkbox>`, e non deve saperlo. Gli passa le prop già collegate e si
 * fa da parte. Un blocco che avesse invece un prop `tipo="testo" | "select" |
 * …` dovrebbe crescere di un ramo a ogni controllo nuovo, e ogni ramo
 * diventerebbe una prop in più da inoltrare: è la strada per cui un blocco
 * finisce per reimplementare, peggio, le prop dei componenti che avvolge.
 *
 * Attenzione a un dettaglio che la funzione tiene onesto: i controlli di
 * Base UI che rappresentano uno stato acceso/spento — `Checkbox`, `Switch` —
 * non parlano `value`/`onChange` ma `checked`/`onCheckedChange`, quindi il
 * `{...campo}` sputato dentro non funzionerebbe e va adattato. Vedi la story
 * `Interruttore`.
 */
import { useId, type ReactNode } from "react"
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/tassullo/ui/field"

/**
 * Ciò che il campo passa al controllo: le prop di react-hook-form —
 * `name`, `value`, `onChange`, `onBlur`, `ref`, `disabled` — più i tre
 * collegamenti che il blocco esiste per non far dimenticare.
 */
export type CampoCollegato<
  T extends FieldValues = FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
> = ControllerRenderProps<T, N> & {
  id: string
  "aria-invalid": boolean
  "aria-describedby": string | undefined
}

export type FormFieldProps<
  T extends FieldValues,
  N extends FieldPath<T>,
> = {
  /** Il `control` di `useForm()`. */
  control: Control<T>
  /** Il nome del dato nello schema. **Non** è l'`id` del controllo. */
  nome: N
  /** L'etichetta. Sempre visibile: un campo senza etichetta è un campo indovinato. */
  etichetta: ReactNode
  /**
   * L'aiuto sotto il campo — collegato con `aria-describedby`, non solo
   * appoggiato lì.
   *
   * **Quasi sempre non si usa.** Una riga d'aiuto sotto ogni campo raddoppia
   * l'altezza del modulo e lo fa leggere come documentazione invece che come
   * una cosa da compilare; chi lo usa tutti i giorni la salta dopo la seconda
   * volta. Un campo che ha bisogno di essere spiegato ha quasi sempre
   * **l'etichetta sbagliata**, e l'etichetta costa zero pixel. Resta per il
   * vincolo che il campo non mostra da sé: un limite di caratteri, un formato
   * obbligato, una conseguenza non reversibile.
   */
  descrizione?: ReactNode
  // Come stanno etichetta e controllo. `verticale` è il modulo normale;
  // `orizzontale` è la riga di un pannello di impostazioni; `adattiva` è
  // `orizzontale` sopra `@md` del `FieldGroup` che la contiene e `verticale`
  // sotto — è una **container query**, quindi guarda il gruppo e non lo
  // schermo.
  /**
   * Come stanno etichetta e controllo. `"verticale"` è il modulo normale;
   * `"orizzontale"` è la riga di un pannello di impostazioni; `"adattiva"` è
   * orizzontale quando il `FieldGroup` che la contiene è largo, verticale
   * quando è stretto. Guarda il gruppo, non la finestra.
   */
  orientamento?: "verticale" | "orizzontale" | "adattiva"
  /**
   * L'etichetta **dopo** il controllo. È la forma di interruttori e caselle,
   * dove il controllo è piccolo e l'etichetta è la sua descrizione — non
   * l'intestazione di una riga.
   */
  etichettaInCoda?: boolean
  /** Il controllo. Riceve le prop già collegate. */
  children: (campo: CampoCollegato<T, N>) => ReactNode
}

const ORIENTAMENTO = {
  verticale: "vertical",
  orizzontale: "horizontal",
  adattiva: "responsive",
} as const

/**
 * Una riga di modulo.
 *
 * ```tsx
 * <FormField control={form.control} nome="codice" etichetta="Codice">
 *   {(campo) => <Input {...campo} autoComplete="off" />}
 * </FormField>
 * ```
 *
 * Più righe si impilano dentro un `<FieldGroup>` della primitiva; un gruppo
 * con un titolo è `<FieldSet>` più `<FieldLegend>`. Quelli non li avvolge
 * nessuno: sono già la forma giusta.
 */
export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  nome,
  etichetta,
  descrizione,
  orientamento = "verticale",
  etichettaInCoda = false,
  children,
}: FormFieldProps<T, N>) {
  /*
   * Un prefisso per istanza, non per nome. `useId` è stabile fra i render e
   * unico nella pagina, che è esattamente ciò che serve: l'`id` è una
   * faccenda di DOM, il `name` è una faccenda di dati, e confonderli è il
   * difetto muto descritto in testa al file.
   */
  const base = useId()
  const idCampo = `${base}-${nome}`
  const idDescrizione = descrizione ? `${idCampo}-descrizione` : undefined

  return (
    <Controller
      control={control}
      name={nome}
      render={({ field, fieldState }) => {
        const idErrore = fieldState.invalid ? `${idCampo}-errore` : undefined
        const descritto = [idDescrizione, idErrore].filter(Boolean).join(" ")
        const campo: CampoCollegato<T, N> = {
          ...field,
          id: idCampo,
          "aria-invalid": fieldState.invalid,
          "aria-describedby": descritto || undefined,
        }

        const controllo = children(campo)
        const etichettaResa = (
          <FieldLabel htmlFor={idCampo}>{etichetta}</FieldLabel>
        )
        /*
         * Aiuto ed errore stanno **dopo** il controllo, ed è l'ordine che
         * shadcn documenta. Con l'etichetta in coda — interruttori, caselle —
         * finiscono invece dentro `FieldContent` insieme all'etichetta, o il
         * testo d'aiuto resterebbe allineato al bordo sinistro della riga
         * invece che sotto la propria etichetta.
         */
        const aiuto = (
          <>
            {descrizione ? (
              <FieldDescription id={idDescrizione}>
                {descrizione}
              </FieldDescription>
            ) : null}
            {fieldState.invalid ? (
              <FieldError id={idErrore} errors={[fieldState.error]} />
            ) : null}
          </>
        )

        return (
          <Field
            data-invalid={fieldState.invalid}
            orientation={ORIENTAMENTO[orientamento]}
          >
            {etichettaInCoda ? (
              <>
                {controllo}
                <FieldContent>
                  {etichettaResa}
                  {aiuto}
                </FieldContent>
              </>
            ) : (
              <>
                {etichettaResa}
                {controllo}
                {aiuto}
              </>
            )}
          </Field>
        )
      }}
    />
  )
}
