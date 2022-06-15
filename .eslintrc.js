module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:wc/recommended',
    'plugin:lit/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/no-unused-vars': [ 'error', {
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-var-requires': 0,
    'array-bracket-spacing': [ 'error', 'always', {
      arraysInArrays: false,
      objectsInArrays: false,
    }],
    'comma-dangle': [ 'error', 'always-multiline' ],
    'comma-spacing': [ 'error', {
      after: true,
      before: false,
    }],
    indent: [ 'error', 2 ],
    'key-spacing': [ 'error', {
      afterColon: true,
      beforeColon: false,
    }],
    'linebreak-style': [ 'error', 'unix' ],
    'max-len': [ 'error', {
      code: 100,
      ignoreComments: true,
      ignoreRegExpLiterals: true,
      ignoreTemplateLiterals: true,
      tabWidth: 2,
    }],
    'no-case-declarations': 0,
    'no-trailing-spaces': 'error',
    'object-curly-spacing': [ 'error', 'always', {
      arraysInObjects: false,
      objectsInObjects: false,
    }],
    'object-property-newline': [ 'error', {
      allowAllPropertiesOnSameLine: true,
    }],
    quotes: [ 'error', 'single' ],
    semi: [ 'error', 'always' ],
    'sort-imports': [ 'error', {
      allowSeparatedGroups: true,
      ignoreCase: true,
      memberSyntaxSortOrder: [
        'all',
        'single',
        'multiple',
        'none',
      ],
    }],
    'sort-keys': [ 'error', 'asc', {
      caseSensitive: true,
      minKeys: 3,
      natural: false,
    }],
  },
};
