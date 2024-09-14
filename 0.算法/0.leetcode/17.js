// 号码字母组合

/**
 * @param {string} digits
 * @return {string[]}
 */
var letterCombinations = function(digits) {
    if (digits.length === 0) return [];
    
    const phoneMap = {
        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno',
        '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
    };
    
    const result = [];
    const path = [];
    
    const backtrack = (index) => {
        if (index === digits.length) {
            result.push(path.join(''));
            return;
        }
        
        const letters = phoneMap[digits[index]];
        for (const letter of letters) {
            path.push(letter);
            backtrack(index + 1);
            path.pop();
        }
    };
    
    backtrack(0);
    return result;
};

console.log(letterCombinations("23")); 
// 输出: ["ad","ae","af","bd","be","bf","cd","ce","cf"]

console.log(letterCombinations("")); 
// 输出: []

console.log(letterCombinations("2")); 
// 输出: ["a","b","c"]

console.log(letterCombinations("7")); 
// 输出: ["p","q","r","s"]

console.log(letterCombinations("79")); 
// 输出: ["pw","px","py","pz","qw","qx","qy","qz","rw","rx","ry","rz","sw","sx","sy","sz"]