interface Person {
  name: string;
  email: string;
  age: number;
  address: string;
}

type PersonContactInfo = Pick<Person, "name" | "email">;

// 用例
const contactInfo: PersonContactInfo = {
  name: "dolphin",
  email: "dolphin@meituan.com"
};
