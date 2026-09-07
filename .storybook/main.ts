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
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-themes',
  ],
  framework: '@storybook/react-vite',
}

export default config
