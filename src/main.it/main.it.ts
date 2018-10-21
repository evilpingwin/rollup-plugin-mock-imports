import { build } from "./helpers";

test("it should not mock when `mockall: false`", async () => {
  const { output, expected } = await build("02", { mockall: false });
  expect(output).toEqual(expected);
});

test("it should mock out node module imports when a mock is present", async () => {
  const { output, expected } = await build("01");
  expect(output).toEqual(expected);
});

test("it should mock out node modules with extensions", async () => {
  const { output, expected } = await build("03", {});
  expect(output).toEqual(expected);
});

test("it should mock out node modules with slashes", async () => {
  const { output, expected } = await build("04", {});
  expect(output).toEqual(expected);
});

test("it should mock out node modules with slashes and extensions", async () => {
  const { output, expected } = await build("05", {});
  expect(output).toEqual(expected);
});

test("it should mock out node modules with relative paths", async () => {
  const { output, expected } = await build("06", {}, false);
  expect(output).toEqual(expected);
});
