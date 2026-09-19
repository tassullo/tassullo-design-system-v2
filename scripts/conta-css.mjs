// Conta i SELETTORI veri di un file CSS: niente `grep -c "{"`, che conta anche
// @media, @keyframes, @supports e i fotogrammi 0%/100%.
// Un "selettore" = un elemento di una lista di selettori davanti a un blocco di
// dichiarazioni (`.a, .b { }` = 2). Le at-rule contenitrici non contano, ma le
// regole dentro di loro sì.
import { readFileSync } from 'node:fs'

export function contaSelettori(css) {
  // via i commenti
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '')
  let sel = 0, regole = 0, atRule = 0
  let buf = ''
  let depth = 0
  const pile = []
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (c === '{') {
      const testa = buf.trim()
      buf = ''
      if (testa.startsWith('@')) { atRule++; pile.push('at') }
      else if (/^(\d+%|from|to)\b/.test(testa) && pile.includes('kf')) { pile.push('kf-frame') }
      else {
        regole++
        sel += testa.split(',').filter((s) => s.trim()).length
        pile.push('rule')
      }
      if (testa.startsWith('@keyframes')) pile[pile.length - 1] = 'kf'
      depth++
    } else if (c === '}') { pile.pop(); depth--; buf = '' }
    else buf += c
  }
  return { selettori: sel, regole, atRule }
}

const files = process.argv.slice(2)
let tS = 0, tR = 0, tA = 0
for (const f of files) {
  const r = contaSelettori(readFileSync(f, 'utf8'))
  console.log(`${r.selettori}\t${r.regole}\t${r.atRule}\t${f}`)
  tS += r.selettori; tR += r.regole; tA += r.atRule
}
console.log(`${tS}\t${tR}\t${tA}\tTOTALE (selettori / regole / at-rule) su ${files.length} file`)
