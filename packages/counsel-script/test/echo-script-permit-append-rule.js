'use strict'

const ScriptRule = require('../')

module.exports = new ScriptRule({
  name: 'install-echo-permit-append-script',
  scriptName: 'echo',
  scriptCommand: 'echo test2',
  scriptAppend: true
})
