import { CheckError, CounselError } from './errors'
import {
  Context, // eslint-disable-line no-unused-vars
  CreateContextOptions, // eslint-disable-line no-unused-vars
  ContextWithRules, // eslint-disable-line no-unused-vars
  Dependency, // eslint-disable-line no-unused-vars
  Rule, // eslint-disable-line no-unused-vars
  WithMigrations, // eslint-disable-line no-unused-vars
  InstallDependenciesOptions // eslint-disable-line no-unused-vars
} from './interfaces'
import { createLogger, withEmoji } from './logger'
import {
  dependencyToString,
  filterToInstallPackages,
  fromNameVersionObject
} from './dependencies'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as project from './project'
import * as rules from './rules' // eslint-disable-line no-unused-vars (compile time only import)
import bluebird from 'bluebird'
import execa from 'execa'
import meow = require('meow') // eslint-disable-line no-unused-vars
const Prompt = require('prompt-checkbox')

/**
 * sugar function for calling plan + migrate
 */
export const apply = async (opts: ContextWithRules) => {
  const {
    ctx: { assumeYes, logger }
  } = opts
  logger.verbose('counsel::apply::start')
  logger.info(withEmoji('planning project migration', '🗓'))
  let migrations = await plan(opts)
  const rules = toRulesWithPlans(opts.rules)
  const report = rules
    .map((rule, i) => ({ rule, migration: migrations[i] }))
    .reduce((agg, curr) => {
      const {
        rule: { dependencies = [], devDependencies = [], name },
        migration
      } = curr
      return {
        ...agg,
        [name]: {
          dependencies: dependencies.map(dependencyToString).join(','),
          devDependencies: devDependencies.map(dependencyToString).join(','),
          migration: migration ? 'READY' : 'NONE'
        }
      }
    }, {})
  if (migrations.length && process.stdout.isTTY && !assumeYes) {
    logger.info('migration plan:')
    console.table(report)
  }
  if (migrations.length && !assumeYes) {
    const prompt = new Prompt({
      name: 'rules',
      message: 'select the rules to be applied:',
      radio: true,
      choices: Object.keys(report),
      default: Object.keys(report)
    })
    var choices: string[] = await prompt.run()
    // select migrations by plucking corresponding indexes where rule names match
    migrations = rules
      .map((rule, i) => {
        if (choices.includes(rule.name)) return migrations[i]
        return null
      })
      .filter(Boolean)
    await prompt.ui.close()
    prompt.end(false)
  }
  logger.info(withEmoji('migrating project', '🔄'))
  const res = await migrate({ ...opts, migrations })
  logger.verbose('counsel::apply::finish')
  return res
}

export const plan = async (opts: ContextWithRules) => {
  opts.ctx.logger.verbose('counsel::plan::start')
  const res = await bluebird.map(toRulesWithPlans(opts.rules), rule =>
    Promise.resolve(rule.plan!({ ctx: opts.ctx, rule, fs, path }))
  )
  opts.ctx.logger.verbose('counsel::plan::finish')
  return res.filter(Boolean)
}

/**
 * Migrate project by means of executing provided Migrations, generally
 * administering project-level side-effects
 */
export const migrate = async (opts: WithMigrations) => {
  const { migrations, ctx, rules } = opts
  opts.ctx.logger.verbose('counsel::migrate::start')
  if (!migrations.length) {
    opts.ctx.logger.info('counsel::migrate: no migrations')
  }
  const res = await bluebird.map(migrations.filter(Boolean), migration =>
    Promise.resolve(migration!())
  )
  const [dependencies, devDependencies] = rules.reduce(
    ([dependencies, devDependencies], rule) => [
      [...dependencies, ...(rule.dependencies || [])],
      [...devDependencies, ...(rule.devDependencies || [])]
    ],
    [[] as Dependency[], [] as Dependency[]]
  )
  await migrateDependencies({ dependencies, ctx, development: false })
  await migrateDependencies({
    dependencies: devDependencies,
    ctx,
    development: true
  })
  if (isTargetPackageDirty(ctx)) await writeTargetPackage(ctx)
  opts.ctx.logger.verbose('counsel::migrate::finish')
  return res
}

export const check = async (opts: ContextWithRules) => {
  opts.ctx.logger.verbose('counsel::check::start')
  const res = await bluebird.map(opts.rules.filter(rule => rule.check), rule =>
    Promise.resolve(rule.check!({ ctx: opts.ctx, rule, fs, path })).catch(
      ({ message, stack }) => {
        throw new CheckError({ message, stack, rule })
      }
    )
  )
  opts.ctx.logger.verbose('counsel::check::finish')
  return res
}

// support!

export const createDefaultContext = async (
  targetProjectDirname: string,
  options?: CreateContextOptions
) => {
  options = options || {}
  const { logLevel } = options
  const targetProjectPackageJsonFilename = path.resolve(
    targetProjectDirname,
    'package.json'
  )
  const targetProjectPackageJson = await fs.readJSON(
    targetProjectPackageJsonFilename
  )
  const ctx: Context = {
    packageJsonPristine: { ...targetProjectPackageJson },
    ctxKey: 'counsel',
    logger: createLogger({ logLevel }),
    packageJson: targetProjectPackageJson,
    packageJsonFilename: targetProjectPackageJsonFilename,
    projectDirname: targetProjectDirname
  }
  return ctx
}

export const getLocalctxFilename = async (targetProjectDirname?: string) => {
  for (const ext of ['ts', 'js']) {
    const basename = `.counsel.${ext}`
    const localctxFilename = path.join(
      targetProjectDirname || process.cwd(),
      basename
    )
    const exists = await fs
      .lstat(localctxFilename)
      .then(() => true)
      .catch(() => false)
    if (exists) return localctxFilename
  }
  return null
}
export const importLocalctx = async (targetProjectDirname: string) => {
  const ctxFilename = await getLocalctxFilename(targetProjectDirname)
  if (!ctxFilename) return null
  if (ctxFilename.match(/\.ts$/)) {
    const transpileModule = require('typescript').transpileModule
    const tsSettingsContents = (await fs.readFile(ctxFilename)).toString()
    const commonJsCtx = transpileModule(tsSettingsContents, {})
    try {
      const nodeEval = require('node-eval')
      const mod = nodeEval(
        commonJsCtx.outputText,
        path.join(targetProjectDirname, '.counsel.js')
      )
      return mod
    } catch (err) {
      if (err.message && err.message.match(/Please pass/)) {
        throw new CounselError(
          [
            'failed to load configuration file.  are all of your dependencies',
            'installed?\n',
            `original error:\n\t${err.message}`
          ].join(' ')
        )
      }
      throw err
    }
  }
  return require(ctxFilename)
}

export const init = async (logger: Context['logger']) => {
  const basename = '.counsel.ts'
  const ctxFilename = await getLocalctxFilename()
  if (ctxFilename) {
    return logger.warn(`ctx file already exists: ${ctxFilename}`)
  }
  const contents = await fs.readFile(
    path.join(__dirname, '.counsel-template.ts')
  )
  await fs.writeFile(path.join(process.cwd(), basename), contents)
  logger.info(withEmoji(`ctx file ${basename} created successfully`, '⚙️'))
}

export const getPristineDependencies = (ctx: Context) =>
  ctx.packageJsonPristine.dependencies || {}
export const getPristineDevDependencies = (ctx: Context) =>
  ctx.packageJsonPristine.devDependencies || {}

export const loadProjectSettings = async (
  targetProjectDirname: string,
  defaultctx: Context,
  cli?: meow.Result
) => {
  const localctx = await importLocalctx(targetProjectDirname)
  if (!localctx) return { ctx: defaultctx, rules: [] }
  const create = localctx.create || localctx
  if (typeof create !== 'function') {
    throw new Error('local counsel ctx must export create function')
  }
  return Promise.resolve(create({ ctx: defaultctx, rules: [], cli }))
}

/**
 * run `npm install` (or similar) for dev or std deps
 * @returns {boolean} indicator if packages were installed
 */
export const installDependencies = async (opts: InstallDependenciesOptions) => {
  const isDev = !!opts.development
  let bin = opts.packageManager
  let isYarnPackage
  if (!bin) {
    isYarnPackage = await project.isYarn(opts.ctx.projectDirname)
    bin = isYarnPackage ? 'yarn' : 'npm'
  }
  const installCmd = isYarnPackage ? 'add' : 'install'
  const toInstall = opts.dependencies
  let flag = ''
  if (isDev) flag = isYarnPackage ? '--dev' : '--save-dev'
  if (!toInstall.length) return false
  opts.ctx.logger.info(
    `installing ${isDev ? 'development' : ''} dependencies: ${toInstall
      .map(dependencyToString)
      .map(dependencyString => dependencyString.replace('@*', ''))
      .join(', ')}`
  )
  try {
    const args = [
      installCmd,
      flag,
      ...toInstall
        .map(dependencyToString)
        .map(dependencyString => dependencyString.replace('@*', ''))
    ].filter(Boolean)
    opts.ctx.logger.verbose(`${bin} ${args.join(' ')}`)
    await execa(bin, args, {
      cwd: opts.ctx.projectDirname,
      stdio: (process.env.NODE_ENV || '').match(/test/) ? 'ignore' : 'inherit'
    })
  } catch (err) {
    if (err) return opts.ctx.logger.error(err)
  }
  return true
}

/**
 * Determines if the target project's package.json has changed (during rule application)
 */
export const isTargetPackageDirty = (ctx: Context) => {
  const pkg1 = JSON.stringify(ctx.packageJsonPristine)
  const pkg2 = JSON.stringify(ctx.packageJson)
  const res = pkg1 !== pkg2
  ctx.logger.verbose(`counsel::isTargetPackageDirty?: ${res}`)
  return res
}

/**
 * write the project package.json if it's dirty
 */
export const writeTargetPackage = async (ctx: Context) => {
  return fs.writeFile(
    ctx.packageJsonFilename,
    JSON.stringify(ctx.packageJson, null, 2)
  )
}

/**
 * migrate deps required by rule set
 */
export const migrateDependencies = async (opts: {
  ctx: Context
  dependencies: Dependency[]
  development: boolean
}) => {
  const { dependencies, development, ctx } = opts
  const toInstall = filterToInstallPackages(
    fromNameVersionObject(
      development
        ? getPristineDevDependencies(ctx)
        : getPristineDependencies(ctx)
    ),
    dependencies,
    ctx.logger
  )
  const isPackageDirty = await installDependencies({
    ctx,
    dependencies: toInstall,
    development
  })
  // istanbul ignore else
  if (isPackageDirty) {
    const tPkg = await fs.readJSON(ctx.packageJsonFilename)
    ctx.packageJson.dependencies = tPkg.dependencies
  }
}

export const toRulesWithPlans = (rules: Rule[]) =>
  rules.filter(rule => rule.plan)

export * from './errors'
export * from './interfaces'
export { rules }
