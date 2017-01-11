<p align="center"><img height="200px" src="https://github.com/cdaringe/counsel/raw/master/img/counsel.png" /></p>

# counsel

the end of boilerplate. automatically bake structure, opinions, and biz rules into projects!

[ ![Codeship Status for cdaringe/counsel](https://app.codeship.com/projects/38b24cc0-684a-0134-dd3d-5ade36a91ecb/status?branch=master)](https://app.codeship.com/projects/176370)
![](https://img.shields.io/badge/standardjs-%E2%9C%93-brightgreen.svg)


## install

`npm i --save counsel`

## usage

docs: [cdaringe.github.io/counsel](https://cdaringe.github.io/counsel/). package level doc links may be found at the _bottom_ of the linked page.

before `counsel`, you have a boring-old-package:

```js
// package.json
{
  "name": "boring-old-package",
  ...
}
```

but, you want to keep up to date with your team's latest and greatest patterns.  no problem, build & publish a small `counsel` tool!

```js
// package.json
{
  "name": "my-counsel-tool",
  "scripts": {
    "install": "node my-counsel-tool.js"
  }
}
```

```js
// my-counsel-tool.js
const counsel = require('counsel')
const ScriptRule = require('counsel-script')
const PreCommitRule = require('counsel-precommit')
counsel.apply([
  // install a dev dep & add a npm script
  new ScriptRule({
    devDependencies: ['standard']
    scriptName: 'lint',
    scriptCommand: 'standard'
  }),
  // install a git pre-commit hook that runs these npm scripts
  new PreCommitRule({
    preCommitTasks: ['validate', 'lint', 'test', 'check-coverage']
  })
])
```

install `my-counsel-tool` into `boring-old-package`:

```js
// package.json
{
  "name": "boring-old-package",
  "devDependencies": {
    "standard": "^4.0.1",
    "my-counsel-tool": "^1.0.0"
  },
  "scripts": {
    "lint": "standard"
  },
  "pre-commit": [
    "validate",
    "lint",
    "test",
    "check-coverage"
  ]
}
```

wow! not so boring after all now, is it?  when `my-counsel-tool` installs or updates, it can update your package!  it is _not_ limited to your `package.json`, of course.  make rules to do anything to your repo on `install`, on some git `hook` event, or any `npm` event!

## what

so what is it?

it's the end of boilerplate. automatically bake structure, opinions, and business rules into projects.

are you familiar with a reference repo? a boilerplate repo? a template repo?  if you are, you know they grow stale.  counsel eliminates the need for these sorts of projects.  instead, counsel allows your team or company to roll personalized tooling that is shared across every package as a development dependency.  it automatically applies your opinions, your formats, your templates, your test scripts, your lint configurations, your "whatevers" per your own desire, with very little effort.

**counsel is a tiny framework for applying rules, standards, and opinions into packages.**

counsel should _rarely_ be installed directly into general projects.  instead, use it to make a shared tool.  place all the rules you want into the tool and release it as a standalone package.

## docs

the official api docs live [here](https://cdaringe.github.io/counsel/).  all other topics covered in the readme are for quickstart only!

## rules

`counsel` is composed of sets of `Rule`s to apply to your package.  provide it a set of rules, and it will fulfill them.

**"how do i make my _own_ rules?**.  making rules is very easy!  see [counsel-rule](https://cdaringe.github.io/counsel/counsel-rule/) for more info.

## configuration

you don't _need_ to configure counsel.  however, if you so desire to, read on!

### configuration key

it is **recommended** that in your `my-counsel-tool` package, to squash `counsel.configKey = 'my-counsel-tool'`. now you can apply configuration directly to consuming projects' `package.json`s as so:

`"my-counsel-tool": { ...some config here }`

### configure rules

some rules aren't so simple.  for rules that offer configuration, you can add your config in `overrides`:

`"my-counsel-tool": { "overrides": { "counsel-plugin": ...configuration } }`.  see more in the [counsel-rule](https://cdaringe.github.io/counsel/counsel-rule/) docs.

to opt in only for an explicit subset of rules that your tool provides, provide a set of rule names to the config:

```json
"my-counsel-tool": {
  "rules": ["readme-rule", "test-rule", "some-other-rule"]
}
```

# examples

- [ripcord](https://github.com/cdaringe/ripcord)

# changelog

- 0.0.16
  - improve & clarify filename ignore rules
- 0.0.15
  - added `counsel-filename-format`
- 0.0.11
  - add `check` support. rules may add an optional `check` method to test if rule is enforced.
  - no attempts to install dually requested deps

## logo credit

[margdking](https://github.com/margdking)
