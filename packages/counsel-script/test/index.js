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

const echoScriptRule = require('./echo-script-rule')
const echoScriptPermitAppendRule = require('./echo-script-permit-append-rule')
const echoScriptVariantOkRule = require('./echo-script-variant-ok-rule')
const echoScriptNoVariants = require('./echo-script-no-variants')

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

test('rule installs same script, permits appending', t => {
  let testProjectId = setup()
  t.plan(2)
  Promise.resolve()
  .then(() => counsel.apply([echoScriptRule, echoScriptPermitAppendRule]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => t.equals(
    dummyPkgJson.scripts.echo,
    `${echoScriptRule.declaration.scriptCommand} && ${echoScriptPermitAppendRule.declaration.scriptCommand}`,
    'package.json not updated on script conflict'
  ))
  .catch(t.fail)
  .then(() => teardown(testProjectId))
  .then(() => t.pass('teardown'))
  .then(t.end)
})
