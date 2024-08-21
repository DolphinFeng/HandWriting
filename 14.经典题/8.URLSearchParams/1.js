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


/**
 * 实现一个自己的 URLSearchParams 类
 * 该类用于解析和操作 URL 查询参数
 */
class URLSearchParams {
  /**
   * 构造函数
   * @param {string|object} init - 可以是 URL 查询字符串或包含键值对的对象
   */
  constructor(init) {
    this.params = new Map();

    if (typeof init === 'string') {
      this._parseString(init); // 解析字符串形式的查询参数
    } else if (typeof init === 'object') {
      this._parseObject(init); // 解析对象形式的查询参数
    }
  }

  /**
   * 解析查询字符串
   * @param {string} str - 查询字符串
   */
  _parseString(str) {
    str = str.startsWith('?') ? str.slice(1) : str; // startsWith 方法返回一个布尔值，表示字符串是否以指定的子字符串开头
    const pairs = str.split('&'); // ['foo=1', 'bar=2']
    for (const pair of pairs) {
      const [key, value] = pair.split('=').map(decodeURIComponent); // decodeURIComponent 是一个 JavaScript 内置函数
      this.append(key, value); // 添加键值对到参数中
    }
  }

  /**
   * 解析对象形式的查询参数
   * @param {object} obj - 包含键值对的对象
   */
  _parseObject(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        this.append(key, obj[key]); // 添加键值对到参数中
      }
    }
  }

  /**
   * 添加一个新的查询参数
   * @param {string} key - 参数名
   * @param {string} value - 参数值
   */
  append(key, value) {
    if (!this.params.has(key)) {
      this.params.set(key, []);
    }
    this.params.get(key).push(value); // 将值添加到对应的键中
  }

  /**
   * 设置一个查询参数的新值
   * @param {string} key - 参数名
   * @param {string} value - 参数值
   */
  set(key, value) {
    this.params.set(key, [value]); // 设置新的值，覆盖原有值
  }

  /**
   * 获取指定查询参数的第一个值
   * @param {string} key - 参数名
   * @returns {string|null} - 返回第一个值或 null
   */
  get(key) {
    const values = this.params.get(key);
    return values ? values[0] : null; // 返回第一个值或 null
  }

  /**
   * 获取指定查询参数的所有值
   * @param {string} key - 参数名
   * @returns {Array} - 返回所有值的数组
   */
  getAll(key) {
    return this.params.get(key) || []; // 返回所有值或空数组
  }

  /**
   * 将查询参数转换为字符串
   * @returns {string} - 返回查询字符串
   */
  toString() {
    const pairs = [];
    for (const [key, values] of this.params) {
      for (const value of values) {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`); // 编码并拼接键值对
      }
    }
    return pairs.join('&'); // 返回拼接后的字符串
  }

  /**
   * 迭代器方法
   * 使实例支持 for of 迭代
   */
  *[Symbol.iterator]() {
    for (const [key, values] of this.params) {
      for (const value of values) {
        yield [key, value]; // 生成键值对
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
