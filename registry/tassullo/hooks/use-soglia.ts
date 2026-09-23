"use client"

import * as React from "react"

/**
 * **La finestra supera la soglia che la pagina ha dichiarato?**
 *
 * Una riga di JavaScript per un bivio che oggi sei pagine in due app fanno
 * in due modi diversi: una lista che su schermo largo è una tabella e su
 * schermo stretto è un elenco di schede.
 *
 * ```tsx
 * const largo = useSoglia("(min-width: 1024px)")
 * return largo ? <Tabella … /> : <Schede … />
 * ```
 *
 * ## La query la dichiara la pagina, e non è pigrizia
 *
 * Quante colonne ha quella lista lo sa solo la pagina che la scrive. Nove
 * colonne stanno strette dove tre stanno larghe: una soglia cotta qui dentro
 * sarebbe giusta per una lista e sbagliata per le altre cinque, e la
 * sesta la aggirerebbe con un `matchMedia` scritto a mano — cioè tornando
 * esattamente al punto di partenza.
 *
 * ## Perché non `useIsMobile`, che pure c'è
 *
 * `use-mobile.ts` **non si tocca**, e le ragioni sono due, entrambe misurate.
 *
 * I suoi 768px governano l'**arredamento**: la sidebar passa a `Sheet` e il
 * dialogo a `Drawer` allo stesso pixel, ed è una cosa sola — un'interfaccia
 * che cambia grammatica a 40px di distanza si legge come un guasto
 * (`responsive-dialog.tsx`). Il bivio tabella/schede è **contenuto**, e non
 * ha nessuna ragione di cadere dove cade l'arredamento.
 *
 * E `useIsMobile` legge `matchMedia` dentro un `useEffect` che chiama
 * `setState`: **il primo render torna sempre `false`, cioè scrivania.** Su un
 * dialogo non morde, perché al primo render è chiuso; su una lista sì — sul
 * telefono disegnerebbe la tabella a nove colonne e la sostituirebbe un
 * fotogramma dopo, cioè uno sfarfallio e un layout buttato via.
 *
 * ## Perché `useSyncExternalStore` e non uno stato con un effetto
 *
 * È la differenza che questo file esiste per fare. `getSnapshot` legge
 * `matchMedia` **durante il render**, quindi il primo fotogramma è già
 * quello giusto e non c'è niente da correggere dopo. Un `useState` +
 * `useEffect` non può arrivarci: l'effetto gira dopo che il DOM è stato
 * scritto, e il `setState` che ne esce è un secondo render per dire una cosa
 * che si sapeva già — che è poi il difetto che oxlint segnala come
 * `react(set-state-in-effect)`.
 *
 * Il terzo argomento, `getServerSnapshot`, vale **`false`**: nel rendering
 * lato server una finestra non c'è, e `false` è la risposta mobile-first —
 * su una query in forma `min-width` significa «sotto la soglia», cioè la
 * faccia stretta. `useSyncExternalStore` sa che il valore del server e
 * quello del client possono divergere e fa ri-renderizzare dopo
 * l'idratazione **senza** l'errore di mismatch che lo stesso codice scritto
 * con `useState` produrrebbe.
 *
 * **La query si scrive in forma `min-width`.** Non è un vincolo di tipo, è
 * una convenzione che tiene: `true` vuol dire «c'è spazio», `false` vuol dire
 * «non c'è», e il valore di partenza è quello prudente. Scritta al
 * contrario (`max-width`) il default diventerebbe «schermo grande», cioè
 * esattamente il difetto di `useIsMobile` rimesso in piedi da un'altra parte.
 *
 * @param query una media query CSS, in forma `min-width` — p.es.
 *   `"(min-width: 1024px)"`. La dichiara la pagina.
 * @returns `true` se la finestra la soddisfa **adesso**, già al primo render.
 */
function useSoglia(query: string): boolean {
  /*
   * `subscribe` e `getSnapshot` devono essere **stabili**: React li confronta
   * per identità e una funzione nuova a ogni render farebbe disiscrivere e
   * riscrivere l'ascoltatore a ogni giro. Dipendono dalla sola `query`, che è
   * una stringa — cioè un valore primitivo, non un array costruito inline,
   * che sarebbe nuovo a ogni render e farebbe ripartire l'effetto senza fine
   * e senza nessun errore.
   */
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onStoreChange)
      return () => mql.removeEventListener("change", onStoreChange)
    },
    [query]
  )

  const getSnapshot = React.useCallback(
    () => window.matchMedia(query).matches,
    [query]
  )

  return React.useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export { useSoglia }
