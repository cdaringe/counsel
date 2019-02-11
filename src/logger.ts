import winston from 'winston'

/**
 * creates a simple console logger
 */
export const createLogger = ({ logLevel }: { logLevel?: string }) => {
  return winston.createLogger({
    level: logLevel || 'info',
    format: (process.env.NODE_ENV || '').match(/dev/)
      ? winston.format.simple()
      : winston.format.json(),
    silent: !!(process.env.NODE_ENV || '').match(/test/),
    transports: [new winston.transports.Console()]
  })
}

export const withEmoji = (msg: string, emoji: string) => {
  if (!process.stdout.isTTY) return msg
  return `${emoji}  ${msg}`
}
