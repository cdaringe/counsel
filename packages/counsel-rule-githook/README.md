# counsel-rule-githook

enables npm/yarn tasks to be run on git hooks.

uses the awesome [`husky`](https://www.npmjs.com/package/husky) under the hood!

## example

- create your rule
  - provide git hook names as keys to the `hooks` object
  - provide npm/yarn tasks to run as values to those githooks

```js
'use strict'

const GitHookRule = require('counsel-rule-githook')

module.exports = new GitHookRule({
  hooks: {
    precommit: ['lint', 'test'], // shorthand. see below for default, implicit configs
    postcheckout: {
      tasks: ['yarn'],
      // [default: false] run all tasks in parallel by default
      serial: false,
      // [default: '*'] allow users to modify the githook tasks.
      // see https://github.com/cdaringe/counsel/tree/master/packages/counsel-rule-script
      variants: '*'
    }
  },
  // ...add any other Rule options below
})
```

- apply it (per `counsel` docs)

now, on every `git commit ...`, `lint` and `test` must execute successfully (e.g. exit with code 0), for the commit to succeed!

## hot tips

- if used in a monorepo style project, make sure to configure `gitRoot` in your `counsel` config!
