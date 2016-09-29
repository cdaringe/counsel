'use strict'

const ScriptRule = require('counsel-common').ScriptRule

module.exports = new ScriptRule({
  name: 'install-echo-script',
  scriptName: 'echo',
  scriptCommand: 'echo test'
})
