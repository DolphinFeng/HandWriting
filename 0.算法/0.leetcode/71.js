function simplifyPath (str) {
    let arr = str.split('/').filter(item => item !== '')

    let stack = []

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === '.') {
            continue
        } else if (arr[i] === '..') {
            stack.pop()
        } else {
            stack.push(arr[i])
        }
    }

    return '/' + stack.join('/')
}

console.log(simplifyPath("/home/")); // 输出："/home"
console.log(simplifyPath("/../")); // 输出："/"
console.log(simplifyPath("/home//foo/")); // 输出："/home/foo"
console.log(simplifyPath("/a/./b/../../c/")); // 输出："/c"