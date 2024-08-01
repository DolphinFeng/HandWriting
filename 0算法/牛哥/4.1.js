// 删除后判断是否为回文
let str = 'abas'

const validPaliond = (s) => {
    const arr = s.split('')
    if (isPaliond(arr)) {
        return true
    } else {        
        for (let i = 0; i < arr.length; i++) {
            let newArr = [...arr]
            newArr.splice(i, 1)
            if (isPaliond(newArr)) {
                return true
            }
        }
        return false
    }
}

const isPaliond = (arr) => {
    // 判断数组是否对称
    return arr.join('') === arr.reverse().join('')
}

console.log(validPaliond(str));