import { Rule } from './interfaces' // eslint-disable-line no-unused-vars
export class CounselError extends Error {}
export class CounselRuleError extends CounselError {
  public rule: Rule
  constructor (opts: { rule: Rule; message?: string; stack?: string }) {
    super(opts.message)
    this.rule = opts.rule
    Object.assign(this, opts)
  }
}
export class CheckError extends CounselRuleError {}
