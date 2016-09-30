'use strict'

const TemplateRule = require('../')

module.exports = new TemplateRule({
  templateSource: './test/README.swig',
  templateTarget: './folder/README.md'
})
