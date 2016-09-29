/**
 * @module counsel
 */

'use strict'

const logger = require('./logger')
const project = require('./project')
const cp = require('child_process')
const cloneDeep = require('lodash.clonedeep')
const fs = require('fs')
const path = require('path')

const jsonRead = (p) => JSON.parse(fs.readFileSync(p))

module.exports = {
  targetProjectRoot: null,
  targetProjectPackageJson: null,
  targetProjectPackageJsonFilename: null,
  _targetProjectPackageJsonPristine: null,

  logger: logger,
  project: project,
  configKey: 'counsel',

  /**
   * main counsel entry point. applies rules.
   * @param {Rules[]} rules
   * @returns {Promise}
   */
  apply (rules) {
    this.setTargetPackageMeta()

    const config = this.targetProjectPackageJson[this.configKey] || {}
    this.targetProjectPackageJson[this.configKey] = config

    this.installDeps(rules)
    this.installDevs(rules)

    return rules.reduce((chain, rule) => {
      return chain.then(() => Promise.resolve(rule.apply(this)))
    }, Promise.resolve())
    .catch((err) => {
      logger.error(err)
      throw err
    })
    .then(this.isTargetPackageDirty.bind(this))
    .then(this.writeTargetPackageIfDirty.bind(this))
  },

  /**
   * install deps reequired by rule set
   * @param {Rules[]} rules
   * @returns {undefined}
   */
  installDeps (rules) {
    const toInstallDeps = rules.reduce((set, rule) => set.concat(rule.dependencies), [])
    const didInstall = this.npmInstall(toInstallDeps, '--save')
    if (didInstall) {
      this.targetProjectPackageJson.dependencies =
        jsonRead(this.targetProjectPackageJsonFilename).dependencies
    }
  },

  /**
   * install devDeps reequired by rule set
   * @param {Rules[]} rules
   * @returns {undefined}
   */
  installDevs (rules) {
    const toInstallDevs = rules.reduce((set, rule) => set.concat(rule.devDependencies), [])
    const didInstall = this.npmInstall(toInstallDevs, '--save-dev')
    if (didInstall) {
      this.targetProjectPackageJson.devDependencies =
        jsonRead(this.targetProjectPackageJsonFilename).devDependencies
    }
  },

  /**
   * Determines if the target project's package.json has changed (during rule application)
   * @returns {boolean}
   */
  isTargetPackageDirty () {
    const pkg1 = JSON.stringify(this._targetProjectPackageJsonPristine)
    const pkg2 = JSON.stringify(this.targetProjectPackageJson)
    return pkg1 !== pkg2
  },

  /**
   * run `npm install` for dev or std deps
   * @param {string[]} packages set of packages in form accepted by npm
   * @param {string} flag `--save` or `--save-dev`
   * @returns {boolean} indicator if packages were installed
   */
  npmInstall (packages, flag) {
    const isDev = flag === '--save-dev'
    if (!packages.length) return false
    logger.info(`installing ${isDev ? 'development' : ''} dependencies: ${packages.join(', ')}`)
    let rslt
    try {
      rslt = cp.execSync(`npm install ${flag} ${packages.join(' ')}`, { cwd: this.targetProjectRoot })
    } catch (err) {
      if (err) return logger.error(err)
    }
    logger.info(`install results:\n\n\t${rslt.toString().replace(/\n/g, '\n\t')}`)
    return true
  },

  setTargetPackageMeta () {
    this.targetProjectRoot = this.targetProjectRoot ? this.targetProjectRoot : project.findProjectRoot(process.cwd())
    this.targetProjectPackageJsonFilename = this.targetProjectPackageJsonFilename ? this.targetProjectPackageJsonFilename : path.join(this.targetProjectRoot, 'package.json')
    this.targetProjectPackageJson = this.targetProjectPackageJson ? this.targetProjectPackageJson : jsonRead(this.targetProjectPackageJsonFilename)
    this._targetProjectPackageJsonPristine = cloneDeep(this.targetProjectPackageJson)
    this.logger.verbose([
      `Target package: ${this.targetProjectPackageJson.name} @ ${this.targetProjectPackageJsonFilename}`
    ].join(''))
  },

  /**
   * write the project package.json if it's dirty
   * @param {boolean} isDirty
   * @returns {undefined}
   */
  writeTargetPackageIfDirty (isDirty) {
    if (!isDirty) return
    fs.writeFileSync(
      this.targetProjectPackageJsonFilename,
      JSON.stringify(this.targetProjectPackageJson, null, 2)
    )
  }
}
