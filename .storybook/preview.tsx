import { useEffect, type ReactNode } from 'react'

import { withThemeByClassName } from '@storybook/addon-themes'
import type { Decorator, Preview } from '@storybook/react-vite'

// Tailwind + i token del tema, che `src/index.css` importa dal registry.
import '../src/index.css'

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

const preview: Preview = {
  decorators: [
    withDensity,
    withThemeByClassName({
      themes: { chiaro: '', scuro: 'dark' },
      defaultTheme: 'chiaro',
      parentSelector: 'html',
    }),
  ],

  globalTypes: {
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
  },

  parameters: {
    layout: 'centered',

    // Le tre sezioni della style guide, nell'ordine in cui si leggono:
    // il tema regge le primitive, le primitive reggono i blocchi.
    options: {
      storySort: {
        order: ['Introduzione', 'Tema', 'Primitive', 'Blocchi', 'Pagine'],
      },
    },

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
