import * as path from 'path'
import * as fs from 'fs-extra'
import ava from 'ava'
import {
  createMockPackageContext,
  TestPackageContext // eslint-disable-line no-unused-vars
} from '../../fixture/test-project'
import { kebabCase } from 'lodash'
import {
  FilenameFormatRule, // eslint-disable-line no-unused-vars
  check as checkFilename
} from '../../../src/rules/filename-format'
import { ContextWithRules } from '../../../src/counsel' // eslint-disable-line no-unused-vars

const test = ava as TestPackageContext

test.beforeEach(t => createMockPackageContext(t.context))

test('filename rule', async t => {
  const { check, ctx } = t.context
  const { projectDirname: targetProjectDirname } = ctx

  const rule: FilenameFormatRule = {
    name: 'test-filename-rule',
    filenameFormatExtensions: ['js'],
    filenameFormatExclude: ['*IGNORE*'],
    filenameFormatFunction: kebabCase,
    check: checkFilename
  }
  const withRules: ContextWithRules = { ctx, rules: [rule] }
  await fs.writeFile(path.join(targetProjectDirname, 'test-ing.js'), '')
  await check(withRules)
  t.pass('all things kebab cased')
  await fs.writeFile(path.join(targetProjectDirname, 'IGNORE.js'), '')
  await check(withRules)
  t.pass('filename ignore rule honored')
  await fs.writeFile(path.join(targetProjectDirname, 'test-WAT.js'), '')
  try {
    await check(withRules)
  } catch (err) {
    t.truthy(err.message.match(/violation/), 'catches filename violations')
  }
})
