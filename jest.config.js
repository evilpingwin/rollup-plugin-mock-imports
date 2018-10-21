module.exports = {
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test|it).ts?(x)"],
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
