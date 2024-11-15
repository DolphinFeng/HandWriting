// 螺旋矩阵

var spiralOrder = function (matrix) {
    if (matrix.length == 0) return []
    const res = []
    let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1
    const size = matrix.length * matrix[0].length
    while (res.length !== size) { // 仍未遍历结束
        for (let i = left; i <= right; i++) res.push(matrix[top][i])
        top++
        for (let i = top; i <= bottom; i++) res.push(matrix[i][right])
        right--
        if (res.length === size) break // 遍历结束
        for (let i = right; i >= left; i--)  res.push(matrix[bottom][i])
        bottom--
        for (let i = bottom; i >= top; i--) res.push(matrix[i][left])
        left++
    }
    return res
};

// test cases
const matrix1 = [
    [1,2,3],
    [4,5,6],
    [7,8,9]
]
console.log(spiralOrder(matrix1)) // [1,2,3,6,9,8,7,4,5]

const matrix2 = [
    [1,2,3,4],
    [5,6,7,8],
    [9,10,11,12]
]
console.log(spiralOrder(matrix2)) // [1,2,3,4,8,12,11,10,9,5,6,7]

const matrix3 = []
console.log(spiralOrder(matrix3)) // []
