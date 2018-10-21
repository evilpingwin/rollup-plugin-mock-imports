import * as crypto from "crypto";
import * as fse from "fs-extra";
import * as rollup from "rollup";
import * as commonjs from "rollup-plugin-commonjs";
import * as json from "rollup-plugin-json";
import * as resolve from "rollup-plugin-node-resolve";
import { mockImports } from "../main";

const path = `${process.cwd()}/src/main.it`;

export async function build(
  num: string,
  mockOptions: object = {},
  unlink: boolean = true,
): Promise<{ output: string; expected: string }> {
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

  const files = await Promise.all([
    fse.readFile(`${path}/__temp__/test-output-${num}.js`),
    fse.readFile(`${path}/fixtures/test-output-${num}.js`),
  ]);

  if (unlink) {
    await fse.unlink(`${path}/__temp__/test-output-${num}.js`);
  }

  const fileHash = files.map(f =>
    crypto
      .createHash("sha1")
      .update(f)
      .digest("hex"),
  );

  return { output: fileHash[0], expected: fileHash[1] };
}
