import * as fs from 'fs-extra'
import * as path from 'path'

export async function isYarn (dirname: string) {
  try {
    const stat = await fs.lstat(path.resolve(dirname, 'yarn.lock'))
    return !!stat
  } catch (err) {
    if (err.code === 'ENOENT') return false
    // istanbul ignore next
    throw err
  }
}
