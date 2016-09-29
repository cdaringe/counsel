'use strict'

require('perish')
const test = require('tape')
const counsel = require('../')
counsel.logger.configure({ transports: [] }) // hush hush little winston.
const path = require('path')
const util = require('./util')
const cloneDeep = require('lodash.clonedeep')
const tapeRule = require('./dummy-rules/tape-rule')
const echoScriptRule = require('./dummy-rules/echo-script-rule')
const echoScriptVariantOkRule = require('./dummy-rules/echo-script-variant-ok-rule')
const echoScriptNoVariants = require('./dummy-rules/echo-script-no-variants')
const preCommitRule = require('./dummy-rules/pre-commit-rule')
const fs = require('fs')
const counselDefaultProjectRoot = counsel.targetProjectRoot

const setup = () => {
  const testProjectId = util.createTestProject()
  const dummyTestPkgDir = path.join(__dirname, testProjectId)
  process.chdir(dummyTestPkgDir)

  // squash counsel target project attrs
  counsel.targetProjectRoot = dummyTestPkgDir
  counsel.targetProjectPackageJsonFilename = path.join(dummyTestPkgDir, 'package.json')
  counsel.targetProjectPackageJson = require(counsel.targetProjectPackageJsonFilename)
  counsel._targetProjectPackageJsonPristine = cloneDeep(counsel.targetProjectPackageJson)

  return testProjectId
}
const teardown = (testProjectId) => {
  try {
    counsel.targetProjectRoot = counselDefaultProjectRoot
    util.teardownTestProject(testProjectId)
    process.chdir(__dirname)
  } catch (err) {
    console.error(err)
  }
}

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

test('rule installs script', t => {
  let testProjectId = setup()
  t.plan(2)
  Promise.resolve()
  .then(() => counsel.apply([echoScriptRule]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => t.ok(dummyPkgJson.scripts.echo, 'echo script installed'))
  .catch(t.fail)
  .then(() => teardown(testProjectId))
  .then(() => t.pass('teardown'))
  .then(t.end)
})

test('rule installs script with pre-existing script, but variant permits existing', t => {
  let testProjectId = setup()
  t.plan(2)
  Promise.resolve()
  .then(() => counsel.apply([echoScriptRule, echoScriptVariantOkRule]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => t.equals(
    dummyPkgJson.scripts.echo,
    echoScriptRule.declaration.scriptCommand,
    'echo script persisted'
  ))
  .catch(t.fail)
  .then(() => teardown(testProjectId))
  .then(() => t.pass('teardown'))
  .then(t.end)
})

test('rule installs script with pre-existing script, but no variants permitted', t => {
  let testProjectId = setup()
  t.plan(3)
  Promise.resolve()
  .then(() => counsel.apply([echoScriptRule, echoScriptNoVariants]))
  .catch(err => t.ok(err.message.match(/relax/, 'errors on script conflict'))) // @TODO weak detection
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => t.notOk(dummyPkgJson.scripts.echo, 'package.json not updatd on script conflict'))
  .catch(t.fail)
  .then(() => teardown(testProjectId))
  .then(() => t.pass('teardown'))
  .then(t.end)
})

test('rule installs pre-commit hook tasks', t => {
  let testProjectId = setup()
  t.plan(2)
  Promise.resolve()
  .then(() => counsel.apply([preCommitRule]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => t.ok(Array.isArray(dummyPkgJson['pre-commit']), 'installed pre-commit tasks'))
  .catch(t.fail)
  .then(() => teardown(testProjectId))
  .then(() => t.pass('teardown'))
  .then(t.end)
})
