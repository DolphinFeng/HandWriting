setTimeout(() => {
    console.log('1');
    new Promise((resolve) => {
        console.log('2');
        resolve()
    }).then(() => {
        console.log('3');
    })
})

async function async1 () {
    console.log('4');
    await async2()
    console.log('5');
    await async3()
}

async function async2 () {
    console.log('6');
}

async function async3 () {
    console.log('7');
}

console.log('8');

async1()

new Promise((resolve) => {
    console.log('9');
    resolve()
}).then(() => {
    console.log('10');
})

new Promise((resolve) => {
    console.log('11');
    resolve()
}).then(() => {
    console.log('12');
})

console.log('13');