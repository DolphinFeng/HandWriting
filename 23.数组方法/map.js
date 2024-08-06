// 手写map

/**
 * 为Array原型添加myMap方法
 * @param {Function} cb - 回调函数，接收数组的每个元素并返回处理后的值
 * @returns {Array} 返回处理后的新数组
 */
Array.prototype.myMap = function(cb){
    let res = [] // 初始化结果数组
    let arr = this // 获取调用myMap方法的数组
    for(let item of arr){ // 遍历数组的每个元素
        res.push(cb(item)) // 将回调函数处理后的值推入结果数组
    }
    return res // 返回结果数组
}

let arr = [1, 2, 3, 4] // 定义一个数组

let newArr = arr.myMap((item) => item + 1) // 使用myMap方法对数组进行处理，每个元素加1

console.log(newArr); // 输出处理后的新数组
