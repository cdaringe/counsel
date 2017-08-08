'use strict'

const Rule = require('counsel-rule')

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
   * @param {string[]|RegExp[]} [opts.scriptCommandVariants] permitted variants of the script. '*' for permitting any alternative
   * @param {boolean} [opts.scriptAppend] default false. will append _exact_ script to any pre-existing
   * @memberOf ScriptRule
   */
  constructor (opts) {
    super(opts)
    if (!this.declaration.scriptName) throw new ReferenceError('script rule must contain a scriptName')
    if (!this.declaration.scriptCommand) throw new ReferenceError('script rule must contain a scriptcmd')
    const variants = opts.scriptCommandVariants
    this.isAnyVariantValid = variants && variants.length
      ? (variants.indexOf('*') > -1 || variants === '*')
      : false
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
    const append = this.declaration.scriptAppend
    if (!pkg.scripts) pkg.scripts = {}
    if (!prexistingCmd) {
      pkg.scripts[name] = cmd
      return
    }
    // script key already has cmd specified. handle it.
    if (append && !prexistingCmd.match(cmd)) {
      pkg.scripts[name] = `${prexistingCmd} && ${cmd}`
      return
    }
    if (this.satisfiesVariants(counsel)) return
    const err = new Error(`failed to apply command "${cmd}" to script "${name}"`)
    err.code = 'ENOSCRIPTINSTALL'
    return Promise.reject(err)
  }

  /**
   * Asserts that the specified cmd exists in the corresponding script or that
   * an approved variant is present
   * @param {Counsel} counsel
   * @returns {Promise}
   */
  check (counsel) {
    const pkg = counsel.targetProjectPackageJson
    const name = this.declaration.scriptName
    const missingScriptError = new Error(`missing ${name} script in package.json`)
    missingScriptError.code = 'ENOSCRIPT'
    if (!pkg.scripts) return Promise.reject(missingScriptError)
    const actual = pkg.scripts[name]
    if (!actual) return Promise.reject(missingScriptError)
    const requested = this.declaration.scriptCommand
    if (
      requested.trim() === actual.trim() ||
      this.satisfiesVariants(counsel)
    ) return Promise.resolve()
    const err = new Error(`script ${name} not found with requested command or variants`)
    err.code = 'ENOSCRIPT'
    return Promise.reject(err)
  }

  getVariants () {
    return (this.declaration.scriptCommandVariants || []).concat([this.declaration.scriptCommand])
  }

  satisfiesVariants (counsel) {
    const pkg = counsel.targetProjectPackageJson
    const name = this.declaration.scriptName
    if (!pkg.scripts) return false
    const actual = pkg.scripts[name]
    if (!actual) return false
    if (this.isAnyVariantValid) return true
    const variants = this.getVariants()
    return variants
    .filter(variant => variant)
    .some(function testIfCmdMatchesVariant (variant) {
      if (actual.trim() === variant) return true
      if (variant.test && variant.test(actual.trim())) return true
      return false
    })
  }
}

module.exports = ScriptRule
