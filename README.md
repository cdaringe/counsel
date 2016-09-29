# counsel :herb:

## install

`npm i --save counsel`

## usage

before `counsel`, you have a boring-old-package:

```json
// package.json
{
  name: "boring-old-package",
  ...
}
```

but, you want to keep up to date with your team's latest and greatest patterns.  no problem, build & publish a small `counsel` tool!

```json
// package.json
{
  name: "my-counsel-tool",
  scripts: {
    "install": "node my-counsel-tool.js"
  }
}
```

```js
// my-counsel-tool.js
const counsel = require('counsel')
const ScriptRule = require('counsel-common').ScriptRule
const PreCommitRule = require('counsel-common').PreCommitRule
counsel.apply([
  new ScriptRule({
    dependencies: ['standard']
    scriptName: 'lint',
    scriptCommand: 'standard'
  }),
  new PreCommitRule({
    preCommitTasks: ['validate', 'lint', 'test', 'check-coverage']
    // ^ will install a git pre-commit hook that runs these npm scripts
  })
])
```

install `my-counsel-tool` into `boring-old-package`:

```json
// package.json
{
  name: "boring-old-package",
  dependencies: {
    "standard": "^4.0.1",
    "my-counsel-tool": "^1.0.0"
  },
  scripts: {
    "lint": "standard",
    ...
  },
  "pre-commit": [
    "validate",
    "lint",
    "test",
    "check-coverage"
  ]
}
```

wow! not so boring after all now, is it.  when `my-counsel-tool` installs or updates, it can update your package!  it is _not_ limited to your `package.json`, of course.  make rules to do anything to your repo on `install`, on some git `hook` event, or any `npm` event!

## what

so what is it?

it's the end of boilerplate. automatically bake structure, opinions, and biz rules into projects.

are you familiar with a reference repo? boilerplate repo?  template repo?  if you are, you know they grow stale.  counsel eliminates the need for these sorts of projects.  instead, counsel allows your team or company to roll personalized tooling that is shared across every package as a development dependency.  it automatically applies your opinions, your formats, your templates, your test scripts, your lint configurations, your "whatevers" per your own desire, with very little effort.

counsel is a framework for applying business rules and opinions into packages.

counsel should _rarely_ be installed directly into general projects.  instead, use it to make a shared tool.  place all the rules you want into the tool and release it as a standalone package.

## rules

`counsel` is composed of sets of `Rule`s to apply to your package.  provide it a set of rules, and it will fulfill them.

## configure

some rules aren't so simple.  for rules that offer configuration, you can add your config in package.json:

`"counsel": { counsel-plugin: { ignore: true } }`

it is **recommended** that in your `my-counsel-tool` package, to squash `counsel.configKey = 'my-counsel-tool'`, such that now, you can load config like:

`"my-counsel-tool": { counsel-plugin: { ignore: true } }`

## todo

- formalize api docs!
- add some more Rules!
- break rules out into independet thingies.
- script rule, allow by default for stacked scripts to `&&` onto each other

## to implement

- readme-plugin (assert readme present)
- template-plugin (apply swig-templates to file(s). e.g. auto-build readme)
- docs (jsdoc plugin. add doc script, add docs on postpublish apply .jsdoc.json)
- filename convention (assert filenames are, say, kebab-cased.js)
- ~~lint~~ <== ScriptRule fulfills
- ~~pre-commit~~
- ~~nsp~~ <== Script + PreCommit fulfills