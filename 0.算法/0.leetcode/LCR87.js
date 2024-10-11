function restoreIpAddresses(s) {
    if (s.length > 12 || s.length < 4) return [];
    const res = [];
    const path = [];
    const dfs = (index) => {
        if (path.length > 4) return;
        if (index === s.length && path.length >= 4) {
            return res.push(path.join('.'));
        }
        let temp = '';
        for (let i = index; i < s.length; i++) {
            temp = temp + s[i]; // 记录不符合条件时的单个字符，也许加着加着就符合了。
            if (
                Number(temp) >= 0 &&
                Number(temp) <= 255 &&
                (temp[0] !== '0' || temp === '0') // 判断第一个位置上的数字是0，只有0才符合条件，例如：'01' 不符合
            ) {
                path.push(temp);
                dfs(i + 1); // i作为参数传递下去，确保深一层的递归函数不从头遍历。
                path.pop();
            }
        }
    };
    dfs(0);
    return res;
}


const s = "25525511135";
console.log(restoreIpAddresses(s)); // [ '255.255.11.135', '255.255.111.35' ]