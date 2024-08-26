// { a: { b: 1 } }  ->  a.b.c => undefined,  a.b => 1  a => {b: 1}

let obj = { a: { b: 1 } }
let str = 'a.b'

/**
 * 根据路径字符串获取对象中的值
 * @param {Object} obj - 要查询的对象
 * @param {string} path - 用点分隔的路径字符串
 * @returns {*} - 返回路径对应的值，如果路径不存在则返回 undefined
 */
function getValue(obj, path) {
    // 将路径字符串按点分隔成数组
    const keys = path.split('.');
    // 初始化值为传入的对象
    let value = obj;

    // 遍历路径数组中的每个键
    for (const key of keys) {
        // 如果值为 undefined、null 或不是对象，则返回 undefined
        if (value === undefined || value === null || typeof value !== 'object') {
            return undefined;
        }
        // 更新值为当前键对应的值
        value = value[key];
    }

    // 返回最终获取的值
    return value;
}

// 输出根据路径获取的值
console.log(getValue(obj, str));
