function file(str) {
    return `FAKE test-mock-23-01.ts' + ${str}`;
}

function something() {
    return file();
}

export { something };
