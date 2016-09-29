'use strict'

const Rule = require('./rule')
const xor = require('lodash/xor')

/**
 * Adds `git` pre-commit hooks to the project.  Enables you to specify a set of
 * tasks that are guaranteed to run and pass on git commit, assuming `-n` not passed
 * to bypass.
 * @class PreCommitRule
 * @extends {Rule}
 */
class PreCommitRule extends Rule {

  /**
   * Adds the requested script to the package.json
   * @note Rule's shall not write the package.json file.  counsel shall
   * write the file on our behalf to not trash the disk and many rules may update
   * it
   * @memberOf ScriptRule
   */
  apply (counsel, ruleConfig) {
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
    const taskDiff = xor(tasks, prevTasks || [])
    if (prevTasks && taskDiff.length) {
      counsel.logger.warn([
        `existing pre-commit tasks found.  leaving untouched.  consider adding`,
        `the following tasks: ${taskDiff.join(', ')}`
      ].join(' '))
      return
    }
    counsel.project.installHooks(hook)
    pkg[hook] = tasks
  }
}

module.exports = PreCommitRule
