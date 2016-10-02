'use strict'

const Rule = require('counsel-rule')
const xor = require('lodash.xor')
const noop = () => {}

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
    noop() // bypass useless constructor warning. @jsdoc must happen!
  }

  /**
   * Adds the requested script to the package.json
   * @note Rule's shall not write the package.json file.  counsel shall
   * write the file on our behalf to not trash the disk and many rules may update
   * it
   * @override
   * @memberOf ScriptRule
   * @param {Module} counsel
   * @returns {undefined}
   */
  apply (counsel) {
    Rule.prototype.apply.apply(this, arguments)
    const pkg = counsel.targetProjectPackageJson
    let tasks = ['validate', 'lint', 'test']
    if (!Array.isArray(this.declaration.preCommitTasks)) {
      counsel.logger.info(`no \`preCommitTasks\` tasks specified, installing default pre-commit tasks`)
    } else {
      tasks = this.declaration.preCommitTasks
    }
    const hook = 'pre-commit'
    const prevTasks = pkg[hook]
    if (prevTasks && xor(tasks, prevTasks).length) {
      counsel.logger.warn([
        `existing pre-commit tasks found.  leaving untouched.\n`,
        `\tcurrent tasks: ${prevTasks}\n`,
        `\trequested tasks: ${tasks}\n`
      ].join(' '))
      return
    }
    counsel.project.installHooks({
      hook: hook,
      root: counsel.targetProjectRoot,
      search: false
    })
    pkg[hook] = tasks
  }
}

module.exports = PreCommitRule