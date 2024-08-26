// js实现对象的key和value反转 虾皮面经

function reverseObject(obj) {
    const reversed = {};
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const type = typeof value;
            // 只有在值的类型为 string 或 number 时才进行反转
            if (type === 'string' || type === 'number') {
                reversed[value] = key;
            } else {
                console.warn(`Value "${value}" with type "${type}" is not supported as a key.`);
            }
        }
    }
    return reversed;
}