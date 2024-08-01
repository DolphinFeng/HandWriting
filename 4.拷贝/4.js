// JSON structredClone
function deepCopy(obj) {
    // return JSON.parse(JSON.stringify(obj))
    return structuredClone(obj)
}

let obj = {
    a: 1
}

let objCopy = deepCopy(obj)

obj.a = 2

console.log(objCopy);