require('perish')
const ava = require('ava').default
const fs = require('fs-extra')
const { factory } = require('./scaffold/factory')
const { setup, teardown } = require('./scaffold/test-project')
const path = require('path')
// const tapeRule = require('./dummy-rules/tape-rule')
// const Rule = require('counsel-rule')
// const sinon = require('sinon')
// const fs = require('fs-extra')

ava.beforeEach(async t => {
  const counsel = factory()
  t.context.counsel = counsel
  t.context.project = await setup({ counsel })
})

ava.afterEach(async t => {
  await teardown({ dir: t.context.project.dir })
})

ava('isDir', async t => {
  const { counsel, project } = t.context
  const { dir } = project
  let isDir = await counsel.project.isDir(dir)
  t.is(isDir, true)
  isDir = await counsel.project.isDir('/TOTALLY/NO/WAY/BRO')
  t.is(isDir, false)
})

ava('findGitRoot', async t => {
  const { counsel, project } = t.context
  const { buildDir, gitDir } = project
  let gitRoot = await counsel.project.findGitRoot(buildDir)
  t.is(gitRoot, gitDir.replace(`${path.sep}.git`, ''), 'finds git root')
})

ava('findProjectRoot', async t => {
  const { counsel, project } = t.context
  const { buildDir, dir } = project
  let projectRoot = await counsel.project.findProjectRoot(buildDir)
  t.is(projectRoot, dir, 'can find project root')
  const err = await t.throws(
    counsel.project.findProjectRoot('/BOGUS/ROOT'),
    Error
  )
  t.truthy(err.message.match(/package/))
})

ava('isYarn', async t => {
  const { counsel, project } = t.context
  const { dir } = project
  let isYarn = await counsel.project.isYarn(dir)
  t.false(isYarn)
  await fs.writeFile(path.join(dir, 'yarn.lock'), '_')
  isYarn = await counsel.project.isYarn(dir)
  t.true(isYarn)
})
