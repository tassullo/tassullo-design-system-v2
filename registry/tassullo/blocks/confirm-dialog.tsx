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
 *
 * ── La conferma digitata, e perché il campo non va nella descrizione ────
 *
 * Il caso vero è **ChangeSets di Anagrafe**, che oggi apre un `window.prompt`:
 * una finestra del sistema operativo, che non ha i colori del tema, non si
 * naviga come il resto della pagina e — su ogni macchina — è disegnata
 * diversa. È la stessa obiezione con cui si è chiuso D19 sul `<select>`
 * nativo.
 *
 * Portarla qui dentro ha voluto dire due cose, e la prima **non è un
 * formalismo**. `descrizione` finisce in `<AlertDialogDescription>`, cioè
 * nell'elemento che il dialogo dichiara in `aria-describedby`: è il testo che
 * un lettore di schermo annuncia *come descrizione del dialogo*, tutto in
 * fila, appena il dialogo si apre. Metterci dentro un campo di testo vuol dire
 * che l'etichetta del campo viene letta come parte della spiegazione e che il
 * campo stesso compare in mezzo a una frase. Perciò c'è `corpo`, che è un
 * **terzo posto** — fra l'intestazione e i bottoni — e non sta dentro
 * `aria-describedby`.
 *
 * La seconda è la firma: `onConferma` riceve ora il **valore digitato**. Senza,
 * il dialogo saprebbe cosa si è scritto e chi l'ha aperto no — e la pagina
 * dovrebbe tenersi uno stato in parallelo, cioè esattamente la ripetizione che
 * questo blocco esiste per togliere. Chi non usa `campo` continua a scrivere
 * `onConferma={() => …}`: una funzione che ignora il suo argomento è
 * assegnabile, e nessun punto d'uso esistente cambia.
 */
import { useId, useState, type ComponentProps, type ReactNode } from "react"

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
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/registry/tassullo/ui/field"
import { Input } from "@/registry/tassullo/ui/input"
import { Spinner } from "@/registry/tassullo/ui/spinner"
import { Textarea } from "@/registry/tassullo/ui/textarea"

/**
 * Il campo della conferma digitata. Una forma sola, perché i casi veri sono
 * due e si somigliano abbastanza da stare nella stessa:
 *
 *   - **un motivo da scrivere** — ChangeSets di Anagrafe, oggi
 *     `window.prompt("Motivo del rifiuto")`: testo libero, `obbligatorio`,
 *     quasi sempre `multiriga`;
 *   - **una parola da ricopiare** — la guardia che si mette davanti a una
 *     cosa che non si disfa: `parolaAttesa`, e la conferma resta spenta
 *     finché non coincide.
 */
export type CampoConferma = {
  /**
   * L'etichetta, **sempre visibile**: un campo senza etichetta è un campo
   * indovinato. È la stessa regola di `form-field`.
   */
  etichetta: ReactNode
  /**
   * L'aiuto sotto il campo, collegato con `aria-describedby` — non appoggiato
   * lì accanto.
   *
   * Con `parolaAttesa` e senza `aiuto`, il blocco scrive da sé la riga che
   * dice **quale** parola serve, con la parola in evidenza. È la risposta per
   * costruzione alla sola domanda che conta su questa forma: la parola da
   * scrivere si legge *prima* di scriverla, non dopo aver sbagliato.
   */
  aiuto?: ReactNode
  segnaposto?: string
  /**
   * Il valore di partenza. Il campo ci **torna a ogni apertura**: un dialogo
   * riaperto dopo un annullo non deve ritrovarsi dentro quello che si era
   * cominciato a scrivere la volta prima, che è il modo in cui si conferma
   * una cosa scritta per un'altra riga.
   */
  iniziale?: string
  /** Più righe: un motivo si scrive in un `textarea`, non in una riga sola. */
  multiriga?: boolean
  /**
   * La parola da ricopiare. Finché il campo non la contiene **esatta**
   * (a meno degli spazi ai bordi), la conferma resta disabilitata.
   */
  parolaAttesa?: string
  /** Senza `parolaAttesa`: la conferma resta disabilitata a campo vuoto. */
  obbligatorio?: boolean
}

export type ConfirmDialogProps = {
  /** La domanda. Si scrive **come una domanda**: «Eliminare il prodotto?». */
  titolo: ReactNode
  /**
   * Cosa succede se si conferma, e cosa non si può disfare. È il posto dove
   * dire «l'operazione non è reversibile», non il titolo.
   */
  descrizione?: ReactNode
  // Quello che sta **fra la spiegazione e i bottoni**: un campo, un elenco di
  // cose che si stanno per cancellare, un riepilogo.
  //
  // Non è un secondo `descrizione` con un altro nome, ed è la ragione per cui
  // esiste: `descrizione` finisce in `<AlertDialogDescription>`, cioè
  // nell'elemento di `aria-describedby`, che un lettore di schermo annuncia
  // **tutto in fila** all'apertura. Ci sta una frase; non ci sta un controllo,
  // né un elenco di dodici righe. Il corpo sta fuori di lì, ed è un contenuto
  // come un altro della pagina.
  //
  // Si compone **dal punto di chiamata** e non aggiunge nulla ad
  // `alert-dialog`: la primitiva è un `grid`, e un terzo figlio fra
  // intestazione e piè è una riga in più della griglia. Vedi la regola 4bis di
  // `CLAUDE.md`, gradino 2.
  /**
   * Ciò che sta fra la spiegazione e i bottoni: un campo da compilare, l'elenco
   * di ciò che si sta per cancellare, un riepilogo. Non è una seconda
   * `descrizione`: la descrizione si legge tutta insieme all'apertura, e ci
   * sta una frase; il corpo è contenuto come un altro, e ci sta anche un
   * controllo.
   */
  corpo?: ReactNode
  /**
   * Il campo della **conferma digitata**. Si rende dentro `corpo` (prima di
   * un eventuale corpo passato a mano), e il suo valore arriva a `onConferma`.
   */
  campo?: CampoConferma
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
   *
   * Riceve il **valore del campo** (`campo`), o la stringa vuota se campo non
   * ce n'è. Chi non lo usa scrive `onConferma={() => …}` e non cambia niente:
   * una funzione che ignora il suo argomento resta assegnabile.
   */
  onConferma: (valore: string) => void | Promise<unknown>
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
  corpo,
  campo,
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
  const [valore, setValore] = useState(campo?.iniziale ?? "")

  const controllato = aperto !== undefined
  const apertoOra = controllato ? aperto : apertoInterno

  /*
   * `id` per istanza, non il nome del campo: due dialoghi nella stessa pagina
   * avrebbero due `id` uguali e il clic sull'etichetta porterebbe il fuoco
   * nel campo dell'altro. È la stessa ragione — e la stessa soluzione — di
   * `form-field`.
   */
  const idBase = useId()
  const idCampo = `${idBase}-campo`
  const idAiuto = `${idBase}-aiuto`

  /**
   * Il campo torna al valore di partenza **a ogni apertura**: un dialogo
   * riaperto dopo un annullo non deve ritrovarsi dentro quello che si era
   * cominciato a scrivere la volta prima — è il modo in cui si conferma una
   * cosa scritta per un'altra riga.
   *
   * **Aggiustato in fase di render, non in un `useEffect`**, che è la stessa
   * scelta e lo stesso pattern di `data-table` (`chiaveFiltroVista`): React
   * lo documenta per «resettare uno stato quando cambia un altro valore» —
   * un confronto con l'ultimo valore visto, e `setState` durante il render,
   * prima del commit. Con l'effetto ci sarebbe un giro di rendering in più,
   * e il campo si vedrebbe per un fotogramma col valore vecchio.
   *
   * `apertoOra` e `iniziale` sono due primitivi, non `campo`: `campo` è quasi
   * sempre un letterale, cioè un riferimento nuovo a ogni render, e
   * confrontarlo rimetterebbe il campo a zero in continuo — la trappola delle
   * dipendenze non primitive di `CLAUDE.md`, che qui non darebbe un ciclo ma
   * un campo che si cancella mentre ci si scrive dentro.
   */
  const iniziale = campo?.iniziale ?? ""
  const [apertoVisto, setApertoVisto] = useState(apertoOra)
  if (apertoOra !== apertoVisto) {
    setApertoVisto(apertoOra)
    if (apertoOra) setValore(iniziale)
  }

  const scritto = valore.trim()
  /*
   * Quando la conferma è spenta. `parolaAttesa` vince su `obbligatorio`: se
   * c'è una parola da ricopiare, «non vuoto» è già implicito e un secondo
   * controllo direbbe la stessa cosa in modo più debole.
   */
  const bloccato = campo
    ? campo.parolaAttesa != null
      ? scritto !== campo.parolaAttesa
      : campo.obbligatorio === true && scritto === ""
    : false

  /*
   * L'aiuto, e il suo collegamento, esistono **insieme o per niente**: un
   * `aria-describedby` che punta a un `<p>` vuoto è un riferimento che il
   * lettore di schermo segue per non trovare nulla, e un `<p>` vuoto è
   * comunque uno spazio sotto il campo.
   */
  const aiuto =
    campo?.aiuto ??
    (campo?.parolaAttesa != null ? (
      <>
        Scrivi{" "}
        <span className="font-medium text-foreground">{campo.parolaAttesa}</span>{" "}
        per confermare.
      </>
    ) : null)

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
      await onConferma(valore)
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
        {campo || corpo ? (
          /*
           * Il terzo posto. `AlertDialogContent` è un `grid gap-4`, quindi
           * questo `<div>` è semplicemente la riga in mezzo — nessuna riga di
           * `alert-dialog` è stata toccata.
           *
           * `text-left`, esplicito. L'intestazione della primitiva è centrata
           * su schermo stretto (`place-items-center text-center`, e a
           * sinistra solo da `sm` in su): un'etichetta centrata sopra un
           * campo largo quanto il dialogo non sta sopra niente, e la riga
           * d'aiuto centrata sotto si legge come una didascalia invece che
           * come l'istruzione che è.
           */
          <div data-slot="confirm-dialog-body" className="text-left">
            {campo ? (
              <Field>
                <FieldLabel htmlFor={idCampo}>{campo.etichetta}</FieldLabel>
                {campo.multiriga ? (
                  <Textarea
                    id={idCampo}
                    data-slot="confirm-dialog-campo"
                    value={valore}
                    placeholder={campo.segnaposto}
                    disabled={inCorso}
                    aria-describedby={aiuto ? idAiuto : undefined}
                    onChange={(evento) => setValore(evento.target.value)}
                  />
                ) : (
                  <Input
                    id={idCampo}
                    data-slot="confirm-dialog-campo"
                    value={valore}
                    placeholder={campo.segnaposto}
                    disabled={inCorso}
                    autoComplete="off"
                    aria-describedby={aiuto ? idAiuto : undefined}
                    onChange={(evento) => setValore(evento.target.value)}
                  />
                )}
                {/*
                 * L'aiuto c'è **sempre** quando c'è una parola da ricopiare, e
                 * lo scrive il blocco se l'app non lo scrive: è l'unico posto
                 * in cui la parola si legge prima di doverla scrivere.
                 */}
                {aiuto ? (
                  <FieldDescription id={idAiuto}>{aiuto}</FieldDescription>
                ) : null}
              </Field>
            ) : null}
            {corpo}
          </div>
        ) : null}
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
            disabled={inCorso || bloccato}
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
