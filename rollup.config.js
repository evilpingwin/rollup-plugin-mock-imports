import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

// CommonJS and ESM
export default {
  input: "src/main.ts",
  plugins: [commonjs(), resolve(), typescript()],
  external: [
    "path",
    "fs",
    "assert",
    "os",
    "module",
    "util",
    "constants",
    "stream",
  ],
  output: [
    { file: pkg.module, format: "es" },
    { file: pkg.main, format: "cjs" },
  ],
};
