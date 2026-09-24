/**
 * `tassullo-responsive-dialog` — **una chiamata sola**: sulla scrivania è un
 * dialogo, sul telefono è un cassetto che sale dal basso.
 *
 * ── Il pattern è di shadcn; qui è impacchettato ─────────────────────────
 *
 * shadcn lo documenta nell'esempio `drawer-dialog`, e la sua forma è questa:
 *
 * ```tsx
 * const isDesktop = useMediaQuery("(min-width: 768px)")
 * if (isDesktop) { return <Dialog>…</Dialog> }
 * return <Drawer>…</Drawer>
 * ```
 *
 * È corretto, e non è riusabile. Quel codice **duplica il contenuto** — titolo,
 * descrizione, corpo, piedini, due volte — quindi ogni modifica va fatta in due
 * posti e la seconda si dimentica; e vive nella pagina, quindi ogni app, e ogni
 * pagina dentro ogni app, si riscrive la stessa `if`. Con undici pagine e tre
 * applicazioni la soglia finisce scritta in trenta punti diversi, e il giorno in
 * cui va spostata si sposta in ventinove.
 *
 * Qui la scelta la fa un **contesto**, e i figli sono scritti una volta sola:
 *
 * ```tsx
 * <ResponsiveDialog>
 *   <ResponsiveDialogTrigger render={<Button>Modifica</Button>} />
 *   <ResponsiveDialogContent>
 *     <ResponsiveDialogHeader>
 *       <ResponsiveDialogTitle>Modifica prodotto</ResponsiveDialogTitle>
 *       <ResponsiveDialogDescription>…</ResponsiveDialogDescription>
 *     </ResponsiveDialogHeader>
 *     <ResponsiveDialogBody><ModuloProdotto /></ResponsiveDialogBody>
 *     <ResponsiveDialogFooter>
 *       <ResponsiveDialogClose render={<Button variant="outline">Annulla</Button>} />
 *       <Button type="submit">Salva</Button>
 *     </ResponsiveDialogFooter>
 *   </ResponsiveDialogContent>
 * </ResponsiveDialog>
 * ```
 *
 * Nessuna `if` nella pagina, e il contenuto esiste in un posto solo.
 *
 * ── Perché **qui** la soglia è sulla viewport, e non è una smentita ─────
 *
 * `docs/DECISIONI.md` §31 dice il contrario per il guscio, per la fascia e per
 * la tabella: le soglie guardano l'**elemento**, non lo schermo, perché sotto i
 * 768px la colonna esce dal DOM e lo schermo che si allarga di 1px restringe
 * l'area utile di 255. Quel ragionamento vale per ciò che sta **dentro** il
 * guscio.
 *
 * Un dialogo non ci sta dentro. È reso in un **portale** appeso alla radice del
 * documento, `position: fixed`, fuori dal flusso: la colonna non gli toglie
 * niente, e il suo contenitore *è* la viewport. La discontinuità che rendeva
 * sbagliata la media query negli altri tre casi qui non esiste — non c'è nessun
 * antenato la cui larghezza salti. Una container query, per di più, non avrebbe
 * su cosa appoggiarsi: il contenitore da interrogare dovrebbe essere un elemento
 * che al momento della decisione non è ancora montato.
 *
 * E c'è una ragione di sostanza sopra quella tecnica: la scelta fra dialogo e
 * cassetto non è «quanto spazio ho», è «che forma ha il dispositivo». Un
 * cassetto che sale dal basso, con la maniglia da trascinare, è una grammatica
 * da telefono. Si è valutato di leggere il **puntatore** invece della larghezza
 * (`(pointer: coarse)`): è più vicino alla domanda vera, ma sbaglia i due casi
 * che contano per noi — il portatile col touch screen in cantiere, che
 * riceverebbe un cassetto su uno schermo da 15 pollici, e il telefono collegato
 * a una tastiera. La larghezza è un'approssimazione, ed è quella che shadcn
 * documenta: si resta lì.
 *
 * ── Il prezzo, dichiarato ───────────────────────────────────────────────
 *
 * Attraversare la soglia con il dialogo **aperto** smonta un albero e ne monta
 * un altro: `Dialog` e `Drawer` sono due componenti diversi, non lo stesso
 * componente con un'altra classe. Ciò che è stato scritto in un campo non
 * controllato si perde. Non è aggirabile senza tenere lo stato del modulo fuori
 * dal dialogo — che è comunque la forma giusta, ed è quella che `form-field`
 * incoraggia, perché con react-hook-form lo stato sta in `useForm()` e non nel
 * DOM. Succede solo trascinando il bordo della finestra attraverso i 768px
 * mentre si compila: raro, e il rimedio esiste.
 */
import { createContext, useContext, type ComponentProps } from "react"

import { cn } from "cn"
import { useIsMobile } from "@/registry/tassullo/hooks/use-mobile"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/tassullo/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/tassullo/ui/drawer"

/**
 * ── La soglia non è scritta qui ─────────────────────────────────────────
 *
 * È `useIsMobile()` — l'hook che shadcn installa con `sidebar` e che il registry
 * ha già, a **768px**. Non se ne scrive un secondo: quello che serve, shadcn
 * ce l'ha già.
 *
 * Il vantaggio non è risparmiare dieci righe, è che **il dialogo cambia forma
 * allo stesso pixel in cui la cambia il guscio**: sotto i 768 la colonna esce
 * dal DOM e diventa un pannello che scorre da un lato, e nello stesso momento il
 * dialogo diventa un cassetto che sale dal basso. Due soglie scritte in due posti
 * sarebbero rimaste uguali per un po' e poi si sarebbero staccate — e
 * un'interfaccia che cambia grammatica a 40px di distanza si legge come un
 * guasto.
 *
 * Per la stessa ragione **non c'è una prop `soglia`**: una soglia che ogni app
 * può spostare è una soglia che in tre app vale tre numeri, e la disciplina che
 * questo registry difende è l'opposto.
 *
 * La soglia non scala con la densità, ed è voluto: la densità è la misura del
 * **guanto**, la soglia è la forma dello **schermo**. Un tablet da 800px in
 * densità touch resta un dispositivo su cui un dialogo centrato sta comodo.
 *
 * ── Il difetto che `useIsMobile` si porta dietro, e perché qui non morde ─
 *
 * L'hook di shadcn legge `matchMedia` in un `useEffect` che chiama `setState`:
 * il primo render torna sempre `false`, cioè **scrivania**, e il valore vero
 * arriva un fotogramma dopo. `useSyncExternalStore` non avrebbe quel difetto.
 * Qui però il primo fotogramma è quello del pannello **chiuso** — non c'è niente
 * da vedere, e lo scambio avviene prima che qualcosa possa essere aperto.
 *
 * Morde in un caso solo: un dialogo già aperto al montaggio (`defaultOpen`, o
 * uno stato controllato che nasce `true`). Lì su un telefono si vedrebbe il
 * dialogo comparire e *diventare* cassetto. Se capita, il rimedio non è una
 * copia locale dell'hook: è correggerlo **qui**, in `use-mobile.ts`, dove
 * l'unico costo è che `sidebar` ne beneficia insieme a noi.
 */
type Forma = "dialog" | "drawer"

/*
 * ── Perché ci sono quattro `as` in questo file, e perché sono tutti qui ──
 *
 * `Dialog` e `Drawer` di Base UI hanno la stessa *forma* — Root, Trigger,
 * Close, Popup, Title, Description — ma due tipi **nominalmente** distinti:
 * il `handle` del cassetto porta un marchio `__drawerBrand`, il suo
 * `onOpenChange` riceve un `reason` con un caso in più, e lo stato del popup
 * ha campi diversi. TypeScript ha ragione a rifiutare l'unione: non sono lo
 * stesso componente, e un `handle` di dialogo dentro un cassetto sarebbe un
 * errore vero.
 *
 * Ciò che questo blocco espone, però, è il **sottoinsieme comune**: apertura,
 * grilletto, chiusura, titolo, descrizione, classi. Su quel sottoinsieme le
 * due API coincidono davvero. I `as` stanno quindi tutti in questo file, uno
 * per famiglia, e il tipo pubblico è quello del dialogo — che è la forma
 * predefinita, e quella che l'autocompletamento deve suggerire. Il prezzo è
 * dichiarato: passare un `handle` o un `payload` a `<ResponsiveDialog>` non
 * viene fermato dal compilatore e non funzionerebbe nella forma a cassetto.
 * Non è una prop che questo blocco documenta.
 */
const DrawerComeDialog = Drawer as unknown as typeof Dialog
const DrawerTriggerComeDialog = DrawerTrigger as unknown as typeof DialogTrigger
const DrawerCloseComeDialog = DrawerClose as unknown as typeof DialogClose
const DrawerContentComeDialog =
  DrawerContent as unknown as typeof DialogContent

const FormaCtx = createContext<Forma>("dialog")

/** La forma in cui il dialogo si sta rendendo. Utile per gli `aria-label`. */
export function useFormaDialogo(): Forma {
  return useContext(FormaCtx)
}

export type ResponsiveDialogProps = ComponentProps<typeof Dialog> & {
  // `auto` sceglie con la larghezza. `dialog` e `drawer` la forzano — servono
  // a mettere in scena le due forme senza cambiare viewport, che è l'unico modo
  // di **misurarle tutte e due** (un test automatico spesso la viewport non
  // la cambia), e a quelle pagine che una forma la vogliono sempre.
  /**
   * `"auto"`, il predefinito, sceglie dalla larghezza della finestra: dialogo
   * sulla scrivania, cassetto sul telefono. `"dialog"` e `"drawer"` fissano
   * una forma, per una pagina che ne vuole sempre una o per mostrarle tutte e
   * due.
   */
  forma?: "auto" | Forma
}

/**
 * La radice. Monta `Dialog` o `Drawer` e lo dice ai figli attraverso il
 * contesto: sono loro a scegliere la propria controparte, quindi i figli si
 * scrivono una volta sola.
 */
export function ResponsiveDialog({
  forma = "auto",
  ...props
}: ResponsiveDialogProps) {
  const stretto = useIsMobile()
  const scelta: Forma = forma === "auto" ? (stretto ? "drawer" : "dialog") : forma
  const Radice = scelta === "dialog" ? Dialog : DrawerComeDialog
  return (
    <FormaCtx.Provider value={scelta}>
      <Radice {...props} />
    </FormaCtx.Provider>
  )
}

// Il grilletto.
//
// Il `data-slot` è **nostro** e non quello della primitiva sottostante, e non è
// un vezzo: `dialog-trigger` e `drawer-trigger` sono due selettori diversi per
// la stessa cosa, quindi un test che apre il dialogo per selettore dovrebbe
// sapere in che forma si sta rendendo prima di
// poter cercare il grilletto. Con un nome solo non deve saperlo.
/**
 * Il grilletto. Ha `data-slot="responsive-dialog-trigger"` in tutte e due
 * le forme, così un test lo trova senza sapere quale forma si sta rendendo.
 */
export function ResponsiveDialogTrigger(
  props: ComponentProps<typeof DialogTrigger>,
) {
  const forma = useFormaDialogo()
  const T = forma === "dialog" ? DialogTrigger : DrawerTriggerComeDialog
  return <T data-slot="responsive-dialog-trigger" {...props} />
}

export function ResponsiveDialogClose(
  props: ComponentProps<typeof DialogClose>,
) {
  const forma = useFormaDialogo()
  const C = forma === "dialog" ? DialogClose : DrawerCloseComeDialog
  return <C data-slot="responsive-dialog-close" {...props} />
}

/**
 * Il pannello.
 *
 * Nella forma a cassetto il contenuto **non** ha respiro proprio — `DrawerContent`
 * è un contenitore nudo, e intestazione e piedini se lo mettono da sé — mentre
 * `DialogContent` ha il suo `p-4`. È la ragione per cui esiste
 * `ResponsiveDialogBody` qui sotto: senza, il corpo starebbe incollato ai bordi
 * nella sola forma a cassetto, che è il difetto che l'esempio di shadcn corregge
 * a mano scrivendo `className="px-4"` sul modulo.
 *
 * Nel cassetto l'altezza massima la mette la primitiva; nel dialogo no — shadcn
 * non ne dichiara nessuna, quindi un contenuto lungo esce dallo schermo sopra e
 * sotto e non c'è modo di raggiungerlo. `max-h-dvh` più `overflow-y-auto` è il
 * minimo che rimette il contenuto dentro un'area raggiungibile, ed è un gradino
 * tarato del tema, non una misura scritta a mano.
 */
export function ResponsiveDialogContent({
  className,
  ...props
}: ComponentProps<typeof DialogContent>) {
  const forma = useFormaDialogo()
  if (forma === "dialog") {
    return (
      <DialogContent
        data-slot="responsive-dialog-content"
        className={cn("max-h-dvh overflow-y-auto", className)}
        {...props}
      />
    )
  }
  /*
   * `showCloseButton` è del dialogo: nel cassetto la chiusura è il gesto di
   * trascinare, e una crocetta in alto a destra sarebbe un secondo modo di
   * fare la stessa cosa in un posto scomodo per il pollice. Si toglie qui
   * invece di inoltrarla, o Base UI la scriverebbe nel DOM come attributo
   * sconosciuto.
   */
  const { showCloseButton, ...restoCassetto } = props
  void showCloseButton
  return (
    <DrawerContentComeDialog
      data-slot="responsive-dialog-content"
      className={className}
      {...restoCassetto}
    />
  )
}

/**
 * L'intestazione. Nel cassetto è centrata per impostazione della primitiva —
 * qui torna a sinistra, perché un dialogo e un cassetto che dicono la stessa
 * cosa devono **leggersi** nello stesso modo, e l'allineamento a sinistra è
 * quello della forma su cui si lavora tutto il giorno. È la stessa correzione
 * che fa l'esempio `drawer-dialog` di shadcn.
 */
export function ResponsiveDialogHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  const forma = useFormaDialogo()
  if (forma === "dialog") {
    return <DialogHeader className={className} {...props} />
  }
  /*
   * La variante, non la classe nuda. `DrawerHeader` centra con
   * `group-data-[swipe-axis=y]/drawer-popup:text-center`, e un `text-left`
   * appoggiato accanto **perde**: tailwind-merge non riconosce come coppia due
   * classi di cui una porta una variante, quindi le tiene entrambe e vince la
   * più specifica. Misurato: `textAlign` restava `center` in tutte e tre le
   * celle a cassetto. Si sovrascrive con la stessa variante.
   */
  return (
    <DrawerHeader
      className={cn(
        "gap-2 group-data-[swipe-axis=y]/drawer-popup:text-left",
        className,
      )}
      {...props}
    />
  )
}

/**
 * Il corpo: ciò che sta fra intestazione e piedini.
 *
 * Esiste per una ragione sola e misurabile — **il respiro orizzontale non è lo
 * stesso nelle due forme**, e senza questo componente lo si scriverebbe a mano
 * in ogni punto d'uso, cioè lo si dimenticherebbe. Nel cassetto è anche la
 * parte che scorre, quando il contenuto supera l'altezza disponibile: in un
 * dialogo scorre tutto il pannello, in un cassetto no, o si scorrerebbero via
 * anche i bottoni.
 */
export function ResponsiveDialogBody({
  className,
  ...props
}: ComponentProps<"div">) {
  const forma = useFormaDialogo()
  return (
    <div
      data-slot="responsive-dialog-body"
      className={cn(
        forma === "drawer" && "min-h-0 flex-1 overflow-y-auto px-4 py-2",
        className,
      )}
      {...props}
    />
  )
}

/**
 * I piedini.
 *
 * Le due primitive li disegnano diversamente, ed è giusto così: nel dialogo
 * sono una fascia con un fondo e un bordo in alto, appoggiata al fondo del
 * riquadro; nel cassetto sono bottoni impilati a tutta larghezza, che è la
 * forma che si preme col pollice. Qui non si uniforma niente — si sceglie.
 *
 * **L'ordine dei bottoni**: l'azione principale per ultima nel DOM. Nel dialogo
 * `flex-col-reverse` più `sm:flex-row` la porta a destra sulla riga; nel
 * cassetto resta in cima alla pila, che è il posto più vicino al pollice.
 */
export function ResponsiveDialogFooter({
  className,
  ...props
}: ComponentProps<"div">) {
  const forma = useFormaDialogo()
  if (forma === "dialog") {
    return <DialogFooter className={className} {...props} />
  }
  return (
    <DrawerFooter className={cn("flex-col-reverse pt-2", className)} {...props} />
  )
}

export function ResponsiveDialogTitle(
  props: ComponentProps<typeof DialogTitle>,
) {
  const forma = useFormaDialogo()
  const T = forma === "dialog" ? DialogTitle : DrawerTitle
  return <T {...props} />
}

export function ResponsiveDialogDescription(
  props: ComponentProps<typeof DialogDescription>,
) {
  const forma = useFormaDialogo()
  const D = forma === "dialog" ? DialogDescription : DrawerDescription
  return <D {...props} />
}
