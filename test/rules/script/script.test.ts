import * as path from 'path'
import * as fs from 'fs-extra'
import ava from 'ava'
import {
  createMockPackageContext,
  TestPackageContext // eslint-disable-line no-unused-vars
} from '../../fixture/test-project'
import {
  ContextWithRules, // eslint-disable-line no-unused-vars
  rules,
  apply,
  plan
} from '../../../src/counsel'

const test = ava as TestPackageContext

test.beforeEach(t => createMockPackageContext(t.context))

test('script rule', async t => {
  const { check, ctx } = t.context
  const rule: rules.script.ScriptRule = rules.script.create({
    name: 'test-filename-rule',
    scriptName: 'testScriptName',
    scriptCommand: 'echo `test script command!`'
  })
  const withRules: ContextWithRules = { ctx, rules: [rule] }
  await apply(withRules)
  const nextPackageJson = await fs.readJSON(
    path.join(ctx.projectDirname, 'package.json')
  )
  t.is(
    nextPackageJson.scripts.testScriptName,
    rule.scriptCommand,
    'script command inserted'
  )
  const nextMigrations = await plan(withRules)
  t.is(
    nextMigrations.length,
    0,
    'no migrations required post-initial migration'
  )
  await check(withRules)
  await t.throwsAsync(
    async () => {
      delete withRules.ctx.packageJson.scripts[rule.scriptName]
      await check(withRules)
    },
    null,
    'fails check when script missing'
  )
})
