// import * as fs from "fs";
import fse from "fs-extra";
import isBuiltIn from "is-builtin-module";
import isRelative from "is-relative";
import path from "path";
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
  ignore?: (string | RegExp)[] | RegExp | string;
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

const normaliseMockdules = (
  filePath: string,
  ext: string,
  nodePath: string,
): string => {
  return `${filePath}${ext === "" ? ".js" : ext}`.replace(
    nodePath,
    "node_mockdules",
  );
};

const shouldItRun = (
  mockall: boolean,
  importer: string | undefined,
  importee: string | undefined,
  ignore: (string | RegExp)[] | RegExp | string,
  mock: (string | RegExp)[] | RegExp | string,
): boolean => {
  if ((!mockall && mock === undefined) || importer === undefined) return false;

  if (mockall && ignore !== undefined) {
    const ignoreArr = [].concat(ignore);
    // istanbul ignore else
    if (ignoreArr.some(v => importee.match(v) !== null)) return false;
  }
  if (!mockall && mock !== undefined) {
    const mocksArr = [].concat(mock);
    // istanbul ignore else
    if (!mocksArr.some(v => importee.match(v) !== null)) return false;
  }

  return true;
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
      // ts lint was shouting at me so I had to break these conditionals out
      // istanbul ignore else

      if (!shouldItRun(mockall, importer, importee, ignore, mock)) return null;
      // builtins are mocked like node modules
      let thePath;

      if (isBuiltIn(importee)) {
        const root = await checkForRoot(process.cwd());
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
        thePath = normaliseMockdules(
          `${absPath}/${importee.split(".")[0]}`,
          ext,
          nodePath,
        );
      } else if (isWeirdNode(absPath, nodePath)) {
        thePath = normaliseMockdules(`${absPath.split(".")[0]}`, ext, nodePath);
      } else {
        let pathArray = absPath.split("/");
        const fileName = `${pathArray.slice(-1)[0].split(".")[0]}${
          ext === "" ? ".js" : ext
        }`;
        pathArray = [...pathArray.slice(0, -1), "__mocks__", fileName];

        thePath = pathArray.join("/");
      }

      return (await fse.pathExists(thePath)) ? thePath : null;
    },
  };
}
