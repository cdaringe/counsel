'use strict'

const Rule = require('counsel-rule')
const ScriptRule = require('counsel-script')

/**
 * Adds `git` pre-commit hooks to the project.  Enables you to specify a set of
 * tasks that are guaranteed to run and pass on git commit, assuming `-n` not passed
 * to bypass.
 * @class GitHookRule
 * @extends {Rule}
 */
class GitHookRule extends Rule {

  /**
   * Creates an instance of PreCommitRule.
   *
   * @param {object} opts
   * @param {object} opts.hooks list of commands or npm tasks to run on precommit
   * @memberOf PreCommitRule
   */
  constructor (opts) {
    super(opts)
    if (!opts || !opts.hooks) throw new Error('GitHookRule requires hooks')
    this.declaration.devDependencies = opts.devDependencies || []
    this.declaration.devDependencies.push('husky')
    this.declaration.devDependencies.push('npm-run-all')
  }

  /**
   * @property scriptRules
   * @description Set of `ScriptRule`s (counsel-script) used to deploy each
   * githook passed into GitHookRule under the `hooks` configuration object
   */
  get scriptRules () {
    var hooks = this.declaration.hooks
    var rules = []
    var name
    var conf
    var scriptCommand
    for (name in hooks) {
      if (!name.match || !(name.match(/^pre/) || name.match(/^post/))) {
        throw new Error(`invalid githook: ${name}. expected pre[task] or post[task] (e.g. precommit)`)
      }
      conf = hooks[name]
      if (Array.isArray(conf)) conf = { tasks: conf }
      if (typeof conf === 'string') conf = { command: conf }
      if (conf.command) {
        scriptCommand = conf.command
      } else if (conf.tasks) {
        scriptCommand = [
          conf.serial ? 'run-s' : 'run-p',
          conf.tasks.join(' ')
        ].join(' ')
      } else {
        throw new Error('unable to determine command or tasks for GitHookRule')
      }
      rules.push(new ScriptRule({
        scriptName: name,
        scriptCommand: scriptCommand,
        scriptCommandVariants: conf.variants || '*'
      }))
    }
    return rules
  }

  set scriptRules (rule) {
    throw new Error('script rules cannot be set. please configure via `new GitHookRule({ hooks: ... })`')
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
    return this.scriptRules.reduce((chain, _rule) => {
      chain = chain.then(function applyGitHookScriptRule (rule) {
        return rule.apply(counsel)
      }.bind(this, _rule))
      return chain
    }, Promise.resolve())
  }

  /**
   * Checks that all hook tasks are in the target package.json
   *
   * @param {Counsel} counsel
   * @throws {Error} with missing pkg info
   * @memberOf PreCommitRule
   */
  check (counsel) {
    return this.scriptRules.reduce((chain, _rule) => {
      chain = chain.then(function checkGitHookRuleScript (rule) {
        return rule.check(counsel)
      }.bind(this, _rule))
      return chain
    }, Promise.resolve())
  }
}

module.exports = GitHookRule
