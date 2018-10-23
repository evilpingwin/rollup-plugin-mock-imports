import crypto from "crypto";
import fse from "fs-extra";
import path from "path";
import { rollup, RollupSingleFileBuild } from "rollup";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript";
import { mockImports } from "../main";

const filePath = path.resolve(`${process.cwd()}/src/main.it`);

export async function build(
  num: string,
  mockOptions: object = {},
  unlink: boolean = true,
  ext: string = ".js",
): Promise<{ output: string; expected: string }> {
  const bundle = await rollup({
    // @ts-ignore: This is patently wrong, who knows why
    input: `${filePath}/fixtures/test-mock-${num}${ext}`,
    plugins: [
      mockImports(mockOptions),
      resolve({ browser: true }),
      commonjs(),
      typescript({ declaration: false }),
      // @ts-ignore: Type mismatchm no idea what is going on
      json(),
    ],
  });

  await bundle.write({
    file: `${filePath}/__temp__/test-output-${num}.js`,
    sourcemap: false,
    format: "esm",
  });

  const files = await Promise.all([
    fse.readFile(`${filePath}/__temp__/test-output-${num}.js`, "utf8"),
    fse.readFile(`${filePath}/fixtures/test-output-${num}.js`, "utf8"),
  ]);
  const trimmedFiles = files.map(v => v.replace(/\t|\r|\n|\s{2,}/g, ""));

  if (unlink) {
    await fse.unlink(`${filePath}/__temp__/test-output-${num}.js`);
  }

  const fileHash = trimmedFiles.map(f =>
    crypto
      .createHash("sha1")
      .update(f)
      .digest("hex"),
  );

  return { output: fileHash[0], expected: fileHash[1] };
}
