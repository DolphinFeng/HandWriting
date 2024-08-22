// 如何只要title和 description

interface Todo {
    title: string;
    description: string;
    completed: boolean;
    createdAt: number;
}

// 只包含 title 和 description 字段的部分接口
type TodoTitleDescriptionOnly = Partial<Pick<Todo, 'title' | 'description'>>;