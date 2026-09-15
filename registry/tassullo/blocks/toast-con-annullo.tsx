/**
 * `tassullo-toast-con-annullo` — il «successo annullabile», verdetto di D18
 * (M3.5, 2026-09-15, `docs/DECISIONI.md` §35).
 *
 * ── La domanda, e perché non era «conferma o annullo» ────────────────────
 *
 * D18 nasce da una domanda su `confirm-dialog`: «mettiamo anche un annullo
 * dopo?». La risposta, a verbale in §35, è che conferma e annullo **non sono
 * complementari**: rispondono alla stessa domanda — «e se non volevo?» — e
 * messi insieme sulla stessa azione fanno due interruzioni e svuotano la
 * conferma, che si clicca via senza leggerla proprio perché tanto si può
 * disfare. La scelta è quale dei due, non «tutti e due»: le azioni **non**
 * dichiarate verso l'esterno (Anagrafe: «tutto ciò che è dichiarato verso
 * l'esterno non si cancella mai, si supera») sono passaggi di stato
 * reversibili — il caso da annullo, e da questo blocco. Le poche cancellazioni
 * vere restano il caso da `confirm-dialog`.
 *
 * ── Perché «differita», e non «ripristino» ────────────────────────────────
 *
 * Un «Annulla» dentro un toast è una bugia se l'API ha già eseguito e non sa
 * tornare indietro. C'erano due strade — ripristino via soft-delete lato API,
 * o azione differita lato client — e la seconda è quella scelta il
 * 2026-09-15: non dipende da un contratto col backend che oggi non esiste per
 * Anagrafe, quindi l'annullo **funziona sempre**, a costo di qualche secondo
 * di attesa prima che l'azione sia davvero eseguita. **Provvisoria**: da
 * rivedere con Roberto a design system finito, se nel frattempo Anagrafe
 * adotta comunque un soft-delete per altre ragioni.
 *
 * ── Cosa fa `toastConAnnullo` ─────────────────────────────────────────────
 *
 * `azione` **non parte subito**. Il toast è la finestra di annullo: se nessuno
 * clicca «Annulla» entro `durata`, `azione()` viene chiamata alla chiusura del
 * toast — automatica o manuale (la X, uno swipe). Cliccare «Annulla» la
 * cancella e basta: `azione` non viene mai chiamata.
 *
 * `sonner.stories.tsx`, story `ConAzione`, porta già scritta metà della
 * regola, dalla FASE 2: *«L'azione dentro un toast è sempre ridondante: il
 * toast sparisce, e chi non fa in tempo dev'essere in grado di fare la stessa
 * cosa dalla pagina. Annulla qui è una comodità, non l'unica via.»* Vale anche
 * qui: l'azione differita non è l'unico modo per tornare sui propri passi, è
 * solo il più comodo nei sette secondi in cui il toast resta a schermo.
 */
import { toast } from "sonner"

export type ToastConAnnulloOpzioni = {
  /** Il messaggio: «Scheda archiviata», al passato — è già successo, agli occhi di chi guarda. */
  messaggio: string
  descrizione?: string
  /** Millisecondi prima che `azione` parta da sé. */
  durata?: number
  etichettaAnnulla?: string
  /** Richiamato quando si clicca «Annulla»: `azione` non partirà. */
  onAnnulla?: () => void
}

const DURATA_DEFAULT = 5000

/**
 * Programma `azione` alla chiusura del toast, salvo annullo. Restituisce
 * l'id del toast (utile per `toast.dismiss(id)`, quando serve chiuderlo da
 * codice).
 */
export function toastConAnnullo(
  azione: () => void | Promise<unknown>,
  {
    messaggio,
    descrizione,
    durata = DURATA_DEFAULT,
    etichettaAnnulla = "Annulla",
    onAnnulla,
  }: ToastConAnnulloOpzioni
) {
  let annullato = false

  function chiudi() {
    // Il clic sull'azione chiude il toast senza passare da `onDismiss`
    // (sorgente di sonner: il bottone azione chiama solo `deleteToast`), quindi
    // qui arrivano solo lo scadere del tempo e la chiusura manuale (X, swipe).
    // Il flag resta comunque la guardia giusta: è quello che distingue «è
    // scaduto» da «ho cliccato Annulla», non la funzione che l'ha chiamato.
    if (!annullato) void azione()
  }

  return toast(messaggio, {
    description: descrizione,
    duration: durata,
    action: {
      label: etichettaAnnulla,
      onClick: () => {
        annullato = true
        onAnnulla?.()
      },
    },
    onAutoClose: chiudi,
    onDismiss: chiudi,
  })
}
