<p align="center"><img height="200px" src="https://github.com/cdaringe/counsel/raw/master/img/counsel.png" /></p>

# counsel

the end of boilerplate. bake structure, opinions, and rules into projects.

it's kind of like [yeoman/yo](http://yeoman.io/), but as a source controlled dependency that brings shared behaviors to all of your packages, beyond just project structure.

`counsel` is for **project maintainers**.  counsel makes sense for people who are developing _many_ projects.  counsel doesn't always make sense for teams or maintainers working on just a single project or two.

[ ![Codeship Status for cdaringe/counsel](https://app.codeship.com/projects/38b24cc0-684a-0134-dd3d-5ade36a91ecb/status?branch=master)](https://app.codeship.com/projects/176370)
![](https://img.shields.io/badge/standardjs-%E2%9C%93-brightgreen.svg)


## install

`npm install [-g|--save-dev] counsel`

## usage

counsel is a CLI and a library.  here's a quick intro to the CLI:

`$ [npx] counsel apply <rule|ruleset>`

suppose you are authoring a node library.  suppose you've also defined a set of rules you
want applied to your node libraries. let's apply those rules:

```bash
$ counsel apply counsel-ruleset-nodelib
info: [counsel] installing development dependencies: counsel-ruleset-nodelib, husky, standard, jsdock
```

cool. it installed **rules** as well as supporting packages.  in fact, let's see the diff:

```diff
$ gd
diff --git a/package.json b/package.json
index cfd7948..059b05d 100644
--- a/package.json
+++ b/package.json
@@ -4,9 +4,27 @@
   "description": "",
   "main": "index.js",
   "scripts": {
+    "precommit": "run-p check lint check-vulnerablities",
+    "check": "counsel check",
+    "lint": "standard",
+    "docs:clean": "jsdock clean",
+    "docs:build": "jsdock build",
+    "docs:publish": "jsdock publish"
   },
   "keywords": [],
   "author": "",
-  "license": "ISC"
+  "license": "ISC",
+  "devDependencies": {
+    "counsel": "^0.4.1",
+    "counsel-ruleset-nodelib": "^0.4.1",
+    "husky": "^0.14.3",
+    "jsdock": "^1.0.2",
+    "npm-run-all": "^4.1.1",
+    "standard": "^10.0.3"
+  }
 }
```

some of our rules added packages and modified npm scripts.

now that we have a ruleset installed, let's make sure those rules are enforced.

```bash
$ counsel check
error: [counsel] README.md not found at: /Users/cdieringer/node/<pkg>/README.md
```

we have a rule that mandates READMEs are present.  smart.  our
ruleset also loaded a rule that runs `counsel check` every time we commit to make
sure we keep in line.  double smart!

as your rules change, you can update your ruleset and bring aged projects up to speed.

for an example of a ruleset, see [counsel-ruleset-nodelib](https://github.com/cdaringe/counsel/blob/master/packages/counsel-ruleset-nodelib/src/index.js).

## docs

the official api docs live [here](https://cdaringe.github.io/counsel/).  all other topics covered in the readme are for quickstart only!

### rules

`counsel` is composed of sets of `Rule`s to apply to your package.  provide it a set of rules, and it will fulfill them.

**"how do i make my _own_ rules?**.  making rules is very easy!  see [counsel-rule](https://cdaringe.github.io/counsel/counsel-rule/) for more info.

## configuration

you don't _need_ to configure counsel.  however, if you so desire to, read on!

### configure rules

some rules aren't so simple.  for rules that offer configuration, you can add your config in `overrides`:

```json5
// package.json
{
  "counsel": {
    "overrides": {
      "counsel-rule-widget-thing": { ...configuration }
      }
    }
  }
}
```
see more in the [counsel-rule](https://cdaringe.github.io/counsel/counsel-rule/) docs.

to opt in only for an explicit subset of rules that your tool provides, provide a set of rule names to the config:

```json
// package.json
{
  "counsel": {
    // list the rule names. you must name your rules, of course, for this to work
    "rules": ["readme-rule", "test-rule", "some-other-rule"]
  }
}
```

### configuration key

this only applies to when using counsel in library mode.  you can squash the key
in your package.json where configuration comes from.  for instance, if you
embed counsel in a different tool like `super-team-tool`, counsel config can live
under the `super-team-tool` key in the package.json.

in `super-team-tool`, before calling any counsel methods, do:

```js
counsel.configKey = 'super-team-tool' // rebrand counsel
```

# logo credit

[margdking](https://github.com/margdking)
