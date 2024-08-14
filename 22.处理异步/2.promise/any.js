const promise1 = new Promise((resolve, reject) => {
    setTimeout(reject, 100, 'one');
});

const promise2 = new Promise((resolve, reject) => {
    setTimeout(resolve, 200, 'two');
});

const promise3 = new Promise((resolve, reject) => {
    setTimeout(resolve, 300, 'three');
});

Promise.any([promise1, promise2, promise3]).then((value) => {
    console.log(value); // "two"
}).catch((error) => {
    console.log(error);
});
