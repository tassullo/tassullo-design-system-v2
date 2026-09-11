/**
 * `tassullo-confirm-dialog` — «sei sicuro?», in una forma sola.
 *
 * ── Cosa c'era già ──────────────────────────────────────────────────────
 *
 * `alert-dialog` di shadcn, installato e ri-stilato, è la primitiva giusta e
 * qui sotto non se ne tocca una riga. Ciò che manca è che **una conferma non è
 * una composizione, è una domanda**: titolo, spiegazione, due bottoni. Scritta
 * a mano sono quattordici righe di JSX in cui l'unica parte che cambia da un
 * punto d'uso all'altro sono due stringhe — e con quattordici righe di
 * ripetizione arrivano tre difetti che si vedono solo a cose fatte.
 *
 *   1. **Il colore del testo.** La tentazione, sull'azione distruttiva, è
 *      `className="text-destructive"`. `--destructive` è il colore dei
 *      **fondi**: come testo su un menu scuro dà **3.52:1** — misurato dal gate
 *      in M3.2. Qui l'azione distruttiva è `variant="destructive"`, che è la
 *      variante del componente, l'unica forma che il tema garantisce leggibile
 *      in tutte e due le modalità.
 *   2. **L'ordine dei bottoni.** Annulla a sinistra, conferma a destra — e in
 *      colonna, su schermo stretto, conferma **sopra**. Se ogni punto d'uso lo
 *      riscrive, prima o poi da qualche parte è invertito, e chi clicca in
 *      automatico cancella una cosa che voleva tenere.
 *   3. **L'attesa.** Una conferma quasi sempre chiama la rete, e quasi nessuna
 *      la gestisce: il dialogo si chiude subito, la richiesta fallisce in
 *      silenzio, l'utente crede di aver cancellato. Vedi sotto.
 *
 * ── L'attesa, che è la ragione vera per cui questo blocco esiste ────────
 *
 * `onConferma` può restituire una **promessa**. Finché non si risolve, il
 * dialogo **resta aperto**: il bottone di conferma mostra un indicatore e si
 * disabilita, quello di annullo si disabilita, `Esc` e il clic fuori non
 * chiudono. Se la promessa viene rifiutata il dialogo resta aperto e in
 * condizione di riprovare — l'errore lo mostra l'app, dove sa cosa dire, ma non
 * su un dialogo già sparito.
 *
 * È l'unica parte di questo file che non sia impacchettamento: è una piccola
 * macchina a stati, e ce ne vuole **una** per tutte le app, non una per pagina.
 *
 * ── Controllato, perché il grilletto spesso non c'è ─────────────────────
 *
 * La forma comoda ha il grilletto dentro:
 *
 * ```tsx
 * <ConfirmDialog titolo="Eliminare il prodotto?" conferma="Elimina" tono="distruttivo"
 *                onConferma={() => api.elimina(id)}>
 *   <Button variant="destructive"><Trash2Icon />Elimina</Button>
 * </ConfirmDialog>
 * ```
 *
 * Ma il caso più frequente nelle app Tassullo è la voce di un menu di riga
 * della tabella, e lì il grilletto **non può stare dentro**: cliccando la voce
 * il menu si chiude e si smonta, e con lui si smonterebbe il dialogo che stava
 * per aprire. È il caso che shadcn documenta come `dropdown-menu-dialog`. La
 * risposta è la forma controllata — `aperto` e `onApertoChange`, senza figli —
 * con lo stato tenuto dalla pagina.
 */
import { useState, type ComponentProps, type ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/tassullo/ui/alert-dialog"
import { Spinner } from "@/registry/tassullo/ui/spinner"

export type ConfirmDialogProps = {
  /** La domanda. Si scrive **come una domanda**: «Eliminare il prodotto?». */
  titolo: ReactNode
  /**
   * Cosa succede se si conferma, e cosa non si può disfare. È il posto dove
   * dire «l'operazione non è reversibile», non il titolo.
   */
  descrizione?: ReactNode
  /**
   * L'etichetta della conferma. **Il verbo dell'azione**, non «OK»: chi legge
   * in fretta legge solo i bottoni, e «OK» non dice cosa sta per succedere.
   */
  conferma: string
  /** L'etichetta dell'annullo. */
  annulla?: string
  /**
   * `distruttivo` tinge la conferma di rosso. È il **tono della domanda**, non
   * un colore: il colore viene dietro, ed è la variante del componente.
   */
  tono?: "normale" | "distruttivo"
  /**
   * L'azione. Se restituisce una promessa il dialogo aspetta, e si chiude solo
   * quando si risolve.
   */
  onConferma: () => void | Promise<unknown>
  /** Il grilletto, nella forma comoda. Con `aperto` non si passa. */
  children?: ReactNode
  /** Aperto, nella forma controllata. */
  aperto?: boolean
  /** Cambio di apertura, nella forma controllata. */
  onApertoChange?: (aperto: boolean) => void
} & Pick<ComponentProps<typeof AlertDialogContent>, "className">

export function ConfirmDialog({
  titolo,
  descrizione,
  conferma,
  annulla = "Annulla",
  tono = "normale",
  onConferma,
  children,
  aperto,
  onApertoChange,
  className,
}: ConfirmDialogProps) {
  const [apertoInterno, setApertoInterno] = useState(false)
  const [inCorso, setInCorso] = useState(false)

  const controllato = aperto !== undefined
  const apertoOra = controllato ? aperto : apertoInterno

  function cambia(v: boolean) {
    // Mentre l'azione è in corso il dialogo non si chiude: né con `Esc`, né
    // col clic fuori. Chiuderlo lascerebbe una promessa in volo senza più
    // nessuno a cui raccontare com'è finita.
    if (inCorso && !v) return
    if (!controllato) setApertoInterno(v)
    onApertoChange?.(v)
  }

  async function esegui() {
    try {
      setInCorso(true)
      await onConferma()
      /*
       * Si chiude **dopo**, e solo se è andata bene. La chiusura passa da
       * `cambia`, ma `inCorso` è ancora `true` e la bloccherebbe: si azzera
       * prima. L'ordine conta, ed è il genere di dettaglio che riscritto in
       * ogni pagina qualche volta esce sbagliato.
       */
      setInCorso(false)
      if (!controllato) setApertoInterno(false)
      onApertoChange?.(false)
    } catch {
      // Il dialogo resta aperto e riprovabile. L'errore lo racconta l'app —
      // con un toast, o dentro la pagina — perché è lei a sapere cosa dire.
      setInCorso(false)
    }
  }

  return (
    <AlertDialog open={apertoOra} onOpenChange={cambia}>
      {children ? (
        <AlertDialogTrigger
          data-slot="confirm-dialog-trigger"
          render={children as never}
        />
      ) : null}
      <AlertDialogContent
        data-slot="confirm-dialog-content"
        className={className}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{titolo}</AlertDialogTitle>
          {descrizione ? (
            <AlertDialogDescription>{descrizione}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={inCorso}>{annulla}</AlertDialogCancel>
          {/*
           * `variant`, non una classe di colore: `--destructive` è il colore
           * dei fondi e come testo non regge il contrasto. È la seconda delle
           * due trappole elencate in `CLAUDE.md`, e la variante è la risposta
           * che il tema garantisce in tutte e due le modalità.
           */}
          <AlertDialogAction
            variant={tono === "distruttivo" ? "destructive" : "default"}
            disabled={inCorso}
            onClick={esegui}
          >
            {inCorso ? <Spinner /> : null}
            {conferma}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
