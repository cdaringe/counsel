// Type definitions for counsel
// Project: counsel]
// Definitions by: cdaringe <cdaringe.com>


export function apply (rules: any[]): Promise<any>;
export function check (rules: any[]): Promise<any>;

/** filename of target project */
export const targetProjectRoot: string;

/** parsed target project package.json */
export const targetProjectPackageJson: any;

/** filename of target project package.json */
export const targetProjectPackageJsonFilename: string;

export namespace project {
  export function copy(src: string, dest: string, opts: any): void;
  export function isDir(dir: string): boolean;
  export function findGitRoot(start?: string): string;
  export function findProjectRoot(start?: string): string;
  /**
   * Recursively creates directories until `path` exists
   * @param {string} path
   */
  export function mkdir(path: string): void;
}

/** logger! winston instance.  all rules should consume the counsel logger if logging is required */
export const logger: any;

/** key using to read rule configuration from in the target package.json */
export const configKey: string;

/** get counsel config */
export function config (): any;
