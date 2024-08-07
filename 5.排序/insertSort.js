let arr = [5, 3, 2, 4, 1]
// 3, 5, 2, 4, 1
// 2, 3, 5, 4, 1
// 2, 3, 4, 5, 1
// 1, 2, 3, 4, 5

/**
 * 插入排序算法
 * 将数组分为已排序和未排序的两部分，初始时已排序部分只包含第一个元素，然后逐步将未排序部分的元素插入到已排序部分的正确位置，直到所有元素都被排序完
 * @param {Array} arr - 需要排序的数组
 * @returns {Array} - 排序后的数组
 */
function insertSort(arr){
    const len = arr.length // 获取数组长度
    let temp // 临时变量，用于存储当前元素
    for(let i = 1; i < len; i++){ // 从第二个元素开始遍历数组
        temp = arr[i] // 将当前元素存储在临时变量中
        let j = i // 初始化 j 为当前元素的索引
        // 将当前元素与已排序部分进行比较，找到合适的位置插入
        while(j > 0 && arr[j - 1] > temp){
            arr[j] = arr[j - 1] // 将比当前元素大的元素向后移动
            j-- // 继续向前比较
        }
        arr[j] = temp // 将当前元素插入到合适的位置
    }
    return arr // 返回排序后的数组
}

console.log(insertSort(arr));
