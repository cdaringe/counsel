'use strict'

require('perish')
const test = require('tape')
const counsel = require('../')
counsel.logger.configure({ transports: [] }) // hush hush little winston.
const path = require('path')
const util = require('./util')
const tapeRule = require('./dummy-rules/tape-rule')
const Rule = require('counsel-rule')
const fs = require('fs')
const sinon = require('sinon')

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

test('allows disabling rules via override', t => {
  let testProjectId = setup()
  const dropDepsRule = new Rule({
    name: 'drop-deps-rule',
    dependencies: ['a'],
    devDependencies: ['b']
  })
  t.plan(2)
  const stub = sinon.stub(counsel, 'config', () => {
    return {
      overrides: {
        [tapeRule.name]: null,
        [dropDepsRule.name]: {
          dependencies: { subtract: 'a' },
          devDependencies: { subtract: 'b' }
        }
      }
    }
  })
  Promise.resolve()
  .then(() => counsel.apply([ tapeRule, dropDepsRule ]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => t.notOk(dummyPkgJson.dependencies, 'tape rule overriden/dropped'))
  .catch(t.fail)
  .then(() => teardown(testProjectId))
  .then(() => stub.restore())
  .then(() => t.pass('teardown'))
  .then(t.end)
})

test('explicit rule opt in', t => {
  let testProjectId = setup()
  const r1 = new Rule({
    name: 'dummy-rule-1',
    dependencies: ['a']
  })
  const r2 = new Rule({
    name: 'dummy-rule-2',
    dependencies: ['b']
  })
  t.plan(3)
  const stub = sinon.stub(counsel, 'config', () => {
    return {
      rules: [r2.name] // omit r1
    }
  })
  Promise.resolve()
  .then(() => counsel.apply([ r1, r2 ]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => {
    t.notOk(dummyPkgJson.dependencies.a, 'missing opt-in rule dropped')
    t.ok(dummyPkgJson.dependencies.b, 'present opt-in rule present')
  })
  .catch(t.fail)
  .then(() => teardown(testProjectId))
  .then(() => stub.restore())
  .then(() => t.pass('teardown'))
  .then(t.end)
})
