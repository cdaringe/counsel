'use strict'

const FilenameFormatRule = require('../')
const kebab = require('lodash.kebabcase')

module.exports = new FilenameFormatRule({
  fileFormatExtensions: 'js',
  fileFormatExclude: '*IGNORE*',
  fileFormatFunction: kebab
})
