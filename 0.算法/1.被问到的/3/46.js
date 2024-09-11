// 给你n个长度为m的字符串，然后让你随意拼接他们，形成一个回文串，返回拼接序列，拼不成返回-1

// 比如fff acm mca 返回 2 1 3 索引从1开始

function canFormPalindrome(strings) {
    let n = strings.length;
    let used = Array(n).fill(false);
    let left = [];
    let right = [];
    let mid = null;
    
    const isPalindrome = (str) => str === str.split('').reverse().join('');
    
    // 查找所有能够互为镜像的字符串对
    for (let i = 0; i < n; i++) {
        if (used[i]) continue;
        
        for (let j = i + 1; j < n; j++) {
            if (!used[j] && strings[i] === strings[j].split('').reverse().join('')) {
                left.push(i + 1);  // 保存左边部分，索引从1开始
                right.unshift(j + 1);  // 保存右边部分，索引从1开始
                used[i] = used[j] = true;
                break;
            }
        }
        
        // 如果当前字符串可以自成回文串，且尚未找到中间部分
        if (!used[i] && mid === null && isPalindrome(strings[i])) {
            mid = i + 1;  // 保存中间部分，索引从1开始
            used[i] = true;
        }
    }
    
    // 拼接序列
    if (left.length * 2 + (mid !== null ? 1 : 0) === n) {
        return [...left, ...(mid !== null ? [mid] : []), ...right];
    }
    
    // 无法拼成回文串，返回 -1
    return -1;
}

// 测试用例
let strings = ["fff", "acm", "mca", ];
// console.log(canFormPalindrome(strings));  // 输出: [2, 1, 3]

let strings3 = ["abcd", "dcba", "xyz", "zyx"];
// console.log(canFormPalindrome(strings3));  // 输出: [1, 3, 4, 2]
// "abcd" 和 "dcba" 互为镜像，"xyz" 和 "zyx" 互为镜像，可以构成完整回文串。

let strings4 = ["abc", "cba", "aaa", "bbb"];
// console.log(canFormPalindrome(strings4));  // 输出: -1
// "abc" 和 "cba" 互为镜像，但是 "aaa" 和 "bbb" 不能构成回文串。

let strings5 = ["aba", "cbc"];
console.log(canFormPalindrome(strings5));