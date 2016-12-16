# counsel-precommit

enables npm tasks to be run on git's pre-commit event. installs tasks to run on precommit.

## example

- create your rule

```js
'use strict'

const PreCommitRule = require('counsel-precommit')

module.exports = new PreCommitRule({
  preCommitTasks: ['lint', 'test'],
  strict: false // allow users to modify the precommit tasks. default false
})
```

- apply it (per `counsel` docs)

now, on every `git commit ...`, `lint` and `test` must execute successfully (e.g. exit with code 0), for the commit to succeed!

## hot tips

- if used in a monorepo style project, make sure to configure `gitRoot` in your config!
