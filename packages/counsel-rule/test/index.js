'use strict'

const Rule = require('../')
const test = require('tape')

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

test('overrides', t => {
  const r1Name = 'test-rule'
  const r1 = new Rule({
    name: r1Name,
    dependencies: ['test-dep'],
    devDependencies: ['test-dev']
  })
  const r1Override = {
    dependencies: ['a'],
    devDependencies: {
      add: 'b',
      minus: 'test-dev'
    }
  }
  r1._applyDependencyOverrides({ override: r1Override.devDependencies, dev: true })
  r1._applyDependencyOverrides({ override: r1Override.dependencies, dev: false })
  t.deepEquals(r1.dependencies, ['a'], 'dependencies array squash override honored')
  t.deepEquals(r1.devDependencies, ['b'], 'single plus/minus devDependencies override honored')

  const r2Name = 'test-rule2'
  const r2 = new Rule({
    name: r2Name,
    devDependencies: ['e', 'f', 'g']
  })
  const r2Override = {
    devDependencies: {
      add: ['x', 'y', 'z'],
      minus: ['e', 'f']
    }
  }
  r2._applyDependencyOverrides({ override: r2Override.devDependencies, dev: true })
  t.deepEquals(
    r2.devDependencies.sort(),
    ['x', 'y', 'z', 'g'].sort(),
    'array style dependencies override honored'
  )
  t.end()
})
