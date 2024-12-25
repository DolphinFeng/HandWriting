class Query {
    constructor (data) {
        this.data = data
    }

    where (predicate) {
        this.data = this.data.filter(predicate)
        return this
    }

    sortBy (key) {
        this.data = this.data.sort((a, b) => a[key] - b[key])
        return this
    }

    groupBy (key) {
        this.data = this.data.reduce((acc, item) => {
            const groupKey = item[key]
            if (!acc[groupKey]) {
                acc[groupKey] = []
            }
            acc[groupKey].push(item)
            return acc
        }, {})
        return this
    }

    execute () {
        return this.data
    }
}

const list = [
    { id: 1, name: 'Alice', age: 22 },
    { id: 2, name: 'Bob', age: 17 },
    { id: 3, name: 'Charlie', age: 23 },
    { id: 4, name: 'Alice', age: 19 }
]

const query = new Query(list)

query.where(item => item.age > 18)
     .sortBy('id')
     .groupBy('name')
     .execute()

console.log(query)