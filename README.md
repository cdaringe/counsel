<!-- AUTO GENERATED - DO NOT EDIT -->
<p align="center"><img height="80px" src="https://github.com/cdaringe/counsel/raw/master/img/counsel.png" /></p>
<p align="center">
  <img src="https://cdaringe.github.io/counsel/static/demo-apply-bef8a2b7283196e26d7cc45340443922.svg" />
</p>

# counsel

[![CircleCI](https://circleci.com/gh/cdaringe/counsel.svg?style=svg)](https://circleci.com/gh/cdaringe/counsel) ![](https://img.shields.io/badge/standardjs-%E2%9C%93-brightgreen.svg) [![TypeScript package](https://img.shields.io/badge/language-typescript-blue.svg)](https://www.typescriptlang.org)

the end of boilerplate. bake structure, opinions, and rules into projects. see the [documentation site](https://cdaringe.github.io/counsel/).

it's similar to the popular [yeoman/yo](http://yeoman.io/) package, but manages
projects programmatically versus using boilerplate.

`counsel` is for **project maintainers**.  counsel makes sense for people who are developing _many_ projects.  counsel doesn't always make sense for teams or maintainers working on just a single project or two.

<!--  npx svg-term --out ./demo-apply.svg --height=7 --width=50 --padding 10 --window -->

<a name='install'></a>

## install

`yarn add --dev counsel`

alternatively, `npm install --save-dev counsel`

<a name='usage'></a>

## usage

conventional usage is to add a `.counsel.ts` file to your project root dirname.

you can have counsel insert a generic `.counsel.ts` file for you using `--init`:

```sh
$ counsel --init
info: ⚙️ config file .counsel.ts created successfully
```

alternatively, as shown next, we can bootstrap our own `counsel.ts` file.

once a project has a counsel file, run various counsel commands:

- `npx counsel apply`

![](./img/demo-apply.svg)


- `npx counsel check`

![](./img/demo-check-fail.svg)


`npx counsel --help` is also there to help!

<a name='concepts'></a>

## concepts

counsel has only one major concept to understand--the `Rule`.  counsel can apply rules
and check that rules are enforced.  counsel rules are specified using a `.counsel.ts` file, hereby "counsel file."  let's look at counsel files and rules next.

<a name='counselfile'></a>

### counsel file

the counsel file declares and exports `Rule`s.  the only expectation is that
it exports a function named `create` with following signature:

`ContextWithRules => ContextWithRules`

let's create a basic rule that enforces that the project has a readme file:

```typescript
// .counsel.ts
export const assertReadmeExists: Rule = {
  name: 'assert-readme-exists',
  check: async ({ fs, path, ctx: { projectDirname } }) => {
    const filename = path.resolve(projectDirname, 'readme.md')
    const isReadable = await fs.lstat(filename).catch(() => false)
    if (!isReadable) throw new Error('readme.md file missing')
  }
}

// export your rules via a `create` function
export function create (opts: ContextWithRules) =>
  ({ ...opts, rules: [assertReadmeExists] })
```

create, import, and use as many rules as desired.  rules can be used for all sorts
of reasons.  sky is the limit.

<a name='rule'></a>

### rule

`Rule`s are basic interfaces with:

1. a [`name`](#rulename)
1. an optional [`plan`](#ruleplan) function
1. an optional [`check`](#rulecheck) function
1. an optional list of [`dependencies`](#ruledependencies)
1. an optional list of [`devDependencies`](#ruledevdependencies)

in a nut-shell, _that's it_.  counsel is a small set of functions that run these
`Rule`s against your project.

here's a simple rule that exercises some of the rule api:

```ts
export const exampleRule: Rule = {
  name: 'example-rule',
  plan: ({ ctx }) => {
    console.log(
      `planning to add keyword 'example' to pkg: ${ctx.packageJson.name}`
    )
    return () => {
      ctx.packageJson.keywords = ctx.packageJson.keywords || []
      ctx.packageJson.keywords.push('example')
    }
  },
  check: async ({ ctx: { packageJson } }) => {
    const keywords = packageJson.keywords || []
    console.log(`existing keywords: ${keywords.join(' ')}`)
    const keywordExists = keywords.find(val => val === 'example')
    if (!keywordExists) throw new Error("'example' keyword missing")
  },
  devDependencies: [{ name: 'debug', range: '*' }]
}
```

<a name='rulename'></a>

### rule.name

every rule requires a `name`.  it must always be a `string`.

<a name='ruleplan'></a>

### rule.plan

a `plan` returns a function or `null`, which we call a `Migration`.  a `Migration` is responsible for changing the project in some way.  rather than mutating the project upfront, all changes to a project are encouraged to happen in the `Migration`.  this gives the user an opporitunity to _opt-out_ of rules in counsel's interactive mode.

for example, here's a simplified version of counsel's baked in `copy` rule:

```ts
export interface CopyRule {
  src: string
  dest: string
}
const plan = (opts: TaskPayload<CopyRule>) =>
  () => fs.copy(opts.rule.src, opts.rule.dest)
```

the `() => fs.copy(...)` matches the `Migration` type, so it should be set!
plan receives a [TaskPayload](#taskpayload) as input, covered later.

```ts
export type Migration =
  null // return null when there is nothing to migrate
  | (() => void | Promise<void>) // otherwise, migrate in a returned function
```

<a name='rulecheck'></a>

### rule.check

check recieves a [TaskPayload](#taskpayload) as is responsible for ensuring
that a rule is enforced.  we've already seen a few examples of check functions:

- [asserting that a keyword was added](#rule)
- [asserting that a readme file exists](##counselfile)

check functions should:

- be synchronous, or return a promise
- `throw` (or reject) `Error`s when a violation is detected
- tend to be lenient

on the topic of leniency, consider counsel's baked in `ScriptRule`.
if you wanted a rule to provide a default npm script named `test`,
where the test command was `node test/index.js`, consider if the project added a
timeout flag, such as `"test": "node test/index.js --timeout 10s"`.

it would be a bad user experience to `throw` if the script did not strictly equal `node test/index.js`.
adding a simple flag is likely something that rule implementer would be OK with.
more imporantly, the core intent of the rule is likely to assert that the user
has written tests.  a better `check` implementation would be to ensure that a `test`
script is present, and is truthy (i.e. runs _some test script_).  enforcing rules
at any given granularity is something that needs to be worked through with rule makers and
their teams.  **be weary of agitating consumers by implementing
overly strict checks**.


<a name='ruledependencies'></a>
<a name='ruledevdependencies'></a>

### rule.dependencies

rules can request dependencies & devDependencies to be installed.  dependencies
are always requested in a range format:

```ts
const installRule: Rule = {
  name: 'install-koa',
  dependencies: [
    { name: 'koa', range: '^2' }
  ],
  devDependencies: [
    { name: 'node-fetch': range: '*' }
  ]
}
```

by using [semver](https://www.npmjs.com/package/semver) ranges, you can pin dependencies
with moderate precision or flexibility.

<a name='typings'></a>

## typings

it is worth brief mention that the majority of counsel's interfaces/typings are packed nicely
into a < 100 LOC file [here, for your viewing](https://github.com/cdaringe/counsel/blob/master/src/interfaces.ts).


<a name='taskpayload'></a>

### TaskPayload

`plan` and `check` receive a task payload as input. the payload is rich with
data and async functions to help plan and check. check out the typings in the
[source code](https://github.com/cdaringe/counsel/blob/7537c31c3cce4bdaaaae18718b53cf9719bb29fb/src/interfaces.ts#L67) ([1](https://github.com/cdaringe/counsel/blob/7537c31c3cce4bdaaaae18718b53cf9719bb29fb/src/interfaces.ts#L28), [2](https://github.com/cdaringe/counsel/blob/7537c31c3cce4bdaaaae18718b53cf9719bb29fb/src/interfaces.ts#L46)).

<a name='batteries'></a>

## batteries

counsel exports a handful of common and helpful rules. **batteries included!**

see `counsel.rules`, or [src/rules](./src/rules) to see a handful.  at the time of
writing, these default rules include:

<a name='copy'></a>

#### copy

- [copy](https://github.com/cdaringe/counsel/blob/master/src/rules/copy.ts) - copies files or folders into a project

```ts
import { rules } from 'counsel'
const { plan } = rules.copy
const rule: CopyRule = {
  name: 'copy-markdown-file-test',
  src: path.resolve(__dirname, 'readme-template.md'),
  dest: path.resolve(ctx.projectDirname, 'readme.md'),
  plan
}
```

<a name='filenameformat'></a>

#### filename-format

- [filename-format](https://github.com/cdaringe/counsel/blob/master/src/rules/filename-format.ts) - enforces a filename-format convention

```ts
import { kebabCase } from 'lodash'
import { rules } from 'counsel'
const { check } = rules.filenameFormat

const rule: FilenameFormatRule = {
  name: 'test-filename-rule',
  filenameFormatExtensions: ['js'],
  filenameFormatExclude: ['coffee'],
  filenameFormatFunction: kebabCase,
  check
}
// test-file.js // ok
// functional-module.js // ok
// SomeFile // not ok
```

<a name='githook'></a>

#### githook

- [githook](https://github.com/cdaringe/counsel/blob/master/src/rules/githook.ts) - installs githook support via [husky](https://www.npmjs.com/package/husky) into a project

```ts
import { rules } from 'counsel'
const { create } = rules.githook

const rule: GitHooksRule = create({
  name: 'lint-on-commit',
  hooks: {
    'pre-commit': 'yarn lint'
  }
})
```

<a name='readme'></a>


#### readme

- [readme](https://github.com/cdaringe/counsel/blob/master/src/rules/readme.ts) - enforces that a project has a readme file

```ts
import { rules } from 'counsel'
const { rule } = rules.readme
```

<a name='script'></a>

#### script

- [script](https://github.com/cdaringe/counsel/blob/master/src/rules/script.ts) - installs a npm script to a project

```ts
import { rules } from 'counsel'
const { create } = rules.script
const rule: criptRule = create({
  name: 'add-test-script-rule',
  scriptName: 'test',
  scriptCommand: 'tape test/blah.js'
})
```

<a name='examples'></a>

## examples

- <a href='https://github.com/cdaringe/counsel/blob/master/src/rulesets/nodelib.ts' target='_blank'>node library example ruleset</a>
    - see it used [in this project, here](https://github.com/cdaringe/counsel/blob/master/.counsel.ts)

<a name='similarworks'></a>

## similar works

- [FormidableLabs/builder](https://github.com/FormidableLabs/builder)
    - counsel is very similar to builder, but counsel doesn't _need_ to be yet-another-task-runner.  you can `npx counsel apply`, never fully install it, and reap many of it's benefits.
    - builder also claims flexibility and an anti-"buy the farm" attitude.  in practice, we've observed the opposite.  feel free to try both! :)

<div style='margin-bottom: 100px;'></div>

# logo credit

[margdking](https://github.com/margdking)