/**
 * `tassullo-richiesta-supporto` — il dialogo «Apri una richiesta» del canale
 * di supporto (proposta #165, passo #165c).
 *
 * Ricavato da `DialogoRichiestaSupporto.tsx` di Anagrafe al commit
 * `589247a5`, con tre differenze:
 *
 * - **non chiama l'API**: consegna i dati a `onInvia` e mostra `avanzamento`;
 *   l'autenticazione, il contesto tecnico, l'avviso e la navigazione dopo
 *   l'invio restano all'app;
 * - **niente incolla con Ctrl+V**: Francesco l'ha tolto in #165a; gli
 *   screenshot si scelgono dal computer o si trascinano;
 * - le miniature e il tetto sono quelli di `tassullo-file-upload`
 *   (`forma="miniature-compatte"`, `massimo`/`presenti`), non un elenco composto a
 *   mano.
 *
 * Il modulo non usa react-hook-form: quattro campi e una validazione all'invio
 * stanno in quattro `useState`, e `Campo` di `form-field` fa i collegamenti
 * di etichetta, aiuto ed errore senza la dipendenza.
 */
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { AlertCircleIcon } from "lucide-react"

import { FileUpload, FileUploadList } from "@/registry/tassullo/blocks/file-upload"
import { Campo } from "@/registry/tassullo/blocks/form-field"
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/registry/tassullo/blocks/responsive-dialog"
import { intero } from "@/registry/tassullo/lib/numeri"
import {
  DESCRIZIONE_MASSIMA,
  SCREENSHOT_DIMENSIONE_MASSIMA,
  SCREENSHOT_FORMATI,
  SCREENSHOT_MASSIMI,
  TIPI_RICHIESTA,
  TIPO_RICHIESTA,
  TITOLO_MASSIMO,
  type DatiRichiesta,
  type TipoRichiesta,
} from "@/registry/tassullo/lib/supporto"
import { Alert, AlertDescription } from "@/registry/tassullo/ui/alert"
import { Button } from "@/registry/tassullo/ui/button"
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
} from "@/registry/tassullo/ui/field"
import { Input } from "@/registry/tassullo/ui/input"
import { RadioGroup, RadioGroupItem } from "@/registry/tassullo/ui/radio-group"
import { Spinner } from "@/registry/tassullo/ui/spinner"
import { Textarea } from "@/registry/tassullo/ui/textarea"

export type RichiestaSupportoProps = {
  /** Aperto o chiuso: il dialogo si monta una volta nel guscio e si apre dal menu. */
  aperto: boolean
  /** Il cambio di apertura. Durante l'invio la chiusura non arriva. */
  onApertoChange: (aperto: boolean) => void
  /**
   * L'invio. Riceve tipo, titolo e descrizione già puliti e gli screenshot
   * scelti. Riuscito, il dialogo si chiude e si svuota; l'avviso e la pagina
   * da aprire li decide l'app. Rifiutato, il dialogo resta aperto e mostra il
   * `message` dell'errore, che arriva già tradotto.
   */
  onInvia: (dati: DatiRichiesta) => Promise<void>
  /** L'avanzamento dell'invio, 0–100: lo mostra la barra di ogni miniatura. */
  avanzamento?: number
  /** Gli screenshot, al più. Di serie 5. */
  massimo?: number
  /** La frase sotto il titolo del dialogo. */
  descrizione?: ReactNode
  /** Il tipo scelto all'apertura. Di serie `"errore"`. */
  tipoIniziale?: TipoRichiesta
  /**
   * `"auto"`, il predefinito, sceglie dalla larghezza della finestra: dialogo
   * sulla scrivania, cassetto sul telefono. `"dialog"` e `"drawer"` fissano
   * una forma, per mostrarle tutte e due.
   */
  forma?: "auto" | "dialog" | "drawer"
}

type Screenshot = { id: string; file: File }

// Come il server legge il titolo: spazi ripetuti ridotti a uno.
const pulisci = (testo: string) => testo.split(/\s+/).filter(Boolean).join(" ")

function controlla(titolo: string, descrizione: string) {
  const t = pulisci(titolo)
  const d = descrizione.trim()
  return {
    titolo: !t
      ? "Scrivi un titolo."
      : t.length > TITOLO_MASSIMO
        ? `Il titolo è troppo lungo: al più ${intero(TITOLO_MASSIMO)} caratteri.`
        : null,
    descrizione: !d
      ? "Descrivi cosa è successo o cosa ti serve."
      : d.length > DESCRIZIONE_MASSIMA
        ? `La descrizione è troppo lunga: al più ${intero(DESCRIZIONE_MASSIMA)} caratteri.`
        : null,
  }
}

let prossimoId = 0

export function RichiestaSupporto({
  aperto,
  onApertoChange,
  onInvia,
  avanzamento = 0,
  massimo = SCREENSHOT_MASSIMI,
  descrizione = "Scrivici cosa non va o cosa ti serve. La leggiamo noi e la risposta compare nella pagina Supporto.",
  tipoIniziale = "errore",
  forma = "auto",
}: RichiestaSupportoProps) {
  const idModulo = useId()
  const [tipo, setTipo] = useState<TipoRichiesta>(tipoIniziale)
  const [titolo, setTitolo] = useState("")
  const [testo, setTesto] = useState("")
  const [screenshot, setScreenshot] = useState<Screenshot[]>([])
  const [erroriFile, setErroriFile] = useState<string[]>([])
  const [erroreInvio, setErroreInvio] = useState<string | null>(null)
  const [tentato, setTentato] = useState(false)
  const [inCorso, setInCorso] = useState(false)
  const campoTitolo = useRef<HTMLInputElement>(null)
  const campoTesto = useRef<HTMLTextAreaElement>(null)

  // Gli errori dei campi compaiono dopo il primo invio, e da lì seguono quello che si scrive.
  const errori = tentato ? controlla(titolo, testo) : { titolo: null, descrizione: null }
  const pieno = screenshot.length >= massimo

  function cambiaApertura(nuovo: boolean) {
    // Durante l'invio il dialogo non si chiude: né con Esc, né col clic fuori, né trascinando il cassetto.
    if (!nuovo && inCorso) return
    onApertoChange(nuovo)
  }

  function aggiungi(file: File[]) {
    setErroriFile([])
    setScreenshot((prima) => [...prima, ...file.map((f) => ({ id: `screenshot-${prossimoId++}`, file: f }))])
  }

  function togli(id: string) {
    setErroriFile([])
    setScreenshot((prima) => prima.filter((s) => s.id !== id))
  }

  function svuota() {
    setTipo(tipoIniziale)
    setTitolo("")
    setTesto("")
    setScreenshot([])
    setErroriFile([])
    setErroreInvio(null)
    setTentato(false)
  }

  async function invia(evento: FormEvent) {
    evento.preventDefault()
    if (inCorso) return
    setTentato(true)
    const verifica = controlla(titolo, testo)
    if (verifica.titolo) return campoTitolo.current?.focus()
    if (verifica.descrizione) return campoTesto.current?.focus()
    setErroreInvio(null)
    setInCorso(true)
    try {
      await onInvia({
        tipo,
        titolo: pulisci(titolo),
        descrizione: testo.trim(),
        screenshot: screenshot.map((s) => s.file),
      })
    } catch (errore) {
      setInCorso(false)
      setErroreInvio(
        errore instanceof Error && errore.message ? errore.message : "La richiesta non è partita. Riprova.",
      )
      return
    }
    // Prima si toglie `inCorso`, poi si chiude: con `inCorso` acceso la chiusura non passerebbe.
    setInCorso(false)
    svuota()
    onApertoChange(false)
  }

  return (
    <ResponsiveDialog open={aperto} onOpenChange={cambiaApertura} forma={forma}>
      <ResponsiveDialogContent className="md:max-w-4xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Apri una richiesta</ResponsiveDialogTitle>
          {descrizione ? <ResponsiveDialogDescription>{descrizione}</ResponsiveDialogDescription> : null}
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <form id={idModulo} onSubmit={invia} noValidate>
            <FieldGroup>
              <FieldSet>
                <FieldLegend variant="label">Di cosa si tratta?</FieldLegend>
                <RadioGroup
                  className="md:grid-cols-3"
                  value={tipo}
                  onValueChange={(valore) => setTipo(valore as TipoRichiesta)}
                  disabled={inCorso}
                >
                  {TIPI_RICHIESTA.map((t) => (
                    <FieldLabel key={t} htmlFor={`${idModulo}-${t}`}>
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>{TIPO_RICHIESTA[t].testo}</FieldTitle>
                          <FieldDescription>{TIPO_RICHIESTA[t].descrizione}</FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value={t} id={`${idModulo}-${t}`} />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              </FieldSet>

              <Campo etichetta="Titolo" errore={errori.titolo}>
                {(campo) => (
                  <Input
                    {...campo}
                    ref={campoTitolo}
                    name="titolo"
                    autoComplete="off"
                    placeholder="In breve, di cosa si tratta"
                    value={titolo}
                    onChange={(e) => setTitolo(e.target.value)}
                    disabled={inCorso}
                  />
                )}
              </Campo>

              <Campo etichetta="Descrizione" errore={errori.descrizione}>
                {(campo) => (
                  // Cresce col testo fino a un'altezza, poi scorre dentro il campo.
                  <Textarea
                    {...campo}
                    ref={campoTesto}
                    name="descrizione"
                    placeholder="Cosa stavi facendo, cosa ti aspettavi e cosa è successo"
                    value={testo}
                    onChange={(e) => setTesto(e.target.value)}
                    className="min-h-32 max-h-80"
                    disabled={inCorso}
                  />
                )}
              </Campo>

              <FieldSet>
                <FieldLegend variant="label">Screenshot (facoltativo)</FieldLegend>
                <FileUploadList
                  forma="miniature-compatte"
                  file={screenshot.map((s) => ({
                    id: s.id,
                    nome: s.file.name,
                    dimensione: s.file.size,
                    stato: inCorso ? "in-corso" : "in-coda",
                    progresso: avanzamento,
                    anteprima: s.file,
                  }))}
                  onRimuovi={togli}
                />
                {inCorso ? null : (
                  <div className="flex flex-col items-start gap-2">
                    <FileUpload
                      forma="bottone"
                      etichettaBottone={screenshot.length ? "Aggiungi un'immagine" : "Scegli le immagini"}
                      accetta={SCREENSHOT_FORMATI}
                      dimensioneMassima={SCREENSHOT_DIMENSIONE_MASSIMA}
                      massimo={massimo}
                      presenti={screenshot.length}
                      onFile={aggiungi}
                      onRifiutati={(rifiutati) =>
                        setErroriFile(rifiutati.map((r) => `«${r.file.name}»: ${r.errore.toLowerCase()}.`))
                      }
                    />
                    <FieldDescription>
                      {pieno
                        ? `Hai raggiunto il massimo di ${intero(massimo)} immagini. Togline una per aggiungerne un'altra.`
                        : `Fino a ${intero(massimo)} immagini PNG o JPEG, ciascuna fino a 10 MB.`}
                    </FieldDescription>
                  </div>
                )}
                {erroriFile.length ? <FieldError errors={erroriFile.map((message) => ({ message }))} /> : null}
              </FieldSet>

              {erroreInvio ? (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertDescription>{erroreInvio}</AlertDescription>
                </Alert>
              ) : null}
            </FieldGroup>
          </form>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose render={<Button variant="outline" disabled={inCorso} />}>
            Annulla
          </ResponsiveDialogClose>
          <Button type="submit" form={idModulo} disabled={inCorso}>
            {inCorso ? <Spinner data-icon="inline-start" /> : null}
            Invia la richiesta
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
