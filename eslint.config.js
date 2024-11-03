import eslintConfig from './configs/eslint-config/index.js';

export default [
  {
    ignores: ['**/node_modules/**', '**/build/**', '**/.turbo/**'],
    files: ['**/*.{js,jsx,ts,tsx}'],
  },
  ...eslintConfig,
];
