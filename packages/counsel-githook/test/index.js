'use strict'

require('perish')
const test = require('tape')
const counsel = require('counsel')
counsel.logger.configure({ transports: [] }) // hush hush little winston.
const path = require('path')
const util = require('counsel/test/util')
const fs = require('fs-extra')

const setup = () => util.setupTestProject(__dirname)
const teardown = (id) => util.teardownTestProject(__dirname, id)

const { preCommitWithCommand, preCommitWithTasks, preCommitWithTasksNoVariants } = require('./test-rules')

test('rule installs precommit hook tasks', t => {
  let testProjectId = setup()
  t.plan(3)
  return Promise.resolve()
  .then(() => counsel.apply([preCommitWithTasks]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => {
    t.equals(dummyPkgJson.scripts.precommit, 'run-p lint test', 'installed precommit tasks')
  })
  .then(() => counsel.check([preCommitWithTasks]))
  .catch(t.fail)
  .then(() => { counsel.targetProjectPackageJson.precommit = 'BOGUS' })
  .then(() => counsel.check([preCommitWithTasks]))
  .then(() => t.pass('accepts variants by default'))
  .then(() => teardown(testProjectId))
  .then(() => t.pass('teardown'))
  .then(t.end)
})

test('rule fails when variants are forbidden', t => {
  let testProjectId = setup()
  t.plan(4)
  return Promise.resolve()
  .then(() => counsel.apply([preCommitWithTasksNoVariants]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => {
    t.equals(dummyPkgJson.scripts.precommit, 'run-p lint test', 'installed precommit tasks')
  })
  .then(() => counsel.check([preCommitWithTasksNoVariants]))
  .then(() => t.pass('default script passes on check'))
  .then(() => { counsel.targetProjectPackageJson.scripts.precommit = 'BOGUS' })
  .then(() => counsel.check([preCommitWithTasksNoVariants]))
  .catch(err => {
    t.equals(err.code, 'ENOSCRIPT', 'fails when githook script missing/invalid')
  })
  .then(() => teardown(testProjectId))
  .then(() => t.pass('teardown'))
  .then(t.end)
})

test('rule installs precommit hook command', t => {
  let testProjectId = setup()
  t.plan(3)
  Promise.resolve()
  .then(() => counsel.apply([preCommitWithCommand]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => {
    t.equals(dummyPkgJson.scripts.precommit, 'TEST-SHELL-COMMAND', 'installed precommit command')
  })
  .then(() => counsel.check([preCommitWithCommand]))
  .catch(t.fail)
  .then(() => { counsel.targetProjectPackageJson.scripts.precommit = '' })
  .then(() => counsel.check([preCommitWithCommand]))
  .catch(err => t.equals(err.code, 'ENOSCRIPT', 'fails when githook script missing/invalid'))
  .then(() => teardown(testProjectId))
  .then(() => t.pass('teardown'))
  .then(t.end)
})

// https://github.com/typicode/husky/issues/36
// test('precommit in mono repo', t => {
//   const rootProjectId = util.setupTestProject(__dirname, { git: false })
//   const rootProjectDirname = path.resolve(__dirname, `./${rootProjectId}`)
//   fs.mkdirSync(path.join(rootProjectDirname, 'packages'))
//   const nestedProjectId = util.setupTestProject(`${rootProjectDirname}/packages`, { git: false })
//   const childProjectDirname = path.resolve(rootProjectDirname, 'packages', nestedProjectId)

//   t.ok(fs.existsSync(path.resolve(childProjectDirname, 'package.json')), 'mono repo scaffolded')
//   t.notOk(fs.existsSync(path.resolve(rootProjectDirname, '.git')), 'not .git in root project by default')

//   // @note disabled, perhaps indefinitely
//   // t.test('fails without gitRoot config', t => {
//   //   t.plan(1)
//   //   Promise.resolve()
//   //   .then(() => counsel.apply([preCommitWithTasks]))
//   //   .catch(err => t.ok(err.message.match(/\.git/), 'errors on not found git root'))
//   //   .then(t.end, t.end)
// // })

//   t.test('succeeds with gitRoot config', t => {
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
