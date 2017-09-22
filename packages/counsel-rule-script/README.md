# counsel-rule-script

adds a npm/yarn script to package.json.

## example

- create your rules

```js
const ScriptRule = require('counsel-rule-script')
let publishRules = [
  new ScriptRule({
    scriptName: 'publish-minor', // required
    scriptCommand: 'npm version minor' // required
  }),
  new ScriptRule({
    scriptName: 'publish-minor',
    scriptCommand: 'git push origin master --tags && npm publish',
    // optionally, let multiple ScriptRules add to the same `script`.
    scriptAppend: true
  }),
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
    ]
  },
  new ScriptRule({
    scriptName: 'lint',
    scriptCommand: 'standard',
    // do you _know_ that you've changed your ways?
    // force upgrade everyone if you know what to look for!
    // for instance, you use standard now instead of eslint
    overrideConditions: [
      oldScript => oldScript.match(/eslint/)
    ]
  })
]
```

- apply your rules (per `counsel` docs)
- observe your package.json's `publish-minor` script

```json
{
  "name": "my-package",
  "scripts": {
    "publish-minor": "npm version minor && git push origin master --tags && npm publish",
    "bananas": "bananas --peel",
    "lint": "standard"
  },
  ...
}
```

in this contrived example, we observe how the ScriptRule can add scripts to the package.  further, we can see how in append mode, you can chain commands to a common script name.
