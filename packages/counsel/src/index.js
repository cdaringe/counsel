'use strict'

const logger = require('./logger')
const project = require('./project')
const Rule = require('counsel-common').Rule
const cp = require('child_process')
const cloneDeep = require('lodash.clonedeep')
const fs = require('fs')
const path = require('path')

const targetProjectRoot = project.findProjectRoot()
const targetProjectPackageJsonFilename = path.join(targetProjectRoot, 'package.json')
const targetProjectPackageJson = require(targetProjectPackageJsonFilename)

module.exports = {
  targetProjectRoot: targetProjectRoot,
  targetProjectPackageJson: targetProjectPackageJson,
  targetProjectPackageJsonFilename: targetProjectPackageJsonFilename,
  _targetProjectPackageJsonPristine: cloneDeep(targetProjectPackageJson),

  logger: logger,
  project: project,
  configKey: 'counsel',

  /**
   * 
   * 
   * @param {any} rules
   * @returns
   */
  apply(rules) {
    const config = this.targetProjectPackageJson[this.configKey] || {}
    this.targetProjectPackageJson[this.configKey] = config

    this.installDeps(rules)
    this.installDevs(rules)
    
    return rules.reduce((chain, rule) => {
      return chain.then(() => Promise.resolve(rule.apply(this)))
    },  Promise.resolve())
    .catch((err) => {
      logger.error(err)
      throw err
    })
    .then(this.isTargetPackageDirty.bind(this))
    .then(this.writeTargetPackageIfDirty.bind(this))
  },

  /**
   * 
   * 
   * @param {any} rules
   */
  installDeps(rules) {
    /**
     * 
     * 
     * @param {any} set
     * @param {any} rule
     */
    const toInstallDeps = rules.reduce((set, rule) => set.concat(rule.dependencies), [])
    const didInstall = this.npmInstall(toInstallDeps, '--save')
    if (didInstall) {
      this.targetProjectPackageJson.dependencies = 
        JSON.parse(fs.readFileSync(this.targetProjectPackageJsonFilename)).dependencies
    }
  },

  /**
   * 
   * 
   * @param {any} rules
   */
  installDevs(rules) {
    /**
     * 
     * 
     * @param {any} set
     * @param {any} rule
     */
    const toInstallDevs = rules.reduce((set, rule) => set.concat(rule.devDependencies), [])
    const didInstall = this.npmInstall(toInstallDevs, '--save-dev')
    if (didInstall) {
      this.targetProjectPackageJson.devDependencies = 
        JSON.parse(fs.readFileSync(this.targetProjectPackageJsonFilename)).devDependencies
    }
  },

  /**
   * 
   * 
   * @returns
   */
  isTargetPackageDirty() {
    return JSON.stringify(this.targetProjectPackageJson) !== JSON.stringify(this._targetProjectPackageJsonPristine)
  },

  /**
   * 
   * 
   * @param {any} packages
   * @param {any} flag
   * @returns {boolean} flag if packages were installed
   */
  npmInstall(packages, flag) {
    const isDev = flag === '--save' ? false : true
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

  /**
   * 
   * 
   * @param {any} isDirty
   */
  writeTargetPackageIfDirty(isDirty) {
    if (!isDirty) return
    fs.writeFileSync(
      this.targetProjectPackageJsonFilename,
      JSON.stringify(this.targetProjectPackageJson, null, 2)
    )
  }
}