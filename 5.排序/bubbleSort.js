let arr = [3, 2, 4, 1, 5] // 初始化数组

/**
 * 冒泡排序算法
 * 重复遍历数列，依次比较两个相邻的元素，顺序错误则交换位置，直到没有任何元素需要交换为止
 * @param {Array} arr - 需要排序的数组
 */
function bubbleSort (arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] > arr[j]) {
                [arr[i], arr[j]] = [arr[j], arr[i]]
            }
        }
    }
    return arr
}

console.log(bubbleSort(arr));
