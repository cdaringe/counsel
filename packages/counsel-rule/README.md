# counsel-rule

defines a piece of _counselling_ to apply to a project.  how punny.

this package is the base class counsel rule.

## how do i make my own rule?

  - rules do _not_ need to extend `Rule`, exported by `counsel-rule`.
  - a rule is any old [POJO](https://en.wikipedia.org/wiki/Plain_Old_Java_Object) with an `apply` and/or `check` method!
    - the apply method should do something interesting to your project.  apply receives the `counsel` instance, which provides some very useful utilities to expose the target project.  see the example below for more.

## create a rule

here's a fully flushed example:

```js
'use strict'

const Rule = require('counsel-rule')

module.exports = new Rule({
  // dependencies: ['async'], // <== installs any package (at the end of the rule apply chain)
  // devDependencies: ['tape', 'pify'], // <== installs any package (at the end of the rule apply chain)
  apply: function(counsel) {
    // do something interesting

    // some helpful refs (more at https://cdaringe.github.io/counsel/counsel/)

    // counsel.targetProjectPackageJson
    // ^modify the target package.json as you see fit! we will detect changes and write it

    // counsel.config
    // ^ get declarations made towards counsel in the target package's package.json

    // counsel.project.xzy
    // ^ a handful of things
  },
  check: function(counsel) {
    // add assertions that your rule is applied adequately.  optional, but encouraged
  }
})
```

- apply it (per `counsel` docs)


## how to override a rule?

### dependency overrides

```js
// package.json
{
  "counsel": { // or your dev-tool's config key
    "overrides": {
      "your-rule-name": { // make sure to add a rule name to your rules!
        "dependencies": { // add or remove deps from a rule's defaults
          "add": ["x", "y", "z"], // or "plus"
          "substract": "e" // or "minus". accepts string|string[]
        },
        "devDependencies": ["m", "n"] // squashes default devDependencies
      },
      "skip-this-rule": null // `null` skips rules altogether
    }
  }
}
```
