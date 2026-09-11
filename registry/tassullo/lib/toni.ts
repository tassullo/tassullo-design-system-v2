/**
 * `toni` — le quattro famiglie semantiche del tema, come stringhe di classi.
 *
 * ── Perché non sono varianti ────────────────────────────────────────────
 *
 * Perché **shadcn dà questa risposta**, e la dà due volte con le stesse
 * parole. Sulla pagina di `alert`: «You can customize the alert colors by
 * adding custom classes such as `bg-amber-50 dark:bg-amber-950`». Sulla pagina
 * di `badge`, sezione *Custom Colors*: «You can customize the colors of a
 * badge by adding custom classes such as `bg-green-50 dark:bg-green-800`». E
 * l'API Reference di `badge` elenca sei varianti — `default`, `secondary`,
 * `destructive`, `outline`, `ghost`, `link` — e nessuna semantica.
 *
 * La scala della regola 4bis si ferma quindi al **gradino 1**: la strada c'è
 * già. La strada opposta era anche stata **provata e misurata** in M2.4:
 * aggiungere `info`, `success` e `warning` ai nomi di variante del `cva` manda
 * `check:registry` in rosso — «diverge dall'originale FUORI dalle stringhe di
 * classi: nomi di varianti» — e il gate fa il suo mestiere, perché un nome di
 * variante in più non si distingue più da ciò che ha cambiato shadcn quando
 * esce una versione nuova.
 *
 * ── Perché allora esiste questo file ────────────────────────────────────
 *
 * Perché shadcn si ferma un passo prima di dove serve a noi. Il suo esempio
 * scrive `bg-green-50` **a mano, nel punto d'uso**: due cose che qui non vanno.
 * La prima è la regola 3 del `CLAUDE.md` — i colori escono dai token del tema,
 * non dalla tavolozza di Tailwind. La seconda pesa di più: un alert si scrive
 * una volta per pagina, ma un badge di stato si scrive **dentro la definizione
 * di colonna di ogni tabella di ogni app**, e una terna di classi ripetuta lì
 * è esattamente il punto da cui le app del v1 hanno cominciato a divergere.
 *
 * Quindi: **la forma di shadcn, con i nostri token in un posto solo.** Nessuna
 * primitiva cambia, `badge.tsx` e `alert.tsx` restano identici all'originale,
 * il gate resta verde e `componenti-propri.json` resta vuoto.
 *
 * ── Perché i quattro pesano uguale ──────────────────────────────────────
 *
 * Perché le terne del tema sono costruite così: nella modalità scura i tenui
 * si specchiano **a gradini fissi, uguali per tutte le famiglie**
 * (`docs/DECISIONI.md`, la palette scura). Se una saltasse all'occhio più
 * delle altre, quello stato sembrerebbe più grave di quello che è. Tutte e
 * quattro le coppie fondo/testo sono verificate da `npm run check:contrast`.
 *
 * ── Uso ─────────────────────────────────────────────────────────────────
 *
 * ```tsx
 * <Badge className={TONO.success}>Attivo</Badge>
 * <Badge className={TONO.destructive}>Scaduto</Badge>
 * ```
 *
 * In una colonna di tabella, la mappa dallo stato del dominio al tono si
 * dichiara una volta accanto alle colonne:
 *
 * ```tsx
 * const TONO_STATO = {
 *   pubblicato: TONO.success,
 *   'in revisione': TONO.info,
 *   bozza: TONO.warning,
 *   archiviato: TONO.neutro,
 * } as const
 * ```
 *
 * `destructive` c'è **anche** come variante di `badge` e di `alert`, ed è la
 * sola delle quattro: lì la si usi, che è il gradino 1. Questa voce serve a
 * chi mappa tutti e quattro gli stati dalla stessa parte e non vuole che uno
 * solo arrivi per un'altra strada.
 */

/**
 * `border` / `bg` / `text` delle quattro famiglie tenui, più il neutro.
 *
 * Il **neutro** non è una famiglia semantica e non ha token propri: è lo stato
 * che non dice niente — «archiviato», «non applicabile» — e sta qui perché una
 * mappa di stati che lo lascia fuori costringe a uscire dal file per un caso
 * solo. Sotto sono i neutri di shadcn, cioè la stessa cosa che fa la variante
 * `secondary`.
 */
export const TONO = {
  success:
    "border-success-border bg-success-subtle text-success-subtle-foreground",
  warning:
    "border-warning-border bg-warning-subtle text-warning-subtle-foreground",
  info: "border-info-border bg-info-subtle text-info-subtle-foreground",
  destructive:
    "border-destructive-border bg-destructive-subtle text-destructive-subtle-foreground",
  neutro: "border-border bg-muted text-muted-foreground",
} as const

/** Il nome di un tono. */
export type Tono = keyof typeof TONO

/**
 * La stessa terna per `alert`, che ha bisogno di una classe in più: la sua
 * descrizione è `text-muted-foreground` di suo, e senza questa resterebbe
 * grigia dentro un riquadro colorato.
 */
export const TONO_ALERT = {
  success: `${TONO.success} *:data-[slot=alert-description]:text-success-subtle-foreground`,
  warning: `${TONO.warning} *:data-[slot=alert-description]:text-warning-subtle-foreground`,
  info: `${TONO.info} *:data-[slot=alert-description]:text-info-subtle-foreground`,
  destructive: `${TONO.destructive} *:data-[slot=alert-description]:text-destructive-subtle-foreground`,
} as const
