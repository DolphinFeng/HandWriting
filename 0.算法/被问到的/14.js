// 给你一个字符串 path ，表示指向某一文件或目录的 Unix 风格 绝对路径 （以 '/' 开头），请你将其转化为更加简洁的规范路径。
// 在 Unix 风格的文件系统中，一个点（.）表示当前目录本身；此外，两个点 （..） 表示将目录切换到上一级（指向父目录）；两者都可以是复杂相对路径的组成部分。
// 任意多个连续的斜杠（即，'//'）都被视为单个斜杠 '/' 。 对于此问题，任何其他格式的点（例如，'...'）均被视为文件/目录名称。
// 请注意，返回的 规范路径 必须遵循下述格式：
// 始终以斜杠 '/' 开头。
// 两个目录名之间必须只有一个斜杠 '/' 。
// 最后一个目录名（如果存在）不能 以 '/' 结尾。
// 此外，路径仅包含从根目录到目标文件或目录的路径上的目录（即，不含 '.' 或 '..'）。
// 返回简化后得到的 规范路径 。
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


/**
 * 将给定的 Unix 风格绝对路径转换为简洁的规范路径。
 * @param {string} path - 表示指向某一文件或目录的 Unix 风格绝对路径。
 * @return {string} - 返回简化后的规范路径。
 */
function simplifyPath(path) {
    // 使用栈来处理路径中的目录和操作
    const stack = [];
    // 将路径按斜杠分割成数组
    const components = path.split('/');

    // 遍历路径的每个部分
    for (let i = 0; i < components.length; i++) {
        const component = components[i];
        // 如果遇到 ".." 则返回上一级目录
        if (component === '..') {
            if (stack.length > 0) {
                stack.pop();
            }
        // 如果遇到 "." 或空字符串则跳过
        } else if (component !== '' && component !== '.') {
            // 将有效的目录名压入栈中
            stack.push(component);
        }
    }

    // 将栈中的目录名用斜杠连接成规范路径
    return '/' + stack.join('/');
}

// 示例用法
console.log(simplifyPath("/home/")); // 输出："/home"
console.log(simplifyPath("/../")); // 输出："/"
console.log(simplifyPath("/home//foo/")); // 输出："/home/foo"
console.log(simplifyPath("/a/./b/../../c/")); // 输出："/c"

