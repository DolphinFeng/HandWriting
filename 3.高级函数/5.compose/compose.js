/**
 * compose 函数用于组合多个函数，从右到左依次执行
 * 例如: compose(f, g, h)(x) 等价于 f(g(h(x)))
 * 
 * @param {...Function} funcs - 要组合的函数列表
 * @returns {Function} - 返回组合后的函数
 * 
 * 工作原理:
 * 1. 接收任意数量的函数作为参数
 * 2. 返回一个新函数，这个函数接收一个初始值
 * 3. 使用 reduceRight 从右到左依次执行函数
 * 4. 前一个函数的返回值会作为下一个函数的参数
 */
const compose = (...func) => {
  return (init) => {
    return func.reduceRight((acc, fn) => {
      return fn(acc)
    }, init)
  }
}

const add = (x) => x + 1
const multiple = (x) => x * 2
const subtract = (x) => x - 3

const composedFunc = compose(add, multiple, subtract)
console.log(composedFunc(5));
