import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      indent: ['warn', 2],
      semi: ['warn', 'never'],
      quotes: ['error', 'single'],
      'no-unexpected-multiline': 'warn',
      'no-multiple-empty-lines': 1,
      'no-multi-spaces': 1,
      'no-lonely-if': 1,
      'no-trailing-spaces': 1,
      'keyword-spacing': 1,
      'array-bracket-spacing': 1,
      'space-before-blocks': ['warn', 'always'],
      'object-curly-spacing': ['warn', 'always'],
    },
  },
]
