import { ContextWithRules } from './src/counsel'
import { rules } from './src/rulesets/nodelib'
const values = Object['values']


export const create = (opts: ContextWithRules) =>
  ({
    ...opts,
    rules: [
      ...opts.rules,
      ...values(rules.common),
      ...values(rules.ts)
    ]
  })
