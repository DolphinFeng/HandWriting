// 反转字符串中的元音字符

function reverseVowels(s) {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);
    let chars = s.split('');
    let left = 0;
    let right = chars.length - 1;

    while (left < right) {
        while (left < right && !vowels.has(chars[left])) {
            left++;
        }
        while (left < right && !vowels.has(chars[right])) {
            right--;
        }
        if (left < right) {
            [chars[left], chars[right]] = [chars[right], chars[left]];
            left++;
            right--;
        }
    }

    return chars.join('');
}

// 示例用法:
console.log(reverseVowels("hello")); // 输出: "holle"
console.log(reverseVowels("leetcode")); // 输出: "leotcede"
console.log(reverseVowels("aA")); // 输出: "Aa"
console.log(reverseVowels("")); // 输出: ""
console.log(reverseVowels("bcdfg")); // 输出: "bcdfg"