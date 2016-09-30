'use strict'

const CopyRule = require('../')

module.exports = new CopyRule({
  copySource: './copy-markdown-rule.md',
  copyTarget: './some/folder/renamed.md'
})
