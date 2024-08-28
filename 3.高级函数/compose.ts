type Func = (...args: any[]) => any;


const compose = (...funcs: Func[]): Func => {
  return (initialValue: any): any => {
    return funcs.reduceRight((acc, func) => func(acc), initialValue);
  };
};

const add = (x: number) => x + 1;
const multiply = (x: number) => x * 2;
const subtract = (x: number) => x - 3;

const composedFunc1 = compose(add, multiply, subtract);
const result1 = composedFunc1(5); // subtract(5) -> multiply(2) -> add(4)
console.log(result1); // 输出: 4