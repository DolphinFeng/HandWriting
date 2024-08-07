function deepCopy (obj) {
    let objCopy = Array.isArray(obj) ? [] : {}
    
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (obj[key] instanceof Object) {
                objCopy[key] = deepCopy(obj[key])
            } else {
                objCopy[key] = obj[key]
            }
        }
    }

    return objCopy  
}

let obj = {
    a: 1
}
let objCopy = deepCopy(obj)
obj.a = 2
console.log(objCopy);