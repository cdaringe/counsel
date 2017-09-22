'use strict'

const ScriptRule = require('../')
const firstRule = require('./echo-script-rule')

module.exports = new ScriptRule({
  name: 'install-echo-script-that-will-error-because-of-existing-conflicting-script',
  scriptName: firstRule.declaration.scriptName,
  scriptCommand: 'wont install, per expected script conflict without scriptCommandVariant'
})
