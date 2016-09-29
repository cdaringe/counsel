'use strict'

const common = require('../')
const test = require('tape')
const Rule = common.Rule

test('rule', t => {
  const dep = 'test-dep'
  const dev = 'test-dev'
  const ruEmptyDeps = new Rule({})
  t.deepEquals(ruEmptyDeps.dependencies, [], 'provides default empty deps')
  t.deepEquals(ruEmptyDeps.devDependencies, [], 'provides default empty dev deps')

  const ruValide = new Rule({
    dependencies: [dep],
    devDependencies: [dev]
  })
  t.deepEquals(ruValide.dependencies, [dep], 'deps getter')
  t.deepEquals(ruValide.devDependencies, [dev], 'dev deps getter')
  t.end()
})
