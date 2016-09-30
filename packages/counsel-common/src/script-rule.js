'use strict'

const Rule = require('./rule')
const DEFAULT_NPM_SCRIPTS = [/no test/]

/**
 * Adds a script to the target package's package.json
 *
 * @class ScriptRule
 * @extends {Rule}
 */
class ScriptRule extends Rule {
  /**
   * Creates an instance of ScriptRule.
   *
   * @param {object} opts
   * @param {string} opts.scriptName npm script name
   * @param {string} opts.scriptCommand npm script command
   * @param {string[]} [opts.scriptCommandVariants] permitted variants of the script. * for permitting any alternative
   * @param {boolean} [opts.scriptAppend] default false. will append _exact_ script to any pre-existing
   * @memberOf ScriptRule
   */
  constructor (opts) {
    super(opts)
    if (!this.declaration.scriptName) throw new ReferenceError('script rule must contain a scriptName')
    if (!this.declaration.scriptCommand) throw new ReferenceError('script rule must contain a scriptcmd')
    const variants = opts.scriptCommandVariants
    this.isAnyVariantValid = (variants && variants.length) ? variants.indexOf('*') > -1 : false
    if (opts.scriptAppend && this.isAnyVariantValid) {
      throw new Error('cannot request scriptAppend and scriptCommandVariants w/ "*" simultaneously')
    }
  }
  /**
   * Adds the requested script to the package.json
   * @note Rule's shall not write the package.json file.  counsel shall
   * write the file on our behalf to not trash the disk and many rules may update
   * it
   * @memberOf ScriptRule
   * @override
   * @param {Module} counsel
   * @returns {undefined}
   */
  apply (counsel) {
    Rule.prototype.apply.apply(this, arguments)
    const pkg = counsel.targetProjectPackageJson
    const name = this.declaration.scriptName
    const cmd = this.declaration.scriptCommand
    const prexistingCmd = pkg.scripts ? pkg.scripts[name] : null
    const variants = (this.declaration.scriptCommandVariants || []).concat([cmd])
    const append = this.declaration.scriptAppend
    const isDefaultScript = DEFAULT_NPM_SCRIPTS
    .filter(v => v && v.test)
    .some(rgx => rgx.test(prexistingCmd))
    if (!pkg.scripts) pkg.scripts = {}
    if (!prexistingCmd) {
      pkg.scripts[name] = cmd
      return
    }
    // script key already has cmd specified. handle it.
    if (prexistingCmd.trim() === cmd.trim()) return
    if (this.isAnyVariantValid) return
    if (variants.indexOf(prexistingCmd) > -1) return
    if (variants.filter(v => v && v.test).some(rgx => rgx.test(prexistingCmd))) return
    if (append && !prexistingCmd.match(cmd)) {
      pkg.scripts[name] = `${prexistingCmd} && ${cmd}`
      return
    }
    if (!isDefaultScript) {
      throw new Error([
        `attempted to install npm script "${name}, however existing script already present.\n`,
        `\texisting: ${prexistingCmd}\n`,
        `\tpermitted scripts: ${variants.join(' ')}\n`,
        'please remove the offending script or update/relax your counsel rules.'
      ].join(''))
    }
  }
}

module.exports = ScriptRule
