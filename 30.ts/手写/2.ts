// 手写 Readonly

type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 手写 partial

type MyPartial<T> = {
    [P in keyof T]?: T[P]
}

// 手写 pick

type MyPick<T, K extends keyof T> = {
    [P in K]: T[P];
};