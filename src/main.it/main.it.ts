import * as crypto from "crypto";
import * as fse from "fs-extra";
import * as rollup from "rollup";
import * as commonjs from "rollup-plugin-commonjs";
import * as json from "rollup-plugin-json";
import * as resolve from "rollup-plugin-node-resolve";
import { mockImports } from "../main";

const path = `${process.cwd()}/src/main.it`;

const build = async (num, mockOptions = {}) => {
  const bundle = await rollup.rollup({
    input: `${path}/fixtures/test-mock-${num}.js`,
    plugins: [
      mockImports(mockOptions),
      resolve({ browser: true }),
      json(),
      commonjs(),
    ],
  });

  await bundle.write({
    file: `${path}/__temp__/test-output-${num}.js`,
    sourcemap: false,
    format: "esm",
  });
};

test("it should mock out node module imports when a mock is present", async () => {
  await build("01");
  const files = await Promise.all([
    fse.readFile(`${path}/__temp__/test-output-01.js`),
    fse.readFile(`${path}/fixtures/test-output-01.js`),
  ]);
  expect(files[0]).toEqual(files[1]);
  await fse.unlink(`${path}/__temp__/test-output-01.js`);
});

test("it should not mock when `mockall: false`", async () => {
  await build("02", { mockall: false });
  console.log("built");

  const files = await Promise.all([
    fse.readFile(`${path}/__temp__/test-output-02.js`),
    fse.readFile(`${path}/fixtures/test-output-02.js`),
  ]);
  console.log("readfiles");

  const file1 = crypto
    .createHash("sha1")
    .update(files[0])
    .digest("hex");
  const file2 = crypto
    .createHash("sha1")
    .update(files[1])
    .digest("hex");

  expect(file1).toEqual(file2);
  // throw Error;
  // await fse.unlink(`${path}/__temp__/test-output-02.js`);
});
