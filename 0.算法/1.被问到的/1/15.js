function pascalToCamel (obj) {
    if (typeof obj !== 'object' && obj === null) return 

    let newObj = {}

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            let arr = key.split('_')
            let newKey = arr[0] + arr.slice(1).map((item) => {
                return item[0].toUpperCase() + item.slice(1)
            }).join('')
            newObj[newKey] = obj[key]
        }
    }
    
    return newObj
}
const obj = {
    user_name: 'Tony',
    current_position_dolphin: 'developer',
    age: 45
}

console.log(pascalToCamel(obj)) // { userName: 'Tony', currentPosition: 'developer', age: 45 }