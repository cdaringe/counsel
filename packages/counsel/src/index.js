/**
 * @module counsel
 */

'use strict'

const logger = require('./logger')
const project = require('./project')
const cp = require('child_process')
const Rule = require('counsel-rule')
const cloneDeep = require('lodash.clonedeep')
const uniq = require('lodash.uniq')
const fs = require('fs')
const path = require('path')

const jsonRead = (p) => JSON.parse(fs.readFileSync(p))

module.exports = {
  /**
   * dirname of project to apply counsel too
   * @property targetProjectRoot
   * @type {string}
   */
  targetProjectRoot: null,

  /**
   * parsed package.json of target project
   * @property targetProjectPackageJson
   * @type {object}
   */
  targetProjectPackageJson: null,

  /**
   * filename of target project's package.json
   * @property targetProjectPackageJsonFilename
   * @type {string}
   */
  targetProjectPackageJsonFilename: null,

  /**
   * @private
   */
  _targetProjectPackageJsonPristine: null,

  /**
   * @property logger
   * @type {Winston}
   */
  logger: logger,

  /**
   * @property project
   * @type {Module}
   */
  project: project,

  /**
   * @private
   */
  _configKey: 'counsel',

  /**
   * sets the field in package.jon that you can configure your counsel runner with.
   * also, sets the logger name.
   * @property configKey
   * @type {string}
   */
  get configKey () {
    return this._configKey
  },
  set configKey (key) {
    const tport = this.logger.transports.console
    tport.name = tport.label = key
    this._configKey = key
  },

  config () {
    return this._targetProjectPackageJsonPristine[this._configKey] || {}
  },

  /**
   * main counsel entry point. applies rules.
   * @param {Rules[]} rules
   * @returns {Promise}
   */
  apply (rules) {
    if (!rules) throw new Error('rules not provided')
    this.setTargetPackageMeta()
    const config = this.config()
    const toExecute = this._applyCustomConfig(rules)

    this.installDeps(toExecute)
    this.installDevs(toExecute)

    return toExecute.reduce((chain, rule) => {
      if (!rule.apply) return
      return chain.then(() => Promise.resolve(rule.apply(this, config)))
    }, Promise.resolve())
    .catch((err) => {
      logger.error(err)
      logger.error('please resolve the issue and re-run the last command')
      throw err
    })
    .then(this.isTargetPackageDirty.bind(this))
    .then(this.writeTargetPackageIfDirty.bind(this))
  },

  check (rules) {
    this.setTargetPackageMeta()
    if (!rules) throw new Error('rules not provided')
    const toExecute = this._applyCustomConfig(rules)
    let currRule
    return toExecute.reduce((chain, rule) => {
      return chain.then(() => {
        if (!rule.check) return
        currRule = rule
        return Promise.resolve(rule.check(this))
      })
    }, Promise.resolve())
    .catch((err) => {
      this.logger.error(`check failed on rule: ${currRule.name}`)
      throw err
    })
  },

  /**
   * takes a set of packages requested to be installed, returns the set of packages
   * not yet installed from initial list.
   * @private
   * @param {string[]} set deps to be installed
   * @param {string} depType [dev]dependencies
   * @returns string[]
   */
  _filterPrexistingInstalledPackages (set, depType) {
    const pkg = this.targetProjectPackageJson
    const toRemove = pkg[depType] ? Object.keys(pkg[depType]) : []
    if (!set.length || !toRemove.length) return set
    toRemove.forEach((remove) => {
      let ndx = set.indexOf(remove)
      while (ndx >= 0) {
        delete set[ndx]
        ndx = set.indexOf(remove)
      }
    })
    set = set.filter(name => name) // drop undefined
    return set
  },

  _applyCustomConfig (rules) {
    const config = this.config()
    const overrides = config.overrides
    const filtered = config.rules
      ? rules.filter(rule => config.rules.indexOf(rule.name) > -1)
      : rules
    if (!overrides) return filtered
    return filtered.filter(rule => {
      let pkgOverrides = overrides[rule.name]
      if (pkgOverrides === null) return false // null drops rule
      if (pkgOverrides === undefined) return true // undefined => no change! keep it :)
      if (pkgOverrides.dependencies) Rule.prototype._applyDependencyOverrides.apply(rule, [{ dev: false, override: pkgOverrides.dependencies }])
      if (pkgOverrides.devDependencies) Rule.prototype._applyDependencyOverrides.apply(rule, [{ dev: true, override: pkgOverrides.devDependencies }])
      return true
    })
  },

  /**
   * install deps reequired by rule set
   * @param {Rules[]} rules
   * @returns {undefined}
   */
  installDeps (rules) {
    let toInstallDeps = rules.reduce((set, rule) => set.concat(rule.dependencies || []), [])
    toInstallDeps = this._filterPrexistingInstalledPackages(toInstallDeps, 'dependencies')
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
    let toInstallDevs = rules.reduce((set, rule) => set.concat(rule.devDependencies || []), [])
    toInstallDevs = this._filterPrexistingInstalledPackages(toInstallDevs, 'devDependencies')
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
    const toInstall = uniq(packages.filter(p => p))
    if (!toInstall.length) return false
    logger.info(`installing ${isDev ? 'development' : ''} dependencies: ${toInstall.join(', ')}`)
    let rslt
    try {
      rslt = cp.execSync(`npm install ${flag} ${toInstall.join(' ')}`, { cwd: this.targetProjectRoot })
    } catch (err) {
      if (err) return logger.error(err)
    }
    logger.info(`install results:\n\n\t${rslt.toString().replace(/\n/g, '\n\t')}`)
    return true
  },

  /**
   * scours filesystem to find data about the project we will be counseling.
   * updates class properties.
   * @returns {undefined}
   */
  setTargetPackageMeta () {
    this.targetProjectRoot = this.targetProjectRoot ? this.targetProjectRoot : project.findProjectRoot(process.cwd())
    this.targetProjectPackageJsonFilename = this.targetProjectPackageJsonFilename ? this.targetProjectPackageJsonFilename : path.join(this.targetProjectRoot, 'package.json')
    this.targetProjectPackageJson = this.targetProjectPackageJson ? this.targetProjectPackageJson : jsonRead(this.targetProjectPackageJsonFilename)
    this._targetProjectPackageJsonPristine = cloneDeep(this.targetProjectPackageJson)
    this.logger.verbose(`Target package: ${this.targetProjectPackageJson.name} @ ${this.targetProjectRoot}`)
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
