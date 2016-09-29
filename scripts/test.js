'use strict'

/**
 * Test.
 *
 * Run all packages' tests in parallel
 */
const async = require('async')
const exec = require('shelljs').exec

const children = []

function getExec(dirPath, callback) {
  const child = exec('npm test', {
    async: true,
    cwd: dirPath,
    silent: false,
  }, (exitCode, stdout, stderr) => {
    if (exitCode) {
      callback(stderr.toString())
    } else {
      callback(null, stdout.toString())
    }
  })

  children.push(child)

  return child
}

function killChildren() {
  children.forEach(c => c.kill())
}

process.on('exit', killChildren)

async.series([
  cb1 => {
    const children = []
    const dirPaths = [
      './packages/counsel',
      './packages/counsel-common'
    ]

    async.parallel(dirPaths.map(dirPath => {
      return cb1a => children.push(getExec(dirPath, cb1a))
    }), (error, response) => {
      if (error) {
        cb1(error)
      } else {
        cb1(null, response)
      }
    })
  }
], (error, results) => {
  killChildren() // Ensure child processes are killed

  if (error) {
    console.error(error)
  } else {
    console.log(results)
  }
})
