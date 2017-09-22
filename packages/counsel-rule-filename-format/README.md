# counsel-rule-filename-format

add's a `counsel` `check` task that enforces filename conventions in your project!

## example

- create your rule

```js
'use strict'

const FilenameFormatRule = require('counsel-rule-filename-format')
const kebab = require('lodash.kebabcase')

module.exports = new FilenameFormatRule({
  fileFormatExtensions: 'js',
  fileFormatExclude: ['*IGNORE*', '*docs/**/*.blah'], // <== `glob` matchers!
  fileFormatFunction: kebab // <== enforces all files are kebab-cased.  best case :)
})
```

- run `counsel.check(rules)` (per `counsel` docs)

check will `reject`, and the process will exit w/ code 1 if unhandled.
