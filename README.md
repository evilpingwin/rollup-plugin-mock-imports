# rollup-plugin-mock-imports

A [Rollup](www.rollupjs.org) plugin that provides a simple way to mock out ESM imports when bundling. Takes a similar approach to Jest's manual mocks.

Simply place `__mocks__` folder alongside relative imports or a `node_mockdules` folder alongside `node_modules` and this plugin will resolve imports to those files and folders instead of the real ones.

There are various options you can make use of to customise the behaviour a little. It should work with typescript files as well but I'm not too confident about that right now, needs more tests.

In most cases you'll want to use normal mocks but this is useful when you need to compile before testing for whatever reason which often makes mocking difficult or impossible. I created this plugin so I could easily test Svelte components that had been compiled and mounted to a JSDOM instance without significantly altering how I wrote my code.

_I chose `node_mockdules` partly because I am hilarious and partly because this means the mock and `node_modules` folders will be next to one another in most IDEs and File Managers: your happiness is my top priority. It also reminds of [DuckTales](https://en.wikipedia.org/wiki/DuckTales)._

---

## Install

Rollup is a peer dependency of this plugin so you'll need to install that as well.

```bash
npm i --save-dev rollup-plugin-mock-imports rollup
# or
yarn add --dev rollup-plugin-mock-imports rollup
```

## Use it

Simply import it as a named import and use it as a plugin. This will typically be used with npm modules so you will probably need [rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve) as well. A standard config might look something like this:

```js
// rollup.config.js
import { mockImports } from "rollup-plugin-mock-imports";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
  input: "src/main.ts",
  // `mockImports` must come before other module resolution plugins
  // or they will steal away certain modules
  plugins: [mockImports(), resolve(), commonjs()],
  output: "dist/index.js",
};
```

Now you can simple carry on as normal. If you have no mocks then nothing will happen, to make something magical happen simply create some folders, a standard folder structure might look like this:

```
.
├── config
├── node_mockdules
│   └── someModule.js
├── node_modules
├── src
│   ├── __mocks__
│   │   └── user.js
│   └── user.js
└── views
```

Now the node module `some-module` will be automatically mocked with the `some-module.js` file, the `src/user.js` import will be mocked out for `src/__mocks__/user.js`. Simple.

`mockImports()` takes and options object, there are not many.

```js
// ...other rollup stuff

  plugins: [ mockImports({
    // by default if there is a mock present
    // for a module it will be mocked.
    //
    // you can switch this off and explicitly
    // state which modules should be mocked.
    //
    // true | false
    mockall: true,
    // path to your node modules folder
    // string
    nodePath: "node_modules",
    // if mockall is `true` you can ignore certain
    // mocks with this option.
    //
    // if any of the ignore patterns match the import
    // ('./myFile' or 'my-module') it will not be
    // mocked even if one is present
    //
    // it can be a string, RegExp, or an array of
    // string/regexp
    //
    // The array can contain either strings or
    // RegExps: ["my-module", /something.+/] is fine
    //
    // string | RegExp | (RegExp | string)<Array>
    ignore: undefined,
    // the opposite of ignore. If mockall is `false`
    // you can mock on a case by case basis.
    //
    // if any of the mock patterns match the import
    // ('./myFile' or 'my-module') it will be mocked
    // if one is present
    //
    // it can be a string, RegExp, or an array of
    // string or RegExp
    //
    // The array can contain either strings or
    // RegExps: ["my-module", /something.+/] is fine
    //
    // string | RegExp | (RegExp | string)<Array>
    mock: undefined
  }), ...moreplugins],

// other rollup stuff...
```

That's pretty much it for now. Should work most of the time. Probably.
