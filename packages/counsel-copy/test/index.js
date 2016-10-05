'use strict'

require('perish')
const test = require('tape')
const counsel = require('counsel')
counsel.logger.configure({ transports: [] }) // hush hush little winston.
const path = require('path')
const util = require('counsel/test/util')
const fs = require('fs')

const setup = () => util.setupTestProject(__dirname)
const teardown = (id) => util.teardownTestProject(__dirname, id)

const copyMarkdownRule = require('./copy-markdown-rule')

test('copy rule', t => {
  t.plan(2)
  const id = setup()
  Promise.resolve()
  .then(() => counsel.apply([copyMarkdownRule]))
  .then(() => {
    t.ok(fs.lstatSync(
      path.join(__dirname, id, copyMarkdownRule.declaration.copyTarget)),
      'file copied'
    )
  })
  .then(() => counsel.check())
  .catch(t.fail)
  .then(() => teardown(id))
  .then(() => t.pass('teardown'))
  .then(t.end)
})
