// 函数重载定义
function myFunction(arg1: string): string;
function myFunction(arg1: string, arg2: number): boolean;

// 函数实现
function myFunction(arg1: string, arg2?: number): string | boolean {
  if (arg2 === undefined) {
    const result = "单个参数";
    console.log(result); // 打印返回值
    return result;
  } else {
    const result = true;
    console.log(result); // 打印返回值
    return result;
  }
}

// 测试
const result1 = myFunction("hello"); // 返回 string 并打印
const result2 = myFunction("hello", 42); // 返回 boolean 并打印