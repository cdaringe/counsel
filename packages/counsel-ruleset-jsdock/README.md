# counsel-ruleset-jsdock

a simple ruleset to build JSDoc documentation with [jsdock](https://github.com/cdaringe/jsdock).

creates a few npm scripts.  here's the full source:

```js
'use strict'
const ScriptRule = require('counsel-rule-script')
module.exports = [
  new ScriptRule({
    devDependencies: ['jsdock'],
    scriptName: 'docs:clean',
    scriptCommand: 'jsdock clean'
  }),
  new ScriptRule({
    devDependencies: ['jsdock'],
    scriptName: 'docs:build',
    scriptCommand: 'jsdock build'
  }),
  new ScriptRule({
    devDependencies: ['jsdock'],
    scriptName: 'docs:publish',
    scriptCommand: 'jsdock publish'
  })
]
```
