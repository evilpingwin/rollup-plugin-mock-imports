import { build } from "./helpers";

test("it should mock out node module imports when a mock is present", async () => {
  const { output, expected } = await build("01");

  expect(output).toEqual(expected);
});

test("it should not mock when `mockall: false`", async () => {
  const { output, expected } = await build("02", { mockall: false });
  console.log("built");

  expect(output).toEqual(expected);
});
