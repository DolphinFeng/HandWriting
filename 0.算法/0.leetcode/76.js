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
    if (s.length === 0 || t.length === 0) {
        return "";
    }

    let dictT = {};
    for (let i = 0; i < t.length; i++) {
        dictT[t[i]] = (dictT[t[i]] || 0) + 1;
    }

    let required = Object.keys(dictT).length;

    let l = 0, r = 0;
    let formed = 0;
    let windowCounts = {};
    let ans = [-1, 0, 0];

    while (r < s.length) {
        let c = s[r];
        windowCounts[c] = (windowCounts[c] || 0) + 1;

        if (dictT[c] && windowCounts[c] === dictT[c]) {
            formed++;
        }

        while (l <= r && formed === required) {
            c = s[l];

            if (ans[0] === -1 || r - l + 1 < ans[0]) {
                ans[0] = r - l + 1;
                ans[1] = l;
                ans[2] = r;
            }

            windowCounts[c]--;
            if (dictT[c] && windowCounts[c] < dictT[c]) {
                formed--;
            }

            l++;
        }

        r++;  
    }

    return ans[0] === -1 ? "" : s.slice(ans[1], ans[2] + 1);
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
