'use strict'

const Rule = require('counsel-common').Rule

/**
 * Copies files into a project.
 * @class CopyRule
 * @extends {Rule}
 */
class CopyRule extends Rule {

  /**
   * Creates an instance of PreCommitRule.
   *
   * @param {object} opts
   * @param {string|string[]} opts.copySource read carefully! this is relative to your counsel tooling package, _not_ necessarily the package being copied to!
   * @param {string|string[]} opts.copyTarget read carefully! this is relative to the root of the target package!
   * @param {object} opts.copyOptions see counsel.project#copy
   * @memberOf PreCommitRule
   */
  constructor (opts) {
    super(opts)
    if (!this.declaration.copySource) throw new Error('must provide a copy source')
    if (!this.declaration.copyTarget) throw new Error('must provide a copy target')
  }

  /**
   * Does copying.
   * @override
   * @memberOf CopyRule
   * @param {Module} counsel
   * @returns {undefined}
   */
  apply (counsel) {
    Rule.prototype.apply.apply(this, arguments)
    const toCopy = Array.isArray(this.declaration.copySource)
      ? this.declaration.copySource : [this.declaration.copySource]
    const dest = this.declaration.copyTarget
    toCopy.forEach(src => counsel.project.copy(
      src,
      dest,
      { targetProjectRoot: counsel.targetProjectRoot }
    ))
  }
}

module.exports = CopyRule
