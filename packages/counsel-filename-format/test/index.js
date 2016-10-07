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

const filenameRule = require('./kebab-filename-rule')

test('filename rule', t => {
  t.plan(4)
  const id = setup()
  const pkgDir = path.join(__dirname, id)
  Promise.resolve()
  .then(() => fs.writeFileSync(path.join(pkgDir, 'test-ing.js')))
  .then(() => counsel.check([filenameRule]))
  .then(() => t.pass('all things kebab cased'))
  .then(() => fs.writeFileSync(path.join(pkgDir, 'IGNORE.js')))
  .then(() => counsel.check([filenameRule]))
  .then(() => t.pass('filename ignore rule honored'))
  .catch(t.fail)
  .then(() => fs.writeFileSync(path.join(pkgDir, 'test-WAT.js')))
  .then(() => counsel.check([filenameRule]))
  .catch(err => t.ok(err.message.match(/violation/), 'catches filename violations'))
  .then(() => teardown(id))
  .then(() => t.pass('teardown'))
  .then(t.end)
})
