// 实现一个_get函数，它接受三个参数object, keypath, defaultValue
// object是个对象
// keypath是你的对象object的调用路径，它可能是属性的获取，可能是方法的调用，也有可能是数组元素的获取，调用的格式如有右所示：a.b[1].c(1,2)
// defaultValue是默认值，当获取的值为undefined时返回它。
// 最后返回通过keypath的调用路径获取的对象中的某个属性值或某个方法调用结果。
type _get = (object: Object, keypath: string, defaultValue: any) => any;

const _get: _get = (object, keypath, defaultValue) => {
  try {
    // 使用 Function 构造函数动态生成一个函数来访问对象属性
    const result = new Function('obj', `return obj.${keypath}`)(object);
    // 如果结果为 undefined，返回 defaultValue，否则返回结果
    return result === undefined ? defaultValue : result;
  } catch (e) {
    // 如果在访问过程中发生错误，返回 defaultValue
    return defaultValue;
  }
};



const obj = {
  a: {
    b: [
      { c: 3 },
      { d: 4 }
    ],
    e: (x: number, y: number): number => x + y
  }
};

const value1 = _get(obj, 'a.b[1].d', 'default');
console.log(value1); // 输出: 4
const value2 = _get(obj, 'a.b[2].d', 'default');
console.log(value2); // 输出: default
const value3 = _get(obj, 'a.e(1, 2)', 'default');
console.log(value3); // 输出: 3
const value4 = _get(obj, 'a.f(1, 2)', 'default');
console.log(value4); // 输出: default