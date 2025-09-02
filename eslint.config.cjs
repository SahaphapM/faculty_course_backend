import pluginTs from '@typescript-eslint/eslint-plugin';
import parserTs from '@typescript-eslint/parser';
import js from '@eslint/js';

export default [
  // Ignore build output
  { ignores: ['dist/**', 'node_modules/**'] },

  // Base JS recommended
  js.configs.recommended,

  // TypeScript support
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        // Let ESLint find the tsconfig automatically
        projectService: true,
      },
      // Node globals to avoid noisy no-undef in backend
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': pluginTs,
    },
    rules: {
      // Use the TS-aware variant and disable the base rule
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Reasonable TS defaults; adjust as needed
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
    },
  },

  // Disallow `import type` in Nest DI contexts where runtime tokens are required
  {
    files: [
      'src/**/*.controller.ts',
      'src/**/*.service.ts',
      'src/**/*.module.ts',
      'src/**/*.guard.ts',
      'src/**/*.strategy.ts',
      'src/**/*.interceptor.ts',
      'src/**/*.gateway.ts',
      'src/**/*.resolver.ts',
    ],
    rules: {
      // Hard ban on type-only imports in DI files
      'no-restricted-syntax': [
        'error',
        {
          // Disallow type-only imports for RELATIVE paths in DI files,
          // except when importing from a dedicated types folder or .d.ts modules.
          // This avoids erasing runtime tokens for providers.
          selector:
            "ImportDeclaration[importKind='type'][source.value^='.']:not([source.value*='/types/']):not([source.value$='.d.ts'])",
          message:
            'Do not use `import type` for project-local modules in Nest DI files; it erases runtime tokens required by dependency injection.',
        },
      ],
  // We disable the style rule here to allow type-only imports for .d.ts/types
  // and rely on the targeted restriction above.
  '@typescript-eslint/consistent-type-imports': 'off',
    },
  },

  // Test files: add Jest globals to avoid no-undef
  {
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
];
