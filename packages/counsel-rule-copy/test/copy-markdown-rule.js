'use strict'

const CopyRule = require('../')
const path = require('path')

module.exports = new CopyRule({
  src: path.resolve(__dirname, 'copy-markdown-rule.md'),
  dest: './some/folder/renamed.md'
})
