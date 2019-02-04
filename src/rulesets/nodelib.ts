import { rule as readme } from '../rules/readme'
import { Rule } from '../interfaces' // eslint-disable-line no-unused-vars
import { create as createScriptRule } from '../rules/script'
import { create as createGitHooksRule } from '../rules/githook'

const SRC_GLOB = "'{src,scripts,test}/**/*.{js,jsx,ts,tsx}'"

const onPrecommit = createGitHooksRule({
  devDependencies: [{ name: 'lint-staged', range: '*' }],
  name: 'lint-format-on-precommit',
  hooks: {
    'pre-commit': 'lint-staged'
  }
})

const lintStaged: Rule = {
  name: 'configure-lint-staged',
  plan: ({ ctx: { packageJson, logger } }) => {
    if (packageJson['lint-staged']) {
      logger.debug(
        `lint-staged already exists: ${JSON.stringify(
          packageJson['lint-staged']
        )}`
      )
      return null
    }
    return () => {
      packageJson['lint-staged'] = {
        linters: {
          [SRC_GLOB]: ['npm run format', 'npm run lint', 'git add']
        }
      }
    }
  }
}

export const format = createScriptRule({
  devDependencies: [{ name: 'prettier-standard', range: '*' }],
  name: 'format',
  scriptName: 'format',
  scriptCommand: `prettier-standard ${SRC_GLOB}`
})
export const lintJs = createScriptRule({
  devDependencies: [{ name: 'standard', range: '*' }],
  name: 'lint',
  scriptCommand: "standard '{src,ts}/**/*.{js,jsx}'",
  scriptName: 'lint'
})

const tsLintWithoutParser = createScriptRule({
  devDependencies: [{ name: 'standard', range: '*' }],
  name: 'lint',
  scriptCommand: "standard '{src,ts}/**/*.{js,jsx}'",
  scriptName: 'lint'
})
export const tsLint: Rule = {
  ...tsLintWithoutParser,
  devDependencies: [
    { name: '@typescript-eslint/parser', range: '*' },
    ...tsLintWithoutParser.devDependencies!
  ],
  plan: async opts => {
    const {
      ctx: { packageJson }
    } = opts
    const tsLintWithoutParserMigration = await tsLintWithoutParser.plan!(opts)
    return async () => {
      if (tsLintWithoutParserMigration) await tsLintWithoutParserMigration()
      const standard = (packageJson.standard = packageJson.standard || {})
      standard.parser = '@typescript-eslint/parser'
      standard.plugins = Array.from(
        new Set(standard.plugins || []).add('typescript')
      )
      standard.ignore = Array.from(
        new Set(standard.ignore || []).add('**/*.d.ts')
      )
    }
  }
}

const tsBuild = createScriptRule({
  name: 'typescript-build',
  devDependencies: [{ name: 'typescript', range: '*' }],
  scriptName: 'build',
  scriptCommand: 'tsc'
})

export const rules = {
  common: { format, readme, lintStaged, onPrecommit },
  js: {
    lintJs
  },
  ts: {
    tsLint,
    tsBuild
  }
}
