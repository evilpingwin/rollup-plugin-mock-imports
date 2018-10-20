export const isNode = (filePath: string): boolean => !filePath.includes("./");

export const isWeirdNode = (filePath: string, nodeDir: string): boolean =>
  filePath.includes(nodeDir);
