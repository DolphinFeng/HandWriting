// 回文数

function isPalindrome (x) {
    let str = '' + x
    return Array.from(str).reverse().join('') === str
}

console.log(isPalindrome(121));
console.log(isPalindrome(-121));
console.log(isPalindrome(10));
