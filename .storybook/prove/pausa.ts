/**
 * La pausa delle animazioni che Storybook lascia accesa quando una scena cade
 * nel controllo di axe (`docs/DECISIONI.md` §95).
 *
 * ── Cosa fa Storybook ───────────────────────────────────────────────────
 *
 * Nei test (Vitest in un browser), finita la `play`, Storybook chiama
 * `pauseAnimations()`: aggiunge in `<head>` uno `<style>` senza `id` che mette
 * in pausa ogni animazione (`animation-play-state: paused !important`), poi
 * esegue gli `afterEach` — fra cui quello di `addon-a11y`, che lancia axe —, e
 * solo dopo toglie lo stile. Le due righe, in `runStory` di Storybook 10.6:
 *
 *     cleanUp = pauseAnimations()
 *     await story.applyAfterEach(context), await cleanUp?.()
 *
 * Non c'è un `finally`. Se axe trova una violazione, `afterEach` lancia, lo
 * stile **resta**, e resta per tutte le scene seguenti dello stesso file, che
 * girano nella stessa pagina. Da lì ogni animazione d'uscita parte ferma a
 * zero, Base UI aspetta che finisca per smontare il popup, e il popup non si
 * smonta più: una caduta vera ne trascina con sé altre, tutte con le
 * animazioni `exit:paused:0`.
 *
 * ── Cosa fa questo file ─────────────────────────────────────────────────
 *
 * Toglie lo stile rimasto, all'inizio di ogni scena (lo chiama un
 * `beforeEach` in `.storybook/vitest.setup.ts`). A quel punto uno stile così
 * può essere solo un avanzo: quello della scena in corso nasce dopo la sua
 * `play`. Lo riconosce dal testo, perché Storybook non gli dà un `id`; se una
 * versione nuova di Storybook cambia quel testo, la funzione non trova più
 * niente e la scena `Si chiude dopo una pausa rimasta, prova` del popover
 * cade, invece di tacere.
 */

import { waitFor } from 'storybook/test'

const AVANZO = ['animation-delay: 0s !important', 'animation-play-state: paused !important']

/** Gli stili di pausa di Storybook presenti adesso nella pagina. */
export const stiliDiPausa = (radice: Document = document) =>
  [...radice.head.querySelectorAll('style:not([id])')].filter((stile) =>
    AVANZO.every((riga) => stile.textContent?.includes(riga))
  )

/** Toglie gli stili di pausa rimasti da una scena precedente e dice quanti. */
export function togliPausaRimasta(radice: Document = document) {
  const avanzi = stiliDiPausa(radice)
  for (const stile of avanzi) stile.remove()
  return avanzi.length
}

/** Vero quando la scena gira nell'imbracatura di Vitest, non nel canvas. */
export const nelleProve = () => '__vitest_browser__' in globalThis

/**
 * I popup che si stanno ancora chiudendo: Base UI dà `data-ending-style` a ciò
 * che ha un'uscita in corso. Non conta ciò che sta dentro un contenitore
 * `hidden`: il menu del `select` chiuso resta nella pagina così, e le sue parti
 * possono tenere l'attributo, ma axe non le legge.
 */
export const inChiusura = (radice: Document = document) =>
  [...radice.querySelectorAll<HTMLElement>('[data-ending-style]')].filter((el) => !el.closest('[hidden]'))

/**
 * Aspetta, prima di axe, che nessun popup si stia più chiudendo
 * (`docs/DECISIONI.md` §96).
 *
 * ── Perché serve ────────────────────────────────────────────────────────
 *
 * Storybook mette in pausa le animazioni dopo la `play` e prima di axe, e la
 * pausa riparte da capo ogni animazione e la ferma all'istante zero. Se la
 * scena finisce mentre un popup si sta chiudendo, la sua uscita resta ferma lì
 * per tutta la lettura di axe, Base UI aspetta che finisca per smontarlo, e
 * axe legge il popup a metà: un `popover` ha ancora le guardie del fuoco con
 * `tabindex="0"` e `aria-hidden`. Se la scena finisca prima o dopo che il
 * popup sia smontato dipende dai fotogrammi, cioè dal carico della macchina.
 *
 * ── Cosa fa ─────────────────────────────────────────────────────────────
 *
 * Gira come `afterEach` dell'imbracatura: Storybook li esegue in ordine
 * inverso, quindi dopo quelli della scena e prima di quello di axe. Se niente
 * si sta chiudendo esce subito. Altrimenti toglie la pausa, aspetta che le
 * uscite finiscano, e rimette **lo stesso** stile, così Storybook lo toglie da
 * sé dopo axe. Un popup che in cinque secondi non si è chiuso fa cadere la
 * scena con il suo nome: è un difetto, non una lentezza.
 */
export async function aspettaPaginaFerma(radice: Document = document) {
  if (inChiusura(radice).length === 0) return
  const pause = stiliDiPausa(radice)
  for (const stile of pause) stile.remove()
  try {
    await waitFor(
      () => {
        const restano = inChiusura(radice)
        if (restano.length > 0) {
          const nomi = restano.map((el) => el.getAttribute('data-slot') ?? el.tagName.toLowerCase())
          throw new Error(`La scena è finita con un popup in chiusura che non si chiude: ${nomi.join(', ')}`)
        }
      },
      { timeout: 5000 }
    )
  } finally {
    for (const stile of pause) radice.head.appendChild(stile)
  }
}
