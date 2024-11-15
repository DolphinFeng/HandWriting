// 74. 搜索二维矩阵

var searchMatrix = function(matrix, target) {
    let xlen = matrix.length;
    if(xlen <= 0){
        return false;
    }
    let ylen = matrix[0].length;
    if(target > matrix[xlen-1][ylen-1] || target < matrix[0][0]){
        return false;
    }
    let i = 0, j = ylen-1;
    while( i < xlen && j >= 0){
        if(matrix[i][j] == target){
            return true;
        }else if(matrix[i][j] < target){
            i++;
        }else if(matrix[i][j] > target){
            j--;
        }
    }
    return false;  
};


// 示例 1
let matrix1 = [
    [1,3,5,7],
    [10,11,16,20],
    [23,30,34,60]
];
console.log(searchMatrix(matrix1, 3)); // true
// 解释：3 在矩阵中

// 示例 2
let matrix2 = [
    [1,3,5,7],
    [10,11,16,20],
    [23,30,34,60]
];
console.log(searchMatrix(matrix2, 13)); // false
// 解释：13 不在矩阵中

// 示例 3
let matrix3 = [];
console.log(searchMatrix(matrix3, 0)); // false
// 解释：空矩阵

// 示例 4
let matrix4 = [[1]];
console.log(searchMatrix(matrix4, 1)); // true
// 解释：单元素矩阵，目标值存在

// 示例 5
let matrix5 = [[1,3]];
console.log(searchMatrix(matrix5, 3)); // true
// 解释：单行矩阵，目标值存在
