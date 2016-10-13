'use strict'

const cp = require('child_process') // @TODO, use fs.extra for x-platform compat, for crying out loud.
const path = require('path')
const cloneDeep = require('lodash.clonedeep')
const counsel = require('../')

const counselDefaultProjectRoot = counsel.targetProjectRoot

module.exports = {

  projectCounter: 0,

  setupTestProject (destRootDirname, opts) {
    const testProjectId = this._createTestProject(destRootDirname, opts)
    const dummyTestPkgDir = path.join(destRootDirname, testProjectId)
    process.chdir(dummyTestPkgDir)

    // squash counsel target project attrs
    counsel.targetProjectRoot = dummyTestPkgDir
    counsel.targetProjectPackageJsonFilename = path.join(dummyTestPkgDir, 'package.json')
    counsel.targetProjectPackageJson = require(counsel.targetProjectPackageJsonFilename)
    counsel._targetProjectPackageJsonPristine = cloneDeep(counsel.targetProjectPackageJson)

    return testProjectId
  },

  _createTestProject (destRootDirname, opts) {
    ++this.projectCounter
    opts = opts || { git: true }
    const dummyProjectPrefix = 'dummy-project-test-'
    const projectId = `${dummyProjectPrefix}${this.projectCounter}`
    const destDirname = path.join(destRootDirname, projectId)
    const destGitDirname = path.join(destDirname, '.git')
    const dummyProjectDirname = path.resolve(__dirname, 'dummy-project')
    const cmd = [
      `rm -rf ${dummyProjectPrefix}*`, // clean!
      `cp -r ${dummyProjectDirname} ${destDirname}`,
      opts.git ? `mkdir -p ${destGitDirname}` : `rm -rf ${destGitDirname}`
    ].join(' && ')
    cp.execSync(cmd, { cwd: destRootDirname })
    return projectId
  },

  teardownTestProject (destRootDirname, projectId) {
    try {
      counsel.targetProjectRoot = counselDefaultProjectRoot
      const toRemoveDirname = path.join(destRootDirname, projectId)
      cp.execSync(`rm -rf ${toRemoveDirname}`)
      process.chdir(__dirname)
    } catch (err) {
      console.error(err)
    }
  }
}
