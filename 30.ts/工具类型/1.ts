interface Person {
    id: number;
    name: string;
    email: string;
  }
  
  const user: Readonly<Person> = {
    id: 1,
    name: "Dolphin",
    email: "dolphin@meituan.com"
  };
  
  // 尝试修改只读属性会导致编译错误
  // user.id = 2; // Error: Cannot assign to 'id' because it is a read-only property.
  // user.name = "Bob"; // Error: Cannot assign to 'name' because it is a read-only property.
  
  
  