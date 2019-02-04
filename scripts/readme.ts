import * as fs from 'fs-extra'
import * as common from './common'

const stripHeadMatter = (str: string) =>
  str.replace(/---((.*)\n)*---/g, '').trim()

async function go () {
  const [
    readmeTemplate,
    docs
  ] = await Promise.all([
    fs.readFile(common.README_TEMPLATE_FILENAME).then(buf => buf.toString()),
    fs.readFile(common.DOCS_MARKDOWN_FILENAME).then(buf => buf.toString())
  ])
  await fs.writeFile(common.README_FILENAME, readmeTemplate.replace('{docs}', stripHeadMatter(docs)))
}

go()
