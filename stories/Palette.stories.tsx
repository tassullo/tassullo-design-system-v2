import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Tema / Palette — M1.3 (le due modalità), completata in M1.5.
 *
 * Le due modalità si guardano **affiancate**, non una alla volta con
 * l'interruttore: una palette scura si giudica per contrasto con quella
 * chiara, e alternandole la memoria dell'occhio non regge. Funziona perché il
 * tema emette i token chiari anche su `.light` e non solo su `:root`, quindi
 * una colonna chiara dentro una pagina scura è possibile (e viceversa).
 *
 * Le tessere leggono i token con `var(--token)`: non sono valori arbitrari —
 * che la regola 3 del CLAUDE.md vieta — è il token stesso, letto per nome. È
 * anche l'unico modo di enumerarli: una classe `bg-${nome}` non verrebbe
 * generata affatto, perché Tailwind v4 cerca nomi di classe interi nel
 * sorgente (errore preso in M1.2 e da non ripetere).
 *
 * **Il valore oklch non è scritto qui: è letto dal DOM** (M1.5), con
 * `getComputedStyle`, dall'elemento stesso che quel colore lo sta mostrando.
 * È la stessa scelta della pagina `Tema/Densità`, e per la stessa ragione: un
 * elenco di valori copiati a mano resta verde anche il giorno in cui il tema
 * smette di funzionare. Letto dal DOM, invece, la colonna chiara e quella
 * scura riportano ciascuna il proprio valore senza che la story sappia nulla
 * della palette — che resta dove deve stare, in `scripts/hex-to-oklch.ts`.
 *
 * **Click-to-copy** (eredita l'idea dalla palette di `styleguide.html` del
 * v1): un clic sulla riga copia il **nome del token**, `--primary`, non il
 * valore. È il nome che si scrive nel codice; il valore è lì per riconoscere
 * il colore, non per incollarlo — incollarlo sarebbe esattamente il valore
 * arbitrario che la regola 3 vieta.
 *
 * I rapporti di contrasto NON si ricalcolano qui: la fonte è
 * `npm run check:contrast`, che è il gate. Una seconda misura in pagina
 * potrebbe divergere dalla prima, e allora non si saprebbe a quale credere.
 *
 * **Niente `opacity-*` sul testo, mai, e qui meno che altrove.** La prima
 * versione di questa pagina metteva `opacity-80` sulla terza riga di ogni
 * tessera per attenuarla: axe-core ha trovato 9 violazioni di contrasto, tutte
 * lì. Una coppia che passa a 4.55:1 sbiadita all'80% scende a 3.17:1 — la
 * pagina che dimostra il contrasto lo stava rompendo. L'opacità su un testo
 * NON è una scelta tipografica: è un cambio di colore che nessun token
 * dichiara e che il gate delle coppie non può vedere, perché avviene in
 * composizione, nel browser. Se una riga deve pesare meno, si usa un token
 * più tenue — che è già stato misurato — o un gradino tipografico più piccolo.
 */

type Tessera = { token: string; su?: string; nota?: string; velo?: boolean }
type Gruppo = { titolo: string; testo?: string; tessere: Tessera[] }

/** Coppie fondo/testo: si guarda se il testo si legge, non se il colore piace. */
const COPPIE: Gruppo[] = [
  {
    titolo: 'Superfici e testo',
    tessere: [
      { token: 'background', su: 'foreground' },
      { token: 'card', su: 'card-foreground' },
      { token: 'popover', su: 'popover-foreground' },
      { token: 'muted', su: 'muted-foreground' },
      { token: 'accent', su: 'accent-foreground', nota: 'hover dei menu, NON il brand' },
      { token: 'secondary', su: 'secondary-foreground' },
    ],
  },
  {
    titolo: 'Brand',
    testo: 'L’arancio è identico nelle due modalità. Cambiano l’hover — sul chiaro scurisce, sullo scuro schiarisce — e --accent-ink, che sul fondo scuro coincide col brand.',
    tessere: [
      { token: 'primary', su: 'primary-foreground', nota: 'testo NERO, mai bianco' },
      { token: 'primary-hover', su: 'primary-foreground' },
      { token: 'primary-subtle', su: 'accent-ink', nota: 'chip attivo' },
      { token: 'primary-border', su: 'foreground' },
    ],
  },
  {
    titolo: 'Stati semantici — livello pieno',
    testo: 'Un colore per stato in entrambe le modalità, con una sola eccezione: --info, che sul fondo scuro dava 2.20:1 ed era un badge invisibile.',
    tessere: [
      { token: 'success', su: 'success-foreground' },
      { token: 'warning', su: 'warning-foreground' },
      { token: 'info', su: 'info-foreground' },
      { token: 'destructive', su: 'destructive-foreground' },
    ],
  },
  {
    titolo: 'Stati semantici — livello tenue (gli alert di M2.4)',
    testo: 'Le quattro famiglie devono pesare uguale: se una salta all’occhio più delle altre, l’alert corrispondente sembrerà più grave di quello che è.',
    tessere: [
      { token: 'success-subtle', su: 'success-subtle-foreground' },
      { token: 'warning-subtle', su: 'warning-subtle-foreground' },
      { token: 'info-subtle', su: 'info-subtle-foreground' },
      { token: 'destructive-subtle', su: 'destructive-subtle-foreground' },
    ],
  },
  {
    titolo: 'Sidebar',
    testo: 'Sul chiaro è antracite e stacca dalla pagina. Sullo scuro la pagina è già antracite: la sidebar sale di un gradino, al livello della card.',
    tessere: [
      { token: 'sidebar', su: 'sidebar-foreground', nota: 'voce a riposo' },
      { token: 'sidebar', su: 'sidebar-accent-foreground', nota: 'voce attiva' },
      { token: 'sidebar-accent', su: 'sidebar-accent-foreground', nota: 'voce in hover' },
      { token: 'sidebar-primary', su: 'sidebar-primary-foreground' },
    ],
  },
]

/** Token senza un testo sopra: si guarda il colore, non la leggibilità. */
const TINTE: Gruppo[] = [
  {
    titolo: 'Bordi e anello di focus',
    tessere: [
      { token: 'border' },
      { token: 'border-strong' },
      { token: 'input' },
      { token: 'ring' },
      { token: 'success-border' },
      { token: 'warning-border' },
      { token: 'info-border', nota: 'derivato' },
      { token: 'destructive-border' },
    ],
  },
  {
    titolo: 'Sidebar — bordo, focus, e il velo dei modali',
    testo: '--overlay è l’unico token con un canale alfa: si guarda sopra il contenuto, non affiancato. La tessera lo mostra sopra un fondo a bande, dove il velo si vede per quello che è.',
    tessere: [
      { token: 'sidebar-border' },
      { token: 'sidebar-ring' },
      { token: 'overlay', nota: 'velo dei modali (M2.3)', velo: true },
    ],
  },
  {
    titolo: 'Serie dei grafici — provvisorie (M2.8)',
    tessere: [
      { token: 'chart-1' },
      { token: 'chart-2' },
      { token: 'chart-3' },
      { token: 'chart-4' },
      { token: 'chart-5' },
    ],
  },
]

/**
 * Legge il valore risolto di un token **dall'elemento stesso**, non da una
 * tabella. Le proprietà custom si ereditano, quindi la stessa riga dentro la
 * colonna `.light` e dentro la `.dark` restituisce due valori diversi senza
 * che il componente sappia in quale delle due si trova.
 */
function useValore(token: string) {
  const ref = useRef<HTMLButtonElement>(null)
  const [valore, setValore] = useState('')
  useEffect(() => {
    const el = ref.current
    if (!el) return
    setValore(getComputedStyle(el).getPropertyValue(`--${token}`).trim())
  }, [token])
  return { ref, valore }
}

/**
 * Una riga copiabile: nome del token, valore letto, e il clic che copia il
 * nome. `aria-live` sull'esito perché un cambio di etichetta senza annuncio
 * non esiste per chi usa uno screen reader.
 */
function RigaToken({ token, colore }: { token: string; colore?: string }) {
  const { ref, valore } = useValore(token)
  const [copiato, setCopiato] = useState(false)

  async function copia() {
    const testo = `--${token}`
    try {
      await navigator.clipboard.writeText(testo)
    } catch {
      // Contesto non sicuro o permesso negato: la via vecchia funziona ancora.
      const area = document.createElement('textarea')
      area.value = testo
      document.body.append(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopiato(true)
    setTimeout(() => setCopiato(false), 1200)
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={copia}
      title={`Copia --${token}`}
      className="block w-full cursor-pointer rounded-sm border border-transparent px-1 py-0.5 text-left font-mono text-xs hover:border-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      style={colore ? { color: `var(--${colore})` } : undefined}
    >
      <span className="block break-all">--{token}</span>
      <span className="block break-all">{valore}</span>
      <span aria-live="polite" className="block">
        {copiato ? 'copiato' : ' '}
      </span>
    </button>
  )
}

function Coppia({ token, su, nota }: Tessera) {
  return (
    <div
      className="rounded-md border p-3"
      style={{ background: `var(--${token})`, borderColor: 'var(--border)' }}
    >
      <RigaToken token={token} colore={su} />
      <div className="mt-1 text-base font-medium" style={{ color: `var(--${su})` }}>
        Testo su questo fondo
      </div>
      <RigaToken token={su!} colore={su} />
      {nota && (
        <div className="px-1 font-mono text-xs" style={{ color: `var(--${su})` }}>
          {nota}
        </div>
      )}
    </div>
  )
}

function Tinta({ token, nota, velo }: Tessera) {
  return (
    <div>
      <div
        className="relative h-10 overflow-hidden rounded-md border"
        style={{ borderColor: 'var(--border-strong)' }}
      >
        {/* Sotto un velo ci vuole qualcosa da velare, o --overlay sembra un
            grigio pieno come gli altri. È una scacchiera e non una scritta di
            proposito: axe misura il contrasto di qualunque testo visibile, e
            un testo sotto un velo è per definizione «sovrapposto da un altro
            elemento» — un *incomplete* che resterebbe acceso per sempre senza
            dimostrare niente (misurato: 2 nodi, uno per colonna). Le bande
            sono fatte di due token, non di due colori. */}
        {velo && (
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(45deg, var(--foreground) 0 8px, var(--background) 8px 16px)',
            }}
          />
        )}
        <div className="absolute inset-0" style={{ background: `var(--${token})` }} />
      </div>
      <div className="mt-1 text-muted-foreground">
        <RigaToken token={token} />
        {nota && <div className="px-1 font-mono text-xs">{nota}</div>}
      </div>
    </div>
  )
}

function Colonna({ modo, etichetta }: { modo: 'light' | 'dark'; etichetta: string }) {
  return (
    <div className={`${modo} bg-background text-foreground`}>
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-xl font-semibold">{etichetta}</h2>
        <p className="font-mono text-xs text-muted-foreground">
          {modo === 'light' ? ':root, .light' : '.dark'}
        </p>
      </div>

      <div className="space-y-6 px-5 py-5">
        {COPPIE.map((g) => (
          <section key={g.titolo}>
            <h3 className="text-md font-semibold">{g.titolo}</h3>
            {g.testo && <p className="mt-1 text-sm text-muted-foreground">{g.testo}</p>}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {g.tessere.map((t) => (
                <Coppia key={`${t.token}/${t.su}/${t.nota ?? ''}`} {...t} />
              ))}
            </div>
          </section>
        ))}

        {TINTE.map((g) => (
          <section key={g.titolo}>
            <h3 className="text-md font-semibold">{g.titolo}</h3>
            {g.testo && <p className="mt-1 text-sm text-muted-foreground">{g.testo}</p>}
            <div className="mt-2 grid grid-cols-4 gap-2">
              {g.tessere.map((t) => (
                <Tinta key={t.token} {...t} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

/**
 * Quanti token la pagina mostra davvero: contato dalle due tabelle qui sopra,
 * non scritto a mano. Un numero scritto a mano è vero il giorno in cui lo si
 * scrive e falso al primo token aggiunto — e nessuno se ne accorge.
 */
const QUANTI = new Set([
  ...COPPIE.flatMap((g) => g.tessere.flatMap((t) => [t.token, t.su!])),
  ...TINTE.flatMap((g) => g.tessere.map((t) => t.token)),
]).size

function Affiancate() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto max-w-page px-5 pt-6 pb-2">
        <h1 className="text-title font-semibold text-foreground">Palette</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Tutti i {QUANTI} token del tema, nelle due modalità. Il valore è letto dal DOM; un clic
          sulla riga copia il nome del token.
        </p>
      </header>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2">
        <Colonna modo="light" etichetta="Chiaro" />
        <Colonna modo="dark" etichetta="Scuro" />
      </div>
    </div>
  )
}

const meta = {
  title: 'Tema/Palette',
  component: Affiancate,
  parameters: {
    layout: 'fullscreen',
    // L'interruttore Modalità non serve qui: la story mostra già entrambe le
    // modalità, e commutarlo cambierebbe solo la cornice attorno alle colonne.
    // Resta attivo — è un global, non un addon che si possa spegnere per
    // story — ma è innocuo: ciascuna colonna dichiara la propria classe.

    // Né la superficie: questa è la pagina che le superfici le *mostra*, e
    // dipinge il proprio fondo da sé su ciascuna colonna.
  },
} satisfies Meta<typeof Affiancate>

export default meta
type Story = StoryObj<typeof meta>

export const ChiaroEScuro: Story = { name: 'Chiaro e scuro affiancati' }
