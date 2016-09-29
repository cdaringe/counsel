/**
 * @module project
 * @private
 */

'use strict'

const fs = require('fs')
const path = require('path')
const logger = require('./logger')

/**
 * @private
 */
const internals = {
  /**
   * Find the topmost parent of the given module.
   * @param {Module} mod
   * @returns {Module}
   */
  findParent (mod) {
    return mod.parent ? internals.findParent(mod.parent) : mod
  },

  /**
   * Recursively creates directories until `path` exists
   * @param {string} path
   */
  mkdir (p) {
    var mode = ~process.umask() & parseInt('777', 8)
    if (exports.isDir(p)) return
    try {
      fs.mkdirSync(p, mode)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
      internals.mkdir(path.dirname(p))
      internals.mkdir(p)
    }
  },

  /**
   * Determine if source is a directory or a file and call the appropriate method
   * @param {string} source
   * @param {string} target
   * @param {object} [options]
   * @returns {undefined}
   */
  copy (source, target, options) {
    if (exports.isDir(source)) {
      internals.copyDirectory(source, target, options)
    } else {
      return exports.copyFile(source, target, options)
    }
  },

  /**
   * Recursively copy a directory
   * @param {string} source
   * @param {string} target
   * @param {object} [options]
   */
  copyDirectory (source, target, options) {
    internals.mkdir(target)
    var sources = fs.readdirSync(source)
    for (var i = 0, l = sources.length; i < l; ++i) {
      var sourcepath = path.join(source, sources[i])
      var targetpath = path.join(target, sources[i])
      internals.copy(sourcepath, targetpath, options)
    }
  }
}

Object.assign(exports, {
  // Expands source and target to absolute paths, then calls internals.copy
  copy (source, target, options) {
    if (typeof target === 'object') {
      options = target
      target = undefined
    }
    options = options || {}

    var root = path.dirname(internals.findParent(module).filename)
    var projectRoot = exports.findProjectRoot(root)

    var sourcepath = path.resolve(root, source)
    var targetpath = path.resolve(projectRoot, target || source)

    if (targetpath.indexOf(projectRoot) !== 0) {
      throw new Error('Destination must be within project root')
    }

    return internals.copy(sourcepath, targetpath, options)
  },

  // Copy a single file
  copyFile (source, target, options) {
    internals.mkdir(path.dirname(target))
    var mode = ~process.umask() & parseInt('666', 8)
    if (fs.existsSync(target) && !options.overwrite) {
      return new Error(target + ' already exists')
    }
    var sourceContent = ''
    try {
      sourceContent = fs.readFileSync(source)
    } catch (err) {
      // @TODO this is very naughty, nlf!
      // pass
    }
    fs.writeFileSync(target, sourceContent, { flag: 'w', mode: mode })
  },

  // Given a path, determine if the path is a directory
  isDir (path) {
    try {
      var stat = fs.statSync(path)
      return stat.isDirectory()
    } catch (e) {
      return false
    }
  },

  /**
   * Given a starting directory, find the root of a git repository.
   * In this case, the root is defined as the first directory that contains
   * a directory named ".git"
   * @param {string} start
   * @returns {string|undefined}
   */
  findGitRoot (start) {
    var root
    start = start || path.dirname(internals.findParent(module).filename)
    if (exports.isDir(path.join(start, '.git'))) {
      root = start
    } else if (path.dirname(start) !== start) {
      root = exports.findGitRoot(path.dirname(start))
    } else {
      logger.error('Unable to find a .git directory for this project')
      process.exit(1)
    }
    return root
  },

  /**
   * Given a starting directory, find the root of the current project.
   * The root of the project is defined as the topmost directory that is
   * *not* contained within a directory named "node_modules" that also
   * contains a file named "package.json"
   * @param {string} start
   * @returns {string}
   */
  findProjectRoot (start) {
    start = start || path.dirname(internals.findParent(module).filename)
    var position = start.indexOf('node_modules')
    var root = start.slice(0, position === -1 ? undefined : position - path.sep.length)
    if (root === path.resolve(root, '..')) {
      logger.error('Unable to find a package.json for this project')
      process.exit(1)
    }
    while (!fs.existsSync(path.join(root, 'package.json'))) {
      root = exports.findProjectRoot(path.dirname(root))
    }
    return root
  },

  /**
   * Install the git hook as specified by `hook`.
   * For example, `.installHook('pre-commit')`
   * @param {object} opts
   * @param {string|string[]} opts.hooks
   * @param {string} [opts.root]
   * @param {boolean} [opts.search] search for git dir. if false, root must be provided
   * @returns {undefined}
   */
  installHooks (opts) {
    let hooks = opts.hooks || opts.hook
    let root = opts.root
    let search = !!opts.search
    hooks = Array.isArray(hooks) ? hooks : [hooks]
    var gitRoot = search ? exports.findGitRoot(root) : root
    if (!exports.isDir(path.join(gitRoot, '.git'))) {
      throw new Error(`.git folder not found in project root ${gitRoot}`)
    }
    var hookRoot = path.join(gitRoot, '.git', 'hooks')
    var source = path.resolve(__dirname, '..', 'bin', 'validate.sh')
    if (!exports.isDir(hookRoot)) internals.mkdir(hookRoot)
    for (var i = 0, il = hooks.length; i < il; ++i) {
      var hook = hooks[i]
      var dest = path.join(hookRoot, hook)
      if (fs.existsSync(dest)) {
        fs.renameSync(dest, dest + '.backup')
      }
      fs.writeFileSync(dest, fs.readFileSync(source), { mode: 511 })
    }
  }

})
