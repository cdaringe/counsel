const path = require('path')
const ScriptRule = require('counsel-script')
const fs = require('fs')

module.exports = {
  rules: [
    new ScriptRule({
      devDependencies: ['npm-run-all', 'husky'],
      name: 'precommit',
      scriptName: 'precommit',
      scriptCommand: 'run-p check lint test check-vulnerablities',
      scriptCommandVariants: ['*']
    }),

    // validate!
    new ScriptRule({
      name: 'check',
      scriptName: 'check',
      scriptCommand: 'counsel check',
      scriptCommandVariants: ['*']
    }),

    // secure!
    new ScriptRule({
      name: 'check-vulnerablities',
      devDependencies: ['nsp'],
      scriptName: 'check-vulnerablities',
      scriptCommand: 'nsp check',
      scriptCommandVariants: ['*']
    }),

    // lint!
    new ScriptRule({
      name: 'lint',
      devDependencies: ['standard'],
      scriptName: 'lint',
      scriptCommand: 'standard',
      scriptCommandVariants: ['*']
    }),

    // test and coverage!
    new ScriptRule({
      name: 'test',
      devDependencies: ['nyc', 'ava'],
      scriptName: 'test',
      scriptCommand: 'nyc --reporter=lcov ava test/**/*.test.js',
      scriptCommandVariants: ['*']
    }),

    // readme
    (function () {
      /* istanbul ignore next */
      return {
        name: 'enforce-readme',
        apply () {},
        check (counsel) {
          const readmeFilename = path.resolve(counsel.targetProjectRoot, 'README.md')
          if (!fs.existsSync(readmeFilename)) {
            throw new Error(`README.md not found at: ${readmeFilename}`)
          }
        }
      }
    })(),

    // developer docs
    new ScriptRule({
      name: 'api-docs-generate',
      devDependencies: ['jsdoc', 'minami', 'resolve-jsdoc-bin'],
      scriptName: 'docs:build',
      scriptCommand: 'ripcord docs',
      scriptCommandVariants: ['*']
    }),
    new ScriptRule({
      name: 'api-docs-publish',
      devDependencies: ['gh-pages'],
      scriptName: 'docs:publish',
      scriptCommand: 'ripcord docs --publish',
      scriptCommandVariants: ['*']
    })
  ]
}
