# counsel-script

adds a npm script to package.json.

## example

- create your rules

```js
const ScriptRule = require('counsel-script')
let publishRules = [
  new ScriptRule({
    scriptName: 'publish-minor',
    scriptCommand: 'npm version minor',
    scriptAppend: true
  })
  new ScriptRule({
    scriptName: 'publish-minor',
    scriptCommand: 'git push origin master --tags',
    scriptAppend: true
  })
  new ScriptRule({
    scriptName: 'publish-minor',
    scriptCommand: 'npm publish',
    scriptAppend: true
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
    "publish-minor": "npm version minor && git push origin master --tags && npm publish"
  },
  ...
}
```

in this contrived example, we observe how the ScriptRule can add scripts to the package.  further, we can see how in append mode, you can chain commands to a common script name.