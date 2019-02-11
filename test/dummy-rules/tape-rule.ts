import { rules } from '../../'

export const TapeRule: rules.script.ScriptRule = {
  name: 'install-tape-rule',
  dependencies: [{ name: 'tape', range: '^1' }],
  scriptName: 'test',
  scriptCommand: 'tape test/**/*.test.js',
  plan: rules.script.plan
}
