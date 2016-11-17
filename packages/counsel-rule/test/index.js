'use strict'

const Rule = require('../')
const test = require('tape')
const counsel = require('counsel')
const sinon = require('sinon')

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
  const stub1 = sinon.stub(counsel, 'config', () => {
    return {
      overrides: {
        'test-rule': {
          dependencies: ['a'],
          devDependencies: {
            add: 'b',
            minus: 'test-dev'
          }
        }
      }
    }
  })
  r1.apply(counsel)
  t.deepEquals(r1.dependencies, ['a'], 'dependencies array squash override honored')
  t.deepEquals(r1.devDependencies, ['b'], 'single plus/minus devDependencies override honored')
  stub1.restore()

  const r2Name = 'test-rule2'
  const r2 = new Rule({
    name: r2Name,
    devDependencies: ['e', 'f', 'g']
  })
  const stub2 = sinon.stub(counsel, 'config', () => {
    return {
      overrides: {
        'test-rule2': {
          devDependencies: {
            add: ['x', 'y', 'z'],
            minus: ['e', 'f']
          }
        }
      }
    }
  })
  r2.apply(counsel)
  t.deepEquals(
    r2.devDependencies.sort(),
    ['x', 'y', 'z', 'g'].sort(),
    'array style dependencies override honored'
  )
  stub2.restore()
  t.end()
})
