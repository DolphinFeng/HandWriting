// 后端数据是[{name:'苹果'，price:'1.0'}]转换为[{label:'苹果'， value:1}]要求:name为空的元素过滤掉,price可能为undefined,null,''

function transformData(data) {
    return data
        .filter(item => item.name) // 过滤掉 name 为空的元素
        .map(item => ({
            label: item.name,
            value: item.price ? parseFloat(item.price) : 0 // 将 price 转换为数字，处理 undefined, null, ''
        }));
}

// 示例用法:
const backendData = [
    { name: '苹果', price: '1.0' },
    { name: '', price: '2.0' },
    { name: '香蕉', price: undefined },
    { name: '橙子', price: null },
    { name: '葡萄', price: '' }
];

const transformedData = transformData(backendData);
console.log(transformedData);
// 输出: [{ label: '苹果', value: 1 }, { label: '香蕉', value: 0 }, { label: '橙子', value: 0 }, { label: '葡萄', value: 0 }]