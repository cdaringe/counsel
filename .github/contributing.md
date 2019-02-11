# contributing

## general

- `git clone` and branch (`git checkout -b feat/my-feature`)
- install dependencies via yarn: `yarn`
- `npx tsc -w` to start the compiler
- `yarn test -w` to start the tests

## testing

- run 'em, add to 'em

## lint/formatting

- this project uses githooks, so each time you commit your code it _should_ run the linter and formatter on your code automatically
  - if not, please run `yarn lint && yarn format`
