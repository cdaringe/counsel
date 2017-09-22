'use strict'

const ScriptRule = require('../')
const firstRule = require('./echo-script-rule')

module.exports = new ScriptRule({
  name: 'install-echo-script-knowing-previous-echo-script-already-installed',
  scriptName: firstRule.declaration.scriptName,
  scriptCommand: 'this cmd will never be installed because variant cmd is satisfied',
  scriptCommandVariants: [ firstRule.declaration.scriptCommand ]
})
