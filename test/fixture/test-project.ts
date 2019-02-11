import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'
import * as counsel from '../../src/counsel'
import { TestInterface } from 'ava' // eslint-disable-line no-unused-vars

export type CounselContext = typeof counsel
export type PackageContext = {
  readPackageJson: () => Promise<any>
  projectDirname: string
  gitDirname: string
  buildDirname: string
  ctx: counsel.Context
}
export type ProjectContext = PackageContext & CounselContext
export type TestPackageContext = TestInterface<ProjectContext>

export async function copyTestProject (templateDirname: string) {
  const projectDirname = path.join(
    os.tmpdir(),
    Math.random()
      .toString()
      .substr(2)
  )
  const gitDirname = path.join(projectDirname, '.git')
  const buildDirname = path.join(projectDirname, 'build')
  await fs.copy(templateDirname, projectDirname)
  await Promise.all([fs.mkdirp(gitDirname), fs.mkdirp(buildDirname)])
  return {
    projectDirname,
    gitDirname,
    buildDirname,
    readPackageJson: fs
      .readFile(path.join(projectDirname, 'package.json'))
      .then(buf => JSON.parse(buf.toString()))
  }
}

export const createMockPackageContext = async (context: ProjectContext) => {
  const fixtureDirname = path.resolve(__dirname, 'empty-package')
  const testProjectDirnames = await copyTestProject(fixtureDirname)
  context.ctx = await counsel.createDefaultContext(
    testProjectDirnames.projectDirname
  )
  context.ctx.assumeYes = true
  Object.assign(context, testProjectDirnames, counsel)
}

export async function teardown (dirname: string) {
  await fs.remove(dirname)
}

// export async function setup () {
//   const project = await .createTestProject()
//   const { dir } = project

//   // squash counsel target project attrs
//   counsel.targetProjectDirname = dir
//   counsel.targetProjectPackageJsonFilename = path.join(dir, 'package.json')

//   // stub install process 4 speeeeeed 🏁
//   counsel.installPackages = async function (packages, opts) {
//     opts = opts || {}
//     const { dev: isDev } = opts
//     packages.map(pkgName => {
//       return mockNpmInstall.install({
//         isDev,
//         package: { name: pkgName, version: '100.200.300' },
//         nodeModulesDir: path.join(dir, 'node_modules'),
//         targetPackage: path.join(dir, 'package.json')
//       })
//     })
//     return true
//   }
//   return project
// }
