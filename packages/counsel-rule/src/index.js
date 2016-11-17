'use strict'

const without = require('./without')

/**
 * Counsel Rule to run/enforce on project
 * @class Rule
 */
class Rule {
  constructor (declaration) {
    this.declaration = {}
    Object.assign(this.declaration, declaration)
  }

  get dependencies () {
    return this.declaration.dependencies || []
  }

  set dependencies (deps) {
    this.declaration.dependencies = deps
  }

  get devDependencies () {
    return this.declaration.devDependencies || []
  }

  set devDependencies (deps) {
    this.declaration.devDependencies = deps
  }

  get name () {
    return this.declaration.name
  }

  /**
   * applies a single counsel rule
   * @param {any} counsel
   * @memberOf Rule
   */
  apply (counsel) {
    counsel.logger.verbose(`applying rule: ${this.name || 'UNNAMED-RULE'}`)
  }

  _applyDependencyOverrides ({ override, dev }) {
    if (!override) throw new Error('missing override')
    const depKey = dev ? 'devDependencies' : 'dependencies'
    let toSubtract = override.minus || override.subtract
    let toAdd = override.plus || override.add
    if (Array.isArray(override)) {
      this[depKey] = override
    }
    if (toSubtract) {
      toSubtract = Array.isArray(toSubtract) ? toSubtract : [ toSubtract ]
      toSubtract.forEach(sub => { without(this[depKey], sub) })
    }
    if (toAdd) {
      toAdd = Array.isArray(toAdd) ? toAdd : [ toAdd ]
      toAdd.forEach(add => { this[depKey] = this[depKey].concat(add) })
    }
  }
}

module.exports = Rule
