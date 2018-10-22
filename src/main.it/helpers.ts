import crypto from "crypto";
import fse from "fs-extra";
import { rollup } from "rollup";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import resolve from "rollup-plugin-node-resolve";
import { mockImports } from "../main";

const path = `${process.cwd()}/src/main.it`;

export async function build(
  num: string,
  mockOptions: object = {},
  unlink: boolean = true,
): Promise<{ output: string; expected: string }> {
  const bundle = await rollup({
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
