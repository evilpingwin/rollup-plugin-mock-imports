import { build } from "./helpers";

test("it should not mock when `mockall: false`", async () => {
  const { output, expected } = await build("02", { mockall: false });
  expect(output).toEqual(expected);
});

// node modules

test("it should mock out node module imports when a mock is present", async () => {
  const { output, expected } = await build("01");
  expect(output).toEqual(expected);
});

test("it should mock out node modules with extensions", async () => {
  const { output, expected } = await build("03");
  expect(output).toEqual(expected);
});

test("it should mock out node modules with slashes", async () => {
  const { output, expected } = await build("04");
  expect(output).toEqual(expected);
});

test("it should mock out node modules with slashes and extensions", async () => {
  const { output, expected } = await build("05");
  expect(output).toEqual(expected);
});

test("it should mock out node modules with relative paths", async () => {
  const { output, expected } = await build("06");
  expect(output).toEqual(expected);
});

test("it should mock out node modules with relative paths and no extension", async () => {
  const { output, expected } = await build("07");
  expect(output).toEqual(expected);
});

// built-in node modules
test("it should mock out builtin modules: 'fs', etc", async () => {
  const { output, expected } = await build("08");
  expect(output).toEqual(expected);
});

test("if no built-in mock is present it should not mock: 'fs', etc", async () => {
  // these modules would normally want to be treated as external, since they're built-in
  const { output, expected } = await build("09");
  expect(output).toEqual(expected);
});

// relative imports
test("it should mock out relative imports: './file.js'", async () => {
  const { output, expected } = await build("10");
  expect(output).toEqual(expected);
});

test("it should mock out relative imports with no extension: './file'", async () => {
  const { output, expected } = await build("11");
  expect(output).toEqual(expected);
});

test("if there is no matching mock relative imports should be ignored", async () => {
  const { output, expected } = await build("12");
  expect(output).toEqual(expected);
});

// ignore options

test("ignore options should be respected: string", async () => {
  const { output, expected } = await build("13", { ignore: "axios" });
  expect(output).toEqual(expected);
});

test("ignore options should be respected: string[]", async () => {
  const { output, expected } = await build("14", { ignore: ["axios", "fs"] });
  expect(output).toEqual(expected);
});

test("ignore options should be respected: RegExp", async () => {
  const { output, expected } = await build("15", { ignore: /test-mock/ });
  expect(output).toEqual(expected);
});

test("ignore options should be respected: RegExp[]", async () => {
  const { output, expected } = await build("16", {
    ignore: [/test-mock/, /f./],
  });
  expect(output).toEqual(expected);
});
