const path = require('path')
const ghPages = require('gh-pages')

const WEBSITE_DIRNAME = path.resolve(__dirname, '..')
const BUILD_DIRNAME = path.resolve(WEBSITE_DIRNAME, 'public')

async function go () {
  if (process.env.CIRCLE_BRANCH !== 'master') {
    return console.log(`skipping build. on branch "${process.env.CIRCLE_BRANCH}"`)
  }
  ghPages.publish(BUILD_DIRNAME, {
    repo: `https://${process.env.GH_TOKEN}@github.com/cdaringe/counsel.git`,
    user: {
      name: 'wa11-e',
      email: 'cdaringe@gmail.com'
    }
  }, err => {
    if (err) throw err
    console.log('docs successfully published')
  })
}

go()
