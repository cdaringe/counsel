require('perish')
const ava = require('ava').default
const { factory } = require('./scaffold/factory')
const { setup, teardown, clean } = require('./scaffold/test-project')
const Project = require('../src/Project').Project
// const tapeRule = require('./dummy-rules/tape-rule')
// const Rule = require('counsel-rule')
// const sinon = require('sinon')
const path = require('path')
// const fs = require('fs-extra')

ava.beforeEach(async t => {
  const counsel = factory()
  t.context.counsel = counsel
  t.context.dir = await setup({ counsel })
  t.context.project = new Project()
})

ava.afterEach(async t => {
  await teardown({ dir: t.context.dir })
})

ava('isDir', async t => {
  const { counsel, project } = t.context
  const counselProjectDirname = path.dirname(counsel.targetProjectPackageJsonFilename)
  let isDir = await project.isDir(counselProjectDirname)
  t.is(isDir, true)
  isDir = await project.isDir('/TOTALLY/NO/WAY/BRO')
  t.is(isDir, false)
})
