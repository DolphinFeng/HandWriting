/**
实现一个自己的 URLSearchParams 类，该类需要具备下面能力：
1，构造函数支持传入 url 字符串或者包含键值对的对象，比如 ?foo=1&bar=2 或者 {foo: "1", bar: "2"}
2，实现 append 方法，支持插入一个指定的键值对作为新的查询参数 比如 bar，4
3，实现 set 方法，支持改写一个查询参数的新值
4，实现 get 和 getAll 方法，支持获取指定查询参数的第一个值和所有值
5，实现 toString 方法
6，实例支持 for of 迭代
 */

class URLSearchParams {
    constructor (init) {
        this.params = new Map()
        if (typeof init === 'string') {
            this._parseString(init)
        } else if (typeof init === 'object') {
            this._parseObject(init)
        }
    }

    _parseString (str) {
        str = str.startsWith('?') ? str.slice(1) : str
        const pairs = str.split('&')
        for (const pair of pairs) {
            const [key, value] = pair.split('=').map(decodeURIComponent)
            this.append(key, value)
        }
    }

    _parseObject (obj) {
        for (const key in obj) {
            if (Object.hasOwnProperty(key)) {
                this.append(key, obj[key])
            }
        }
    }

    append (key, value) {
        if (!this.params.has(key)) {
            this.params.set(key, [])
        }
        this.params.get(key).push(value)
    }

    set (key, value) {
        this.params.set(key, [value])
    }

    get (key) {
        const values = this.params.get(key)
        return values ? values[0] : null
    }

    getAll (key) {
        return this.params.get(key) || []
    }

    toString () {
        const pairs = []
        for (const [key, values] of this.params) {
            for (const value of values) {
                pairs.push(`${decodeURIComponent(key)}=${decodeURIComponent(value)}`)
            }
        }
        return pairs.join('&')
    }

    *[Symbol.iterator] () {
        for (const [key, values] of this.params) {
            for (const value of values) {
                yield [key, value]
            }
        }
    }
}

const params = new URLSearchParams('?foo=1&bar=2')

params.append('bar', '4')
params.set('foo', '3')
// console.log(params.get('bar'));
// console.log(params.getAll('bar'));
// console.log(params.toString());

const obj = new URLSearchParams({ foo: '2', bar: '3' })
obj.append('foo', 222)
obj.set('bar', 4)
console.log(obj.get('foo'))
console.log(obj.getAll('foo'));
console.log(obj.toString());

for (const [key, value] of obj) {
    console.log(`${key}: ${value}`)    
}