let a = 1;
a = a + 1;

const b = function () {
  a = a + 1;
  return a;
}

exports.a = a;
exports.b = b;