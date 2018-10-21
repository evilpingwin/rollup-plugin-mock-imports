import { mockImports } from "./main";

// rudimentary tests to check file paths are being resolved as I _think_ they should be

test("if `mockall` is false and no mock pattern is passed `resolveId` shold return null", async () => {
  expect(
    await mockImports({ mockall: false }).resolveId(
      "./index.js",
      "/some/file/path/mock.js",
    ),
  ).toBe(null);
});

test("it should resolve node dependencies correctly", async () => {
  expect(await mockImports().resolveId("axios", "/some/path/to/file.js")).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/axios.js",
  );
});

test("it should resolve node module mocks with slashes correctly", async () => {
  expect(
    await mockImports().resolveId("axios/index", "/some/path/to/file.js"),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/axios/index.js",
  );
});

test("it should resolve node module mocks with slashes and extensions correctly", async () => {
  expect(
    await mockImports().resolveId("axios/index.js", "/some/path/to/file.js"),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/axios/index.js",
  );
});

test("it should resolve node module mocks with multiple slashes correctly", async () => {
  expect(
    await mockImports().resolveId("lodash/fp/curryN", "/some/path/to/file.js"),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/lodash/fp/curryN.js",
  );
});

test("it should resolve node module mocks with relative paths correctly", async () => {
  // why would anyone ever actually do this
  // i bet someone does though
  // and they'll be emailing me death threats at 4am if i don't test it
  expect(
    await mockImports().resolveId(
      "../node_modules/axios/index.js",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/axios/index.js",
  );
});

test("it should resolve node module mocks with relative paths and no extensions correctly", async () => {
  expect(
    await mockImports().resolveId(
      "../node_modules/axios/index",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/axios/index.js",
  );
});

test("it should resolve node builtin mocks correctly: 'fs'", async () => {
  expect(
    await mockImports().resolveId(
      "fs",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/fs.js",
  );
});

test("if no builtin mock is present it should return null", async () => {
  expect(
    await mockImports().resolveId(
      "path",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});

test("it should resolve local module mocks correctly", async () => {
  expect(
    await mockImports().resolveId(
      "../tests/something.js",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/tests/__mocks__/something.js",
  );
});

test("it should resolve local module mocks with no extension correctly", async () => {
  expect(
    await mockImports().resolveId(
      "../tests/something",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/tests/__mocks__/something.js",
  );
});

test("if there is no matching mock function, it should return null", async () => {
  expect(
    await mockImports().resolveId(
      "fs-extra",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});

test("if a module does not exist it should return null", async () => {
  expect(
    await mockImports().resolveId(
      "whatever",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});

test("if there is no importer `resolveId` should return null", async () => {
  expect(await mockImports().resolveId("./index.js")).toBe(null);
});

test("ignore options should be respected: string", async () => {
  expect(
    await mockImports({ ignore: "fs" }).resolveId(
      "fs",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});

test("ignore options should be respected: string[]", async () => {
  expect(
    await mockImports({ ignore: ["fs", "axios"] }).resolveId(
      "fs",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});

test("ignore options should be respected: RegExp", async () => {
  expect(
    await mockImports({ ignore: /ios/ }).resolveId(
      "axios",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});

test("ignore options should be respected: RegExp[]", async () => {
  expect(
    await mockImports({ ignore: [/^a/, /fs/] }).resolveId(
      "axios",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});

test("built in modules should be mocked even if the node cwd is not root", async () => {
  // this is probably not smart
  const temp = process.cwd;
  const path = process.cwd();
  process.cwd = () => `${path}/some/random/path/that/is/long`;
  expect(
    await mockImports().resolveId(
      "fs",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/fs.js",
  );
  process.cwd = temp;
});

test("built in modules should return null if the root app path cannot be resolved", async () => {
  const temp = process.cwd;
  const path = process.cwd();
  process.cwd = () => `/some/random/path/that/is/wrong`;
  expect(
    await mockImports().resolveId(
      "fs",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
  process.cwd = temp;
});

test("built in modules should return log a warning if the root app path cannot be resolved", async () => {
  const temp = process.cwd;
  process.cwd = () => `/some/random/path/that/is/wrong`;
  const spy = spyOn(console, "warn");
  await mockImports().resolveId(
    "fs",
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
  );
  expect(spy).toBeCalledWith(
    "Couldn't resolve root path. Deferring to default module resolution.",
  );
  process.cwd = temp;
});

test("if `mockall` option is set to false return null", async () => {
  expect(
    await mockImports({ mockall: false }).resolveId(
      "axios",
      "/some/path/to/file.js",
    ),
  ).toBe(null);
});

test("with `mockall: false` `mock` patterns should be respected: string", async () => {
  expect(
    await mockImports({ mockall: false, mock: "axios" }).resolveId(
      "axios",
      "/some/path/to/file.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/axios.js",
  );
});

test("with `mockall: false` `mock` patterns should be respected: string[]", async () => {
  expect(
    await mockImports({ mockall: false, mock: ["fs", "axios"] }).resolveId(
      "fs",
      "/some/path/to/file.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/fs.js",
  );
});

test("with `mockall: false` `mock` patterns should be respected: RegExp", async () => {
  expect(
    await mockImports({ mockall: false, mock: /\.js/ }).resolveId(
      "../tests/something.js",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/tests/__mocks__/something.js",
  );
});

test("with `mockall: false` `mock` patterns should be respected: RegExp[]", async () => {
  expect(
    await mockImports({ mockall: false, mock: [/hail/, /some/] }).resolveId(
      "../tests/something",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/tests/__mocks__/something.js",
  );
});

test("`mockall: false` with non-matching `mock` patterns should be ignored", async () => {
  expect(
    await mockImports({ mockall: false, mock: /xyz/ }).resolveId(
      "../tests/something",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});
