module.exports = {
  rules: [
    {
      apply (counsel) {
        counsel.targetProjectPackageJson.scripts = {
          'dummyscript': 'dummycommand'
        }
      }
    }
  ]
}
