// 从升序数组中找到与目标值最接近的数  字节一面

function findClosest(arr, target) {
    if (arr.length === 0) return null;

    let left = 0;
    let right = arr.length - 1;
    let closest = arr[0];

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);

        // 更新最接近的数
        if (Math.abs(arr[mid] - target) < Math.abs(closest - target)) {
            closest = arr[mid];
        }

        // 根据 arr[mid] 和 target 的大小关系调整指针
        if (arr[mid] < target) {
            left = mid + 1;
        } else if (arr[mid] > target) {
            right = mid - 1;
        } else {
            return arr[mid]; // 如果找到目标值，直接返回
        }
    }

    return closest;
}

// 示例用法:
console.log(findClosest([1, 2, 4, 5, 6, 6, 8, 9], 7)); // 输出: 6
console.log(findClosest([1, 2, 4, 5, 6, 6, 8, 9], 5)); // 输出: 5
console.log(findClosest([1, 2, 4, 5, 6, 6, 8, 9], 10)); // 输出: 9
console.log(findClosest([1, 2, 4, 5, 6, 6, 8, 9], 0)); // 输出: 1
console.log(findClosest([], 5)); // 输出: null