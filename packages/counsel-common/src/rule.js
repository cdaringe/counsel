'use strict'

/**
 * Counsel Rule to run/enforce on project
 * @class Rule
 */
class Rule {
  constructor(declaration) {
    this.declaration = {}
    Object.assign(this.declaration, declaration)
  }

  get dependencies() {
    return this.declaration.dependencies || []
  }

  set dependencies(deps) {
    this.declaration.dependencies = deps
  }

  get devDependencies() {
    return this.declaration.devDependencies || []
  }

  set devDependencies(deps) {
    this.declaration.devDependencies = deps
  }

  get name() {
    return this.declaration.name
  }

  apply(counsel) {
    counsel.logger.verbose(`applying rule: ${this.name || 'UNNAMED-RULE'}`)
  }
}

module.exports = Rule