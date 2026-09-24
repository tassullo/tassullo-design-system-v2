/*
 * **Diverge da shadcn, e di proposito** (proposta #49, 2026-09-24,
 * `docs/DECISIONI.md` §67). L'originale legge `matchMedia` in un `useEffect`
 * che chiama `setState`: il primo render dice sempre «scrivania» e il valore
 * vero arriva un render dopo — sul telefono la colonna del guscio si disegna
 * per un fotogramma nella forma larga. `react-hooks` 7 lo segnala come
 * errore (`set-state-in-effect`) nel lint delle app. Qui lo stesso hook, con
 * la stessa firma e la stessa soglia, su `useSyncExternalStore`, come
 * `use-soglia.ts`.
 *
 * Gli hook non hanno un originale in `registry/.upstream/`: alla prossima
 * versione di shadcn si confronta a mano con `npx shadcn@latest view
 * @shadcn/use-mobile`, e se l'hanno corretto loro si torna al loro.
 */
import * as React from "react"

const MOBILE_BREAKPOINT = 768

const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// La finestra si legge durante il render, non in un effetto: il primo
// render dà già il valore giusto, senza un secondo render che lo corregge.
function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}
