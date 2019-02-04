import { Rule } from '../counsel' // eslint-disable-line no-unused-vars

const ALLOWED_BASENAMES = ['readme.md', 'README.md']

export const check: Rule['check'] = async ({ fs, path, ctx }) => {
  for (const basename of ALLOWED_BASENAMES) {
    const filename = path.resolve(ctx.projectDirname, basename)
    const isExists = await fs
      .lstat(filename)
      .then(() => true)
      .catch(() => false)
    if (isExists) return
  }
  throw new Error('readme.md file missing')
}

export const rule: Rule = {
  name: 'assert-readme-exists',
  check
}
