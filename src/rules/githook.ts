import { Rule, TaskPayload } from '../counsel' // eslint-disable-line no-unused-vars

export type Hooks =
  | 'applypatch-msg'
  | 'commit-msg'
  | 'fsmonitor-watchman'
  | 'post-update'
  | 'pre-applypatch'
  | 'pre-commit'
  | 'pre-push'
  | 'pre-rebase'
  | 'pre-receive'
  | 'prepare-commit-msg'
  | 'update'

export type HooksMap = Partial<{ [K in Hooks]: string }>

export interface GitHooksRule extends Rule {
  hooks: HooksMap
  strict?: boolean
}

/**
 * create a GitHooksRule with a prebound check, plan, and dependencies
 */
export const create: (
  partialRule: Partial<GitHooksRule> & {
    name: string
    hooks: GitHooksRule['hooks']
  }
) => GitHooksRule = partialRule => ({
  check,
  plan,
  ...partialRule,
  devDependencies: [
    { name: 'husky', range: '*' },
    ...(partialRule.dependencies || [])
  ]
})

export const getCurrentHooks = (packageJson: any) =>
  (packageJson.husky && packageJson.husky.hooks) || {}

export const plan = (opts: TaskPayload<GitHooksRule>) => {
  const {
    ctx: { packageJson },
    rule: { hooks: desiredHooksByName }
  } = opts
  const currentHuskyHooks: Partial<{ [K in Hooks]: string }> = getCurrentHooks(
    packageJson
  )
  const currentHuskyHookNames = Object.keys(currentHuskyHooks) as Hooks[]
  const hookNamesToAdd = Object.keys(desiredHooksByName).filter(
    desired => !currentHuskyHookNames.some(current => current === desired)
  ) as Hooks[]
  if (!hookNamesToAdd.length) return null
  return () => {
    // upsert husky hooks container
    packageJson.husky = packageJson.husky || {}
    packageJson.husky.hooks = packageJson.husky.hooks || {}
    for (const desiredHookName of hookNamesToAdd) {
      packageJson.husky.hooks[desiredHookName] =
        desiredHooksByName[desiredHookName]
    }
  }
}

export const check = (opts: TaskPayload<GitHooksRule>) => {
  const {
    ctx: { packageJson },
    rule: { hooks: desiredHooksByName, strict }
  } = opts
  const currentHooksByName = getCurrentHooks(packageJson)
  for (const hookName in desiredHooksByName) {
    const currentHookValue = currentHooksByName[hookName]
    const desiredHookValue = desiredHooksByName[hookName as Hooks]
    if (strict && currentHookValue !== desiredHookValue) {
      throw new Error(
        `hook ${hookName} has different current and target values in strict mode`
      )
    }
    if (!(hookName in currentHooksByName)) {
      throw new Error(`githook "${hookName}" missing from current hooks`)
    }
  }
}
