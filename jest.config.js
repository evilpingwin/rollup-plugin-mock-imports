module.exports = {
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test|it).ts?(x)"],
  coveragePathIgnorePatterns: ["/node_modules/", "/src/main.it/"],
  watchPathIgnorePatterns: [".+__temp__+"],
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
};
