// n对括号的所有合法的组合 t神 字节二面

// 正整数 n 代表生成括号的对数，请设计一个函数，用于能够生成所有可能的并且 有效的 括号组合。

 

// 示例 1：

// 输入：n = 3
// 输出：["((()))","(()())","(())()","()(())","()()()"]
// 示例 2：

// 输入：n = 1
// 输出：["()"]

function generateParenthesis(n) {
    const result = [];
    
    function backtrack(current, open, close) {
        if (current.length === n * 2) {
            result.push(current);
            return;
        }
        
        if (open < n) {
            backtrack(current + "(", open + 1, close);
        }
        
        if (close < open) {
            backtrack(current + ")", open, close + 1);
        }
    }
    
    backtrack("", 0, 0);
    return result;
}


console.log(generateParenthesis(3)); // ["((()))", "(()())", "(())()", "()(())", "()()()"]
console.log(generateParenthesis(1)); // ["()"]
console.log(generateParenthesis(2)); // ["(())", "()()"]
console.log(generateParenthesis(4)); // ["(((())))", "((()()))", "((())())", "((()))()", "(()(()))", "(()()())", "(()())()", "(())(())", "(())()()", "()((()))", "()(()())", "()(())()", "()()(())", "()()()()"]