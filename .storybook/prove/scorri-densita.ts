import { expect, waitFor } from 'storybook/test'

/**
 * La prova della passata WebKit: scorre il riquadro che scorre, passa a
 * touch, scorre ancora, torna a normale, due volte, e fallisce se React ha
 * segnalato un ciclo di aggiornamenti («Maximum update depth exceeded»).
 *
 * ── Perché esiste ───────────────────────────────────────────────────────
 *
 * Il corpo virtualizzato di tabella e griglia rileggeva dopo ogni render
 * l'altezza della prima riga e, se diversa, chiamava `measure()`. In WebKit,
 * a 1×, righe alte 36,5px si arrotondano a 36 e 37 alternati: la prima riga
 * cambiava a ogni giro e React si fermava col limite degli aggiornamenti.
 * Chromium non lo mostra, e il gate girava solo lì; e anche in WebKit una
 * scena che si apre e basta non lo trova, perché il ciclo parte solo quando
 * lo scorrimento e la densità cambiano le righe montate
 * (`docs/DECISIONI.md` §69 e §70).
 *
 * ── Perché i fotogrammi e non un tempo ──────────────────────────────────
 *
 * Il virtualizzatore reagisce allo scorrimento e ai `ResizeObserver`, che
 * scattano al fotogramma: aspettare fotogrammi e non millisecondi rende la
 * prova uguale su una macchina lenta e su una veloce. Headless la pagina è
 * visibile e `requestAnimationFrame` scatta (non nel pannello del browser
 * dell'app, dove questa prova non si lancia).
 */
const fotogramma = () => new Promise<void>((r) => requestAnimationFrame(() => r()))
const aspetta = async (n: number) => {
  for (let i = 0; i < n; i++) await fotogramma()
}

export async function scorriECambiaDensita({ canvasElement }: { canvasElement: HTMLElement }) {
  const errori: string[] = []
  const suErrore = (e: ErrorEvent) => errori.push(String(e.message))
  const consoleErrore = console.error
  console.error = (...a: unknown[]) => {
    errori.push(a.map(String).join(' '))
    consoleErrore(...a)
  }
  window.addEventListener('error', suErrore)
  const radice = document.documentElement
  const densitaDiPartenza = radice.getAttribute('data-density')
  try {
    const riquadro = await waitFor(() => {
      const trovato = [...canvasElement.querySelectorAll<HTMLElement>('*')].find(
        (el) => el.scrollHeight > el.clientHeight + 50 && getComputedStyle(el).overflowY !== 'visible',
      )
      if (!trovato) throw new Error('nessun riquadro che scorre nella scena')
      return trovato
    })
    for (const densita of ['touch', 'normale', 'touch', 'normale']) {
      for (let i = 0; i < 6; i++) {
        riquadro.scrollTop += 180
        await aspetta(3)
      }
      // Come l'interruttore Densità della barra: `touch` è l'attributo, normale è la sua assenza.
      if (densita === 'touch') radice.setAttribute('data-density', 'touch')
      else radice.removeAttribute('data-density')
      await aspetta(20)
    }
    await aspetta(30)
    await expect(riquadro.scrollTop, 'il riquadro non è scorso').toBeGreaterThan(0)
  } finally {
    if (densitaDiPartenza === null) radice.removeAttribute('data-density')
    else radice.setAttribute('data-density', densitaDiPartenza)
    window.removeEventListener('error', suErrore)
    console.error = consoleErrore
  }
  const cicli = errori.filter((e) => /Maximum update depth/i.test(e))
  await expect(cicli, `errori: ${errori.slice(0, 3).join(' | ')}`).toEqual([])
}
