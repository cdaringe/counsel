'use strict'

const cp = require('child_process') // @TODO, use fs.extra for x-platform compat, for crying out loud.
const path = require('path')
const cloneDeep = require('lodash.clonedeep')
const counsel = require('../')

const counselDefaultProjectRoot = counsel.targetProjectRoot

module.exports = {

  projectCounter: 0,

  setupTestProject (destRootDirname) {
    const testProjectId = this._createTestProject(destRootDirname)
    const dummyTestPkgDir = path.join(destRootDirname, testProjectId)
    process.chdir(dummyTestPkgDir)

    // squash counsel target project attrs
    counsel.targetProjectRoot = dummyTestPkgDir
    counsel.targetProjectPackageJsonFilename = path.join(dummyTestPkgDir, 'package.json')
    counsel.targetProjectPackageJson = require(counsel.targetProjectPackageJsonFilename)
    counsel._targetProjectPackageJsonPristine = cloneDeep(counsel.targetProjectPackageJson)

    return testProjectId
  },

  _createTestProject (destRootDirname) {
    ++this.projectCounter
    const dummyProjectPrefix = 'dummy-project-test-'
    const projectId = `${dummyProjectPrefix}${this.projectCounter}`
    const destDirname = path.join(destRootDirname, projectId)
    const destGitDirname = path.join(destDirname, '.git')
    const dummyProjectDirname = path.resolve(__dirname, 'dummy-project')
    cp.execSync([
      `rm -rf ${dummyProjectPrefix}*`, // clean!
      `cp -r ${dummyProjectDirname} ${destDirname}`,
      `mkdir -p ${destGitDirname}`
    ].join(' && '), { cwd: destRootDirname })
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
