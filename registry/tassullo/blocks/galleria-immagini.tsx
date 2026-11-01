/**
 * `tassullo-galleria-immagini` — miniature in una griglia e, con un clic,
 * l'immagine grande in un dialogo quasi a tutta finestra, con «Precedente»,
 * «Successivo» e «Chiudi».
 *
 * Nasce dalla proposta #165 (Anagrafe, gli screenshot di una richiesta di
 * supporto), ma è generica: non sa niente del supporto, e serve allo stesso
 * modo alle foto di un prodotto. Il riferimento è `ScreenshotRichiesta.tsx` di
 * Anagrafe al commit `589247a5`.
 *
 * ── Perché una funzione e non un `src` ──────────────────────────────────
 *
 * Le immagini delle app Tassullo sono quasi sempre **autenticate**: un `<img
 * src>` non porta l'intestazione `Authorization`, quindi l'app le scarica con
 * `fetch` e le mostra come blob. Il blocco riceve `carica(immagine, segnale)`,
 * che restituisce un URL o un `Blob`; i `Blob` li trasforma lui in URL e li
 * revoca quando la miniatura si smonta. Un'immagine pubblica passa un URL e
 * basta.
 *
 * ── Si carica una volta sola ────────────────────────────────────────────
 *
 * Ogni miniatura carica la sua immagine e ne dice lo stato alla galleria; il
 * dialogo mostra lo stesso URL, senza un secondo download. Anagrafe scaricava
 * due volte, una per la miniatura e una per l'ingrandimento.
 *
 * ── `carica` può cambiare a ogni render ─────────────────────────────────
 *
 * In Anagrafe la funzione che scarica è nuova a ogni render. Fra le
 * dipendenze dell'effetto avrebbe fatto ripartire il caricamento all'infinito
 * (`docs/DECISIONI.md` §17): la si legge con `useEffectEvent`, e l'effetto
 * dipende solo dall'`id` dell'immagine e dal numero del tentativo.
 */
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
} from "react"
import { cn } from "cn"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageOffIcon,
  RotateCwIcon,
} from "lucide-react"
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
import { Button } from "@/registry/tassullo/ui/button"
import { Skeleton } from "@/registry/tassullo/ui/skeleton"
import { intero } from "@/registry/tassullo/lib/numeri"

/** Un'immagine della galleria: un `id` stabile e, se c'è, un nome. */
export type ImmagineGalleria = {
  id: string | number
  /** Il nome che si legge sopra l'immagine grande, e il nome della miniatura. */
  nome?: string
}

/**
 * Dà l'immagine: un URL da mettere in `src`, oppure un `Blob` che il blocco
 * trasforma in URL. Se l'immagine non c'è, la promessa si rifiuta. `segnale`
 * si interrompe quando la miniatura si smonta prima che il caricamento finisca.
 */
export type CaricaImmagine<T extends ImmagineGalleria = ImmagineGalleria> = (
  immagine: T,
  segnale: AbortSignal,
) => Promise<string | Blob>

type Stato =
  | { stato: "caricamento" }
  | { stato: "pronta"; src: string }
  | { stato: "errore" }

const IN_CARICAMENTO: Stato = { stato: "caricamento" }

export type GalleriaImmaginiProps<T extends ImmagineGalleria> = Omit<
  ComponentProps<"div">,
  "children"
> & {
  /** Le immagini, nell'ordine in cui si mostrano. */
  immagini: T[]
  /** Carica un'immagine: vedi `CaricaImmagine`. */
  carica: CaricaImmagine<T>
  /**
   * La parola per un'immagine senza nome e per il conto nel dialogo:
   * «Screenshot» dà «Screenshot 2» e «Screenshot 2 di 5». Di serie «Immagine».
   */
  etichetta?: string
  /**
   * La forma del dialogo, come in `tassullo-responsive-dialog`: `"auto"`, il
   * predefinito, è un dialogo sulla scrivania e un cassetto sul telefono.
   */
  forma?: "auto" | "dialog" | "drawer"
}

/** La griglia delle miniature e il dialogo dell'immagine grande. */
export function GalleriaImmagini<T extends ImmagineGalleria>({
  immagini,
  carica,
  etichetta = "Immagine",
  forma = "auto",
  className,
  ...props
}: GalleriaImmaginiProps<T>) {
  const [aperta, setAperta] = useState(false)
  // L'immagine mostrata resta anche a dialogo chiuso: durante l'animazione di
  // chiusura il pannello non si svuota.
  const [mostrata, setMostrata] = useState(0)
  const [stati, setStati] = useState<Record<string, Stato>>({})
  const [tentativi, setTentativi] = useState<Record<string, number>>({})
  // La miniatura da cui si è aperto il dialogo: alla chiusura il fuoco torna lì.
  const origine = useRef<HTMLButtonElement | null>(null)

  const n = immagini.length
  const indice = Math.max(0, Math.min(mostrata, n - 1))
  const corrente = n > 0 ? immagini[indice] : null
  const nomeDi = (img: T, i: number) => img.nome ?? `${etichetta} ${intero(i + 1)}`
  const statoDi = (img: T) => stati[String(img.id)] ?? IN_CARICAMENTO

  const aggiorna = (id: string, stato: Stato) =>
    setStati((prima) => ({ ...prima, [id]: stato }))

  const riprova = (img: T) => {
    const id = String(img.id)
    aggiorna(id, IN_CARICAMENTO)
    setTentativi((prima) => ({ ...prima, [id]: (prima[id] ?? 0) + 1 }))
  }

  const vai = (passo: -1 | 1) => {
    const prossimo = indice + passo
    if (prossimo >= 0 && prossimo < n) setMostrata(prossimo)
  }

  // Le frecce scorrono le immagini, come in ogni visore; dentro un campo di
  // testo restano al campo.
  const frecce = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      vai(-1)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      vai(1)
    }
  }

  return (
    <div
      data-slot="galleria-immagini"
      className={cn("@container", className)}
      {...props}
    >
      <ul className="grid grid-cols-2 gap-3 @lg:grid-cols-3">
        {immagini.map((img, i) => {
          const id = String(img.id)
          return (
            <li key={id}>
              <Miniatura
                immagine={img}
                nome={nomeDi(img, i)}
                stato={statoDi(img)}
                tentativo={tentativi[id] ?? 0}
                carica={carica}
                onStato={(s) => aggiorna(id, s)}
                onApri={(bottone) => {
                  origine.current = bottone
                  setMostrata(i)
                  setAperta(true)
                }}
              />
            </li>
          )
        })}
      </ul>

      <ResponsiveDialog
        forma={forma}
        open={aperta && corrente !== null}
        onOpenChange={setAperta}
      >
        <ResponsiveDialogContent
          className="md:flex md:h-11/12 md:max-w-7xl md:flex-col"
          finalFocus={origine}
          onKeyDown={frecce}
        >
          {corrente ? (
            <>
              <ResponsiveDialogHeader>
                <ResponsiveDialogTitle>{nomeDi(corrente, indice)}</ResponsiveDialogTitle>
                {n > 1 ? (
                  <ResponsiveDialogDescription>
                    {`${etichetta} ${intero(indice + 1)} di ${intero(n)}`}
                  </ResponsiveDialogDescription>
                ) : null}
              </ResponsiveDialogHeader>
              <ResponsiveDialogBody className="flex min-h-0 flex-1">
                <Grande
                  nome={nomeDi(corrente, indice)}
                  stato={statoDi(corrente)}
                  onErrore={() => aggiorna(String(corrente.id), { stato: "errore" })}
                  onRiprova={() => riprova(corrente)}
                />
              </ResponsiveDialogBody>
              {/* Sul telefono i bottoni si leggono dall'alto: Precedente e
                  Successivo affiancati sotto l'immagine, Chiudi in fondo. La
                  scrivania li mette in fila a destra, nello stesso ordine. */}
              <ResponsiveDialogFooter className="flex-col">
                {n > 1 ? (
                  <div className="flex gap-2 *:flex-1">
                    {/* Il bottone resta raggiungibile anche spento: arrivati
                        all'ultima immagine il fuoco non cade sul fondo della
                        pagina. */}
                    <Button
                      variant="outline"
                      focusableWhenDisabled
                      className="aria-disabled:opacity-50"
                      disabled={indice === 0}
                      onClick={() => vai(-1)}
                    >
                      <ChevronLeftIcon data-icon="inline-start" />
                      Precedente
                    </Button>
                    <Button
                      variant="outline"
                      focusableWhenDisabled
                      className="aria-disabled:opacity-50"
                      disabled={indice === n - 1}
                      onClick={() => vai(1)}
                    >
                      Successivo
                      <ChevronRightIcon data-icon="inline-end" />
                    </Button>
                  </div>
                ) : null}
                <ResponsiveDialogClose render={<Button />}>Chiudi</ResponsiveDialogClose>
              </ResponsiveDialogFooter>
            </>
          ) : null}
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  )
}

function Miniatura<T extends ImmagineGalleria>({
  immagine,
  nome,
  stato,
  tentativo,
  carica,
  onStato,
  onApri,
}: {
  immagine: T
  nome: string
  stato: Stato
  tentativo: number
  carica: CaricaImmagine<T>
  onStato: (stato: Stato) => void
  onApri: (bottone: HTMLButtonElement) => void
}) {
  const id = immagine.id
  const leggi = useEffectEvent((segnale: AbortSignal) => carica(immagine, segnale))
  const comunica = useEffectEvent(onStato)

  useEffect(() => {
    const segnale = new AbortController()
    let creato: string | null = null
    leggi(segnale.signal)
      .then((dato) => {
        if (segnale.signal.aborted) return
        if (typeof dato === "string") {
          comunica({ stato: "pronta", src: dato })
        } else {
          creato = URL.createObjectURL(dato)
          comunica({ stato: "pronta", src: creato })
        }
      })
      .catch(() => {
        if (!segnale.signal.aborted) comunica({ stato: "errore" })
      })
    return () => {
      segnale.abort()
      if (creato) URL.revokeObjectURL(creato)
    }
  }, [id, tentativo])

  return (
    <button
      type="button"
      data-slot="galleria-immagini-miniatura"
      aria-label={`Ingrandisci ${nome}`}
      onClick={(e) => onApri(e.currentTarget)}
      className="flex aspect-video w-full overflow-hidden rounded-md border bg-muted transition-colors outline-none hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
    >
      {stato.stato === "pronta" ? (
        <img
          src={stato.src}
          alt=""
          className="size-full object-cover object-top"
          onError={() => onStato({ stato: "errore" })}
        />
      ) : stato.stato === "errore" ? (
        <ImageOffIcon aria-hidden className="m-auto size-6 text-muted-foreground" />
      ) : (
        <Skeleton className="size-full rounded-none" />
      )}
    </button>
  )
}

function Grande({
  nome,
  stato,
  onErrore,
  onRiprova,
}: {
  nome: string
  stato: Stato
  onErrore: () => void
  onRiprova: () => void
}) {
  if (stato.stato === "errore") {
    return (
      <div
        role="status"
        className="flex flex-1 flex-col items-center justify-center gap-3 rounded-md border bg-muted p-6 text-center"
      >
        <ImageOffIcon aria-hidden className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">L'immagine non si carica.</p>
        <Button variant="outline" onClick={onRiprova}>
          <RotateCwIcon data-icon="inline-start" />
          Riprova
        </Button>
      </div>
    )
  }
  return (
    // Un'immagine più alta del riquadro scorre dentro: il riquadro si
    // raggiunge col `Tab` e scorre con le frecce su e giù.
    <div
      role="region"
      aria-label={nome}
      tabIndex={0}
      className="flex min-h-0 flex-1 items-start justify-center overflow-auto rounded-md border bg-muted outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
    >
      {stato.stato === "pronta" ? (
        <img src={stato.src} alt={nome} className="h-auto max-w-full" onError={onErrore} />
      ) : (
        <Skeleton className="aspect-video w-full rounded-none" />
      )}
    </div>
  )
}
