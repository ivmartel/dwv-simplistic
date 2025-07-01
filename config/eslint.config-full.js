import jsdoc from 'eslint-plugin-jsdoc';

import eslintConfig from '../eslint.config.js';

export default [
  ...eslintConfig,
  jsdoc.configs['flat/recommended-typescript-flavor'],
  {
    plugins: {
      jsdoc
    },
    rules: {
      // tag lines
      // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/tag-lines.md#readme
      'jsdoc/tag-lines': ['error', 'any', {startLines: 1}],
      // require description complete sentence
      // https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-description-complete-sentence.md
      'jsdoc/require-description-complete-sentence': ['error']
    }
  }
];
