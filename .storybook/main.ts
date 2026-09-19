import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  // Le story dei componenti stanno ACCANTO al file del componente, dentro il
  // registry (PIANO.md §1); `stories/` in root ospita le pagine trasversali
  // della style guide, tipo la Palette (M1.5).
  stories: [
    '../registry/**/*.mdx',
    '../registry/**/*.stories.@(ts|tsx)',
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
  ],
  // `@storybook/addon-themes` è stato tolto: il suo `withThemeByClassName`
  // commutava una volta sola (misurato in DECISIONI.md §17), e l'interruttore
  // Modalità è ora scritto in `preview.tsx` come quelli di Densità e
  // Superficie. Il pacchetto resta in `package.json` per M2.9, dove servirà
  // il suo compagno `addon-vitest`; se non servisse, si disinstalla.
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',

  /**
   * La cornice di Storybook è un documento a parte e non passa da Vite come
   * il canvas: per darle Inter serve un file raggiungibile via URL. Si serve
   * la cartella del tema **dov'è**, invece di copiarne il CSS in `public/` —
   * una copia di un file generato diverge al primo ritocco, ed è esattamente
   * ciò che la disciplina dei file generati esiste per impedire.
   */
  staticDirs: [
    { from: '../registry/tassullo/theme', to: '/tema' },
    // Le foto di esempio di `Primitive/EntityImage`. Stanno in `public/` — che
    // Storybook non serve da sé — e **non vengono spedite da nessun item**:
    // `registry.json` elenca i file uno per uno, e le story non ci sono. Sono
    // disegni, non fotografie: dicono se il riquadro è della misura giusta, non
    // se una foto vera si riconosce.
    { from: '../public/esempi', to: '/esempi' },
  ],
}

export default config
