async function async1 () {
    console.log('1');
    await async2()
    // console.log('2');
    await async3()
    console.log('2');
}

async function async2 () {
    console.log('3');
}

async function async3 () {
    console.log('4');
}

async1()

// 第一个await将后面的所有的代码均视作微任务