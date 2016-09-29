'use strict'

const cp = require('child_process') // @TODO, use fs.extra for x-platform compat, for crying out loud.
const path = require('path')

module.exports = {
  projectCounter: 0,
  createTestProject () {
    ++this.projectCounter
    const projectId = `dummy-project-test-${this.projectCounter}`
    const destDirname = path.join(__dirname, projectId)
    const destGitDirname = path.join(destDirname, '.git')
    cp.execSync([
      `cp -r dummy-project ${destDirname}`,
      `mkdir -p ${destGitDirname}`
    ].join(' && '), { cwd: __dirname })
    return projectId
  },
  teardownTestProject (projectId) {
    const toRemoveDirname = path.join(__dirname, projectId)
    cp.execSync(`rm -rf ${toRemoveDirname}`)
  }
}