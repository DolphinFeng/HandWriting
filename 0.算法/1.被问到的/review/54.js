// 将 key 都变成 label

const list = [
    {
        id: 1,
        name: 'a'
    },
    {
        id: 2,
        name: 'b'
    },
    {
        id: 3,
        name: 'c'
    }
]

const transformedList = list.map(item => {
    return {
        label: item.id,
        label: item.name
    }
})

console.log(transformedList)
console.log(1);
