'use strict'

require('perish')
const ava = require('ava')
const { factory } = require('counsel/test/scaffold/factory')
const { setup, teardown } = require('counsel/test/scaffold/test-project')

ava.beforeEach(async t => {
  const counsel = factory()
  t.context.counsel = counsel
  t.context.project = await setup({ counsel })
})

ava.afterEach(async t => {
  await teardown({ dir: t.context.project.dir })
})

const echoScriptRule = require('./echo-script-rule')
const echoScriptPermitAppendRule = require('./echo-script-permit-append-rule')
const echoScriptVariantOkRule = require('./echo-script-variant-ok-rule')
const echoScriptNoVariants = require('./echo-script-no-variants')

ava('rule installs script', async t => {
  const { counsel } = t.context
  await counsel.apply([echoScriptRule])
  const dummyPkgJson = await counsel.jsonReadPackage()
  t.is(
    dummyPkgJson.scripts.echo,
    echoScriptRule.declaration.scriptCommand,
    'echo script installed and matches'
  )
})

ava('rule installs script with pre-existing script, but variant permits existing', async t => {
  const { counsel } = t.context
  await counsel.apply([echoScriptRule, echoScriptVariantOkRule])
  const dummyPkgJson = await counsel.jsonReadPackage()
  t.is(
    dummyPkgJson.scripts.echo,
    echoScriptRule.declaration.scriptCommand,
    'echo script persisted'
  )
})

ava('rule installs script with pre-existing script, but no variants permitted', async t => {
  const { counsel } = t.context
  try {
    await counsel.apply([echoScriptRule, echoScriptNoVariants])
    t.fail('apply should fail')
  } catch (err) {
    t.is(err.code, 'ENOSCRIPTINSTALL', 'errors on script conflict')
  }
  const dummyPkgJson = await counsel.jsonReadPackage()
  t.not(dummyPkgJson.scripts.echo, 'package.json not updatd on script conflict')
})

ava('rule installs same script, permits appending', async t => {
  const { counsel } = t.context
  await counsel.apply([echoScriptRule, echoScriptPermitAppendRule])
  const dummyPkgJson = await counsel.jsonReadPackage()
  t.is(
    dummyPkgJson.scripts.echo,
    `${echoScriptRule.declaration.scriptCommand} && ${echoScriptPermitAppendRule.declaration.scriptCommand}`,
    'package.json not updated on script conflict'
  )
})
