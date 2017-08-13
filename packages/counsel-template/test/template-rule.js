'use strict'

const TemplateRule = require('../')

module.exports = new TemplateRule({
  templateSource: './README.swig',
  templateTarget: './README.md'
})
