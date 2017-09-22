'use strict'

require('perish')
const ava = require('ava')
const { factory } = require('counsel/test/scaffold/factory')
const { setup, teardown } = require('counsel/test/scaffold/test-project')
const path = require('path')
const fs = require('fs-extra')

const filenameRule = require('./kebab-filename-rule')

ava.beforeEach(async t => {
  const counsel = factory()
  t.context.counsel = counsel
  t.context.project = await setup({ counsel })
})

ava.afterEach(async t => {
  await teardown({ dir: t.context.project.dir })
})

ava('filename rule', async t => {
  const { counsel, project: { dir } } = t.context
  await fs.writeFile(path.join(dir, 'test-ing.js'), '')
  await counsel.check([filenameRule])
  t.pass('all things kebab cased')
  await fs.writeFile(path.join(dir, 'IGNORE.js'), '')
  await counsel.check([filenameRule])
  t.pass('filename ignore rule honored')
  await fs.writeFile(path.join(dir, 'test-WAT.js'), '')
  try {
    await counsel.check([filenameRule])
  } catch (err) {
    t.truthy(err.message.match(/violation/), 'catches filename violations')
  }
})
