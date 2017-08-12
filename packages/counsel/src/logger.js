/**
 * console only, `Winston` transport logger
 * @module logger
 */

const winston = require('winston')
const Logger = winston.Logger
const Console = winston.transports.Console

module.exports = {
  createLogger () {
    return new Logger({
      transports: [
        new Console({
          colorize: true,
          label: 'counsel'
        })
      ]
    })
  }
}
