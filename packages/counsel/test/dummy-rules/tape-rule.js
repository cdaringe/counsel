'use strict'

const Rule = require('counsel-common').Rule

module.exports = new Rule({
  name: 'install-tape-dependency',
  dependencies: ['tape']
})