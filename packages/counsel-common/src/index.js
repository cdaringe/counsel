'use strict'

const Rule = require('./rule')
const ScriptRule = require('./script-rule')
const PreCommitRule = require('./pre-commit-rule')

module.exports = {
  Rule: Rule,
  ScriptRule: ScriptRule,
  PreCommitRule: PreCommitRule
}
