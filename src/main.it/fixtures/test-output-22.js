var file = () => `FAKE! test-mock-22-03.js`;

function file$1() {
  console.log(file());
}

function file$2() {
  console.log(file$1());
}

function testMock22() {
  file$2();
}

export default testMock22;
