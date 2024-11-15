// 搜索二维矩阵 II

/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
var searchMatrix = function (matrix, target) {
    if (matrix.length == 0) return false // 判空
    let [left, up] = [matrix[0].length - 1, 0]; // 初始化位置
    while (left >= 0 && up < matrix.length) {
        if (matrix[up][left] > target) {
            left--;
        } else if (matrix[up][left] < target) {
            up++;
        } else {
            return true;
        }
    }
    return false;
};

// test cases
const matrix1 = [
    [1,4,7,11,15],
    [2,5,8,12,19],
    [3,6,9,16,22],
    [10,13,14,17,24],
    [18,21,23,26,30]
]
console.log(searchMatrix(matrix1, 5)) // true
console.log(searchMatrix(matrix1, 20)) // false

const matrix2 = []
console.log(searchMatrix(matrix2, 0)) // false
