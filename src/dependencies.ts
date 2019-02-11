import semver from 'semver'
import { Context } from './counsel' // eslint-disable-line no-unused-vars
import { map } from 'lodash'
import { Dependency } from './interfaces' // eslint-disable-line no-unused-vars

export const dependencyToString = ({ name, range }: Dependency) =>
  `${name}@${range}`

export const fromNameVersionObject = (obj: { [name: string]: string }) =>
  map(obj, (version, name) => toFullyQualifiedDependency(name, version))

export const toFullyQualifiedDependency = (
  name: string,
  range: string
): Dependency => {
  const isValidRange = !!semver.validRange(range)
  if (!isValidRange) {
    throw new Error(
      [
        `unable to convert ${name}@${range} to`,
        `a valid SemVer range. do you need to add a`,
        '@<semver-version> suffix to the package name? e.g.:\n',
        '\tstandard@*, debug@^5, koa@2.0.x'
      ].join(' ')
    )
  }
  return { name, range }
}

/**
 * takes a set of packages currently installed A, a set of packages requested to
 * be installed B, returns the set difference B - A
 */
export const filterToInstallPackages = (
  current: Dependency[],
  toInstall: Dependency[],
  logger: Context['logger']
): Dependency[] => {
  const toInstallByName: { [key: string]: Dependency } = {}
  for (const dependency of toInstall) {
    if (toInstallByName[dependency.name]) {
      logger.warn(
        `duplicated install request for dependency ${
          dependency.name
        } [version: ${dependency.range}]`
      )
    }
    toInstallByName[dependency.name] = dependency
  }
  for (const dependency of current) {
    if (dependency.name in toInstallByName) {
      const targetRange = toInstallByName[dependency.name].range
      let isIntersecting = true
      try {
        isIntersecting = semver.intersects(dependency.range, targetRange)
      } catch (err) {
        logger.verbose(
          [
            'semver intersect failed. see: https://github.com/npm/node-semver/issues/266.',
            'ignoring error and proceeding'
          ].join(' ')
        )
      }
      if (!isIntersecting) {
        throw new Error(
          [
            `requested to install ${
              dependency.name
            }@${targetRange}, but an incompatible`,
            `version/range @${
              dependency.range
            } is already installed. please remove or`,
            'widen your current or target semver ranges'
          ].join(' ')
        )
      }
      delete toInstallByName[dependency.name]
    }
  }
  return Object.values(toInstallByName)
}
