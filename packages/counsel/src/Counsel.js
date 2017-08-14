const { createLogger } = require('./logger')
const { Project } = require('./Project')
const Rule = require('counsel-rule')
const cloneDeep = require('lodash.clonedeep')
const uniq = require('lodash.uniq')
const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const pify = require('pify')
const resolve = pify(require('resolve'))

/**
 * @class Counsel
 */
class Counsel {

  constructor () {
    this.logger = createLogger({})
    this._configKey = 'counsel'
    this.project = new Project()

    /**
     * parsed package.json of target project
     * @property targetProjectPackageJson
     * @type {object}
     */
    this.targetProjectPackageJson = null
    /**
     * filename of target project's package.json
     * @property targetProjectPackageJsonFilename
     * @type {string}
     */
    this.targetProjectPackageJsonFilename = null
    /**
     * golden copy of target project package.json
     * @private
     */
    this._targetProjectPackageJsonPristine = null

    /**
     * dirname of project to apply counsel too
     * @property targetProjectRoot
     * @type {string}
     */
    this.targetProjectRoot = null
  }

  /**
   * sets the field in package.json that you can configure your counsel runner with.
   * also, sets the logger name.
   * @property configKey
   * @type {string}
   */
  get configKey () { return this._configKey }
  set configKey (key) {
    const tport = this.logger.transports.console
    // istanbul ignore next
    if (tport) tport.name = tport.label = key
    this._configKey = key
  }

  /**
   * value(s) in package.json that you can configure your counsel runner with.
   * @property configKey
   * @type {string}
   */
  get config () {
    return cloneDeep(this._targetProjectPackageJsonPristine[this._configKey] || {})
  }
  set config (prop) {
    throw new Error('config is user configurable only')
  }

  /**
   * main counsel entry point. applies rules.
   * @param {Rules[]} rules
   * @returns {Promise<RuleResult[]>}
   */
  async apply (rules) {
    let results
    if (!rules) throw new Error('rules not provided')
    await this.setTargetPackageMeta()
    const toExecute = await this.applyConsumerConfig(rules)
    await this.installDeps(toExecute)
    await this.installDevs(toExecute)
    try {
      results = await this.process({ rules: toExecute, method: 'apply' })
    } catch (err) {
      this.logger.error(`${this._configKey} failed to apply rules.`)
      throw err
    }

    if (this.isTargetPackageDirty()) await this.writeTargetPackage()
    return results
  }

  /**
   * Apply consuming package counsel config
   * @private
   * @param {Rule[]} rules
   * @return {Rule[]} rules
   */
  async applyConsumerConfig (_rules) {
    let rules = _rules ? [ ..._rules ] : []
    const config = this.config
    if (config.rulesets) {
      for (let i in config.rulesets) {
        const ruleset = config.rulesets[i]
        try {
          // use external resolve algorithm to be robust about a preloaded runtime
          // require-resolve context
          const resolvedFilename = await resolve(ruleset, { basedir: process.cwd() })
          const resolvedRules = require(resolvedFilename).rules // e.g. require('cdaringe-counsel-rules-web'
          rules = rules.concat(resolvedRules)
        } catch (err) {
          console.error('unable to extract rules from ruleset: ' + ruleset)
          throw err
        }
      }
    }
    // allow user's config.rules to filter down applied rules
    rules = config.rules ? rules.filter(rule => config.rules.indexOf(rule.name) > -1) : rules
    if (!config.overrides) return rules
    return rules.filter(rule => {
      let pkgOverrides = config.overrides[rule.name]
      if (!pkgOverrides) return false // null drops rule
      // istanbul ignore else
      if (pkgOverrides.dependencies) Rule.prototype._applyDependencyOverrides.apply(rule, [{ dev: false, override: pkgOverrides.dependencies }])
      // istanbul ignore else
      if (pkgOverrides.devDependencies) Rule.prototype._applyDependencyOverrides.apply(rule, [{ dev: true, override: pkgOverrides.devDependencies }])
      return true
    })
  }

  /**
   * Assert that each rule has been applied.  Test that all `check` methods are
   * run all all active rules
   * @param {Rule[]} rules
   * @returns {Promise}
   */
  async check (rules) {
    let results
    if (!rules) throw new Error('rules not provided')
    await this.setTargetPackageMeta()
    const toExecute = await this.applyConsumerConfig(rules)
    try {
      results = await this.process({ rules: toExecute, method: 'check' })
    } catch (err) {
      this.logger.error(`${this._configKey} check failed`)
      this.logger.error(err)
      throw err
    }
    return results
  }

  async create ({ dir, ruleset }) {
    const exists = await fs.exists(dir)
    if (exists) throw new Error(`${dir} already exists. cannot create new project`)
    await fs.mkdirp(dir)
    await [
      'hub init',
      'hub commit --allow-empty -m "feat(pkg): init <counsel>"',
      'hub create',
      'hub push origin HEAD',
      'hub browse',
      'npm init -y'
    ].reduce(async (last, cmd) => {
      const cwd = path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir)
      await last
      const proc = execa.shell(cmd, { cwd })
      proc.stdout.pipe(process.stdout)
      return await proc
    }, Promise.resolve())
    const cwd = process.cwd()
    process.chdir(dir)
    const targetCounsel = new Counsel()
    const res = await targetCounsel.inject({ package: ruleset, packageManager: 'npm' })
    process.chdir(cwd)
    return res
  }

  /**
   *
   * @param {*} opts
   * @param {string} opts.package ruleset pacakge to inject into project
   * @param {string} [opts.packageManager] npm, yarn, etc
   * @returns {Promise<RuleResult[]>}
   */
  async inject (opts) {
    let { package: pkg } = opts
    pkg = pkg.trim()
    if (!pkg) throw new Error('inject requires package')
    await this.setTargetPackageMeta()
    await this.installPackages([pkg], {
      dev: true,
      packageManager: opts.packageManager
    })
    const conf = this.targetProjectPackageJson.counsel = this.targetProjectPackageJson.counsel || {}
    conf.rulesets = conf.rulesets || []
    conf.rulesets.push(pkg)
    await this.apply([])
  }

  /**
   * Read and parse a json file
   * @param {string} filename
   * @returns {Promise<Object>}
   */
  async jsonRead (filename) {
    const raw = await fs.readFile(filename)
    return JSON.parse(raw.toString())
  }

  async jsonReadPackage () {
    return await this.jsonRead(this.targetProjectPackageJsonFilename)
  }

  /**
   * takes a set of packages requested to be installed, returns the set of packages
   * not yet installed from initial list.
   * @private
   * @param {string[]} set deps to be installed
   * @param {string} depType [dev]dependencies
   * @returns {string[]}
   */
  _filterToInstallPackages (set, depType) {
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
    // istanbul ignore next
    set = set.filter(name => name) // drop undefined
    return set
  }

  /**
   * install deps reequired by rule set
   * @param {Rules[]} rules
   * @returns {Promise<null>}
   */
  async installDeps (rules) {
    let toInstallDeps = rules.reduce((set, rule) => set.concat(rule.dependencies || []), [])
    toInstallDeps = this._filterToInstallPackages(toInstallDeps, 'dependencies')
    const didInstall = await this.installPackages(toInstallDeps)
    // istanbul ignore else
    if (didInstall) {
      const tPkg = await this.jsonRead(this.targetProjectPackageJsonFilename)
      this.targetProjectPackageJson.dependencies = tPkg.dependencies
    }
    return null
  }

  /**
   * install devDeps reequired by rule set
   * @param {Rules[]} rules
   * @returns {Promise<rule>}
   */
  async installDevs (rules) {
    let toInstallDevs = rules.reduce((set, rule) => set.concat(rule.devDependencies || []), [])
    toInstallDevs = this._filterToInstallPackages(toInstallDevs, 'devDependencies')
    const didInstall = await this.installPackages(toInstallDevs, { dev: true })
    // istanbul ignore else
    if (didInstall) {
      const tPkg = await this.jsonRead(this.targetProjectPackageJsonFilename)
      this.targetProjectPackageJson.devDependencies = tPkg.devDependencies
    }
  }

  /**
   * Determines if the target project's package.json has changed (during rule application)
   * @returns {boolean}
   */
  isTargetPackageDirty () {
    const pkg1 = JSON.stringify(this._targetProjectPackageJsonPristine)
    const pkg2 = JSON.stringify(this.targetProjectPackageJson)
    return pkg1 !== pkg2
  }

  /**
   * run `npm install` for dev or std deps
   * @param {string[]} packages set of packages in form accepted by npm
   * @param {object} [opts]
   * @param {boolean} [opts.dev] [default: false]
   * @param {string} [opts.packageManager] npm, yarn, etc
   * @returns {boolean} indicator if packages were installed
   */
  /* istanbul ignore next */
  async installPackages (packages, opts) {
    opts = opts || {}
    const isDev = !!opts.dev
    let bin = opts.packageManager
    let isYarn
    if (!bin) {
      isYarn = await this.project.isYarn(this.proj)
      bin = isYarn ? 'yarn' : 'npm'
    }
    const installCmd = isYarn ? 'add' : 'install'
    const toInstall = uniq(packages.filter(p => p))
    let flag = ''
    if (isDev) flag = isYarn ? '--dev' : '--save-dev'
    if (!toInstall.length) return false
    this.logger.info(`installing ${isDev ? 'development' : ''} dependencies: ${toInstall.join(', ')}`)
    try {
      const cmd = `${bin} ${installCmd} ${flag} ${toInstall.join(' ')}`
      this.logger.verbose(cmd)
      const installP = execa.shell(
        cmd,
        { cwd: this.targetProjectRoot }
      )
      installP.stdout.pipe(process.stdout)
      await installP
    } catch (err) {
      if (err) return this.logger.error(err)
    }
    return true
  }

  async process ({ rules, method }) {
    const results = []
    for (let ndx in rules) {
      const rule = rules[ndx]
      if (rule[method]) {
        let res = rule[method](this, this.config)
        results.push(await Promise.resolve(res))
      } else {
        results.push(null)
      }
    }
    return results
  }

  /**
   * scours filesystem to find data about the project we will be counseling.
   * updates class properties.
   * @returns {undefined}
   */
  async setTargetPackageMeta () {
    this.targetProjectRoot = this.targetProjectRoot ? this.targetProjectRoot : await this.project.findProjectRoot(process.cwd())
    this.targetProjectPackageJsonFilename = this.targetProjectPackageJsonFilename ? this.targetProjectPackageJsonFilename : path.join(this.targetProjectRoot, 'package.json')
    this.targetProjectPackageJson = this.targetProjectPackageJson ? this.targetProjectPackageJson : await this.jsonRead(this.targetProjectPackageJsonFilename)
    this._targetProjectPackageJsonPristine = cloneDeep(this.targetProjectPackageJson)
    this.logger.verbose(`Target package: ${this.targetProjectPackageJson.name || 'UNNAMED PACKAGE'} @ ${this.targetProjectRoot}`)
  }

  /**
   * write the project package.json if it's dirty
   * @returns {undefined}
   */
  async writeTargetPackage () {
    return await fs.writeFile(
      this.targetProjectPackageJsonFilename,
      JSON.stringify(this.targetProjectPackageJson, null, 2)
    )
  }
}

module.exports = {
  Counsel
}
