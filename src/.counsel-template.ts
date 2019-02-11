import { ContextWithRules, rules } from 'counsel' // eslint-disable-line no-unused-vars

export const create = (opts: ContextWithRules) =>
  ({
    ...opts,
    rules: [...opts.rules, rules.readme]
  })
