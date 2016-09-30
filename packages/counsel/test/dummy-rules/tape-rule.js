'use strict'

const Rule = require('counsel-rule')

module.exports = new Rule({
  name: 'install-tape-dependency',
  dependencies: ['tape']
})
