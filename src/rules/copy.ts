import { ContextWithRule, Migration, Rule, TaskPayload } from '../interfaces' // eslint-disable-line no-unused-vars
import * as fs from 'fs-extra'
import * as path from 'path'

export interface CopyRule extends Rule {
  src: string // '/absolute/path/to/file'
  dest: string // relative or absolute path to file
  noOverwrite?: boolean // allow existing files to remain in place
}

/**
 * Copies files into/out-of a project.
 */
export async function plan (opts: TaskPayload<CopyRule>): Promise<Migration> {
  const {
    ctx: { logger },
    rule: { noOverwrite: allowExisting, name, src, dest }
  } = opts
  if (!src) throw new Error('rule must provide a copy `src`')
  if (!dest) throw new Error('rule must provide a copy `dest`')
  try {
    const stat = await opts.fs.stat(dest)
    if (stat && allowExisting) {
      logger.verbose(`[${name}]: skipping migration. ${dest} already exists`)
      return null
    }
  } catch (err) {
    // pass
  }
  if (!path.isAbsolute(src)) {
    throw new Error(
      [
        'CopyRule `src` must be absolute.  see the nodejs docs for `path.resolve`',
        'on how to construct a full path from your CopyRule definition'
      ].join(' ')
    )
  }
  return () => fs.copy(src, toAbsoluteDest(opts), { overwrite: true })
}

/**
 * Checks that copy rule content is in place
 */
export const check = (opts: ContextWithRule<CopyRule>) =>
  fs.stat(toAbsoluteDest(opts)).catch(err => {
    if (err.code === 'ENOTENT') {
      throw new Error(
        `file not found, or access denied: ${toAbsoluteDest(opts)}`
      )
    }
    throw err
  })

export function toAbsoluteDest (opts: ContextWithRule<CopyRule>) {
  const {
    rule: { dest },
    ctx
  } = opts
  if (path.isAbsolute(dest)) return dest
  return path.join(ctx.projectDirname, dest)
}
