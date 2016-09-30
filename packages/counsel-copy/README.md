# counsel-copy

copy files/folders from _some counsel project_ into the target project.

## example

- create your rule

```js
'use strict'

const CopyRule = require('counsel-copy')

module.exports = new CopyRule({
  copySource: './jsdoc.json', // relative to your counsel project's root (package.json folder)
  copyTarget: './' // puts jsdoc.json into your projects root. relative to the target package's root
})
```

- apply your rule per `counsel` docs
- observe `jsdoc.json` in your project root!
