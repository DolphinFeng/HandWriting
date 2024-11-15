// 88. 合并两个有序数组

function merge(nums1, m, nums2, n) {
    let p1 = m - 1;
    let p2 = n - 1;
    let p = m + n - 1;

    while (p1 >= 0 && p2 >= 0) {
        if (nums1[p1] > nums2[p2]) {
            nums1[p] = nums1[p1];
            p1--;
        } else {
            nums1[p] = nums2[p2];
            p2--;
        }
        p--;
    }

    // 如果 nums2 还有剩余元素，直接复制到 nums1 的前面
    while (p2 >= 0) {
        nums1[p] = nums2[p2];
        p2--;
        p--;
    }
}

// 初始数组
let nums1 = [4, 5, 6, 0, 0, 0];
let m = 3;
let nums2 = [1, 2, 3];
let n = 3;

merge(nums1, m, nums2, n);
console.log(nums1);