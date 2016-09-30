'use strict'

require('perish')
const test = require('tape')
const counsel = require('../')
counsel.logger.configure({ transports: [] }) // hush hush little winston.
const path = require('path')
const util = require('./util')
const tapeRule = require('./dummy-rules/tape-rule')
const fs = require('fs')

const setup = () => util.setupTestProject(__dirname)
const teardown = (id) => util.teardownTestProject(__dirname, id)

test('rule installs package', t => {
  let testProjectId = setup()
  t.plan(2)
  Promise.resolve()
  .then(() => counsel.apply([tapeRule]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => t.ok(dummyPkgJson.dependencies.tape, 'tape installed'))
  .catch(t.fail)
  .then(() => teardown(testProjectId))
  .then(() => t.pass('teardown'))
  .then(t.end)
})
