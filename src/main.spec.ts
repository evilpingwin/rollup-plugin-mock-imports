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

test("it should resolve node dependencies correctly, even if they're a bit weird", async () => {
  expect(
    await mockImports().resolveId("axios/index", "/some/path/to/file.js"),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/axios/index.js",
  );
});

test("it should resolve node dependencies correctly, even with file extensions", async () => {
  expect(
    await mockImports().resolveId("axios/index.js", "/some/path/to/file.js"),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/axios/index.js",
  );
});

test("it should resolve node dependencies correctly, even more weird imports", async () => {
  expect(
    await mockImports().resolveId("lodash/fp", "/some/path/to/file.js"),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/lodash/fp.js",
  );
});

test("it should resolve node dependencies correctly, more weird imports", async () => {
  expect(
    await mockImports().resolveId("lodash/fp/curryN", "/some/path/to/file.js"),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/lodash/fp/curryN.js",
  );
});

test("it should resolve node dependencies correctly, more weird imports", async () => {
  expect(
    await mockImports().resolveId("lodash/fp/curryN", "/some/path/to/file.js"),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/lodash/fp/curryN.js",
  );
});

test("it should resolve node dependencies correctly, even if they're imported via a relative path", async () => {
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

test("it should resolve node dependencies correctly, even if they're imported via a relative path with no extension", async () => {
  expect(
    await mockImports().resolveId(
      "../node_modules/axios/index",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/axios/index.js",
  );
});

test("it should resolve builtin node dependencies correctly", async () => {
  expect(
    await mockImports().resolveId(
      "fs",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(
    "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/node_mockdules/fs.js",
  );
});

test("it should resolve local dependencies correctly", async () => {
  expect(
    await mockImports().resolveId(
      "../tests/something.js",
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

test("if there is no importer `resolveId` shold return null", async () => {
  expect(await mockImports().resolveId("./index.js")).toBe(null);
});

test("ignore options should be respected: as strings", async () => {
  expect(
    await mockImports({ ignore: "fs" }).resolveId(
      "fs",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});

test("ignore options should be respected: as string[]", async () => {
  expect(
    await mockImports({ ignore: ["fs", "axios"] }).resolveId(
      "fs",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});

test("ignore options should be respected: as RegExp", async () => {
  expect(
    await mockImports({ ignore: /ios/ }).resolveId(
      "axios",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});

test("ignore options should be respected: as RegExp[]", async () => {
  expect(
    await mockImports({ ignore: [/^a/, /fs/] }).resolveId(
      "axios",
      "/Users/evilpingwin/Projects/rollup-plugin-mock-imports/src/index.js",
    ),
  ).toBe(null);
});
