'use strict'

require('perish')
const ava = require('ava')
const { factory } = require('counsel/test/scaffold/factory')
const { setup, teardown } = require('counsel/test/scaffold/test-project')
const path = require('path')
const fs = require('fs-extra')

ava.beforeEach(async t => {
  const counsel = factory()
  t.context.counsel = counsel
  t.context.project = await setup({ counsel })
})

ava.afterEach(async t => {
  await teardown({ dir: t.context.project.dir })
})

const copyMarkdownRule = require('./copy-markdown-rule')

ava('copy rule', async t => {
  const { counsel, project: { dir } } = t.context
  await counsel.apply([copyMarkdownRule])
  const stat = await fs.lstat(path.join(dir, copyMarkdownRule.declaration.dest))
  t.true(!!stat, 'file copied ok')
  await counsel.check([copyMarkdownRule])
  t.pass('copy check ok')
})
