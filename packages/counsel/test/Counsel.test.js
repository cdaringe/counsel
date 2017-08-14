require('perish')
const ava = require('ava').default
const { factory } = require('./scaffold/factory')
const { setup, teardown } = require('./scaffold/test-project')
const tapeRule = require('./dummy-rules/tape-rule')
const Rule = require('counsel-rule')
const sinon = require('sinon')
const path = require('path')
const fs = require('fs-extra')

ava.beforeEach(async t => {
  const counsel = factory()
  t.context.counsel = counsel
  t.context.project = await setup({ counsel })
})

ava.afterEach(async t => {
  await teardown({ dir: t.context.project.dir })
})

ava('apply, check basics', async t => {
  const counsel = t.context.counsel
  await t.throws(counsel.apply())
  await t.throws(counsel.check())
  t.truthy(await counsel.apply([]))
  t.truthy(await counsel.check([]))
})

ava('rebranding & overrides in consumer tooling', async t => {
  const counsel = t.context.counsel
  const consumerName = 'PATTERN_THING'
  const consumerConfig = {
    test: 'test_overrides'
  }
  // write consumer config to disk and pull it back in
  await counsel.setTargetPackageMeta()
  counsel.targetProjectPackageJson[consumerName] = consumerConfig
  await counsel.writeTargetPackage()
  await counsel.setTargetPackageMeta()
  counsel.configKey = consumerName
  t.is(counsel.configKey, consumerName, 'consumer name set')
  t.throws(() => { counsel.config = consumerConfig }, Error, 'consumer config unsettable directly')
  t.deepEqual(counsel.config, consumerConfig, 'consumer config honored from package.jso')
})

ava('rule installs package', async t => {
  const { counsel } = t.context
  const devDepRule = { devDependencies: ['test_dev_dep'] }
  await counsel.apply([ tapeRule, devDepRule ])
  let dummyPkgJson = await counsel.jsonReadPackage()
  t.is(Object.keys(dummyPkgJson.dependencies).length, 1, 'has exactly one prod dep')
  t.is(Object.keys(dummyPkgJson.devDependencies).length, 1, 'has exactly one dev dep')
  t.truthy(dummyPkgJson.dependencies.tape, 'tape installed')
  await counsel.apply([tapeRule])
  dummyPkgJson = await counsel.jsonReadPackage()
  t.is(Object.keys(dummyPkgJson.dependencies).length, 1, 'dupe run maintains same installed dep state')
})

ava('allows disabling rules via override', async t => {
  const { counsel } = t.context
  const dropDepsRule = new Rule({
    name: 'drop-deps-rule',
    dependencies: ['a'],
    devDependencies: ['b']
  })
  sinon.sandbox.stub(counsel, 'config').value({
    overrides: {
      [tapeRule.name]: null,
      [dropDepsRule.name]: {
        dependencies: { subtract: 'a' },
        devDependencies: { subtract: 'b' }
      }
    }
  })
  await counsel.apply([ tapeRule, dropDepsRule ])
  const dummyPkgJson = await counsel.jsonReadPackage()
  t.falsy(dummyPkgJson.dependencies, 'tape rule overriden/dropped')
})

ava('explicit rule opt in', async t => {
  const { counsel } = t.context
  const r1 = new Rule({
    name: 'dummy-rule-1',
    dependencies: ['a']
  })
  const r2 = new Rule({
    name: 'dummy-rule-2',
    dependencies: ['b']
  })
  sinon.sandbox.stub(counsel, 'config').value({
    rules: [r2.name] // omit r1
  })
  await counsel.apply([ r1, r2 ])
  const dummyPkgJson = await counsel.jsonReadPackage()
  t.falsy(dummyPkgJson.dependencies.a, 'missing opt-in rule dropped')
  t.truthy(dummyPkgJson.dependencies.b, 'present opt-in rule present')
})

ava('faulty rule', async t => {
  const { counsel } = t.context
  const r1 = {
    name: 'dummy-rule-1',
    apply () {
      throw new Error('bananas')
    }
  }
  const err = await t.throws(counsel.apply([ {}, r1 ]))
  t.truthy(err.message.match(/bananas/))
})

ava('apply & check rules', async t => {
  const { counsel } = t.context
  const r1 = {
    _RES: 'R1_TEST',
    async apply (counsel) {
      await fs.writeFile(path.resolve(counsel.targetProjectRoot, 'r1'), this._RES)
      return this._RES
    },
    async check (counsel) {
      const value = await fs.readFile(path.resolve(counsel.targetProjectRoot, 'r1'))
      if (value.toString() !== this._RES) throw new Error('R1 CHECK FAILED')
    }
  }
  const r2 = {
    _RES: 1,
    apply () { return this._RES },
    check () { return true }
  }
  const r3 = {
    _RES: 1,
    apply () { return this._RES }
  }
  const r4 = {
    check () { throw new Error('R4_CHECK_FAIL') }
  }
  const r5 = {
    apply () { throw new Error('R5_APPLY_FAIL') }
  }
  const res = await counsel.apply([ r1, r2, r3 ])
  t.is(r1._RES, res[0])
  t.is(r2._RES, res[1])
  t.is(r3._RES, res[2])
  const checkRes = await counsel.check([ r1, r2, r3 ])
  t.is(checkRes.length, 3)
  const err = await t.throws(counsel.check([ r1, r2, r3, r4 ]))
  t.truthy(err.message.match(/R4_CHECK_FAIL/))
  await t.throws(counsel.apply([ r5 ]))
})

ava('inject', async t => {
  const { counsel, project: { dir } } = t.context
  const DUMMY_RULESET_PACKAGE_DEST = path.join(dir, 'node_modules/dummy-ruleset-package')
  counsel.installPackages = async function mockInstallPackage () {
    await fs.mkdirp(path.join(dir, 'node_modules'))
    await fs.copy(
      path.resolve(__dirname, 'scaffold/dummy-ruleset-package'),
      DUMMY_RULESET_PACKAGE_DEST
    )
  }
  // usually we inject just a package name, e.g. 'dummy-ruleset-package', however,
  // use a full filepath in testing to give `require` a hand resolving our test
  // ruleset
  await counsel.inject({ package: DUMMY_RULESET_PACKAGE_DEST })
  const dummyPkgJson = await counsel.jsonReadPackage()
  t.is(dummyPkgJson.scripts.dummyscript, 'dummycommand')
})
