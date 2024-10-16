function merge (num1, m, num2, n) {
    let p1 = m - 1
    let p2 = n - 1
    let p = m + n - 1
    while (p1 >= 0 && p2 >= 0) {
        if (num1[p1] > num2[p2]) {
            num1[p] = num1[p1]
            p1--
        } else {
            num1[p] = num2[p2]
            p2--
        }
        p--
    }
    while (p2 >= 0) {
        num1[p] = num2[p2]
        p2--
        p--
    }
}

// 初始数组
let nums1 = [4, 5, 6, 0, 0, 0];
let m = 3;
let nums2 = [1, 2, 3];
let n = 3;

// 调用 merge 函数
merge(nums1, m, nums2, n);

// 输出结果
console.log(nums1); // 输出: [1, 2, 3, 4, 5, 6]