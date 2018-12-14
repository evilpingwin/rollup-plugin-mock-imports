import fse from "fs-extra";
import isBuiltIn from "is-builtin-module";
import isRelative from "is-relative";
import path, { normalize } from "path";
import { isNode } from "./util";

const isWin = process.platform === "win32";

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

const normaliseMockdules = (filePath: string, nodePath: string): string => {
  return `${filePath}`.replace(nodePath, "node_mockdules");
};

const checkForFile = async (filePath: string): Promise<string | false> => {
  const extensions: string[] = [
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".json",
    ".node",
    ".html",
    ".svelte",
  ];
  const checkedFiles = await Promise.all(
    extensions.map(async ext => fse.pathExists(`${filePath}${ext}`)),
  );
  const correctFile: number = checkedFiles.findIndex(v => v === true);

  return correctFile > -1 ? `${filePath}${extensions[correctFile]}` : false;
};

const shouldItRun = (
  mockall: boolean,
  importer: string,
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

const resolveBuiltIn = async (importee: string): Promise<string | null> => {
  const root = await checkForRoot(process.cwd());

  if (root[0]) {
    const mockPath = path.normalize(`${root[1]}/node_mockdules/${importee}`);
    const correctPath = await checkForFile(mockPath);

    return correctPath !== false ? correctPath : null;
  } else {
    console.warn(
      "Couldn't resolve root path. Deferring to default module resolution.",
    );

    return null;
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
    async resolveId(
      importee: string,
      importer: string,
    ): Promise<string | null> {
      // istanbul ignore else

      if (!shouldItRun(mockall, importer, importee, ignore, mock)) return null;

      if (isBuiltIn(importee)) {
        return resolveBuiltIn(importee);
      }

      let absPath;
      try {
        absPath =
          !isRelative(importee) || isNode(importee)
            ? require.resolve(importee)
            : path.resolve(path.dirname(importer), importee);
      } catch {
        try {
          absPath = await checkForFile(
            path.normalize(`${path.dirname(importer)}/${importee}`),
          );
        } catch {
          // istanbul ignore next
          return null;
        }
      }
      if (!absPath) return null;

      const pathArr: string[] = absPath.split(path.sep);
      const impArr: string[] = path
        .normalize(importee)
        .split(path.sep)
        .filter(v => v !== "." && v !== "..");
      const find: number = pathArr.findIndex(v => v === impArr[0]);

      pathArr.splice(find, find + importee.split(path.sep).length, ...impArr);
      pathArr[pathArr.length - 1] = path.parse(
        pathArr[pathArr.length - 1],
      ).name;

      absPath = path.resolve(
        path.join(
          // istanbul ignore next
          !isWin ? path.sep : "",
          ...pathArr,
        ),
      );

      let thePath;
      if (absPath.includes(nodePath)) {
        thePath = normaliseMockdules(absPath, nodePath);
      } else {
        pathArr.splice(-1, 0, "__mocks__");

        thePath = `${path.join(
          // istanbul ignore next
          !isWin ? path.sep : "",
          ...pathArr,
        )}`;
      }

      const filePath = await checkForFile(thePath);

      return filePath !== false ? filePath : null;
    },
  };
}
