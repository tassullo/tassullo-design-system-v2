import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Tema / Palette — M1.3, la prova visiva che chiude D2.
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
 * I rapporti di contrasto NON si ricalcolano qui: la fonte è
 * `npm run check:contrast`, che è il gate. Una seconda misura in pagina
 * potrebbe divergere dalla prima, e allora non si saprebbe a quale credere.
 * Il click-to-copy e l'elenco completo dei token arrivano in M1.5.
 */

type Tessera = { token: string; su?: string; nota?: string }
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

function Coppia({ token, su, nota }: Tessera) {
  return (
    <div
      className="rounded-md border p-3"
      style={{ background: `var(--${token})`, borderColor: 'var(--border)' }}
    >
      <div className="font-mono text-xs" style={{ color: `var(--${su})` }}>
        --{token}
      </div>
      <div className="mt-1 text-base font-medium" style={{ color: `var(--${su})` }}>
        Testo su questo fondo
      </div>
      <div className="mt-1 font-mono text-xs opacity-80" style={{ color: `var(--${su})` }}>
        --{su}
        {nota ? ` · ${nota}` : ''}
      </div>
    </div>
  )
}

function Tinta({ token, nota }: Tessera) {
  return (
    <div>
      <div
        className="h-10 rounded-md border"
        style={{ background: `var(--${token})`, borderColor: 'var(--border-strong)' }}
      />
      <div className="mt-1 font-mono text-xs text-muted-foreground">
        --{token}
        {nota ? ` · ${nota}` : ''}
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

function Affiancate() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto max-w-page px-5 pt-6 pb-2">
        <h1 className="text-title font-semibold text-foreground">Palette</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Le due modalità affiancate. Il gate del contrasto (
          <code className="font-mono text-sm">npm run check:contrast</code>) verifica{' '}
          <strong>24 coppie per modalità, 48 in tutto</strong>, con soglia 4.5:1: qui non si
          rimisurano i numeri, si guarda ciò che i numeri non dicono — se le famiglie pesano
          uguale, se qualcosa salta all’occhio più di quanto meriti.
        </p>
        <p className="mt-2 text-base text-muted-foreground">
          I tre punti da giudicare a occhio, dove la misura non decide: il crema di{' '}
          <code className="font-mono text-sm">--warning</code> sul fondo scuro (passa, ma è la cosa
          più luminosa della pagina), la sidebar scura alzata a{' '}
          <code className="font-mono text-sm">#1C1C1C</code> per non sparire nella pagina, e il blu
          di <code className="font-mono text-sm">--info</code>, l’unico pieno ricalcolato.
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
    // L'interruttore del tema non serve qui: la story mostra già entrambe le
    // modalità, e commutarlo cambierebbe solo la cornice attorno alle colonne.
    themes: { disable: true },
  },
} satisfies Meta<typeof Affiancate>

export default meta
type Story = StoryObj<typeof meta>

export const ChiaroEScuro: Story = { name: 'Chiaro e scuro affiancati' }
