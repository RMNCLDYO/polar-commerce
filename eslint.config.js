import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'convex/_generated/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      // React 19.2: Use recommended-latest for React Compiler-powered lint rules
      // Includes: refs, set-state-in-render, purity, immutability, and more
      ...reactHooks.configs['recommended-latest'].rules,
    },
  },
];
