# counsel-rule-readme

[counsel](https://github.com/cdaringe/counsel) rule for asserting that a project
always has a README file in the project root.

## install

`npm install --save-dev counsel-rule-readme`

## example

```js
// my-ruleset.js
module.exports = {
  rules: [
    require('counsel-rule-readme'),
    ...
  ]
}
```

