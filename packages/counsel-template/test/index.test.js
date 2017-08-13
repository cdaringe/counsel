'use strict'

require('perish')
const ava = require('ava')
const { factory } = require('counsel/test/scaffold/factory')
const { setup, teardown } = require('counsel/test/scaffold/test-project')
const path = require('path')
const fs = require('fs-extra')

const templateRule = require('./template-rule')

ava.beforeEach(async t => {
  const counsel = factory()
  t.context.counsel = counsel
  t.context.project = await setup({ counsel })
})

ava.afterEach(async t => {
  await teardown({ dir: t.context.project.dir })
})

ava('template rule', async t => {
  const { counsel, project: { dir } } = t.context
  await fs.copy(
    path.join(__dirname, 'README.swig'),
    path.join(dir, 'README.swig')
  )
  await counsel.apply([templateRule])
  const templatedReadmeFilename = path.join(dir, 'README.md')
  const templatedReadmeContent = await fs.readFile(templatedReadmeFilename)
  t.truthy(templatedReadmeContent.toString().match(/dummy-project/), 'template rendered')
})
