import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import js from '@eslint/js'

// 创建基础配置，避免使用可能导致循环引用的FlatCompat
export default [
  // 忽略不需要检查的目录和文件
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      '*.d.ts',
      'test/**',
      'vite.config.ts',
      'server/**',
    ],
  },

  // 为应用代码创建配置 - 使用tsconfig.app.json
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        // 使用应用代码的配置文件
        project: './tsconfig.app.json',
        tsconfigRootDir: import.meta.dirname,
        // 禁用类型检查以避免tsconfig问题
        EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
      },
    },
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
    },
    rules: {
      // 整合ESLint推荐规则
      ...js.configs.recommended.rules,
      // 整合TypeScript-ESLint推荐规则，但不启用需要类型检查的规则
      ...tseslint.configs.recommended.rules,
      // 整合React Hooks推荐规则
      ...reactHooks.configs.recommended.rules,
      // 禁用可能与Prettier冲突的规则
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'no-unused-vars': 'off',
    },
  },

  // 为普通JS/JSX文件创建配置 - 不使用类型检查
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        sourceType: 'module',
      },
    },
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // 只使用基础ESLint和React Hooks规则
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
]
