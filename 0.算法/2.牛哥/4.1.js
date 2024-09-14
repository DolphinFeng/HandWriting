// 删除后判断是否为回文
let str = 'abas'

/**
 * 判断字符串在删除一个字符后是否为回文
 * @param {string} s - 输入的字符串
 * @returns {boolean} - 如果删除一个字符后是回文，返回true；否则返回false
 */
const validPaliond = (s) => {
    const arr = s.split('') // 将字符串转换为字符数组
    if (isPaliond(arr)) { // 如果原始数组已经是回文
        return true
    } else {        
        for (let i = 0; i < arr.length; i++) { // 遍历数组的每个字符
            let newArr = [...arr] // 复制数组
            newArr.splice(i, 1) // 删除当前字符
            if (isPaliond(newArr)) { // 判断删除一个字符后的数组是否为回文
                return true
            }
        }
        return false // 如果删除任意一个字符后都不是回文，返回false
    }
}

/**
 * 判断数组是否为回文
 * @param {Array} arr - 输入的字符数组
 * @returns {boolean} - 如果数组是回文，返回true；否则返回false
 */
const isPaliond = (arr) => {
    // 判断数组是否对称
    return arr.join('') === arr.reverse().join('')
}

console.log(validPaliond(str)); // 输出结果
