'use strict'

const fs = require('fs-extra')
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
    const project = await this._createTestProject()
    const { dir } = project

    // squash counsel target project attrs
    counsel.targetProjectRoot = dir
    counsel.targetProjectPackageJsonFilename = path.join(dir, 'package.json')

    // stub install process 4 speeeeeed 🏁
    counsel.installPackages = async function (packages, opts) {
      opts = opts || {}
      const { dev: isDev } = opts
      packages.map(pkgName => {
        return mockNpmInstall.install({
          isDev,
          package: { name: pkgName, version: '100.200.300' },
          nodeModulesDir: path.join(dir, 'node_modules'),
          targetPackage: path.join(dir, 'package.json')
        })
      })
      return true
    }
    return project
  }

  async _createTestProject (opts) {
    const dir = path.join(os.tmpdir(), Math.random().toString().substr(2))
    const gitDir = path.join(dir, '.git')
    const buildDir = path.join(dir, 'build')
    const dummyProjectDirname = path.resolve(__dirname, 'dummy-project')
    await fs.copy(dummyProjectDirname, dir)
    await Promise.all([
      fs.mkdirp(gitDir),
      fs.mkdirp(buildDir)
    ])
    return {
      dir,
      gitDir,
      buildDir
    }
  }

  async teardown ({ dir }) {
    await fs.remove(dir)
  }
}

module.exports = new TestProjectUtil()
