'use strict'

const ScriptRule = require('../')

module.exports = new ScriptRule({
  name: 'install-echo-script',
  scriptName: 'echo',
  scriptCommand: 'echo test'
})
