import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

// CommonJS and ESM
export default {
  input: "src/main.ts",
  plugins: [resolve(), commonjs(), typescript()],
  output: [
    { file: pkg.module, format: "es" },
    { file: pkg.main, format: "cjs" },
  ],
};
