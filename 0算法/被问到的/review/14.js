// 有效路径

// 示例 1：
// 输入：path = "/home/"
// 输出："/home"
// 解释：注意，最后一个目录名后面没有斜杠。
// 示例 2：
// 输入：path = "/../"
// 输出："/"
// 解释：从根目录向上一级是不可行的，因为根目录是你可以到达的最高级。
// 示例 3：
// 输入：path = "/home//foo/"
// 输出："/home/foo"
// 解释：在规范路径中，多个连续斜杠需要用一个斜杠替换。
// 示例 4：
// 输入：path = "/a/./b/../../c/"
// 输出："/c"

path = "/home/"

function toPath (str) {
    let arr = str.split('/').filter(item => item !== '')
    console.log(arr);
    let stack = []
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === '.') {
            continue
        } else if (arr[i] == '..') {
            stack.pop()
        } else {
            stack.push(arr[i])
        }
    }
    return '/' + stack.join('/')
}

console.log(toPath(path));