'use strict'

const Rule = require('counsel-rule')
const swig = require('swig-templates')
const pify = require('pify')
const path = require('path')
const fs = require('fs')

/**
 * Runs a template engine against a template file! Your template is passed all
 * of counsel, and the the target project's package json
 * @class TemplateRule
 * @extends {Rule}
 *
 * @example
 * 'use strict'
 * const TemplateRule = require('counsel-template')
 * module.exports = new TemplateRule({
 *   templateSource: './README.swig',
 *   templateTarget: './README.md'
 * })
 */
class TemplateRule extends Rule {

  /**
   * Creates an instance of TemplateRule.
   * @param {object} opts
   * @param {string|string[]} opts.templateSource read carefully! this is relative to your counsel tooling package, _not_ necessarily the package being copied to!
   * @param {string} opts.templateTarget read carefully! this is relative to the root of the target package!
   * @memberOf TemplateRule
   */
  constructor (opts) {
    super(opts)
    if (!this.declaration.templateSource) throw new Error('must provide a template source')
    if (!this.declaration.templateTarget) throw new Error('must provide a template target')
  }

  /**
   * Does templating.
   * @override
   * @memberOf TemplateRule
   * @param {Module} counsel
   * @returns {undefined}
   */
  apply (counsel) {
    Rule.prototype.apply.apply(this, arguments)
    const templateRoot = counsel.project.findProjectRoot()
    let toTemplate = Array.isArray(this.declaration.templateSource)
      ? this.declaration.templateSource : [this.declaration.templateSource]
    toTemplate = toTemplate.map(tmpl => {
      if (path.isAbsolute(tmpl)) return tmpl
      return path.resolve(templateRoot, tmpl)
    })
    let dest = this.declaration.templateTarget
    dest = path.isAbsolute(dest) ? dest : path.resolve(counsel.targetProjectRoot, dest)
    counsel.project.mkdir(path.dirname(dest))
    return Promise.all(toTemplate.map(tmpl => {
      dest = counsel.project.isDir(dest) ? path.join(dest, path.basename(tmpl)) : dest
      return pify(fs.writeFile)(
        dest,
        swig.renderFile(tmpl, { counsel: counsel, package: counsel.targetProjectPackageJson })
      )
    }))
  }
}

module.exports = TemplateRule
