# counsel-precommit

installs a configuration `git` precommit commit, so you can _do great things_ on every commit.

## example

- create your rule

```js
'use strict'

const PreCommitRule = require('counsel-precommit')

module.exports = new PreCommitRule({
  preCommitTasks: ['lint', 'test']
})
```

- apply it (per `counsel` docs)

now, on every `git commit ...`, `lint` and `test` must execute successfully (e.g. exit with code 0), for the commit to succeed!