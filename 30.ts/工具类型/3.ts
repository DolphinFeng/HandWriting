interface Person {
  name: string;
  email: string;
  age: number;
}

type OmitPerson = Omit<Person, "age">;

// 用例
const person: OmitPerson = {
  name: "dolphin",
  email: "dolphin@meituan.com"
};
