import { useEffect, type ReactNode } from 'react'

import { withThemeByClassName } from '@storybook/addon-themes'
import type { Decorator, Preview } from '@storybook/react-vite'

// Tailwind + i token del tema, che `src/index.css` importa dal registry.
import '../src/index.css'
// Il canvas di Storybook dipinto coi token, non col bianco di Storybook.
import './preview.css'

/**
 * Densità: l'interruttore agisce su un attributo del documento e basta —
 * nessuna primitiva va patchata, perché in Tailwind v4 le utility di
 * dimensione derivano da `--spacing` e la scala tipografica da `--text-*`.
 * Le due leve, i loro valori e le loro motivazioni stanno nel tema (M1.4);
 * qui c'è solo l'interruttore.
 *
 * È lo stesso attributo che un'app scrive una volta nel suo `index.html`, e
 * la scelta è esplicita e non `@media (pointer: coarse)`: è l'app a sapere se
 * si usa in campo — un tablet in ufficio non deve prendere la densità da
 * guanti.
 *
 * La pagina `Tema/Densità` mostra le due densità affiancate e non risente di
 * questo interruttore: fissa la propria con l'attributo su ciascuna colonna.
 */
function ConDensita({
  density,
  children,
}: {
  density: string
  children: ReactNode
}) {
  useEffect(() => {
    const root = document.documentElement
    if (density === 'touch') root.setAttribute('data-density', 'touch')
    else root.removeAttribute('data-density')
  }, [density])

  return children
}

const withDensity: Decorator = (Story, context) => (
  <ConDensita density={context.globals.density as string}>
    <Story />
  </ConDensita>
)

/**
 * La superficie si scrive come attributo sul `<body>` del canvas, e il
 * colore lo mette `preview.css` leggendo i token. È la stessa forma della
 * densità, e per la stessa ragione: l'attributo è un interruttore, il
 * valore sta nel tema. Così la superficie segue chiaro/scuro senza che
 * questo file sappia nulla dei colori.
 */
function ConSuperficie({ superficie, children }: { superficie: string; children: ReactNode }) {
  useEffect(() => {
    const body = document.body
    if (superficie && superficie !== 'pagina') body.setAttribute('data-superficie', superficie)
    else body.removeAttribute('data-superficie')
  }, [superficie])

  return children
}

const withSuperficie: Decorator = (Story, context) => (
  <ConSuperficie superficie={context.globals.superficie as string}>
    <Story />
  </ConSuperficie>
)

const preview: Preview = {
  decorators: [
    withSuperficie,
    withDensity,
    withThemeByClassName({
      themes: { chiaro: '', scuro: 'dark' },
      defaultTheme: 'chiaro',
      parentSelector: 'html',
    }),
  ],

  globalTypes: {
    /**
     * Su quale superficie del tema si guarda il componente. Tre, e non di
     * più: sono quelle per cui il tema dichiara **anche il colore del
     * testo**, cioè le coppie che `npm run check:contrast` verifica. Un
     * fondale senza il suo testo verificato non è un banco di prova
     * realistico — è un modo di rompere il contrasto senza accorgersene.
     */
    superficie: {
      description: 'Superficie del tema su cui poggia la story',
      toolbar: {
        title: 'Superficie',
        icon: 'paintbrush',
        items: [
          { value: 'pagina', title: 'Pagina' },
          { value: 'card', title: 'Card' },
          { value: 'sidebar', title: 'Sidebar' },
        ],
        dynamicTitle: true,
      },
    },

    density: {
      description: 'Densità dei controlli — in touch il bottone è 48px',
      toolbar: {
        title: 'Densità',
        icon: 'ruler',
        items: [
          { value: 'normale', title: 'Normale' },
          { value: 'touch', title: 'Touch' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    density: 'normale',
    viewport: { value: 'scrivania', isRotated: false },
    // Si parte dalla pagina: è la superficie su cui sta la maggior parte
    // dei componenti, e commutando chiaro/scuro segue da sé.
    superficie: 'pagina',
  },

  parameters: {
    layout: 'centered',

    /**
     * L'addon «backgrounds» di Storybook è **spento**, e al suo posto c'è
     * l'interruttore «Superficie» qui sotto. Due ragioni.
     *
     * I suoi fondali predefiniti sono `#F8F8F8` e `#333333`: colori che in
     * Tassullo non esistono, offerti *accanto* all'interruttore
     * chiaro/scuro — due controlli che sembrano fare la stessa cosa.
     *
     * E, provandolo, **l'addon cuoce il valore**: configurato con
     * `var(--background)` il fondale resta quello della modalità in cui è
     * stato applicato. Misurato: commutando su scuro il testo diventava
     * chiaro e il fondo restava quello chiaro. Illeggibile, senza errore.
     * La superficie la mette quindi il CSS (`preview.css`), dove `var()`
     * resta vivo e segue la modalità da sé.
     */
    backgrounds: { disable: true },

    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },

    // I due formati che contano per le app dello studio: la scrivania di
    // Anagrafe/Studio e il telefono di Officina in cantiere.
    viewport: {
      options: {
        scrivania: { name: 'Scrivania 1440', styles: { width: '1440px', height: '900px' } },
        telefono: { name: 'Telefono 375', styles: { width: '375px', height: '812px' } },
      },
    },

    // axe-core su ogni story. Passerà a 'error' in M2.9, quando l'audit
    // diventa automatico e continuo e fa fallire la CI.
    a11y: { test: 'todo' },
  },
}

export default preview
