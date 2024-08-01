async function async1(){
    console.log(2)
    await async2()
    console.log(3)

}

async function async2(){
    console.log(4)
}


console.log(1)
async1()
console.log(5)

// 宏：
// 微：3
// 输出：1 2 4 5 3