interface Person {
  name?: string;
  email?: string;
}

type RequiredPerson = Required<Person>;

// 用例
const person: RequiredPerson = {
  name: "dolphin",
  email: "dolphin@meituan.com"
};