import 'perish'
import * as path from 'path'
import * as fs from 'fs-extra'
import ava from 'ava'
import { plan, migrate } from '../'
import {
  TestPackageContext, // eslint-disable-line no-unused-vars
  createMockPackageContext
} from './fixture/test-project'
import { TapeRule } from './dummy-rules/tape-rule'

const test = ava as TestPackageContext

test.beforeEach(async t => {
  await createMockPackageContext(t.context)
})

test('plan, generates migrations', async t => {
  const { ctx } = t.context
  const migrations0 = await plan({ ctx, rules: [] })
  t.is(migrations0.length, 0, 'has no migrations')
  const migrations1 = await plan({ ctx, rules: [TapeRule] })
  t.is(migrations1.length, 1, 'has one migrations')
  const tapeMigration = migrations1[0]
  t.falsy(ctx.packageJson.scripts.test, 'package has no test script')
  const res = tapeMigration!()
  t.falsy(res, 'tape migration returns undefined')
  t.truthy(ctx.packageJson.scripts.test, 'package has test script')
})

test('migrate processes migrations', async t => {
  const { ctx, projectDirname } = t.context
  const rules = [TapeRule]
  const migrations = await plan({ ctx, rules })
  const migrated = await migrate({ ctx, migrations, rules })
  t.is(migrated.length, rules.length, 'migrations migrated')
  const flushedPackageJson = await fs.readJSON(
    path.resolve(projectDirname, 'package.json')
  )
  t.is(
    flushedPackageJson.scripts.test,
    TapeRule.scriptCommand,
    'migration flushes dependency changes to disk'
  )
  const tapePackageJson = await fs.readJSON(
    path.resolve(projectDirname, 'node_modules/tape/package.json')
  )
  t.truthy(
    tapePackageJson.version.match(/1\./),
    'dependency found in node_modules'
  )
})
