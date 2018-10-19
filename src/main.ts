import * as path from "path";

interface ImportOptions {
  name: string;
  resolveId(importee: string, importer: string): string;
}

function resolveId(importee: string, importer: string | undefined): string {
  if (importer === undefined) return null;
  const absPath: string = path.resolve(
    path.dirname(
      "/Users/evilpingwin/Projects/svelte-test/node_modules/svelte/shared.js",
    ),
    "../../node_modules",
  );
  console.log(absPath);

  return importee;
}

export function mockImports(): ImportOptions {
  return {
    name: "mock-imports",
    resolveId,
  };
}
