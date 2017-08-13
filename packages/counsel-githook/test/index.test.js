'use strict'

require('perish')
const ava = require('ava')
const { factory } = require('counsel/test/scaffold/factory')
const { setup, teardown } = require('counsel/test/scaffold/test-project')

const {
  preCommitWithCommand,
  preCommitWithTasks,
  preCommitWithTasksNoVariants
} = require('./test-rules')

ava.beforeEach(async t => {
  const counsel = factory()
  t.context.counsel = counsel
  t.context.project = await setup({ counsel })
})

ava.afterEach(async t => {
  await teardown({ dir: t.context.project.dir })
})

ava('rule installs precommit hook tasks', async t => {
  const { counsel } = t.context
  await counsel.apply([preCommitWithTasks])
  const dummyPkgJson = await counsel.jsonReadPackage()
  t.is(dummyPkgJson.scripts.precommit, 'run-p lint test', 'installed precommit tasks')
  await counsel.check([preCommitWithTasks])
  counsel.targetProjectPackageJson.precommit = 'SOME_VARIANT'
  await counsel.check([preCommitWithTasks])
})

ava('rule fails when variants are forbidden', async t => {
  const { counsel } = t.context
  await counsel.apply([preCommitWithTasksNoVariants])
  const dummyPkgJson = await counsel.jsonReadPackage()
  t.is(dummyPkgJson.scripts.precommit, 'run-p lint test', 'installed precommit tasks')
  await counsel.check([preCommitWithTasksNoVariants])
  counsel.targetProjectPackageJson.scripts.precommit = 'BOGUS'
  try {
    await counsel.check([preCommitWithTasksNoVariants])
  } catch (err) {
    t.is(err.code, 'ENOSCRIPT', 'fails when githook script missing/invalid')
  }
})

ava('rule installs precommit hook command', async t => {
  const { counsel } = t.context
  await counsel.apply([preCommitWithCommand])
  const dummyPkgJson = await counsel.jsonReadPackage()
  t.is(dummyPkgJson.scripts.precommit, 'TEST-SHELL-COMMAND', 'installed precommit command')
  await counsel.check([preCommitWithCommand])
  counsel.targetProjectPackageJson.scripts.precommit = ''
  try {
    await counsel.check([preCommitWithCommand])
  } catch (err) {
    t.is(err.code, 'ENOSCRIPT', 'fails when githook script missing/invalid')
  }
})

// https://github.com/typicode/husky/issues/36
// ava('precommit in mono repo', t => {
//   const rootProjectId = util.setupTestProject(__dirname, { git: false })
//   const rootProjectDirname = path.resolve(__dirname, `./${rootProjectId}`)
//   fs.mkdirSync(path.join(rootProjectDirname, 'packages'))
//   const nestedProjectId = util.setupTestProject(`${rootProjectDirname}/packages`, { git: false })
//   const childProjectDirname = path.resolve(rootProjectDirname, 'packages', nestedProjectId)

//   t.ok(fs.existsSync(path.resolve(childProjectDirname, 'package.json')), 'mono repo scaffolded')
//   t.notOk(fs.existsSync(path.resolve(rootProjectDirname, '.git')), 'not .git in root project by default')

//   // @note disabled, perhaps indefinitely
//   // t.ava('fails without gitRoot config', t => {
//   //   t.plan(1)
//   //   Promise.resolve()
//   //   .then(() => counsel.apply([preCommitWithTasks]))
//   //   .catch(err => t.ok(err.message.match(/\.git/), 'errors on not found git root'))
//   //   .then(t.end, t.end)
// // })

//   t.ava('succeeds with gitRoot config', t => {
//     t.plan(2)
//     fs.mkdirpSync(`${rootProjectDirname}/.git/hooks`)
//     const prevConfig = counsel.targetProjectPackageJson[counsel.configKey]
//     counsel.targetProjectPackageJson[counsel.configKey] = { gitRoot: '../..' }
//     return Promise.resolve()
//     .then(() => counsel.apply([preCommitWithTasks]))
//     .then(() => JSON.parse(fs.readFileSync(path.resolve(childProjectDirname, 'package.json'))))
//     .then(pkg => t.ok(pkg['precommit'], 'precommit hooks added in monorepo'))
//     .then(() => { counsel.targetProjectPackageJson[counsel.configKey] = prevConfig })
//     .then(() => teardown(rootProjectId))
//     .then(() => t.ok('teardown'))
//     .then(t.end, t.end)
//   })
// })
