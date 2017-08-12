'use strict'

const fs = require('fs-extra')
const cp = require('child_process') // @TODO, use fs.extra for x-platform compat, for crying out loud.
const path = require('path')
const mockNpmInstall = require('mock-package-install')
const os = require('os')

class TestProjectUtil {
  constructor () {
    this._createTestProject = this._createTestProject.bind(this)
    this.setup = this.setup.bind(this)
    this.teardown = this.teardown.bind(this)
  }

  /**
   * Create a new test project to simulate counsel on
   * @param {*} opts
   * @param {Counsel} opts.counsel
   */
  async setup (opts) {
    const { counsel } = opts || {}
    const dummyDir = await this._createTestProject()

    // squash counsel target project attrs
    counsel.targetProjectRoot = dummyDir
    counsel.targetProjectPackageJsonFilename = path.join(dummyDir, 'package.json')

    // stub install process 4 speeeeeed 🏁
    counsel.installPackages = async function (packages, opts) {
      opts = opts || {}
      const { dev: isDev } = opts
      packages.map(pkgName => {
        return mockNpmInstall.install({
          isDev,
          package: { name: pkgName, version: '100.200.300' },
          nodeModulesDir: path.join(dummyDir, 'node_modules'),
          targetPackage: path.join(dummyDir, 'package.json')
        })
      })
      return true
    }
    return dummyDir
  }

  async _createTestProject (opts) {
    const destDirname = path.join(os.tmpdir(), Math.random().toString().substr(2))
    const dummyProjectDirname = path.resolve(__dirname, 'dummy-project')
    await fs.copy(dummyProjectDirname, destDirname)
    return destDirname
  }

  async teardown ({ dir }) {
    await fs.remove(dir)
  }
}

module.exports = new TestProjectUtil()
