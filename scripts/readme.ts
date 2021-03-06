import * as fs from 'fs-extra'
import * as common from './common'

const stripHeadMatter = (str: string) =>
  str.replace(/---((.*)\n)*---/g, '').trim()

const autogeneratedWarning = `
<!-- AUTO GENERATED - DO NOT EDIT -->
`.trim()

async function go () {
  const [readmeTemplate, docs] = await Promise.all([
    fs.readFile(common.README_TEMPLATE_FILENAME).then(buf => buf.toString()),
    fs.readFile(common.DOCS_MARKDOWN_FILENAME).then(buf => buf.toString())
  ])
  const nextReadme = `
${autogeneratedWarning}
${readmeTemplate.replace('{docs}', stripHeadMatter(docs)).replace(/\.\.\/images/g, './img')}
  `.trim()
  await fs.writeFile(common.README_FILENAME, nextReadme)
}

go()
