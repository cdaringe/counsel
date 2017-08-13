# counsel-copy

copy files/folders from a counsel project into a target project.

## example

- create your rule

```js
'use strict'

const CopyRule = require('counsel-copy')

module.exports = new CopyRule({
  src: '/absolute/path/to/thing',
  dest: '<path>/to/thing',
  // if dest is relative, it is relative to the target
  // project's root directory.
})
```

- apply your rule per `counsel` docs
- observe `jsdoc.json` in your project root!
