import {
  ScriptRule, // eslint-disable-line no-unused-vars
  plan
} from '../../src/rules/script'

export const TapeRule: ScriptRule = {
  name: 'install-tape-rule',
  dependencies: [{ name: 'tape', range: '1.0.0' }],
  scriptName: 'test',
  scriptCommand: 'tape test/**/*.test.js',
  plan
}
