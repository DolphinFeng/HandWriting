function customSplice(array, start, deleteCount, ...items) {
    let result = [];
    let len = array.length;

    // 处理 start 参数
    start = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);

    // 处理 deleteCount 参数
    deleteCount = deleteCount === undefined ? len - start : Math.min(Math.max(deleteCount, 0), len - start);

    // 删除元素并保存到 result
    for (let i = 0; i < deleteCount; i++) {
        result.push(array[start + i]);
    }

    // 创建新的数组
    let newArray = [];
    for (let i = 0; i < start; i++) {
        newArray.push(array[i]);
    }
    for (let i = 0; i < items.length; i++) {
        newArray.push(items[i]);
    }
    for (let i = start + deleteCount; i < len; i++) {
        newArray.push(array[i]);
    }

    // 清空原数组并将新数组的元素复制回去
    array.length = 0;
    for (let i = 0; i < newArray.length; i++) {
        array.push(newArray[i]);
    }

    return result;
}

// 测试
let arr = [1, 2, 3, 4, 5];
let removed = customSplice(arr, 1, 2, 'a', 'b');
console.log(arr); // 输出 [1, 'a', 'b', 4, 5]
console.log(removed); // 输出 [2, 3]
