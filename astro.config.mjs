import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import solid from '@astrojs/solid-js';
import tailwind from '@astrojs/tailwind';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import { remarkAsides } from './src/remarkPlugin/remark-asides.js';
import { remarkModifiedTime } from './src/remarkPlugin/remark-modified-time.mjs';
import { resetRemark } from './src/remarkPlugin/reset-remark.js';

function customRehypeLazyLoadImage() {
  return function (tree) {
    visit(tree, function (node) {
      if (node.tagName === 'img') {
        node.properties['data-src'] = node.properties.src;
        node.properties.src = '/spinner.gif';
        node.properties['data-alt'] = node.properties.alt;
        node.properties.alt = 'default';
      }
    });
  };
}

export default defineConfig({
  site: 'https://arias9306.github.io/',
  integrations: [
    sitemap(),
    tailwind(),
    solid(),
    expressiveCode({
      plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
      themes: ['github-dark', 'github-light'],
      styleOverrides: {
        codeFontFamily: 'jetbrains-mono',
        uiFontFamily: 'jetbrains-mono',
      },
      themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
    }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkModifiedTime, resetRemark, remarkDirective, remarkAsides({})],
    rehypePlugins: [customRehypeLazyLoadImage],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
      wrap: true,
    },
  },
});
