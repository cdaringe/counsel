'use strict'

const CopyRule = require('../')

module.exports = new CopyRule({
  copyContentRoot: __dirname,
  copySource: './copy-markdown-rule.md',
  copyTarget: './some/folder/renamed.md'
})
