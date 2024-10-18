async function async1() {
    console.log(1);
    await async2();
    console.log(2);
}
async function async2() {
    console.log(3);
    return Promise.resolve().then(() => {
        console.log(4);
    });
}

console.log(5);
setTimeout(function () {
    console.log(6);
});

async1();
new Promise(function (resolve) {
    console.log(7);
    resolve();
})
    .then(function () {
        console.log(8);
    })
    .then(function () {
        console.log(9);
    })
    .then(function () {
        console.log(10);
    });
console.log(11);

// 不懂