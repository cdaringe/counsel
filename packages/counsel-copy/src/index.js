'use strict'

const Rule = require('counsel-rule')
const path = require('path')
const fs = require('fs-extra')

/**
 * Copies files into a project.
 * @class CopyRule
 * @extends {Rule}
 */
class CopyRule extends Rule {

  /**
   * Creates an instance of CopyRule.
   *
   * @param {object} opts
   * @param {string|string[]} opts.copySource read carefully! this is relative to your counsel tooling package, _not_ necessarily the package being copied to!
   * @param {string} opts.copyTarget read carefully! this is relative to the root of the target package!
   * @param {object} opts.copyOptions see counsel.project#copy
   * @memberOf CopyRule
   */
  constructor (opts) {
    super(opts)
    const { src, dest } = opts
    if (!src) throw new Error('must provide a copy `src`')
    if (!dest) throw new Error('must provide a copy `dest`')
    if (!path.isAbsolute(src)) {
      throw new Error([
        'CopyRule `src` must be absolute.  see the nodejs docs for `path.resolve`',
        'on how to construct a full path from your CopyRule definition'
      ].join(' '))
    }
  }

  getAbsoluteDest (dest, counsel) {
    if (!path.isAbsolute(dest)) dest = path.join(counsel.targetProjectRoot, dest)
    return dest
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
    const { src, dest } = this.declaration
    return fs.copy(src, this.getAbsoluteDest(dest, counsel))
  }

  /**
   * Checks that copy rule content is in place
   * @TODO for directories, test for file content present, vs just target dir
   * @param {Counsel} counsel
   * @memberOf CopyRule
   */
  check (counsel) {
    const dest = this.getAbsoluteDest(this.declaration.dest, counsel)
    return fs.exists(dest)
  }
}

module.exports = CopyRule
