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

const preCommitRule = require('./pre-commit-rule')

test('rule installs pre-commit hook tasks', t => {
  let testProjectId = setup()
  t.plan(3)
  Promise.resolve()
  .then(() => counsel.apply([preCommitRule]))
  .then(() => JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${testProjectId}/package.json`))))
  .then(dummyPkgJson => {
    t.ok(Array.isArray(dummyPkgJson['pre-commit']), 'installed pre-commit tasks')
  })
  .then(() => counsel.check([preCommitRule]))
  .catch(t.fail)
  .then(() => { counsel.targetProjectPackageJson['pre-commit'] = [] })
  .then(() => counsel.check([preCommitRule]))
  .catch(() => t.pass('fails check when tasks missing'))
  .then(() => teardown(testProjectId))
  .then(() => t.pass('teardown'))
  .then(t.end)
})

test('pre-commit in mono repo', t => {
  const rootProjectId = util.setupTestProject(__dirname, { git: false })
  const rootProjectDirname = path.resolve(__dirname, `./${rootProjectId}`)
  fs.mkdirSync(path.join(rootProjectDirname, 'packages'))
  const nestedProjectId = util.setupTestProject(`${rootProjectDirname}/packages`, { git: false })
  const childProjectDirname = path.resolve(rootProjectDirname, 'packages', nestedProjectId)

  t.ok(fs.existsSync(path.resolve(childProjectDirname, 'package.json')), 'mono repo scaffolded')
  t.notOk(fs.existsSync(path.resolve(rootProjectDirname, '.git')), 'not .git in root project by default')

  t.test('fails without gitRoot config', t => {
    t.plan(1)
    Promise.resolve()
    .then(() => counsel.apply([preCommitRule]))
    .catch(err => t.ok(err.message.match(/\.git/), 'errors on not found git root'))
    .then(t.end, t.end)
  })

  t.test('succeeds with gitRoot config', t => {
    t.plan(2)
    fs.mkdirSync(`${rootProjectDirname}/.git`)
    const prevConfig = counsel.targetProjectPackageJson[counsel.configKey]
    counsel.targetProjectPackageJson[counsel.configKey] = { gitRoot: '../..' }
    Promise.resolve()
    .then(() => counsel.apply([preCommitRule]))
    .then(() => JSON.parse(fs.readFileSync(path.resolve(childProjectDirname, 'package.json'))))
    .then(pkg => t.ok(pkg['pre-commit'], 'pre-commit hooks added in monorepo'))
    .then(() => { counsel.targetProjectPackageJson[counsel.configKey] = prevConfig })
    .then(() => teardown(rootProjectId))
    .then(() => t.ok('teardown'))
    .then(t.end, t.end)
  })
})
