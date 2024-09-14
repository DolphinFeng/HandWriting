// 回文数

function isPalindrome (x) {
    let str = '' + x
    return Array.from(str).reverse().join('') === str // Array.from 不仅可以将类数组对象转为数组，还可以将字符串转为数组
}

console.log(isPalindrome(121));
console.log(isPalindrome(-121));
console.log(isPalindrome(10));