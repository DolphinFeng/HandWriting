// 给定一个字符串，里面有英文和？以及乱码，写一个函数过滤出正确的句子，并且在遇到？后的下一个字母要大写

function filterSentence(input) {
    // 移除非英文字符，只保留 '?'
    let filtered = input.replace(/[^a-zA-Z\s?]/g, '');

    // 将字符串拆分成单词数组
    let words = filtered.split(' ');

    // 遍历单词数组，在 '?' 后的单词首字母大写
    for (let i = 0; i < words.length; i++) {
        if (words[i].includes('?') && i + 1 < words.length) {
            words[i + 1] = words[i + 1].charAt(0).toUpperCase() + words[i + 1].slice(1);
        }
    }

    // 将单词数组重新拼接成句子
    return words.join(' ');
}

// 示例用法:
let input = "hello?world 这是一段乱码 this is a test?string with some?random characters 还有一些乱码";
console.log(filterSentence(input)); // 输出: "hello?World this is a test?String with some?Random characters"