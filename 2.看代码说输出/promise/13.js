// 掌上先机笔试

console.log('start');

setTimeout(() => {
    console.log('1');

    new Promise((resolve) => {
        console.log('2');
        resolve();
    }).then(() => {
        console.log('3');
    });

}, 0);

new Promise((resolve) => {
    console.log('middle');
    reject();
}).then(() => {
    console.log('4');
}).catch(() => {
    console.log('5');
    setTimeout(() => {
        console.log('6');
    }, 0);
});

console.log('end');

// start
// middle
// end
// 5
// 1
// 2
// 3
// 6