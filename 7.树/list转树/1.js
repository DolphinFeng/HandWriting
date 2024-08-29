// 数组转树
let arr = [
    { id: 0, name: '1', parent: -1, childNode: [] },
    { id: 1, name: '1', parent: 0, childNode: [] },
    { id: 99, name: '1-1', parent: 1, childNode: [] },
    { id: 111, name: '1-1-1', parent: 99, childNode: [] },
    { id: 66, name: '1-1-2', parent: 99, childNode: [] },
    { id: 1121, name: '1-1-2-1', parent: 112, childNode: [] },
    { id: 12, name: '1-2', parent: 1, childNode: [] },
    { id: 2, name: '2', parent: 0, childNode: [] },
    { id: 21, name: '2-1', parent: 2, childNode: [] },
    { id: 22, name: '2-2', parent: 2, childNode: [] },
    { id: 221, name: '2-2-1', parent: 22, childNode: [] },
    { id: 3, name: '3', parent: 0, childNode: [] },
    { id: 31, name: '3-1', parent: 3, childNode: [] },
    { id: 32, name: '3-2', parent: 3, childNode: [] }
]

// let tree = {
//     id: 0,
//     name: '1',
//     parent: -1,
//     childNode: [
//         {
//             id: 1,
//             name: '1',
//             parent: 0,
//             childNode: [
//                 {
//                     id: 99,
//                     name: '1-1',
//                     parent: 1,
//                     childNode: [
//                         {
//                             id: 111,
//                             name: '1-1-1',
//                             parent: 99,
//                             childNode: []
//                         },
//                         {
//                             id: 66,
//                             name: '1-1-2',
//                             parent: 99,
//                             childNode: []
//                         }
//                     ]
//                 },
//                 {
//                     id: 12,
//                     name: '1-2',
//                     parent: 1,
//                     childNode: []
//                 }
//             ]
//         },
//         {
//             id: 2,
//             name: '2',
//             parent: 0,
//             childNode: [
//                 {
//                     id: 21,
//                     name: '2-1',
//                     parent: 2,
//                     childNode: []
//                 },
//                 {
//                     id: 22,
//                     name: '2-2',
//                     parent: 2,
//                     childNode: [
//                         {
//                             id: 221,
//                             name: '2-2-1',
//                             parent: 22,
//                             childNode: []
//                         }
//                     ]
//                 }
//             ]
//         },
//         {
//             id: 3,
//             name: '3',
//             parent: '0',
//             childNode: [
//                 {
//                     id: 31,
//                     name: '3-1',
//                     parent: 3,
//                     childNode: []
//                 },
//                 {
//                     id: 32,
//                     name: '3-2',
//                     parent: 3,
//                     childNode: []
//                 }
//             ]
//         }
//     ]
// }

// 0 (1)
// ├── 1 (1)
// │   ├── 99 (1-1)
// │   │   ├── 111 (1-1-1)
// │   │   └── 66 (1-1-2)
// │   └── 12 (1-2)
// ├── 2 (2)
// │   ├── 21 (2-1)
// │   └── 22 (2-2)
// │       └── 221 (2-2-1)
// └── 3 (3)
//     ├── 31 (3-1)
//     └── 32 (3-2)


/**
 * 将数组转换为树结构
 * @param {Array} arr - 输入的数组
 * @param {number} parentId - 父节点的ID
 * @returns {Array} - 转换后的树结构数组
 */
function arrToTree(arr, parentId = -1) {
    // 过滤出当前父节点的子节点
    const filterArr = arr.filter(item => item.parent === parentId);

    // 递归调用，将子节点添加到父节点的 childNode 属性中
    filterArr.forEach(item => {
        item.childNode = arrToTree(arr, item.id);
    });

    // 返回过滤后的数组，即树结构
    return filterArr;
}


console.log(arrToTree(arr));

