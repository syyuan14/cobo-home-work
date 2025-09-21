export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'revert', 'build', 'ci'],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
  },
}
