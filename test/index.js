'use strict'

require('perish')
const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec

/**
 * Test all the things.
 * Run all packages' tests in parallel.
 */
const pkgDirnames = fs.readdirSync(path.resolve(__dirname, '..', 'packages')).filter(p => path.basename(p)[0] !== '.')
pkgDirnames.map((dir, ndx) => {
  const cwd = path.resolve(__dirname, '..', 'packages', dir)
  console.log(`running tests in: ${cwd}`)
  const child = exec('npm test', { cwd: cwd }, (err, stdout, stderr) => {
    if (err) throw err
    console.log(`${stdout}`)
    console.log(`${stderr}`)
  })
})