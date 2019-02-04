import {
  rule // eslint-disable-line no-unused-vars
} from '../../../src/rules/readme'
import * as path from 'path'
import * as fs from 'fs-extra'
import ava from 'ava'
import {
  createMockPackageContext,
  TestPackageContext // eslint-disable-line no-unused-vars
} from '../../fixture/test-project'
const test = ava as TestPackageContext

test.beforeEach(t => createMockPackageContext(t.context))

test('readme rule', async t => {
  const { apply, check, ctx } = t.context
  const readmeFilename = path.resolve(ctx.projectDirname, 'readme.md')
  let stat = await fs.lstat(readmeFilename)
  t.truthy(stat.isFile(), 'readme present')
  await apply({ ctx, rules: [rule] })
  stat = await fs.lstat(readmeFilename)
  t.truthy(stat.isFile(), 'readme _still_ present')
  await check({ ctx, rules: [rule] })
  t.pass('check is ok with readme')
  await fs.remove(readmeFilename)
  await fs
    .lstat(readmeFilename)
    .then(() => t.fail('readme should be removed'))
    .catch(() => t.pass('readme removed'))
  await check({ ctx, rules: [rule] })
    .then(() => t.fail('readme rule should have failed check'))
    .catch(() => t.pass('readme rule failed check with no readme'))
})
