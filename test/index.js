'use strict'

require('perish')
const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync

/**
 * Test.
 *
 * Run all packages' tests in series
 */
const pkgDirnames = fs.readdirSync(path.resolve(__dirname, '..', 'packages')).filter(p => path.basename(p)[0] !== '.')
pkgDirnames.map((dir, ndx) => {
  const cwd = path.resolve(__dirname, '..', 'packages', dir)
  console.log(`running tests in: ${cwd}`)
  console.log(execSync('npm test', { cwd: cwd }).toString())
})