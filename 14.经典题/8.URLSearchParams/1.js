/**
实现一个自己的 ‘URLSearchParams 类，该类需要具备下面能力：
1，构造函数支持传入 url 字符串或者包含键值对的对象，比如 ?foo=1&bar=2
或者 {foo: "1", bar: "2"}
2,实现 append 方法，支持插入一个指定的键值对作为新的查询参数 比如 bar，4
3，实现 set 方法，支持改写一个查询参数的新值
4，实现 get 和 getAll 方法，支持获取指定查询参数的第一个值和所有值
5，实现 toString 方法
6，实例支持 for of 迭代
 */


class URLSearchParams {
  constructor(init) {
    this.params = new Map();

    if (typeof init === 'string') {
      this._parseString(init);
    } else if (typeof init === 'object') {
      this._parseObject(init);
    }
  }

  _parseString(queryString) {
    queryString = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=').map(decodeURIComponent);
      this.append(key, value);
    }
  }

  _parseObject(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        this.append(key, obj[key]);
      }
    }
  }

  append(key, value) {
    if (!this.params.has(key)) {
      this.params.set(key, []);
    }
    this.params.get(key).push(value);
  }

  set(key, value) {
    this.params.set(key, [value]);
  }

  get(key) {
    const values = this.params.get(key);
    return values ? values[0] : null;
  }

  getAll(key) {
    return this.params.get(key) || [];
  }

  toString() {
    const pairs = [];
    for (const [key, values] of this.params) {
      for (const value of values) {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    return pairs.join('&');
  }

  *[Symbol.iterator]() {
    for (const [key, values] of this.params) {
      for (const value of values) {
        yield [key, value];
      }
    }
  }
}

// 示例用法
const params1 = new URLSearchParams('?foo=1&bar=2');
params1.append('bar', '4');
params1.set('foo', '3');
console.log(params1.get('foo')); // 输出 '3'
console.log(params1.getAll('bar')); // 输出 ['2', '4']
console.log(params1.toString()); // 输出 'foo=3&bar=2&bar=4'

const params2 = new URLSearchParams({ foo: '1', bar: '2' });
params2.append('bar', '4');
params2.set('foo', '3');
console.log(params2.get('foo')); // 输出 '3'
console.log(params2.getAll('bar')); // 输出 ['2', '4']
console.log(params2.toString()); // 输出 'foo=3&bar=2&bar=4'

// 迭代示例
for (const [key, value] of params1) {
  console.log(`${key}: ${value}`);
}