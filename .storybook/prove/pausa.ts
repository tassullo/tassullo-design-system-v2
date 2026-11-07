/**
 * La pausa delle animazioni che Storybook lascia accesa quando una scena cade
 * nel controllo di axe (`docs/DECISIONI.md` §93).
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
