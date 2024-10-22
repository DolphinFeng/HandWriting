// 求数组深度
var arr = [1, [2, [3, [4, 5]]]]

function getDimen (arr) {
    let max = 1
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] instanceof Array) {
        max = Math.max(max, 1 + getDimen(arr[i]))
        }
    }
    return max
}

console.log(getDimen(arr));
