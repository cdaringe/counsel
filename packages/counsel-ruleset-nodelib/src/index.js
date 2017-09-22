'use strict'

const ScriptRule = require('counsel-rule-script')
const readmeRule = require('counsel-rule-readme')
const jsdockRuleset = require('counsel-ruleset-jsdock')

module.exports = [

  new ScriptRule({
    devDependencies: ['npm-run-all', 'husky'],
    name: 'precommit',
    scriptName: 'precommit',
    scriptCommand: 'run-p check lint test check-vulnerablities',
    scriptCommandVariants: ['*']
  }),

  // validate!
  new ScriptRule({
    devDependencies: ['counsel'],
    name: 'check',
    scriptName: 'check',
    scriptCommand: 'counsel check',
    scriptCommandVariants: ['*']
  }),

  // secure!
  new ScriptRule({
    name: 'check-vulnerablities',
    devDependencies: ['nsp'],
    scriptName: 'check-vulnerablities',
    scriptCommand: 'nsp check',
    scriptCommandVariants: ['*']
  }),

  // lint!
  new ScriptRule({
    name: 'lint',
    devDependencies: ['standard'],
    scriptName: 'lint',
    scriptCommand: 'standard',
    scriptCommandVariants: ['*']
  }),

  // test and coverage!
  new ScriptRule({
    name: 'test',
    devDependencies: ['nyc', 'ava'],
    scriptName: 'test',
    scriptCommand: 'nyc --reporter=lcov ava test/**/*.test.js',
    scriptCommandVariants: ['*'],
    overrideConditions: [
      script => script.match(/no test/)
    ]
  }),
  readmeRule
].concat(jsdockRuleset)
