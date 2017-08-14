# counsel-script

adds a npm/yarn script to package.json.

## example

- create your rules

```js
const ScriptRule = require('counsel-script')
let publishRules = [
  new ScriptRule({
    scriptName: 'publish-minor', // required
    scriptCommand: 'npm version minor', // required
    scriptAppend: true
  })
  new ScriptRule({
    scriptName: 'publish-minor',
    scriptCommand: 'git push origin master --tags && npm publish',

    // optional, let multiple ScriptRules add to the same `script`.
    // see the result below to understand how these two `publish-minor` scripts
    // are combined.
    scriptAppend: true
  })
  new ScriptRule({
    scriptName: 'bananas',
    scriptCommand: 'bananas --peel',
    // permit variants of a script to exist for `scriptName`.
    // variants can be explict strings or RegExp's
    // @NOTE: `scriptCommandVariants: '*'` allows any user provided script to override the rule
    scriptCommandVariants: [
      'bananas --eat',
      'apples --eat',
      /fruit.io --consume/
    ],
  })
]
...
```

- apply your rules (per `counsel` docs)
- observe your package.json's `publish-minor` script

```json
{
  "name": "my-package",
  "scripts": {
    "publish-minor": "npm version minor && git push origin master --tags && npm publish",
    "bananas": "bananas --peel"
  },
  ...
}
```

in this contrived example, we observe how the ScriptRule can add scripts to the package.  further, we can see how in append mode, you can chain commands to a common script name.
