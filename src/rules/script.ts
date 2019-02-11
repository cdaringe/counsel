import { Migration, Rule, TaskPayload } from '../interfaces' // eslint-disable-line no-unused-vars

/**
 * Adds a script to the target package's package.json
 */

export interface ScriptRule extends Rule {
  strictCheck?: boolean
  scriptName: string // 'test'
  scriptCommand: string // 'tape --bail test/*.test.js'
}

export const create: (
  partialScriptRule: Partial<ScriptRule> & {
    name: string
    scriptName: string
    scriptCommand: string
  }
) => ScriptRule = partialScriptRule =>
  Object.keys(partialScriptRule).reduce(
    (agg, key) => ({ ...agg, [key]: (partialScriptRule as any)[key] }),
    {
      plan,
      check
    }
  ) as ScriptRule

/**
 * Plans to add the requested script to the package.json
 * @note Rule's shall not to write the package.json file.  counsel shall
 * write the file on your behalf to not trash the disk and as rules are likely
 * to update it.
 */
export async function plan (opts: TaskPayload<ScriptRule>): Promise<Migration> {
  const { ctx, rule } = opts
  const pkg = ctx.packageJson
  const name = rule.scriptName
  const cmd = rule.scriptCommand
  const prexistingCmd = pkg.scripts ? pkg.scripts[name] : null
  pkg.scripts = pkg.scripts || {}
  if (!prexistingCmd) {
    return () => {
      pkg.scripts[name] = cmd
    }
  }
  // script key already has cmd specified. handle it.
  if (prexistingCmd.indexOf(cmd) >= 0) return null
  if (!rule.strictCheck) return null
  throw new Error(
    `unable to create migration for rule ${
      rule.name
    }. script "${name}" already exists and strictCheck is enabled`
  )
}

/**
 * Asserts that the specified cmd exists in the corresponding script or that
 * an approved variant is present
 */
export const check = async (opts: TaskPayload<ScriptRule>) => {
  const {
    ctx,
    rule: { strictCheck, scriptCommand, scriptName }
  } = opts
  const pkg = ctx.packageJson
  const missingScriptError = new Error(
    `missing ${scriptName} script in package.json`
  )
  if (!pkg.scripts) throw missingScriptError
  const actual = pkg.scripts[scriptName]
  if (!actual) throw missingScriptError
  if (!strictCheck) return // scriptName exists, loose check zen™
  if (scriptCommand.trim() === actual.trim()) return
  throw new Error(
    `script ${scriptName} not found with requested command or variants`
  )
}
