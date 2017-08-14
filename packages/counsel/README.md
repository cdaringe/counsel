<p align="center"><img height="200px" src="https://github.com/cdaringe/counsel/raw/master/img/counsel.png" /></p>

# counsel

the end of boilerplate. automatically bake structure, opinions, and biz rules into projects!

think of it like [yeoman/yo](http://yeoman.io/), but as a source controlled dependency that brings shared behaviors to all of your packages, beyond just project structure.

counsel is for project maintainers.  counsel makes sense for people who are developing _many_ projects.  counsel doesn't always make sense for teams or maintainers working on just a project or two.

[ ![Codeship Status for cdaringe/counsel](https://app.codeship.com/projects/38b24cc0-684a-0134-dd3d-5ade36a91ecb/status?branch=master)](https://app.codeship.com/projects/176370)
![](https://img.shields.io/badge/standardjs-%E2%9C%93-brightgreen.svg)


## install

`npm install [-g|--save-dev] counsel`

## usage

counsel can be used via the CLI or via the library.  below we will discuss CLI mode for brevity purposes.

API docs may be found here: [cdaringe.github.io/counsel](https://cdaringe.github.io/counsel/). package level doc links may be found at the _bottom_ of the linked page.

before `counsel`, you have a boring-old-package:

```js
// package.json
{
  "name": "boring-old-package",
  "version": "1.0.0",
  ...
}
```

but, you want to keep up to date with your team's latest and greatest patterns.  no problem, build & publish a small set of rules.

```js
// package.json
{
  "name": "@team/rules",
  "main": "index.js",
  ...
}
```

```js
// index.js
const ScriptRule = require('counsel-script')
const GitHookRule = require('counsel-githook')

module.exports = {
  rules: [
    // install a dev dep & add a npm script
    new ScriptRule({
      devDependencies: ['standard']
      scriptName: 'lint',
      scriptCommand: 'standard'
    }),
    // install a git pre-commit hook that runs these npm scripts
    new GitHookRule({
      hooks: {
        precommit: ['lint', 'test', 'check']
      }
    }),
    // validate!
    new ScriptRule({
      devDependencies: ['counsel'],
      name: 'check',
      scriptName: 'check',
      scriptCommand: 'counsel check',
      scriptCommandVariants: ['*']
    }),
  ]
}
```

cool! once published, you can run:

```sh
$ cd /path/to/boring-package
$ counsel inject @team/rules
```

what you will now see is:

```js
// package.json
{
  "name": "boring-old-package",
  "devDependencies": {
    "@team/rules": "1.0.0",
    "counsel": "1.0.0",
    "standard": "^4.0.1",
    "husky": "2.0.0",
    "npm-run-all": "1.0.3"
  },
  "scripts": {
    "lint": "standard",
    "precommit": "run-p lint test check",
    "check": "counsel check"
  },
  "counsel": {
    "rulesets": [
      "@team/rules"
    ]
  }
}
```

wow! not so boring after all now, is it?  when `@team/rules` is injected, it can update your package with all sorts of behavior!

above, we saw an update to your `package.json`, but it is not limited to that. make rules to do anything to your project on `install`, on some git `hook` event, or any `npm` event!

counsel has two primary actions:

- `apply`
  - provided a set of rules, applies them to your project
- `check`
  - provided a set of rules, asserts that those rules are applied

various rules are ready out of the box.  see [here](https://github.com/cdaringe/counsel/tree/master/packages).

## what

so what is it?

it's the end of boilerplate. automatically bake structure, opinions, and business rules into projects.

are you familiar with a reference repo? a boilerplate repo? a template repo?  if you are, you know they grow stale.  counsel eliminates the need for these sorts of projects.  instead, counsel allows your team or company to roll personalized tooling that is shared across every package as a development dependency.  it automatically applies your opinions, your formats, your templates, your test scripts, your lint configurations, your "whatevers" per your own desire, with very little effort.

**counsel is a tiny framework for applying rules, standards, and opinions into packages.**

## docs

the official api docs live [here](https://cdaringe.github.io/counsel/).  all other topics covered in the readme are for quickstart only!

## rules

`counsel` is composed of sets of `Rule`s to apply to your package.  provide it a set of rules, and it will fulfill them.

**"how do i make my _own_ rules?**.  making rules is very easy!  see [counsel-rule](https://cdaringe.github.io/counsel/counsel-rule/) for more info.

## configuration

you don't _need_ to configure counsel.  however, if you so desire to, read on!

### configuration key

this only applies to when using counsel in library mode.  you can squash the key
in your package.json where configuration comes from.  for instance, if you
embed counsel in a different tool like `super-team-tool`, counsel config can live
under the `super-team-tool` key in the package.json.

in `super-team-tool`, before calling any counsel methods, do:

```js
counsel.configKey = 'super-team-tool'
```


### configure rules

some rules aren't so simple.  for rules that offer configuration, you can add your config in `overrides`:

`"super-team-tool": { "overrides": { "counsel-plugin": ...configuration } }`.  see more in the [counsel-rule](https://cdaringe.github.io/counsel/counsel-rule/) docs.

to opt in only for an explicit subset of rules that your tool provides, provide a set of rule names to the config:

```json
"super-team-tool": {
  "rules": ["readme-rule", "test-rule", "some-other-rule"]
}
```

# logo credit

[margdking](https://github.com/margdking)
