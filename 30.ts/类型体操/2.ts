// function processValue(value: unknown) {
//   // 检查 value 是否为字符串
//   if (typeof value === "string") {
//     console.log(`String value: ${value}`);
//   } 
//   // 检查 value 是否为数字
//   else if (typeof value === "number") {
//     console.log(`Number value: ${value}`);
//   } 
//   // 检查 value 是否为对象
//   else if (typeof value === "object" && value !== null) {
//     console.log("Object value:", value);
//   } 
//   // 其他类型
//   else {
//     console.log("Unknown type");
//   }
// }

// 测试函数
// processValue("Hello, world!"); // 输出: String value: Hello, world!
// processValue(42);              // 输出: Number value: 42
// processValue({ id: 1 });       // 输出: Object value: { id: 1 }
// processValue(true);            // 输出: Unknown type


// function processValue(value: unknown) {
//   // 直接尝试使用 value 的属性或方法会导致编译错误
//   console.log(value.toUpperCase()); 
// }

// processValue("Hello, world!");



// let list: [number, string, boolean] = [1, '2', true]
// list.push(undefined)

// function logMessage(message: string): void {
//   console.log(message);
// }

// logMessage("Hello, world!"); // 输出: Hello, world!




// function add(x: number,z?:number, y: number): number {
//     return x + y;
//   }


// let obj = {
//     name: 'dolphin',
//     age: 22
// }

// enum Direction {
//     Up,
//     Down,
//     Left,
//     Right
//   }
  
// console.log(Direction.Up, Direction.Down, Direction.Left, Direction.Right); // 0, 1, 2, 3
// console.log(Direction[0], Direction[1], Direction[2], Direction[3]); // Up Down Left Right

// interface User {
//   id: number;
//   name: string;
// }

// // 重新定义同一个接口
// interface User {
//   email: string;
// }

// const user: User = {
//   id: 1,
//   name: "Dolphin",
//   email: "dolphin@meituan.com"
// };

// console.log(user);


// type User = {
//   id: number;
//   name: string;
// };

// // 重新定义同一个类型会导致错误
// type User = {
//   email: string;
// };

// const user: User = {
//   id: 1,
//   name: "Dolphin",
//   email: "dolphin@meituan.com"
// };

// console.log(user);

let value: unknown = "Hello, TypeScript";

// 使用类型断言将 unknown 类型的值转换为 string 类型
let strValue: string = value as string;

console.log(strValue.toUpperCase()); // 输出: HELLO, TYPESCRIPT

