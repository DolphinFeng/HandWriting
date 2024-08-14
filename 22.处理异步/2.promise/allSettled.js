const promise1 = Promise.resolve(3);
const promise2 = new Promise((resolve, reject) => {
    setTimeout(reject, 100, 'foo');
});
const promise3 = 42;

Promise.allSettled([promise1, promise2, promise3]).then((results) => {
    results.forEach((result) => console.log(result));
    // { status: 'fulfilled', value: 3 }
    // { status: 'rejected', reason: 'foo' }
    // { status: 'fulfilled', value: 42 }
});