// 遍历给定节点id的所有子节点，如有结果以数组形式输出
const tree = [
    {
        id: "1",
        children: [
            {
                id: "2",
                children: [
                    {
                        id: "3",
                        children: [{ id: "4" }]
                    },
                    { id: "5" },
                    {
                        id: "6",
                        children: [{ id: "7" }]
                    },
                ]
            },
            {
                id: "8",
                children: [{ id: "9" }]
            }
        ]
    }
]

function find(root, id) {
    let arr = []
    for (let item of root) {      
            if(item.id == id){
                
            }
            arr.push(item.id)
            if (item.children) {
                arr.push(...find(item.children,-1))
            }
    }
    return arr
}
console.log(find(tree, 2));
