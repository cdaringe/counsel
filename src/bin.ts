#!/usr/bin/env node

import meow from 'meow'
// import * as os from 'os'
// import * as cp from 'child_process'
import * as counsel from './counsel'
import * as path from 'path'
import { CounselError, CheckError } from './errors'
import { withEmoji } from './logger'

const cli = meow(`
  Usage
    $ counsel <input>

  Options
    --init, initialize a .counsel.ts file
    --yes bypass interactivity, just say yes
    --project  path to project
    --log-level info/warn/error/verbose (see winston levels)
    --verbose sugar for --log-level=verbose
    --silent sugar for --log-level=silent

  Examples
    $ npx counsel apply
    $ npx counsel check
`)

async function run (settings: counsel.ContextWithRules) {
  const {
    ctx: { logger }
  } = settings
  if (cli.flags.init) return counsel.init(logger)
  switch (cli.input[0]) {
    case 'apply':
      await counsel.apply(settings)
      break
    case 'plan':
      const migrations = await counsel.plan(settings)
      logger.info(migrations)
      break
    case 'check':
      logger.info(
        withEmoji(
          `checking project with ${settings.rules.length} rule${
            settings.rules.length > 1 ? 's' : ''
          }`,
          '🚬'
        )
      )
      await counsel.check(settings)
      logger.info(withEmoji('project checks out', '✅'))
      break
    default:
      throw new CounselError(
        `unsupported command ${cli.input[0] ||
          '[no command given]'}. try running "counsel --help"`
      )
  }
}

async function start () {
  const { logLevel, silent, verbose, project } = cli.flags
  const projectDirname = project ? path.resolve(project) : process.cwd()
  const defaultCtx = await counsel.createDefaultContext(projectDirname, {
    logLevel: silent ? 'silent' : verbose ? 'verbose' : logLevel || 'info'
  })
  let logger = defaultCtx.logger
  if (!cli.flags.init) {
    logger.info(withEmoji('loading local project settings', '👓'))
  }
  const settings: counsel.ContextWithRules = await counsel.loadProjectSettings(
    projectDirname,
    defaultCtx,
    cli
  )
  settings.ctx.assumeYes = cli.flags.yes
  if (!cli.flags.init && (!settings.ctx || !settings.rules)) {
    throw new CounselError(
      [
        'invalid settings detected.  ensure your local .counsel ctx',
        'file exports an object with shape `{ ctx: {...}, rules: [...] }`'
      ].join(' ')
    )
  }
  logger = settings.ctx.logger
  try {
    await run(settings)
  } catch (err) {
    if (!(err instanceof CounselError)) throw err
    if (err instanceof CheckError) {
      logger.error(
        `check failure on rule "${err.rule.name}": ${err.message &&
          err.message.toString()}`
      )
    } else {
      logger.error(err)
    }
    process.exit(1)
  }
}

start()
