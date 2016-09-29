'use strict'

const fs = require('fs')
const path = require('path')
const swig = require('swig-templates')
const cp = require('child_process')
const ghpages = require('gh-pages')
const mkdir = (path) => cp.execSync(`mkdir -p ${path}`)
const rmdir = (path) => { try { cp.execSync(`rm -rf ${path}`) } catch (e) { /* pass */ } }
const docsPath = path.resolve(__dirname, 'docs')
const packagesPath = path.resolve(__dirname, '..', 'packages')
const marked = require('marked')

// get packages to doc'ify.
const packages = fs.readdirSync(packagesPath)
.filter((p) => p.match(/counsel/))
.map((p) => {
  const pkgRoot = path.resolve(packagesPath, p)
  return {
    name: p,
    path: pkgRoot,
    /* eslint-disable global-require */
    packageJSON: require(path.resolve(pkgRoot, 'package.json')),
    /* eslint-enable global-require */
  }
})

// clean && create docs folder.
rmdir(docsPath)
mkdir(docsPath)

// generate all docs.
packages.forEach((pkg) => {
  const readmePath = path.join(pkg.path, 'README.md')
  const conf = path.join(__dirname, '.jsdoc.json')
  const dest = path.join(__dirname, `docs-${pkg.name}`)
  const cmd = { bin: 'jsdoc', args: [pkg.path, '-c', conf, '-R', readmePath, '-d', dest] }
  console.log(`Generating docs for ${pkg.name}`) // eslint-disable-line no-console
  try {
    rmdir(dest)
    const rslt = cp.spawnSync(cmd.bin, cmd.args)
    if (rslt.stderr.toString()) { throw rslt.error }
  } catch (err) {
    console.error([ // eslint-disable-line no-console
      `Failed to generate docs for ${pkg.name}.`,
      `Failing cmd ${cmd.bin} ${cmd.args.join(' ')} `,
    ].join(' '))
    rmdir(dest)
    return
  }
  cp.execSync(`mv ${dest} ${docsPath}/${pkg.name}`)
})

// build documentation entry.
const docsIndexTemplatePath = path.resolve(__dirname, 'docs-index.swig')
const readmePath = path.resolve(__dirname, '../README.md')
const readmeStr = fs.readFileSync(readmePath).toString()
const docsIndexStr = swig.renderFile(
  docsIndexTemplatePath,
  { packages, readme: marked(readmeStr) }
)


// output index file and associated assets
fs.writeFileSync(path.join(docsPath, 'index.html'), docsIndexStr)
const gfmCSSPath = path.resolve(
  __dirname,
  '../node_modules/github-markdown-css/github-markdown.css'
)
cp.execSync(`cp ${gfmCSSPath} ${docsPath}/`)

// publish.
ghpages.publish(docsPath, (err) => {
  rmdir(docsPath)
  /* eslint-disable no-console */
  if (err) {
    console.error(err)
  } else {
    console.log('docs successfully published')
  }
  /* eslint-enable no-console */
})
