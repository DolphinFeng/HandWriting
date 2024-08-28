// js实现对象的key和value反转: 只有在值的类型为 string 或 number 时才进行反转

function reverseObject(obj) {
    // 创建一个新的空对象，用于存储反转后的键值对
    const reversedObj = {};

    // 遍历输入对象的每一个键值对
    for (const key in obj) {
        // 确保该属性是对象自身的属性，而不是从原型链继承的属性
        if (obj.hasOwnProperty(key)) {
            // 获取当前键对应的值
            const value = obj[key];

            // 检查值的类型是否为 string 或 number
            if (typeof value === 'string' || typeof value === 'number') {
                // 将值作为新的键，键作为新的值，存入新对象
                reversedObj[value] = key;
            }
        }
    }

    // 返回反转后的对象
    return reversedObj;
}

// 示例对象
const originalObj = {
    a: 1,
    b: 'hello',
    c: true,
    d: 2
};

// 调用函数并输出结果
console.log(reverseObject(originalObj)); // { '1': 'a', 'hello': 'b', '2': 'd' }
