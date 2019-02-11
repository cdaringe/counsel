import { promisify } from 'util'
import { Rule, ContextWithRule } from '../counsel' // eslint-disable-line no-unused-vars
import * as path from 'path'
import glob from 'glob'

const DEFAULT_IGNORE = ['**/README.*', '**/package.json', '**/node_modules/**']

export interface FilenameFormatRule extends Rule {
  filenameFormatExtensions?: string[] // js,coffee,etc
  filenameFormatExclude?: string[] // filename, path. default ignores README*, package.json
  filenameFormatFunction: (filename: string) => string // accepts file basename as input
}

const removeValid = (filenames: string[], fn: any) => {
  if (!filenames.length) return filenames
  return filenames.filter(f => {
    const extname = path.extname(f)
    const basename = path.basename(f).replace(extname, '')
    return basename !== fn(basename)
  })
}

export const check = (opts: ContextWithRule<FilenameFormatRule>) => {
  const {
    ctx: { projectDirname: targetProjectDirname },
    rule: {
      filenameFormatExclude: exclude = [],
      filenameFormatExtensions: extensions = [],
      filenameFormatFunction: formatFunction
    }
  } = opts
  const cleanedExtensions = extensions
    .filter(Boolean)
    .map(f => f.trim())
    .map(f => f.replace(/^\./, ''))
    .map(f => `**/*.${f}`)
  const cleanedExclude = exclude
    .concat(DEFAULT_IGNORE)
    .filter(Boolean)
    .map(f => ((f as string).trim ? (f as string).trim() : f))
  return promisify(glob)(cleanedExtensions.join('|'), {
    cwd: targetProjectDirname,
    ignore: cleanedExclude
  })
    .then(filenames => removeValid(filenames, formatFunction))
    .then(violating => {
      if (violating.length) {
        throw new Error(
          [
            'the following files are in violation of a file format naming rule:',
            `\t${violating.join(', ')}`
          ].join('\n')
        )
      }
    })
}
