import * as path from 'path'
import * as fs from 'fs-extra'
import ava from 'ava'
import {
  createMockPackageContext,
  TestPackageContext // eslint-disable-line no-unused-vars
} from '../../fixture/test-project'
import { ContextWithRules, rules, apply, plan } from '../../../src/counsel' // eslint-disable-line no-unused-vars

const test = ava as TestPackageContext

test.beforeEach(t => createMockPackageContext(t.context))

test('githook rule', async t => {
  const { check, ctx } = t.context
  const rule: rules.githook.GitHooksRule = rules.githook.create({
    name: 'test-filename-rule',
    hooks: {
      'pre-commit': 'echo "test_precommit_hook"'
    }
  })
  const withRules: ContextWithRules = { ctx, rules: [rule] }
  await apply(withRules)
  const nextPackageJson = await fs.readJSON(
    path.join(ctx.projectDirname, 'package.json')
  )
  t.is(
    nextPackageJson.husky.hooks['pre-commit'],
    rule.hooks['pre-commit'],
    'test githook loaded'
  )
  const nextMigrations = await plan(withRules)
  t.is(
    nextMigrations.length,
    0,
    'no migrations required post-initial migration'
  )
  await check(withRules)
  await t.throwsAsync(async () => {
    delete withRules.ctx.packageJson.husky.hooks['pre-commit']
    await check(withRules)
  })
})
