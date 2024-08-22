type PersonKeys = "name" | "email" | "age";
type ExcludePerson = Exclude<PersonKeys, "age">;

// 用例
const person: ExcludePerson = "name"; // 只能是 "name" 或 "email"
