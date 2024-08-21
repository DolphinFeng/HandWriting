// 在Promise中，返回任意一个非 promise 的值都会被包裹成 promise 对象，例如return 2会被包装为return Promise.resolve(2)
// then 和 catch 都是 return 数字，然后就用 return Promise.resolve(x)，哪怕是 return 一个 错误出来都是用 resolve 给你包裹，因此 then 中 return 一个 error，走的是后面的 then

// Promise.resolve(1)
//   .then(res => {
//     console.log(res);
//     return 2;
//   })
//   .catch(err => {
//     return 3;
//   })
//   .then(res => {
//     console.log(res);
//   })
//   .catch(err => {
//     console.log(err)
//   })


Promise.reject('error')
  .catch(err => {
    console.log('Caught:', err); // 输出 'Caught: error'
    return 'recovered'; // 返回一个非 Promise 值
  })
  .then(value => {
    console.log('Then:', value); // 输出 'Then: recovered'
  });
