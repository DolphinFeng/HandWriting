// 最小覆盖子串

// 给你一个字符串 s 、一个字符串 t 。返回 s 中涵盖 t 所有字符的最小子串。如果 s 中不存在涵盖 t 所有字符的子串，则返回空字符串 "" 。

 

// 注意：

// 对于 t 中重复字符，我们寻找的子字符串中该字符数量必须不少于 t 中该字符数量。
// 如果 s 中存在这样的子串，我们保证它是唯一的答案。
 

// 示例 1：

// 输入：s = "ADOBECODEBANC", t = "ABC"
// 输出："BANC"
// 解释：最小覆盖子串 "BANC" 包含来自字符串 t 的 'A'、'B' 和 'C'。
// 示例 2：

// 输入：s = "a", t = "a"
// 输出："a"
// 解释：整个字符串 s 是最小覆盖子串。
// 示例 3:

// 输入: s = "a", t = "aa"
// 输出: ""
// 解释: t 中两个字符 'a' 均应包含在 s 的子串中，
// 因此没有符合条件的子字符串，返回空字符串。

var minWindow = function(s, t) {
    let minLen = s.length + 1;
    let start = s.length;     // 结果子串的起始位置
    let map = {};             // 存储目标字符和对应的缺失个数
    let missingType = 0;      // 当前缺失的字符种类数
    for (const c of t) {      // t为baac的话，map为{a:2,b:1,c:1}
      if (!map[c]) {
        missingType++;        // 需要找齐的种类数 +1
        map[c] = 1;
      } else {
        map[c]++;
      }
    }
    let l = 0, r = 0;                // 左右指针
    for (; r < s.length; r++) {      // 主旋律扩张窗口，超出s串就结束
      let rightChar = s[r];          // 获取right指向的新字符
      if (map[rightChar] !== undefined) map[rightChar]--; // 是目标字符，它的缺失个数-1
      if (map[rightChar] == 0) missingType--;   // 它的缺失个数新变为0，缺失的种类数就-1
      while (missingType == 0) {                // 当前窗口包含所有字符的前提下，尽量收缩窗口
        if (r - l + 1 < minLen) {    // 窗口宽度如果比minLen小，就更新minLen
          minLen = r - l + 1;
          start = l;                 // 更新最小窗口的起点
        }
        let leftChar = s[l];          // 左指针要右移，左指针指向的字符要被丢弃
        if (map[leftChar] !== undefined) map[leftChar]++; // 被舍弃的是目标字符，缺失个数+1
        if (map[leftChar] > 0) missingType++;      // 如果缺失个数新变为>0，缺失的种类+1
        l++;                          // 左指针要右移 收缩窗口
      }
    }
    if (start == s.length) return "";
    return s.substring(start, start + minLen);
};

// 示例 1
let s1 = "ADOBECODEBANC";
let t1 = "ABC";
console.log(minWindow(s1, t1)); // 输出: "BANC"

// 示例 2
let s2 = "a";
let t2 = "a";
console.log(minWindow(s2, t2)); // 输出: "a"

// 示例 3
let s3 = "a";
let t3 = "aa";
console.log(minWindow(s3, t3)); // 输出: ""

// 边界情况 1: s 和 t 都为空
let s4 = "";
let t4 = "";
console.log(minWindow(s4, t4)); // 输出: ""

// 边界情况 2: s 为空，t 不为空
let s5 = "";
let t5 = "A";
console.log(minWindow(s5, t5)); // 输出: ""

// 边界情况 3: s 不为空，t 为空
let s6 = "A";
let t6 = "";
console.log(minWindow(s6, t6)); // 输出: ""

// 边界情况 4: s 和 t 都只有一个字符且相同
let s7 = "A";
let t7 = "A";
console.log(minWindow(s7, t7)); // 输出: "A"

// 边界情况 5: s 和 t 都只有一个字符且不同
let s8 = "A";
let t8 = "B";
console.log(minWindow(s8, t8)); // 输出: ""

// 边界情况 6: s 包含 t 的所有字符，但 t 中有重复字符
let s9 = "AA";
let t9 = "AA";
console.log(minWindow(s9, t9)); // 输出: "AA"

// 边界情况 7: s 包含 t 的所有字符，但 t 中有重复字符，且 s 中字符顺序不同
let s10 = "AAB";
let t10 = "AA";
console.log(minWindow(s10, t10)); // 输出: "AA"
