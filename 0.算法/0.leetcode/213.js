/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function (nums) {
    let len = nums.length;
    if(len<2){
        return nums[0]
    }
    let f0 = 0, f1 = 0;
    let f2 = 0, f3 = 0;
    for (let i = 0; i < len; i++) {
        let num = nums[i];

        if (i < len - 1) {
            let f = Math.max(f0 + num, f1);
            f0 = f1;
            f1 = f;
        }
        if (i > 0) {
            let f = Math.max(f2 + num, f3);
            f2 = f3;
            f3 = f;
        }
    }

    return Math.max(f1, f3)
};

console.log(rob([2, 3, 2])) // 3

