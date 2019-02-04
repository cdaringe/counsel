import { Context } from './counsel' // eslint-disable-line no-unused-vars
import { createLogger } from './logger'
import * as fs from 'fs-extra'
import * as path from 'path'

export interface Context {
  assumeYes?: boolean
  logger: ReturnType<typeof createLogger>
  ctxKey: string
  /**
   * parsed package.json of target project
   */
  packageJson: any
  /**
   * filename of target project's package.json
   */
  packageJsonFilename: string
  /**
   * golden copy of target project package.json
   */
  packageJsonPristine: any
  /**
   * dirname of project to apply counsel too
   */
  projectDirname: string
}

export interface ContextWithRule<R extends Rule> {
  rule: R
  ctx: Context
}

export interface ContextWithRules {
  rules: Rule[]
  ctx: Context
}

export interface CreateContextOptions {
  logLevel?: string
}

export type Dependency = { name: string; range: string }

export type Migration = null | (() => void | Promise<void>)

export type Rule = {
  check?: (opts: TaskPayload<any>) => Promise<any> | any
  plan?: (opts: TaskPayload<any>) => Promise<Migration> | Migration
  name: string
  dependencies?: Dependency[]
  devDependencies?: Dependency[]
}

export interface DependencyOverrides {
  dependencies: Dependency[]
  add: Dependency[]
  subtract: Dependency[]
}

export interface InstallDependenciesOptions {
  ctx: Context
  dependencies: Dependency[]
  development?: boolean
  packageManager?: string
}

export interface TaskPayload<R extends Rule = Rule> extends ContextWithRule<R> {
  fs: typeof fs
  path: typeof path
}

export interface WithMigrations extends ContextWithRules {
  migrations: Migration[]
}
