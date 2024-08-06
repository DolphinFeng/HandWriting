// 为Array原型添加myReduce方法
Array.prototype.myReduce = function (cb, init) {
    let array = this; // 获取当前数组
    let acc = init || array[0]; // 初始化累加器，如果没有提供初始值，则使用数组的第一个元素
    let startIndex = init ? 0 : 1; // 如果提供了初始值，则从索引0开始，否则从索引1开始
    for (let i = startIndex; i < array.length; i++) {
        let cur = array[i]; // 当前元素
        acc = cb(acc, cur, i, array); // 调用回调函数，更新累加器
    }
    return acc; // 返回累加结果
}

let arr = [1, 2, 3, 4, 5];
// 使用myReduce方法计算数组元素的和
let sum = arr.myReduce((a, b) => {
    return a + b; // 回调函数，计算累加值
});

console.log(sum); // 输出结果
