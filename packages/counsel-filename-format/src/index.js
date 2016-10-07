'use strict'

const Rule = require('counsel-rule')
const pify = require('pify')
const glob = require('glob')
const path = require('path')
const noop = () => {}

const DEFAULT_IGNORE = [/README.*/, 'package.json', 'node_modules']

/**
 * @class FilenameFormatRule
 */
module.exports = class FilenameFormatRule extends Rule {

  /**
   * Creates an instance of FilenameFormatRule.
   *
   * @param {object} opts
   * @param {string|string[]} opts.fileFormatExtensions js,coffee,etc
   * @param {string|string[]} opts.fileFormatExclude filename, path. default ignores README*, package.json
   * @param {function} opts.fileFormatFunction accepts file basename as input
   */
  constructor (opts) {
    super(opts)
    noop()
  }

  removeExluded (filenames, exclude) {
    if (!filenames.length) return filenames
    return filenames.filter(f => !exclude.some(excl => f.match(excl)))
  }

  removeValid (filenames, fn) {
    if (!filenames.length) return filenames
    return filenames.filter(f => {
      const extname = path.extname(f)
      const basename = path.basename(f).replace(extname, '')
      return basename !== fn(basename)
    })
  }

  check (counsel) {
    const projectRoot = counsel.targetProjectRoot
    let extensions = this.declaration.fileFormatExtensions
    extensions = (Array.isArray(extensions) ? extensions : [extensions])
    extensions = extensions
      .filter(f => f)
      .map(f => f.trim())
      .map(f => f.replace(/^\./, ''))
      .map(f => `**/*.${f}`)
    let exclude = this.declaration.fileFormatExclude
    exclude = (Array.isArray(exclude) ? exclude : [exclude]).concat(DEFAULT_IGNORE)
      .filter(f => f)
      .map(f => f.trim ? f.trim() : f)
    const formatFn = this.declaration.fileFormatFunction

    return pify(glob)(
      extensions.join('|'),
      {
        cwd: projectRoot,
        ignore: ['node_modules']
      }
    )
    .then(filenames => this.removeValid(filenames, formatFn))
    .then(filenames => this.removeExluded(filenames, exclude))
    .then(violating => {
      if (violating.length) {
        throw new Error([
          'the following files are in violation of a file format naming rule:',
          `\t${violating.join(', ')}`
        ].join('\n'))
      }
    })
  }
}
