/**
 * @module project utilities for inspecting and modifying a npm project
 */
const fs = require('fs-extra')
const path = require('path')
const pkgUp = require('pkg-up')

class Project {
  /**
   * Find the topmost parent of the given module.
   * @param {Module} mod
   * @returns {Module}
   */
  findParentPackage (mod) {
    return mod.parent ? this.findParentPackage(mod.parent) : mod
  }

  /**
   * determines if path is a dir
   * @param {string} path
   * @returns {Promise<boolean>}
   */
  async isDir (path) {
    try {
      var stat = await fs.stat(path)
      return stat.isDirectory()
    } catch (err) {
      return false
    }
  }

  /**
   * Given a starting directory, find the root of a git repository.
   * In this case, the root is defined as the first directory that contains
   * a directory named ".git"
   * @param {string} start
   * @returns {Promise<string|null>}
   */
  async findGitRoot (start) {
    var root = null
    start = start || path.dirname(this.findParentPackage(module).filename)
    if (await this.isDir(path.resolve(start, '.git'))) {
      root = start
    } else if (path.dirname(start) !== start) {
      root = await this.findGitRoot(path.dirname(start))
    }
    return root
  }

  /**
   * Given a starting directory, find the root of the current project.
   * The root of the project is defined as the topmost directory that is
   * *not* contained within a directory named "node_modules" that also
   * contains a file named "package.json"
   */
  async findProjectRoot (start) {
    start = start || path.dirname(this.findParentPackage(module).filename)
    var position = start.indexOf('node_modules')
    var root = start.slice(0, position === -1 ? null : position - path.sep.length)
    if (root === path.resolve(root, '..')) {
      var err = new Error('Unable to find a package.json for this project')
      err.code = 'ENOPKG'
      throw err
    }
    root = await pkgUp(root)
    while (root.match(/node_modules/)) {
      root = await pkgUp(root)
    }
  }

  async isYarn (root) {
    root = root || await this.findProjectRoot()
    try {
      const stat = await fs.lstat(path.resolve(root, 'yarn.lock'))
      return !!stat
    } catch (err) {
      if (err.code === 'ENOENT') return false
      throw err
    }
  }
}

module.exports = {
  Project
}
