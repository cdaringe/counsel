'use strict'

const Rule = require('counsel-rule')

module.exports = new Rule({
  name: 'install-tape-rule',
  dependencies: ['tape']
})
