// Il marchio Microsoft, **fuori dal registry**.
//
// `pagina-login` prende il logo come **nodo** (`logoMicrosoft`), non come
// file proprio, e la ragione è doppia: è un marchio di terzi, e i suoi
// quattro colori sono **fissi per specifica** — messi in un file del
// registry sarebbero quattro esadecimali dentro un `fill`, cioè la regola 3
// violata in modo non sanabile (non esiste un token del tema che possa
// diventare il rosso Microsoft senza smettere di essere il rosso Microsoft).
//
// Sta quindi qui, in `.storybook/prove/`, che è la cartella che **nessun
// item spedisce** — la stessa dove vive l'imbracatura di misura di M2.9. Le
// story lo passano come lo passerebbe Studio: dal proprio codice di pagina.
//
// Tracciato: i quattro quadrati del logo Microsoft, colori della guida al
// marchio (#F25022, #7FBA00, #00A4EF, #FFB900).
/**
 * Il marchio Microsoft, che le scene passano a `pagina-login` con
 * `logoMicrosoft`. È un marchio di terzi a colori fissi, quindi non sta nel
 * registry: l'app lo passa dal proprio codice.
 */
export function LogoMicrosoft() {
  return (
    <svg viewBox="0 0 21 21" aria-hidden focusable="false">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  )
}
