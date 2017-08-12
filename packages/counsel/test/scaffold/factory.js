const { Counsel } = require('../../src/Counsel')
module.exports = {
  factory (opts) {
    const counsel = new Counsel(opts)
    counsel.logger.configure({ transports: [] }) // hush hush little winston.
    return counsel
  }
}
