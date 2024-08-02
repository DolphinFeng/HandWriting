// { a: { b: 1 } }  ->  a.b.c => undefined,  a.b => 1  a => {b: 1}

let obj = { a: { b: 1 } }
let str = 'a'

function getValue(obj, path) {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
        if (value === undefined || value === null || typeof value !== 'object') {
            return undefined;
        }
        value = value[key];
    }

    return value;
}

console.log(getValue(obj, str));