'use strict'

const path = require('path')
const Rule = require('counsel-rule')
const noop = () => {}
const DEFAULT_PRECOMMIT_TASKS = ['validate', 'lint', 'test']
const HOOK = 'pre-commit'

/**
 * Adds `git` pre-commit hooks to the project.  Enables you to specify a set of
 * tasks that are guaranteed to run and pass on git commit, assuming `-n` not passed
 * to bypass.
 * @class PreCommitRule
 * @extends {Rule}
 */
class PreCommitRule extends Rule {

  /**
   * Creates an instance of PreCommitRule.
   *
   * @param {object} opts
   * @param {string[]} opts.preCommitTasks list of commands or npm tasks to run on precommit
   * @memberOf PreCommitRule
   */
  constructor (opts) {
    super(opts)
    noop() // bypass linting, useless constructor warning. @jsdoc must happen!
  }

  /**
   * Adds the requested script to the package.json
   * @note Rule's shall not write the package.json file.  counsel shall
   * write the file on our behalf to not trash the disk and many rules may update
   * it
   * @override
   * @memberOf ScriptRule
   * @param {Module} counsel
   * @param {object} config
   * @returns {undefined}
   */
  apply (counsel, config) {
    Rule.prototype.apply.apply(this, arguments)
    const pkg = counsel.targetProjectPackageJson
    const root = counsel.targetProjectRoot
    let tasks = DEFAULT_PRECOMMIT_TASKS
    let gitRoot = config.gitRoot ? path.resolve(root, config.gitRoot) : root
    counsel.project.installHooks({
      hook: HOOK,
      root: gitRoot,
      search: false
    })
    if (!Array.isArray(this.declaration.preCommitTasks)) {
      counsel.logger.info(`no \`preCommitTasks\` tasks specified, installing default pre-commit tasks`)
    } else {
      tasks = this.declaration.preCommitTasks
    }
    const prevTasks = pkg[HOOK]
    if (prevTasks) {
      counsel.logger.info('existing pre-commit tasks found.  leaving untouched.')
      return
    }
    pkg[HOOK] = tasks
  }

  /**
   * Checks that all precommit tasks are in the target package.json
   *
   * @param {Counsel} counsel
   * @throws {Error} with missing pkg info
   * @memberOf PreCommitRule
   */
  check (counsel) {
    const pkg = counsel.targetProjectPackageJson
    const actualTasks = pkg['pre-commit']
    let requestedTasks = this.declaration.preCommitTasks
    requestedTasks = Array.isArray(requestedTasks) ? requestedTasks : DEFAULT_PRECOMMIT_TASKS
    const missing = requestedTasks.filter(rT => actualTasks.indexOf(rT) < 0)
    if (missing.length) {
      const msg = `missing precommit tasks: ${missing.join(', ')}`
      if (this.declaration.strict) throw new Error(`strict rule: ${msg}`)
      counsel.logger.warn(msg)
    }
  }
}

module.exports = PreCommitRule
