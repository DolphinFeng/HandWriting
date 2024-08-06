let arr = [1, 2, 3, 4, 5, 6]

// 为 Array 原型添加一个 myForEach 方法
Array.prototype.myForEach = function (cb) {
    // 将当前数组赋值给局部变量 arr
    let arr = this
    // 遍历数组的每一个元素
    for (let i = 0; i < arr.length; i++) {
        // 调用回调函数 cb，传入当前元素、索引和数组本身
        cb(arr[i], i, arr)
    }
}

// 使用自定义的 myForEach 方法遍历数组并打印每个元素
arr.myForEach((item) => {
    console.log(item);
})
