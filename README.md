<p align="center"><img height="200px" src="https://github.com/cdaringe/counsel/raw/master/img/counsel.png" /></p>

# counsel

the end of boilerplate. automatically bake structure, opinions, and biz rules into projects!

[ ![Codeship Status for cdaringe/counsel](https://app.codeship.com/projects/38b24cc0-684a-0134-dd3d-5ade36a91ecb/status?branch=master)](https://app.codeship.com/projects/176370)
![](https://img.shields.io/badge/standardjs-%E2%9C%93-brightgreen.svg)


## install

`npm i --save counsel`

## usage

`counsel` is generally for **teams** or for **package authors** who want consistency between their projects. to best understand the value counsel provides, let's consider an example.  before `counsel`, you have a boring-old-package:

```js
// package.json
{
  "name": "boring-old-package",
  "devDendencies": {
    "standard": "1.2.3"
  },
  "scripts": {
    "something-great": "node greatness.js",
    "lint": "standard src/",
    "validate": "npm ls",
    "secure": "nsp check"
  }
  ...
}
```

turns out, those scripts and dependencies are common to _all_ of your teams' projects. of course you want to keep up to date with your teams' latest and greatest patterns.  `counsel` can help keep all of your projects aligned.

let's build & publish a tool, which will use `counsel` to keep our team sync'ed up!  let's call it `project-unifier`.

```js
// project-unifier/package.json
{
  "name": "project-unifier",
  "scripts": {
    "install": "node project-unifier.js"
  }
}
```

```js
// project-unifier/project-unifier.js
const counsel = require('counsel')
const ScriptRule = require('counsel-script')
const PreCommitRule = require('counsel-precommit')
counsel.apply([
  new ScriptRule({
    dependencies: ['standard']
    scriptName: 'lint',
    scriptCommand: 'standard src/'
  }),
  new ScriptRule({
    dependencies: ['nsp']
    scriptName: 'secure',
    scriptCommand: 'nsp check'
  }),
  new PreCommitRule({
    preCommitTasks: ['lint', 'test', 'secure']
  })
  // ... and so on
])
```

suppose we have an `existing-project`. install `project-unifier` into some `existing-project`:

```js
// existing-project/package.json
{
  "name": "existing-project",
  "devDependencies": {
    "standard": "^4.0.1",
    "project-unifier": "^1.0.0"
  },
  "scripts": {
    "lint": "standard",
    "secure": "nsp check",
    "test": "node test/"
    ...
  },
  "pre-commit": ["lint", "test", "secure"],
  "project-unifier": { /* optional configuration */ }
}
```

rad!  **when `project-unifier` installs or updates, it can update your package**!

rules are _not_ limited to your `package.json`, of course.  make rules to do anything to your project!  examples:

- make some rules to **run tests** on git-precommit
- make some rules to **lint** on git-precommit
- make a rule to **enforce a file naming convention**
- make a rule to check coverage after testing (e.g. `posttest`)
- make a rule to spell check your README
- make a rule to copy or render templates to/from your project
- make a rule to validate that your installed dependencies match your package.json's declaration!
- ... or so many more

make rules to tap into on git `hook`s or `npm` events!  package them up in a small tool, and integrate it into all of your projects! **[counsel provides some helpful rules](https://github.com/cdaringe/counsel/tree/master/packages)** to get you started.

**not sure where to start?**  take a look at [ripcord](https://github.com/cdaringe/ripcord). or, [ask us for help](https://github.com/cdaringe/counsel/issues/new)!

## what

so what is it, really?

it's the end of boilerplate. automatically bake structure, opinions, and biz rules into projects.

are you familiar with a reference repo? boilerplate repo?  template repo?  if you are, you know they grow stale.  counsel eliminates the need for these sorts of projects.  instead, counsel allows your team or company to roll personalized tooling that is shared across every package as a development dependency.  it automatically applies your opinions, your formats, your templates, your test scripts, your lint configurations, your "whatevers" per your own desire, with very little effort.

counsel is a framework for applying business rules and opinions into packages.

counsel should _rarely_ be installed directly into general projects.  instead, use it to make a shared tool.  place all the rules you want into the tool and release it as a standalone package.

## docs

the official api docs live [here](https://cdaringe.github.io/counsel/).  package level doc links may be found at the _bottom_ of the linked page.  all other topics covered in the readme are for quickstart only!

## rules

`counsel` applies sets of `Rule`s to your package.  it can also check that your package follows those rules, if asked to do so.

provide counsel a set of rules, and it will fulfill them.

### keys included

`counsel` includes some rules for free! check out [the source](https://cdaringe.github.io/counsel/packages) to see what you can import and run with.

### make your own rules

making rules is very easy!  see [counsel-rule](https://cdaringe.github.io/counsel/counsel-rule/) for more info.

### overriding or skipping rules

see [counsel-rule](https://cdaringe.github.io/counsel/counsel-rule/) for instructions on how to handle these cases.

## configure

some rules aren't so simple.  for rules that offer configuration, you can **add your config in package.json**:

```js
"counsel": {
  "overrides": {
    "counsel-plugin-a": null, // ignore this rule
    "counsel-plugin-b: {
      "devDependencies": {
        "subtract": "instanbul" // maybe you already use blanket/jest/etc, who knows!
      }
    }
}
```

it is **recommended** that in your `project-unifier` package, to squash `counsel.configKey = 'project-unifier'`, such that now, you can load config like:

`"project-unifier": { ... }`, vs. `"counsel: { ... }`


### global config

the following configuration(s) may be applied as annotated.

```js
// package.json
"project-unifier": {
  "gitRoot": "../.." // relative path from package.json
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
