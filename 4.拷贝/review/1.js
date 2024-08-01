function shallowCopy (obj) {
    let objCopy = obj instanceof Array ? [] : {}
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            objCopy[key] = obj[key]
        }
    }
    return objCopy
}

let obj = {
    a: {
        b: 1
    }
}

let objCopy = shallowCopy(obj)
obj.a.b = 2

console.log(objCopy);