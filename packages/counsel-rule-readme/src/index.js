'use strict'

const path = require('path')
const fs = require('fs')

module.exports = {
  name: 'enforce-readme',
  apply () {},
  check (counsel) {
    const readmeFilename = path.resolve(counsel.targetProjectRoot, 'README.md')
    if (!fs.existsSync(readmeFilename)) {
      var err = new Error(`README.md not found at: ${readmeFilename}`)
      err.code = 'ECOUNSELCHECK'
      throw err
    }
  }
}
