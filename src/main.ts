import * as path from "path";

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
}

interface MockOptions {
  name: string;
  resolveId(importee: string, importer: string): string | null;
}

export function mockImports({
  mockall = true,
  ignore = "",
  mock = "",
}: UserOptions): MockOptions {
  return {
    name: "mock-imports",
    resolveId(importee, importer): string {
      if (!mockall || !importer) return null;

      const absPath: string = path.resolve(
        path.dirname(
          "/Users/evilpingwin/Projects/svelte-test/node_modules/svelte/shared.js",
        ),
        "../../node_modules",
      );
      console.log(absPath);

      // return importee;
    },
  };
}
