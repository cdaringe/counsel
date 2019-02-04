---
title: "getting started"
---

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
- `npx counsel check`

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

<a name='taskpayload'></a>

### TaskPayload

`plan` and `check` received a task payload as input. the payload is rich with
data and async functions to help plan and check. check out the typings in the
[api documentation](https://counsel.github.io/api#taskpayload).

what to read or try next is up to you!

- [try some examples](./docs/examples.md)
- [learn about the batteries-included rules that ship with counsel](./docs/rules-batteries-included.md)
