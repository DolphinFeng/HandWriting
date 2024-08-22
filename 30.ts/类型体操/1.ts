const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

type User = { id: number; name: string };

type UsersArray = User[];

type UsersMap<T extends UsersArray> = {
  [K in T[number]['id']]: Extract<T[number], { id: K }>
};

const usersMap: UsersMap<typeof users> = {
  1: { id: 1, name: "Alice" },
  2: { id: 2, name: "Bob" },
};

console.log(usersMap, 1);
