import { useEffect, type ReactNode } from 'react'

import { withThemeByClassName } from '@storybook/addon-themes'
import type { Decorator, Preview } from '@storybook/react-vite'

// Tailwind + token del tema. Oggi è ancora la palette di default di shadcn:
// da M1.2 questo file importerà `@/registry/tassullo/theme/tassullo-theme.css`.
import '../src/index.css'

/**
 * Densità: in Tailwind v4 le utility di dimensione derivano da `--spacing`,
 * quindi l'interruttore agisce su un attributo del documento e basta — nessuna
 * primitiva va patchata. Scelta esplicita e non `@media (pointer: coarse)`:
 * è l'app a sapere se si usa in campo (PIANO.md, M1.4).
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
      description: 'Densità dei controlli (normale / touch, ≥44px)',
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
