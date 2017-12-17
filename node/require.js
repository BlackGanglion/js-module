const common1 = require('./common-1');
const common2 = require('./common-1');

console.log(common1, common2);
// { a: 2, b: [Function: b] } { a: 2, b: [Function: b] }

console.log(common1.b());
// 3

const common3 = require('./common-1');
console.log(common3);
// { a: 2, b: [Function: b] }