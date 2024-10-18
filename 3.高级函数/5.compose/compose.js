const compose = (...funcs) => {
  return (init) => {
      return funcs.reduceRight((acc, func) => func(acc), init)
  }
}

const add = (x) => x + 1
const multiple = (x) => x * 2
const subtract = (x) => x - 3

const composedFunc = compose(add, multiple, subtract)
console.log(composedFunc(5));
