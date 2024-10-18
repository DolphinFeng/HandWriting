console.log('a') // a
async function async1() {
    await async2()
    console.log('b') // b
}
async function async2() {
    console.log('c') // c
}
async1()
setTimeout(function () {
    console.log('d')  // d
}, 0)
new Promise(resolve => {
    console.log('e') // e
    resolve()
})
    .then(function () {
        console.log('f') // f
    })
    .then(function () {
        console.log('g')  // g
    })
console.log('h') // h

// 拿下