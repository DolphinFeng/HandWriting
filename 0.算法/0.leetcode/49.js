// 字母异位词分组

// 给你一个字符串数组，请你将 字母异位词 组合在一起。可以按任意顺序返回结果列表。

// 字母异位词 是由重新排列源单词的所有字母得到的一个新单词。

 

// 示例 1:

// 输入: strs = ["eat", "tea", "tan", "ate", "nat", "bat"]
// 输出: [["bat"],["nat","tan"],["ate","eat","tea"]]
// 示例 2:

// 输入: strs = [""]
// 输出: [[""]]
// 示例 3:

// 输入: strs = ["a"]
// 输出: [["a"]]

var groupAnagrams = function(strs) {
    // 创建一个 Map 对象，用于存储字母异位词组
    let map = new Map();
    
    // 遍历输入的字符串数组
    for (let str of strs) {
        // 将字符串按字母顺序排序
        let sortedStr = str.split('').sort().join('');
        
        // 如果 map 中不存在该排序后的字符串，则创建一个新的数组
        if (!map.has(sortedStr)) {
            map.set(sortedStr, []);
        }
        
        // 将原始字符串添加到对应的字母异位词组中
        map.get(sortedStr).push(str);
    }
    
    // 将 map 中的所有字母异位词组转换为数组并返回
    return Array.from(map.values());
};

let strs1 = ["eat", "tea", "tan", "ate", "nat", "bat"];
console.log(groupAnagrams(strs1));
// 输出: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]
