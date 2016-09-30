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

const templateRule = require('./template-rule')

test('template rule', t => {
  t.plan(2)
  const id = setup()
  Promise.resolve()
  .then(() => counsel.apply([templateRule]))
  .then(() => {
    const templatedReadmeFilename = path.join(__dirname, id, 'README.md')
    const templatedReadmeContent = fs.readFileSync(templatedReadmeFilename)
    t.ok(templatedReadmeContent.toString().match(/dummy-project/), 'template rendered')
  })
  .catch(t.fail)
  .then(() => teardown(id))
  .then(() => t.pass('teardown'))
  .then(t.end)
})
