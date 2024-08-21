function child () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('after child')
            // reject('after child')
            console.log('child');
        }, 3000)
    })
}

function teen () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('teen');
            resolve('after teen')
            // reject('after teen')
        }, 2000)
    })
}

function adult () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('adult');
            resolve('after adult')
            // reject('after adult')
        }, 1000)
    })
}

// child()
// .then((res) => {
//     console.log(res);
//     return teen()
// })
// .then((res) => {
//     console.log(res);
//     return adult()
// })
// .then(res => {
//     console.log(res);
// })
// .finally(() => {
//     console.log('All Promise are settled (resolved / rejected)');
    
// })


// // race: static 静态方法挂在非实例上，返回最先 resolve 或 reject 的 Promise
// Promise.race([child(), teen(), adult()])
// .then(res => {
//     console.log(res);
// })
// .catch(err => {
//     console.log(err);
// })


// // all 返回一个 resolve 数组，不会存在 坏的，有坏的就只打印第一个先坏的
// Promise.all([child(), teen(), adult()])
// .then(res => {
//     console.log(res);
// })
// .catch(err => {
//     console.log(err);
// })

// // any 返回一个 reject 数组，不会存在 好的，有好的就只打印第一个先好的
// Promise.any([child(), teen(), adult()])
// .then(res => {
//     console.log(res);
// })
// .catch(err => {
//     console.log(err);
// })

// 输出如下：是个数组，包含了每个 Promise 的状态和结果
// [
//     { status: 'fulfilled', value: 'after child' },
//     { status: 'rejected', reason: 'after teen' },
//     { status: 'fulfilled', value: 'after adult' }
//   ]
// Promise.allSettled([child(), teen(), adult()])
// .then(res => {
//     console.log(res);
    
// })
// .catch(err => {
//     console.log(err);
    
// })


async function executeFunctions() {
    try {
        const result1 = await child();
        console.log(result1); // 输出 'after child'
        console.log(1);
        
        const result2 = await teen();
        console.log(result2); // 输出 'after teen'
        console.log(2);

        const result3 = await adult();
        console.log(result3); // 输出 'after adult'
        console.log(3);
    } catch (error) {
        console.error(error);
    }
}

executeFunctions();