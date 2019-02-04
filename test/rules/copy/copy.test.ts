import {
  CopyRule, // eslint-disable-line no-unused-vars
  plan
} from '../../../src/rules/copy'
import * as path from 'path'
import * as fs from 'fs-extra'
import ava from 'ava'
import {
  createMockPackageContext,
  TestPackageContext // eslint-disable-line no-unused-vars
} from '../../fixture/test-project'

const test = ava as TestPackageContext

test.beforeEach(t => createMockPackageContext(t.context))

test('copy rule', async t => {
  const { apply, check, ctx } = t.context
  const dest = path.resolve(ctx.projectDirname, 'copied.md')
  const rule: CopyRule = {
    name: 'copy-markdown-file-test',
    src: path.resolve(__dirname, 'fixture/copy-me.md'),
    dest,
    plan
  }
  await apply({ ctx, rules: [rule] })
  const stat = await fs.lstat(dest)
  t.true(!!stat, 'file copied ok')
  await check({ ctx, rules: [rule] })
  t.pass('copy check ok')
})

test('copy rule - allow existing', async t => {
  const { apply, ctx } = t.context
  const dest = path.resolve(ctx.projectDirname, 'copied.md')
  const rule: CopyRule = {
    noOverwrite: true,
    name: 'dont-copy-over-markdown-file-test',
    src: path.resolve(__dirname, 'fixture/copy-me.md'),
    dest,
    plan
  }
  const inputDestContent = 'dont_overwrite_me'
  await fs.writeFile(dest, inputDestContent)
  await apply({ ctx, rules: [rule] })
  const outputDestContent = (await fs.readFile(dest)).toString()
  t.is(outputDestContent, inputDestContent, 'allowExisting ok')
})
