/**
 * La forma di serie di un segnaposto di `tassullo-testo-segnaposto`, e la
 * lettura del suo nome. Sta in un file a parte, senza React, perché chi
 * controlla lo stesso testo fuori dal campo — un modulo, un server — la possa
 * importare o ricopiare: se i due controlli tolgono spazi diversi, il colore
 * della pillola e l'esito del salvataggio non concordano. Proposta #107
 * (Anagrafe): su 254.000 testi di prova, 19 disaccordi con `str.strip()` di
 * Python, zero con lo stesso insieme.
 *
 * `shadcn add` toglie tutto ciò che sta prima della prima istruzione: la
 * spiegazione per chi installa sta sotto `SPAZI_SEGNAPOSTO`, non sopra.
 */
export const SPAZI_SEGNAPOSTO =
  "\u0009\u000B\u000C\u000D                  　﻿"

// Qui sopra, uno per carattere, gli spazi ammessi in un segnaposto fra le
// graffe e il nome: `{{ famiglia.nome }}` è lo stesso dato di
// `{{famiglia.nome}}`. Sono quelli di `[^\S\n]`: ogni carattere che per
// JavaScript è uno spazio (`\s`), tranne l'a capo U+000A. Sono 24, gli
// stessi con e senza il flag `u`:
//
//   U+0009  tabulazione            U+2000–U+200A  undici spazi tipografici
//   U+000B  tabulazione verticale  U+2028  separatore di riga
//   U+000C  salto pagina           U+2029  separatore di paragrafo
//   U+000D  ritorno a capo         U+202F  spazio stretto non separabile
//   U+0020  spazio                 U+205F  spazio matematico medio
//   U+00A0  spazio non separabile  U+3000  spazio ideografico
//   U+1680  spazio ogham           U+FEFF  spazio di larghezza nulla
//
// Chi controlla lo stesso testo altrove toglie attorno al nome questi e solo
// questi, o il colore della pillola e l'esito del controllo non concordano.
// Le funzioni pronte di altri linguaggi non coincidono: `str.strip()` di
// Python, per esempio, toglie anche l'a capo, U+0085 e da U+001C a U+001F, e
// non toglie U+FEFF.

/**
 * Un segnaposto: due graffe, un nome senza spazi né graffe, due graffe, con
 * gli spazi di `SPAZI_SEGNAPOSTO` ammessi attorno al nome.
 */
export const FORMA_SEGNAPOSTO = /\{\{[^\S\n]*[^{}\s]+[^\S\n]*\}\}/

const SOLO_UN_SEGNAPOSTO = /^\{\{[^\S\n]*([^{}\s]+)[^\S\n]*\}\}$/

/**
 * Il nome scritto in un segnaposto della forma di serie, senza le graffe e
 * senza gli spazi attorno: da `{{ famiglia.nome }}` dà `famiglia.nome`. Dà
 * `null` se il testo non è un segnaposto, e uno solo.
 */
export function nomeSegnaposto(segnaposto: string): string | null {
  return SOLO_UN_SEGNAPOSTO.exec(segnaposto)?.[1] ?? null
}
