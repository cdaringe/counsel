# counsel-template

runs a template engine against a template file!

your template is passed all of `counsel`, and the the target project's package.json.  the current template engine employed is [swig-templates](http://node-swig.github.io/swig-templates/).

## example

- prep a teamplate file, such as `README.swig`

```jinja
// README.swig
# {{ package.name }}

{{ package.description }}
```

- create your rule

```js
// my-readme-template-rule.js
'use strict'

const TemplateRule = require('counsel-template')

module.exports = new TemplateRule({
  templateSource: './README.swig', // relative to your counsel project's root (package.json folder)
  templateTarget: './README.md' // relative to the target package's root
})
```

- apply it (per `counsel` docs)
- enjoy the output!

```md
// README.md
# my-project

my project description!
```