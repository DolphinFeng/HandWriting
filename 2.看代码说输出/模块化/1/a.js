// b.js
// let foo = 1;
// setTimeout(() => {
//   foo = 2;
// }, 500);
// module.exports = {
//   foo: foo,
// };

var b = require('./b');
console.log(b.foo);
setTimeout(() => {
    console.log(b.foo);
    console.log(require('./b').foo);
}, 1000);

// 两个知识点：cjs 同步，esm 异步。cjs 会缓存