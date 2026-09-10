import { expect, userEvent, waitFor, within } from 'storybook/test'

/**
 * Aprire i popup **in fase di misura**, che è la sola condizione in cui axe
 * li vede.
 *
 * ── Perché questo file esiste ───────────────────────────────────────────
 *
 * «Un popup non aperto non è un popup senza violazioni.» È la lezione più
 * cara della FASE 2 e l'ha pagata due volte. In M2.3 il conto delle
 * violazioni è passato **da 8 a 12** dentro la stessa sessione, appena
 * l'imbracatura ha imparato ad aprire anche il `select`: le quattro nuove
 * non erano nate quel giorno, erano sempre state lì, dietro un pannello
 * chiuso. E in M2.6 si è visto il rovescio — a popup **aperto** Base UI
 * rende inerte il grilletto del combobox, axe lo salta, e un `button-name`
 * *critical* spariva dal conto.
 *
 * Da cui la regola che questo file mette in pratica: ogni componente con un
 * popup si misura in **tutti e due** gli stati, e quale popup si apre
 * davvero dev'essere **scritto**, non presunto. Le story che aprono qualcosa
 * lo dichiarano chiamando una di queste funzioni; `npm run prove:popup`
 * conta le dichiarazioni e le confronta coi componenti che un popup ce
 * l'hanno, così una dimenticanza si vede invece di passare per «zero
 * violazioni».
 *
 * ── Perché si aspetta il contenuto e non basta il clic ──────────────────
 *
 * Base UI monta il pannello in un portale, **fuori** da `canvasElement`, e
 * ci sposta il fuoco dentro `requestAnimationFrame`. Un `click` senza attesa
 * misurerebbe la pagina un fotogramma prima che il pannello esista: verde,
 * e per il motivo sbagliato. Si aspetta quindi che il grilletto dichiari
 * `aria-expanded="true"` — oppure, per i modali che il grilletto non lo
 * marcano, che il contenuto compaia nel documento.
 */

/**
 * Il gate gira in due **stati**, non solo in due modalità: `aperto` e
 * `chiuso`. Con `VITE_POPUP=chiuso` queste funzioni non fanno niente, e la
 * story si misura come si presenta a riposo; senza, il popup si apre e si
 * misura quello. Le due passate trovano cose diverse — è il rovescio scoperto
 * in M2.6: a popup aperto il grilletto del combobox diventa inerte e axe **non
 * lo guarda più**, quindi un `button-name` *critical* esiste solo nella
 * passata `chiuso`.
 */
const soloChiuso = import.meta.env.VITE_POPUP === 'chiuso'

/**
 * Il grilletto di un componente. Si passa un **selettore**, non un nome di
 * `data-slot`, e la ragione l'ha data il `combobox`: lì `ComboboxTrigger`
 * rende *attraverso* `InputGroupButton`, che riscrive lo `data-slot` col
 * proprio — nel DOM il grilletto è `input-group-button`, non
 * `combobox-trigger`. Un'imbracatura che sapesse solo cercare per slot
 * avrebbe dovuto mentire su chi apre cosa.
 *
 * Restituisce `null` quando il grilletto è **disabilitato**, e non è
 * indulgenza: un controllo disabilitato non ha popup, quindi lo stato
 * «aperto» per quella story non esiste e misurarla chiusa è la misura
 * giusta. Se invece il grilletto **manca**, si lancia: vuol dire che la
 * dichiarazione nel meta non corrisponde alla story, ed è esattamente
 * l'errore che questo file esiste per non lasciar passare in silenzio.
 */
function grilletto(canvasElement: HTMLElement, selettore: string): HTMLElement | null {
  const el = canvasElement.querySelector<HTMLElement>(selettore)
  if (!el) throw new Error(`Nessun grilletto ${selettore} in questa story`)
  if (el.hasAttribute('disabled') || el.getAttribute('data-disabled') !== null) return null
  return el
}

/** Il pannello è nel portale, cioè fuori dal canvas: si cerca nel documento. */
async function aspettaContenuto(slot: string) {
  await waitFor(() => {
    expect(document.querySelector(`[data-slot="${slot}"]`)).toBeInTheDocument()
  })
}

/**
 * Apre col clic: `dropdown-menu`, `select`, `combobox`, `popover`, `dialog`,
 * `alert-dialog`, `sheet`, `drawer`.
 */
export function apriCol(selettoreGrilletto: string, slotContenuto: string) {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    if (soloChiuso) return
    const el = grilletto(canvasElement, selettoreGrilletto)
    if (!el) return
    await userEvent.click(el)
    await aspettaContenuto(slotContenuto)
  }
}

/** Apre col tasto destro: `context-menu`. */
export function apriColDestro(selettoreGrilletto: string, slotContenuto: string) {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    if (soloChiuso) return
    const el = grilletto(canvasElement, selettoreGrilletto)
    if (!el) return
    await userEvent.pointer({ keys: '[MouseRight]', target: el })
    await aspettaContenuto(slotContenuto)
  }
}

/** Apre passandoci sopra: `tooltip`, `hover-card`. */
export function apriPassandoci(selettoreGrilletto: string, slotContenuto: string) {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    if (soloChiuso) return
    const el = grilletto(canvasElement, selettoreGrilletto)
    if (!el) return
    await userEvent.hover(el)
    await aspettaContenuto(slotContenuto)
  }
}

/** Apre col bottone che porta questo testo, quando non c'è uno `data-slot`. */
export function apriIlBottone(nome: RegExp, slotContenuto: string) {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    if (soloChiuso) return
    await userEvent.click(within(canvasElement).getByRole('button', { name: nome }))
    await aspettaContenuto(slotContenuto)
  }
}
