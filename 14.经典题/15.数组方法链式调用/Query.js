// 提供了一个数组结构的data,要求实现一个query方法,返
// 回一个新的数组,query方法内部有过滤、排序、分组等操
// 作,并且支持链式调用,调用最终的execute方法返回结
// 果: 过滤用原生的数组filter方法,排序用原生的数组sort方法,分组需要手写一下,类似 lodash/groupBy方法。

// const result = query(list)
// .where(item => item.age > 18)
// .sortBy('id')
// .groupBy('name')
// .execute();

// console.log(result);

class Query {
    constructor(data) {
        this.data = data;
    }

    where(predicate) {
        this.data = this.data.filter(predicate);
        return this;
    }

    sortBy(key) {
        this.data = this.data.sort((a, b) => (a[key] > b[key] ? 1 : -1));
        return this;
    }

    groupBy(key) {
        this.data = this.data.reduce((acc, item) => {
            const groupKey = item[key];
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(item);
            return acc;
        }, {});
        return this;
    }

    execute() {
        return this.data;
    }
}

function query(data) {
    return new Query(data);
}

// Example usage
const list = [
    { id: 1, name: 'Alice', age: 22 },
    { id: 2, name: 'Bob', age: 17 },
    { id: 3, name: 'Charlie', age: 23 },
    { id: 4, name: 'Alice', age: 19 }
];

const result = query(list)
    .where(item => item.age > 18)
    .sortBy('id')
    .groupBy('name')
    .execute();

console.log(result);



