# counsel-rule

defines a piece of counselling to apply to a project.

this is the base class counsel rule.  counsel rules do _not_ need to extend `Rule`.  counsel rules are any old pojo with an `apply` method!

## example

- create your rule

```js
'use strict'

const Rule = require('counsel-rule')

module.exports = new Rule({
  devDependencies: ['some-package'],
  apply: function(counsel) {
    // do something interesting
  }
})
```

- apply it (per `counsel` docs)
