// 手写 pick

type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};