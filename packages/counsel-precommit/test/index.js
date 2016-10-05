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

const preCommitRule = require('./pre-commit-rule')

test('rule installs pre-commit hook tasks', t => {
  let testProjectId = setup()
  t.plan(3)
  Promise.resolve()
  .then(() => counsel.apply([preCommitRule]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => {
    t.ok(Array.isArray(dummyPkgJson['pre-commit']), 'installed pre-commit tasks')
  })
  .then(() => {
    return counsel.check([preCommitRule])
  })
  .catch(t.fail)
  .then(() => { counsel.targetProjectPackageJson['pre-commit'] = [] })
  .then(() => counsel.check([preCommitRule]))
  .catch(() => t.pass('fails check when tasks missing'))
  .then(() => teardown(testProjectId))
  .then(() => t.pass('teardown'))
  .then(t.end)
})
