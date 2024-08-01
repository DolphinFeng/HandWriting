let [x = 1] = [undefined]
let [y = 1] = [null]
console.log(x); // 1
console.log(y); // null

// 解疑
// 解构默认值的问题
// 解构模式中，若对应的值是undefined就是默认值，因此x = 1
// 第二个默认值不是undefined，就是null
// https://es6.ruanyifeng.com/#docs/destructuring