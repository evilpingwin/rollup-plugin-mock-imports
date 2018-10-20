import * as fs from "fs";
import * as fse from "fs-extra";
import * as isBuiltIn from "is-builtin-module";
import * as isRelative from "is-relative";
import * as path from "path";
import { isNode, isWeirdNode } from "./util";

interface UserOptions {
  /**
   * For each import should mocks be checked for and applied?\
   * default: `true`
   */
  mockall?: boolean;
  /**
   * A pattern (string or RegExp) or array of patterns to be ignored for mocking purposes. This should match the imported module.\
   * Only applies when `mockall: true`.\
   * Default: `undefined`
   */
  ignore?: (RegExp | string)[] | RegExp | string;
  /**
   * A pattern (string or RegExp) or array of patterns to be included when mocking. This should match the imported module\
   * Only applies when `mockall: false`.\
   * Default: `undefined
   */
  mock?: (string | RegExp)[] | RegExp | string;
  /**
   * A string describing the path to your node modules folder.\
   * Default: `node_modules`
   */
  nodePath?: string;
}

const defaultOptions: UserOptions = {
  mockall: true,
  ignore: undefined,
  mock: undefined,
  nodePath: "node_modules",
};

interface MockOptions {
  name: string;
  resolveId(
    importee: string,
    importer?: string,
  ): Promise<string> | Promise<null>;
}

// const isLocal = (filePath: string): boolean => filePath.includes(__);

const checkForRoot = async (maybeRoot: string): Promise<[boolean, string]> => {
  const isItRoot = await fse.pathExists(`${maybeRoot}/package.json`);
  if (isItRoot) {
    return [isItRoot, maybeRoot];
  } else if (maybeRoot.split("/").length === 1) {
    return [false, maybeRoot];
  } else {
    const newMaybeRoot = maybeRoot
      .split("/")
      .slice(0, -1)
      .join("/");

    return checkForRoot(newMaybeRoot);
  }
};

export function mockImports({
  mockall = true,
  ignore,
  mock,
  nodePath = "node_modules",
}: UserOptions = defaultOptions): MockOptions {
  return {
    name: "mock-imports",
    async resolveId(importee, importer) {
      if ((!mockall && ignore === undefined) || importer === undefined)
        return null;

      if (mockall && ignore !== undefined) {
        const ignoreArr = [].concat(ignore);

        if (ignoreArr.some(v => importee.match(v) !== null)) return null;
      }
      // builtins, node modules or files stored in node_modules
      // are treated the same -- node_mockdules
      let root;

      // I didn't write a test for this. I'm bad.
      if (isBuiltIn(importee)) {
        root = await checkForRoot(process.cwd());
        if (root[0]) {
          const mockPath = `${root[1]}/node_mockdules/${importee}.js`;

          return (await fse.pathExists(mockPath)) ? mockPath : null;
        } else {
          console.warn(
            "Couldn't resolve root path. Deferring to default module resolution.",
          );

          return null;
        }
      }

      // try to resolve the module
      let absPath;
      try {
        absPath =
          !isRelative(importee) || isNode(importee)
            ? require.resolve(importee).split(`/${importee}`)[0]
            : path.resolve(path.dirname(importer), importee);
      } catch {
        return null;
      }
      const ext = path.extname(absPath);

      if (!isRelative(importee) || isNode(importee)) {
        const thePath = `${absPath}/${importee.split(".")[0]}${
          ext === "" ? ".js" : ext
        }`.replace(nodePath, "node_mockdules");

        return (await fse.pathExists(thePath)) ? thePath : null;
      }

      if (isWeirdNode(absPath, nodePath)) {
        const thePath = `${absPath.split(".")[0]}.js`.replace(
          nodePath,
          "node_mockdules",
        );

        return (await fse.pathExists(thePath)) ? thePath : null;
      }

      const pathArray = absPath.split("/");
      pathArray[pathArray.length - 1] = `__mocks__/${
        pathArray[pathArray.length - 1]
      }`;

      return pathArray.join("/");
    },
  };
}