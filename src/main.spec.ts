import { mockImports } from "./main";

test("should return an object", () => {
  expect(typeof mockImports()).toBe("object");
});

test("should have a name", () => {
  expect(mockImports().name).toBeTruthy();
});

test("the name should be 'mock-imports'", () => {
  expect(mockImports().name).toEqual("mock-imports");
});

test("should have a 'resolveId' method", () => {
  expect(mockImports().resolveId).toBeTruthy();
});

test("'resolveId' should return a string", () => {
  expect(typeof mockImports().resolveId("test", "test")).toBe("string");
});
