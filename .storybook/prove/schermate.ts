/**
 * Finte schermate per le scene del supporto: disegnate su un canvas coi
 * colori del tema, letti a runtime. Niente rete, niente file binari nel
 * repository, niente esadecimali. Fuori dal registry: nessun item la spedisce.
 */

function token(nome: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim()
}

/** Una pagina d'app stilizzata: colonna, fascia, una card con delle righe e il titolo. */
export function disegnaSchermata(titolo: string, larghezza = 1200, altezza = 800): HTMLCanvasElement {
  const tela = document.createElement('canvas')
  tela.width = larghezza
  tela.height = altezza
  const c = tela.getContext('2d')
  if (!c) return tela
  const colonna = Math.round(larghezza * 0.18)
  const fascia = Math.round(altezza * 0.1)
  c.fillStyle = token('--background')
  c.fillRect(0, 0, larghezza, altezza)
  c.fillStyle = token('--sidebar')
  c.fillRect(0, 0, colonna, altezza)
  c.fillStyle = token('--border')
  c.fillRect(colonna, fascia, larghezza - colonna, 2)
  c.fillStyle = token('--primary')
  c.fillRect(larghezza - 200, fascia / 2 - 20, 160, 40)
  c.fillStyle = token('--muted-foreground')
  for (let r = 0; r < 6; r++) c.fillRect(24, fascia + 30 + r * 44, colonna - 48, 14)
  c.fillStyle = token('--card')
  c.fillRect(colonna + 32, fascia + 32, larghezza - colonna - 64, altezza - fascia - 64)
  c.fillStyle = token('--muted')
  for (let r = 0; r < 8; r++) {
    c.fillRect(colonna + 64, fascia + 140 + r * 56, (larghezza - colonna - 160) * (r % 3 === 0 ? 0.9 : 0.6), 20)
  }
  c.fillStyle = token('--foreground')
  c.font = `600 ${Math.round(altezza / 18)}px Inter, sans-serif`
  c.fillText(titolo, colonna + 64, fascia + 100)
  return tela
}

export function comeBlob(tela: HTMLCanvasElement) {
  return new Promise<Blob>((risolvi, rifiuta) =>
    tela.toBlob((b) => (b ? risolvi(b) : rifiuta(new Error('canvas vuoto'))), 'image/png'),
  )
}

/** Una schermata come file PNG, come se l'avesse scelta chi scrive la richiesta. */
export async function fileSchermata(nome: string, titolo: string) {
  const blob = await comeBlob(disegnaSchermata(titolo, 800, 520))
  return new File([blob], nome, { type: 'image/png' })
}

/** Mette dei file nel campo file come una scelta dal computer. */
export function scegliFile(campo: HTMLInputElement, ...file: File[]) {
  const trasferimento = new DataTransfer()
  file.forEach((f) => trasferimento.items.add(f))
  campo.files = trasferimento.files
  campo.dispatchEvent(new Event('change', { bubbles: true }))
}
