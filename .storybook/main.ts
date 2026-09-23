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
    // Il solo `inter.css`, non la cartella del tema: il resto — il CSS dei
    // token coi suoi commenti di testa, il marchio con la sua nota di
    // provenienza — è l'artefatto del registry, e un visitatore della style
    // guide non ha motivo di scaricarlo da qui.
    { from: '../registry/tassullo/theme/inter.css', to: '/tema/inter.css' },
    // Le foto di esempio di `Primitive/EntityImage`. Stanno in `public/` — che
    // Storybook non serve da sé — e **non vengono spedite da nessun item**:
    // `registry.json` elenca i file uno per uno, e le story non ci sono. Sono
    // disegni, non fotografie: dicono se il riquadro è della misura giusta, non
    // se una foto vera si riconosce.
    { from: '../public/esempi', to: '/esempi' },
  ],

  /**
   * `public/` resta fuori dalla style guide. È la radice del workbench, cioè
   * il server del registry in sviluppo: dentro c'è `public/r/`, i JSON che la
   * CLI installa, e in locale `public/fonts/`, i caratteri di fonderia che nel
   * repo non entrano. Vite la copierebbe per intero in `storybook-static/` —
   * una terza copia del registry pubblicata su Pages, dove nessuno deve
   * installarla, e dei file di fonderia in ogni build fatta in locale. Le sole
   * cose di `public/` che le story usano, le immagini d'esempio, arrivano da
   * `staticDirs` qui sopra.
   */
  viteFinal: (config) => ({ ...config, publicDir: false }),
}

export default config
