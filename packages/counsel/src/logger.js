/**
 * console only, `Winston` transport logger
 * @module logger
 */
'use strict'

const winston = require('winston')
const Logger = winston.Logger
const Console = winston.transports.Console

module.exports = new Logger({
  transports: [
    new Console({
      colorize: true,
      label: 'counsel'
    })
  ]
})
