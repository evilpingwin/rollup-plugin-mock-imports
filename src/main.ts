interface ImportOptions {
  name: string;
  resolveId(importee: string, importer: string): string;
}

function resolveId(importee: string, importer: string): string {
  return "hi";
}

export function mockImports(): ImportOptions {
  return {
    name: "mock-imports",
    resolveId,
  };
}
