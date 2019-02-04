import { Rule } from '../../' // eslint-disable-line no-unused-vars
import {
  ScriptRule, // eslint-disable-line no-unused-vars
  check as scriptCheck,
  plan as scriptPlan
} from '../../src/rules/script'
import * as fs from 'fs-extra'
import * as path from 'path'
import { check as copyRuleCheck } from '../../src/rules/copy'
import {
  FilenameFormatRule, // eslint-disable-line no-unused-vars
  check as checkFilename
} from '../../src/rules/filename-format' // eslint-disable-line no-unused-vars
import { kebabCase } from 'lodash'

// lint
const lintScript: ScriptRule = {
  name: 'lint-script',
  devDependencies: [{ name: 'eslint', range: '*' }],
  scriptCommand: 'eslint',
  scriptName: 'lint',
  plan: scriptPlan,
  check: scriptCheck
}
const lintConfig: Rule = {
  name: 'lint-config',
  plan: ({ ctx: config }) => () =>
    fs.writeFile(
      path.join(config.projectDirname, '.eslintrc'),
      JSON.stringify({ extends: 'airbnb' })
    )
}

// test
const testScript: ScriptRule = {
  name: 'test-script',
  devDependencies: [{ name: 'jest', range: '*' }],
  scriptCommand: 'jest --coverage',
  scriptName: 'test',
  plan: scriptPlan,
  check: scriptCheck
}

// ci
const ciTemplate = `
node: 10
jobs:
  default: run-best-job
`
const ciConfig: Rule = {
  name: 'ci-config',
  plan: ({ ctx: config }) => () =>
    fs.writeFile(path.join(config.projectDirname, 'Jenkinsfile'), ciTemplate),
  check: copyRuleCheck
}

// filenames
const filenamesKebabed: FilenameFormatRule = {
  name: 'test-filename-rule',
  filenameFormatExtensions: ['ts'],
  filenameFormatExclude: [],
  filenameFormatFunction: kebabCase,
  check: checkFilename
}

export const rulesByType = {
  ciConfig,
  lintConfig,
  lintScript,
  testScript,
  filenamesKebabed
}
export const rules: Rule[] = Object.values(rulesByType)
